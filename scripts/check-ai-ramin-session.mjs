import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ts from 'typescript';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const uiSource = fs.readFileSync(path.join(root, 'src/sections/AiRamin.tsx'), 'utf8');
const helperSource = fs.readFileSync(path.join(root, 'src/lib/aiRaminConversation.ts'), 'utf8');
const uiAst = ts.createSourceFile('AiRamin.tsx', uiSource, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
const compile = (code) => ts.transpileModule(code, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const timers = new Map();
let timerId = 0;
let storageAttempts = 0;
let networkAttempts = 0;
let logAttempts = 0;
const helperModule = { exports: {} };
const helperContext = {
  module: helperModule, exports: helperModule.exports, AbortController, Error,
  setTimeout: (callback) => { const id = ++timerId; timers.set(id, callback); return id; },
  clearTimeout: (id) => timers.delete(id),
  fetch: () => { networkAttempts += 1; throw new Error('The session helper must not access the network'); },
  console: { log: () => { logAttempts += 1; }, info: () => { logAttempts += 1; }, error: () => { logAttempts += 1; } },
};
for (const key of ['localStorage', 'sessionStorage', 'indexedDB']) Object.defineProperty(helperContext, key, {
  get() { storageAttempts += 1; throw new Error(`The conversation must not use ${key}`); },
});
vm.runInNewContext(compile(helperSource), helperContext);
const { createAiRaminConversation, AI_RAMIN_SESSION_LIMITS: limits } = helperModule.exports;
const initial = () => ({
  messages: [{ id: 'intro', role: 'assistant', content: 'Deterministic test introduction', isIntro: true }],
  selectedMode: 'hiring-manager', selectedRequestType: 'general_chat', isSuggestionsOpen: false,
});
const user = (id, content = 'Deterministic test question') => ({ id: `u-${id}`, role: 'user', content });
const answer = (id, content = 'Deterministic fixture response; not a production/model answer') => ({ id: `a-${id}`, role: 'assistant', content });
const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
};

// Model actual useSyncExternalStore subscription/unsubscription across routes.
const session = createAiRaminConversation(initial());
assert.equal(session.getSnapshot(), session.getSnapshot(), 'External-store snapshot is stable without changes');
let firstMountUpdates = 0;
const unmount = session.subscribe(() => { firstMountUpdates += 1; });
session.setPrompt('A draft kept while following evidence');
session.setSelectedMode('recruiter');
session.setSelectedRequestType('role_fit');
unmount();
const unmountedUpdates = firstMountUpdates;
assert.equal(session.getSnapshot().prompt, 'A draft kept while following evidence');
assert.equal(session.getSnapshot().selectedMode, 'recruiter');
assert.equal(session.getSnapshot().selectedRequestType, 'role_fit');

const reply = deferred();
let requests = 0;
const pending = session.runRequest(user(1), () => { requests += 1; return reply.promise; });
assert.equal(session.getSnapshot().isSending, true, 'Pending status exists independently of a mounted component');
assert.equal(await session.runRequest(user('duplicate'), async () => { requests += 1; return { message: answer('duplicate') }; }), 'busy');
await Promise.resolve();
assert.equal(requests, 1, 'Remount/resubmit cannot duplicate an in-flight request');
let remountUpdates = 0;
const leaveAgain = session.subscribe(() => { remountUpdates += 1; });
session.setPrompt('A newer follow-up draft');
session.setSelectedMode('founder');
session.setSelectedRequestType('product_judgment');
session.setIsSuggestionsOpen(true);
leaveAgain();
reply.resolve({ message: answer(1), selectedMode: 'recruiter', selectedRequestType: 'role_fit', isSuggestionsOpen: false });
assert.equal(await pending, 'success');
assert.equal(firstMountUpdates, unmountedUpdates, 'Unmounted subscribers are not called');
assert.equal(session.getSnapshot().messages.at(-1).id, 'a-1', 'Reply finishes while the visitor is on another route');
assert.equal(session.getSnapshot().isSending, false);
assert.equal(session.getSnapshot().prompt, 'A newer follow-up draft', 'A pending reply cannot erase a newer draft');
assert.equal(session.getSnapshot().selectedMode, 'founder', 'A pending reply cannot overwrite a newer lens');
assert.equal(session.getSnapshot().selectedRequestType, 'product_judgment');
assert.equal(session.getSnapshot().isSuggestionsOpen, true, 'A pending reply cannot override a visitor toggle');
assert.ok(remountUpdates > 0);
let afterReturnUpdates = 0;
const afterReturn = session.subscribe(() => { afterReturnUpdates += 1; });
assert.equal(session.getSnapshot().messages.filter((message) => message.id === 'a-1').length, 1, 'Return reads the completed reply once');
afterReturn();
assert.equal(afterReturnUpdates, 0, 'Subscribing does not replay network work');

// Clear invalidates the request generation even if a transport ignores abort.
const stale = deferred();
let signal;
const clearing = session.runRequest(user(2), (requestSignal) => { signal = requestSignal; return stale.promise; });
await Promise.resolve();
session.clear();
assert.equal(signal.aborted, true);
assert.equal(await clearing, 'cancelled');
assert.equal(session.getSnapshot().messages.length, 1);
assert.equal(session.getSnapshot().prompt, '');
assert.equal(session.getSnapshot().isSending, false);
const newTurn = session.runRequest(user(3), async () => ({ message: answer(3) }));
assert.equal(await newTurn, 'success');
stale.resolve({ message: answer('stale') });
await Promise.resolve();
assert.equal(session.getSnapshot().messages.some((message) => message.id === 'a-stale'), false, 'Late completion cannot resurrect a cleared conversation or enter its replacement');

const never = deferred();
const stalled = session.runRequest(user(4), () => never.promise);
await Promise.resolve();
assert.equal(timers.size, 1);
[...timers.values()][0]();
assert.equal(await stalled, 'unavailable');
assert.equal(session.getSnapshot().isSending, false, 'A stalled request cannot hold the session busy indefinitely');
assert.match(session.getSnapshot().chatError, /longer than expected/);
assert.equal(session.getSnapshot().prompt, user(4).content, 'A timed-out prompt is ready for editing');
assert.equal(session.getSnapshot().failedRequest.message.id, 'u-4', 'Timeout preserves the original retry identity');
never.resolve({ message: answer('too-late') });
await Promise.resolve();
assert.equal(session.getSnapshot().messages.some((message) => message.id === 'a-too-late'), false);

// Exercise the actual component sendMessage callback with a fake transport.
// No API, account, live feedback or model is called by this check.
const component = uiAst.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'AiRaminSection');
const declarations = component.body.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]);
const sendDeclaration = declarations.find((node) => node.name.getText(uiAst) === 'sendMessage');
assert.ok(sendDeclaration && ts.isCallExpression(sendDeclaration.initializer));
const senderCode = sendDeclaration.initializer.arguments[0].getText(uiAst);
const externalStore = declarations.find((node) => ts.isCallExpression(node.initializer) && node.initializer.expression.getText(uiAst) === 'useSyncExternalStore');
assert.ok(externalStore, 'The actual component subscribes to the session instead of copying it into mount-local state');
assert.equal(externalStore.initializer.arguments[0].getText(uiAst), 'aiRaminConversation.subscribe');
assert.equal(externalStore.initializer.arguments[1].getText(uiAst), 'aiRaminConversation.getSnapshot');
const normalizationFunctions = [
  'decodeAiRaminJsonString', 'extractAiRaminLooseStringField', 'extractAiRaminLooseArrayField',
  'parseAiRaminLooseStructuredContent', 'buildAiRaminAnswerMarkdownFromSections', 'normalizeAiRaminClientResponse',
].map((name) => {
  const node = uiAst.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name);
  assert.ok(node, name);
  return node.getText(uiAst);
}).join('\n');
let id = 0;
const metrics = [];
const transports = [];
const uiSession = createAiRaminConversation(initial());
function mountSender() {
  const module = { exports: {} };
  const context = {
    module, exports: module.exports, Error, aiRaminConversation: uiSession,
    ...uiSession.getSnapshot(),
    createAiRaminMessageId: (role) => `${role}-${++id}`,
    shouldRequestAiRaminDebugTrace: () => false,
    recordJourneyEvent: (...values) => metrics.push(values),
    fetch: (url, options) => {
      assert.equal(url, '/api/ai-ramin');
      const result = deferred();
      transports.push({ result, options });
      return result.promise;
    },
  };
  vm.runInNewContext(compile(`${normalizationFunctions}\nconst sendMessage = ${senderCode}; module.exports = {sendMessage};`), context);
  return module.exports.sendMessage;
}
const fixturePayload = {
  answer: 'Deterministic transport fixture; not a model or production result.',
  mode: 'hiring-manager', requestType: 'role_fit', evidenceCards: [], briefSeed: null,
  sections: { short_answer: 'Deterministic transport fixture.', verified_proof: [], inferred_fit: [], confidential_boundary: [], open_questions: [], suggested_next_action: '' },
};
uiSession.setPrompt('Test-only role context');
uiSession.setSelectedRequestType('role_fit');
let mountedUpdates = 0;
const leaveUi = uiSession.subscribe(() => { mountedUpdates += 1; });
const sent = mountSender()();
await Promise.resolve();
assert.equal(transports.length, 1);
assert.equal(JSON.parse(transports[0].options.body).message, 'Test-only role context');
leaveUi();
const afterLeave = mountedUpdates;
await mountSender()('A duplicate while pending');
assert.equal(transports.length, 1, 'Actual remounted send callback honors the shared pending gate');
uiSession.setPrompt('Next draft after visiting evidence');
transports[0].result.resolve({ ok: true, json: async () => fixturePayload });
await sent;
assert.equal(mountedUpdates, afterLeave);
assert.equal(uiSession.getSnapshot().messages.at(-1).content, fixturePayload.answer);
assert.equal(uiSession.getSnapshot().prompt, 'Next draft after visiting evidence');
assert.deepEqual(metrics, [['ai_request', 'role_fit', 'ai'], ['ai_result', 'success', 'ai']], 'Off-route result measurement carries only approved categories and an explicit AI surface');
const next = mountSender()('A test follow-up');
await Promise.resolve();
const followUp = JSON.parse(transports[1].options.body);
assert.equal(followUp.history.length, 2);
assert.equal(followUp.history[1].metadata.requestType, 'role_fit', 'Real request history retains structured answer context after return');
transports[1].result.resolve({ ok: false, json: async () => ({ error: 'Deterministic unavailable fixture' }) });
await next;
assert.equal(uiSession.getSnapshot().chatError, 'Deterministic unavailable fixture');
assert.equal(uiSession.getSnapshot().prompt, 'A test follow-up', 'Failed request text returns to the composer');
assert.deepEqual(metrics.at(-1), ['ai_result', 'unavailable', 'ai']);

