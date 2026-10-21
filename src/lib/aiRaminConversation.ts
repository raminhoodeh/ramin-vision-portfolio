export type AiRaminConversationMessage = {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  isIntro?: boolean;
  response?: unknown;
};

export const AI_RAMIN_SESSION_LIMITS = {
  draftChars: 12_000,
  messageChars: 32_000,
  messageRecordChars: 64_000,
  conversationChars: 256_000,
  messages: 40,
  requestTimeoutMs: 120_000,
} as const;

type Update<T> = T | ((current: T) => T);
export type AiRaminRequestOutcome = 'success' | 'unavailable' | 'cancelled' | 'busy';
type Initial<Message, Mode, RequestType> = {
  messages: Message[];
  selectedMode: Mode;
  selectedRequestType: RequestType;
  isSuggestionsOpen: boolean;
};
export type AiRaminConversationSnapshot<Message, Mode, RequestType> = Initial<Message, Mode, RequestType> & {
  prompt: string;
  isSending: boolean;
  chatError: string | null;
};
type Reply<Message, Mode, RequestType> = {
  message: Message;
  selectedMode?: Mode;
  selectedRequestType?: RequestType;
  isSuggestionsOpen?: boolean;
};

/** One module-owned browser-tab session. No storage, analytics, or network side effects. */
export function createAiRaminConversation<Message extends AiRaminConversationMessage, Mode extends string, RequestType extends string>(
  initial: Initial<Message, Mode, RequestType>,
) {
  type Snapshot = AiRaminConversationSnapshot<Message, Mode, RequestType>;
  const listeners = new Set<() => void>();
  let generation = 0;
  let settingsRevision = 0;
  let suggestionsRevision = 0;
  let pendingController: AbortController | null = null;

  const boundMessage = (message: Message): Message => {
    const bounded = { ...message, content: message.content.slice(0, AI_RAMIN_SESSION_LIMITS.messageChars) };
    if (JSON.stringify(bounded).length <= AI_RAMIN_SESSION_LIMITS.messageRecordChars) return bounded;
    // Keep the answer readable if unusually large debug/structured metadata
    // exceeds the per-record budget. Do not retain an unbounded response graph.
    const { response: _response, ...textOnly } = bounded;
    return textOnly as Message;
  };

  const boundMessages = (messages: Message[]) => {
    const intro = messages.find((message) => message.isIntro);
    const recent = messages.filter((message) => !message.isIntro).slice(-AI_RAMIN_SESSION_LIMITS.messages).map(boundMessage);
    const dropOrphanedAnswers = () => {
      while (recent[0]?.role === 'assistant') recent.shift();
    };
    dropOrphanedAnswers();
    const withIntro = () => intro ? [boundMessage(intro), ...recent] : [...recent];
    while (recent.length > 2 && JSON.stringify(withIntro()).length > AI_RAMIN_SESSION_LIMITS.conversationChars) {
      recent.shift();
      dropOrphanedAnswers();
    }
    return withIntro();
  };

  let snapshot: Snapshot = {
    ...initial,
    messages: boundMessages(initial.messages),
    prompt: '',
    isSending: false,
    chatError: null,
  };
  const publish = (patch: Partial<Snapshot>) => {
    if (Object.entries(patch).every(([key, value]) => Object.is(snapshot[key as keyof Snapshot], value))) return;
    snapshot = { ...snapshot, ...patch };
    listeners.forEach((listener) => listener());
  };
  const setPrompt = (update: Update<string>) => {
    const value = typeof update === 'function' ? update(snapshot.prompt) : update;
    publish({ prompt: value.slice(0, AI_RAMIN_SESSION_LIMITS.draftChars) });
  };
  const setSelectedMode = (value: Mode) => {
    settingsRevision += 1;
    publish({ selectedMode: value });
  };
  const setSelectedRequestType = (value: RequestType) => {
    settingsRevision += 1;
    publish({ selectedRequestType: value });
  };
  const setIsSuggestionsOpen = (update: Update<boolean>) => {
    suggestionsRevision += 1;
    publish({ isSuggestionsOpen: typeof update === 'function' ? update(snapshot.isSuggestionsOpen) : update });
  };
  const setChatError = (value: string | null) => publish({ chatError: value?.slice(0, 1_000) ?? null });

  const clear = () => {
    generation += 1;
    pendingController?.abort();
    pendingController = null;
    publish({
      messages: boundMessages(initial.messages), prompt: '', isSending: false,
      chatError: null, isSuggestionsOpen: initial.isSuggestionsOpen,
    });
  };

  const runRequest = async (
    userMessage: Message,
    request: (signal: AbortSignal) => Promise<Reply<Message, Mode, RequestType>>,
  ): Promise<AiRaminRequestOutcome> => {
    if (snapshot.isSending) return 'busy';
    const requestGeneration = ++generation;
    const requestSettingsRevision = settingsRevision;
    const requestSuggestionsRevision = suggestionsRevision;
    const controller = new AbortController();
    pendingController = controller;
    publish({ messages: boundMessages([...snapshot.messages, userMessage]), prompt: '', chatError: null, isSending: true, isSuggestionsOpen: false });
    let onAbort = () => {};
    const cancelled = new Promise<never>((_resolve, reject) => {
      onAbort = () => reject(controller.signal.reason instanceof Error ? controller.signal.reason : new Error('Request cancelled.'));
      controller.signal.addEventListener('abort', onAbort, { once: true });
    });
    const timeout = setTimeout(() => controller.abort(new Error('AI Ramin took longer than expected. Please try again.')), AI_RAMIN_SESSION_LIMITS.requestTimeoutMs);
    try {
      const work = Promise.resolve().then(() => {
        if (requestGeneration !== generation || controller.signal.aborted) throw new Error('Request cancelled.');
        return request(controller.signal);
      });
      const reply = await Promise.race([work, cancelled]);
      if (requestGeneration !== generation) return 'cancelled';
      const settingsUnchanged = settingsRevision === requestSettingsRevision;
      publish({
        messages: boundMessages([...snapshot.messages, reply.message]),
        isSending: false,
        ...(settingsUnchanged && reply.selectedMode ? { selectedMode: reply.selectedMode } : {}),
        ...(settingsUnchanged && reply.selectedRequestType ? { selectedRequestType: reply.selectedRequestType } : {}),
        ...(suggestionsRevision === requestSuggestionsRevision && reply.isSuggestionsOpen !== undefined ? { isSuggestionsOpen: reply.isSuggestionsOpen } : {}),
      });
      return 'success';
    } catch (error) {
      if (requestGeneration !== generation) return 'cancelled';
      publish({ isSending: false, chatError: (error instanceof Error ? error.message : 'AI Ramin could not answer that yet.').slice(0, 1_000) });
      return 'unavailable';
    } finally {
      clearTimeout(timeout);
      controller.signal.removeEventListener('abort', onAbort);
      if (requestGeneration === generation) pendingController = null;
    }
  };

  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
    setPrompt, setSelectedMode, setSelectedRequestType, setIsSuggestionsOpen, setChatError,
    runRequest, clear,
  };
}