// Invoke the actual rendered error-panel Retry callback; history and the user
// message must not duplicate, and a newer draft/lens must survive the retry.
let retryHandler;
let cancelHandler;
const visitUi = (node) => {
  if (ts.isJsxSelfClosingElement(node) && node.tagName.getText(uiAst) === 'AiRaminRequestRecovery') {
    retryHandler = node.attributes.properties.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(uiAst) === 'onRetry')?.initializer?.expression;
  }
  if (ts.isJsxElement(node) && node.openingElement.tagName.getText(uiAst) === 'button' && node.children.some((child) => ts.isJsxText(child) && child.text.includes('Cancel request'))) {
    cancelHandler = node.openingElement.attributes.properties.find((attribute) => ts.isJsxAttribute(attribute) && attribute.name.getText(uiAst) === 'onClick')?.initializer?.expression;
  }
  ts.forEachChild(node, visitUi);
};
visitUi(uiAst);
assert.ok(retryHandler && cancelHandler, 'Actual retry and cancel affordances are rendered');
uiSession.setPrompt('A newer draft while reviewing the error');
uiSession.setSelectedMode('founder');
uiSession.setSelectedRequestType('product_judgment');
const retryModule = { exports: {} };
let retried;
vm.runInNewContext(compile(`module.exports = ${retryHandler.getText(uiAst)};`), { module: retryModule, sendMessage: (...args) => { retried = mountSender()(...args); } });
retryModule.exports();
await Promise.resolve();
const retriedBody = JSON.parse(transports[2].options.body);
assert.equal(retriedBody.message, 'A test follow-up');
assert.equal(retriedBody.requestType, 'role_fit', 'Retry uses the failed request type');
assert.equal(retriedBody.hiringMode, 'hiring-manager', 'Retry uses the failed request lens');
assert.equal(retriedBody.history.length, 2, 'Failed question is excluded from its own retry history');
assert.equal(uiSession.getSnapshot().messages.filter((message) => message.content === 'A test follow-up').length, 1);
transports[2].result.resolve({ ok: true, json: async () => fixturePayload });
await retried;
assert.equal(uiSession.getSnapshot().failedRequest, null);
assert.equal(uiSession.getSnapshot().prompt, 'A newer draft while reviewing the error');
assert.equal(uiSession.getSnapshot().selectedMode, 'founder', 'Retry cannot overwrite a newer visitor lens');
assert.equal(uiSession.getSnapshot().selectedRequestType, 'product_judgment');

const cancelTurn = mountSender()('Cancel this deterministic fixture');
await Promise.resolve();
const cancelledTransport = transports.at(-1);
uiSession.setPrompt('A draft typed while waiting');
const cancelModule = { exports: {} };
vm.runInNewContext(compile(`module.exports = ${cancelHandler.getText(uiAst)};`), { module: cancelModule, aiRaminConversation: uiSession });
cancelModule.exports();
await cancelTurn;
assert.equal(cancelledTransport.options.signal.aborted, true, 'Actual cancel control aborts the transport');
assert.equal(uiSession.getSnapshot().isSending, false);
assert.equal(uiSession.getSnapshot().prompt, 'A draft typed while waiting', 'Cancel preserves a newer composer draft');
assert.equal(uiSession.getSnapshot().failedRequest.message.content, 'Cancel this deterministic fixture');
cancelledTransport.result.resolve({ ok: true, json: async () => fixturePayload });
await Promise.resolve();
assert.equal(uiSession.getSnapshot().messages.at(-1).role, 'user', 'A late cancelled result is never appended');

const emptyTurn = mountSender()('A malformed-success fixture');
await Promise.resolve();
transports.at(-1).result.resolve({ ok: true, json: async () => ({}) });
await emptyTurn;
assert.match(uiSession.getSnapshot().chatError, /did not return an answer/);
assert.equal(uiSession.getSnapshot().prompt, 'A malformed-success fixture');
const beforeCancelledMetrics = metrics.length;
const beforeCancelledTransport = transports.length;
const cancelledBeforeStart = mountSender()('Cleared before transport begins');
uiSession.clear();
await cancelledBeforeStart;
assert.equal(transports.length, beforeCancelledTransport);
assert.equal(metrics.length, beforeCancelledMetrics, 'Clear-before-start is not counted as an actual AI request');

// Run the real feedback submission callback against deterministic persistence
// responses. HTTP success alone must never be presented as a saved record.
const feedbackComponent = uiAst.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === 'AiRaminAnswerFeedback');
const feedbackDeclaration = feedbackComponent.body.statements.filter(ts.isVariableStatement).flatMap((node) => [...node.declarationList.declarations]).find((node) => node.name.getText(uiAst) === 'submitFeedback');
const feedbackCode = feedbackDeclaration.initializer.arguments[0].getText(uiAst);
for (const [ok, payload, expected] of [[true, { persisted: false }, 'failed'], [true, {}, 'failed'], [true, { persisted: 'true' }, 'failed'], [false, { persisted: true }, 'failed'], [true, null, 'failed'], [true, { persisted: true }, 'saved']]) {
  const feedbackModule = { exports: {} };
  const statuses = [];
  const noteOpen = [];
  vm.runInNewContext(compile(`module.exports = ${feedbackCode};`), {
    module: feedbackModule, Error, disabled: false, status: 'idle', response: fixturePayload, messageId: 'fixture-only', userPrompt: 'Fixture prompt',
    setSelectedFeedback() {}, setStatus: (value) => statuses.push(value), setIsNoteOpen: (value) => noteOpen.push(value),
    fetch: async (url) => { assert.equal(url, '/api/ai-ramin/feedback'); return { ok, json: async () => payload }; },
  });
  await feedbackModule.exports('needs_review', 'Deterministic feedback note');
  assert.equal(statuses.at(-1), expected, `Feedback status follows actual persisted=${payload?.persisted}`);
  assert.equal(noteOpen.length, expected === 'saved' ? 1 : 0, 'An unsaved note stays available for retry');
}

const pureUi = ['AiRaminRequestRecovery', 'AiRaminStartingQuestions'].map((name) => uiAst.statements.find((node) => ts.isFunctionDeclaration(node) && node.name?.text === name).getText(uiAst)).join('\n');
const controlsModule = { exports: {} };
vm.runInNewContext(compile(`${pureUi}\nmodule.exports = { AiRaminRequestRecovery, AiRaminStartingQuestions };`), { module: controlsModule, exports: controlsModule.exports, require: createRequire(import.meta.url) });
const recoveryHtml = renderToStaticMarkup(React.createElement(controlsModule.exports.AiRaminRequestRecovery, { error: 'Unavailable fixture', canRetry: true, onRetry() {} }));
for (const href of ['/experience-education', '/projects', '/contact']) assert.ok(recoveryHtml.includes(`href="${href}"`), `Error recovery exposes ${href}`);
const starting = controlsModule.exports.AiRaminStartingQuestions({ onSelect: (value) => selectedPrompts.push(value) });
const selectedPrompts = [];
for (const button of starting.props.children) button.props.onClick();
assert.equal(selectedPrompts.length, 3, 'Three visible initial phone questions fill the composer without an API request');
assert.ok(selectedPrompts.every((value) => typeof value === 'string' && value.length > 30));

// Bound count, record size, draft and total retained conversation size.
const bounded = createAiRaminConversation(initial());
bounded.setPrompt('x'.repeat(limits.draftChars + 100));
assert.equal(bounded.getSnapshot().prompt.length, limits.draftChars);
for (let turn = 0; turn < 45; turn += 1) {
  await bounded.runRequest(user(turn, 'u'.repeat(8_000)), async () => ({ message: {
    ...answer(turn, 'a'.repeat(9_000)), response: { oversizedFixture: 'x'.repeat(limits.messageRecordChars + 1) },
  } }));
}
const retained = bounded.getSnapshot().messages;
assert.ok(retained.filter((message) => !message.isIntro).length <= limits.messages);
assert.ok(JSON.stringify(retained).length <= limits.conversationChars);
assert.equal(retained[1].role, 'user', 'Pruning does not leave an answer without its question');
assert.equal(retained.at(-1).response, undefined, 'Oversized structured/debug records retain only bounded readable text');
assert.ok(retained.at(-1).content.length <= limits.messageChars);
bounded.clear();
assert.equal(bounded.getSnapshot().messages.length, 1);
assert.equal(storageAttempts, 0);
assert.equal(networkAttempts, 0);
assert.equal(logAttempts, 0);
assert.equal(timers.size, 0, 'Completed/cleared requests release their deadline timers');
console.log('AI Ramin session checks passed: real send/retry/cancel and feedback callbacks; failed-prompt/history recovery; pending/off-route replies; clear/late-response isolation; strict persisted acknowledgement; three phone starts and evidence/contact fallbacks; bounded in-memory session. No model/API or real feedback endpoint was called.');
