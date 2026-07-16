import { useEffect, useMemo, useRef, useState } from 'react';

type QuotaState = {
  submissionsUsed: number;
  submissionsLimit: number;
  submissionsRemaining: number;
  transcriptionsUsed: number;
  transcriptionsLimit: number;
  transcriptionsRemaining: number;
  maxUrlsPerSubmission: number;
};

type WisdomLog = {
  id: string;
  at: string;
  message: string;
};

type WisdomSection = {
  heading: string;
  paragraphs: string[];
};

type WisdomItem = {
  id: string;
  url: string;
  sourceType: string;
  sourceLabel: string;
  title: string;
  category: string;
  qualityScore: number;
  transcription: string;
  sections?: WisdomSection[];
  modelUsed: string;
};

type WisdomJob = {
  id: string;
  status: 'running' | 'done' | 'stopped' | 'error';
  stage: string;
  createdAt?: string;
  completedAt?: string | null;
  urls?: string[];
  liveItems: WisdomItem[];
  log: WisdomLog[];
  failedUrls: { url: string; message: string }[];
  error?: string;
  stages: string[];
  resultReady: boolean;
  quota?: QuotaState;
};

const CATEGORIES = [
  'Health & Wellbeing',
  'AI or Technology Advice',
  'Finance or Trading Advice or Tools',
  'Film or Movies or TV Shows',
  'Personal Branding or UGC or Social Media Tips',
  'Conspiracy Theories or Esoteric',
  'Romantic Relationships',
  'Other',
];

const PREPARED_URLS_TEXT = [
  'https://www.instagram.com/reel/DWMBq3oBob0/ | Instagram',
  'https://www.youtube.com/watch?v=D7_ipDqhtwk | How We Build Effective Agents: Barry Zhang, Anthropic - YouTube',
  'https://www.instagram.com/reel/DW-CNZKEp9-/?hl=en | Instagram',
  'https://x.com/angelomagnolima/status/1957823726474416532 | X / Twitter',
  'https://www.tiktok.com/@eckharttolle/video/7631908423042419982 | The Greatest Philosophy: Beyond Thinking and the Space of No Mind | TikTok',
  'https://www.youtube.com/watch?v=BPI-FJj8f5o | The 5 things you NEED to know for better GUT HEALTH with Professor Tim Spector - YouTube',
  'https://www.instagram.com/reel/DUD3AaWCogL/ | Instagram',
  'https://www.youtube.com/watch?v=gh5VhaicC6g | Skills for Healthy Romantic Relationships | Joanne Davila | TEDxSBU - YouTube',
  'https://www.youtube.com/watch?v=0xso7qXHK94 | Can Quantum Computing Power the AI Boom? - YouTube',
  'https://www.youtube.com/watch?v=I0V14dTS9JQ | What is Quantum Mechanics? | Google Quantum AI - YouTube',
].join('\n');

const URL_RE = /https?:\/\/(?:[-\w]+\.)+[a-zA-Z]{2,}(?:\/[^\s]*)?/gi;
const CONCURRENT_TRANSCRIPTION_LIMIT = 3;
const STAGE_PROGRESS: Record<string, number> = {
  Queued: 0.02,
  Inspect: 0.05,
  Route: 0.1,
  Transcribe: 0.46,
  Compose: 0.76,
  'Self-Assess': 0.86,
  Categorise: 0.93,
  Sort: 0.97,
  Export: 0.99,
};

function getLogTone(message: string) {
  if (/failed|error/i.test(message)) return 'error';
  if (/done|export|ready|content depth/i.test(message)) return 'success';
  if (/route|transcribe|compose|categorise|self-assess|inspect|sort/i.test(message)) return 'active';
  return 'default';
}

function formatLogTime(isoDate: string) {
  try {
    return new Intl.DateTimeFormat('en', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(isoDate));
  } catch {
    return '--:--:--';
  }
}

function groupItems(items: readonly WisdomItem[]) {
  return CATEGORIES.map((category) => ({
    category,
    items: items.filter((item) => item.category === category),
  })).filter((group) => group.items.length > 0);
}

function sortItems(items: readonly WisdomItem[]) {
  return [...items].sort((a, b) => {
    const categoryDelta = CATEGORIES.indexOf(a.category) - CATEGORIES.indexOf(b.category);
    if (categoryDelta !== 0) return categoryDelta;
    const aTopic = a.sections?.[0]?.heading || a.title;
    const bTopic = b.sections?.[0]?.heading || b.title;
    return aTopic.localeCompare(bTopic);
  });
}

function countUrls(text: string) {
  return (text.match(URL_RE) || []).length;
}

function getItemSections(item: WisdomItem): WisdomSection[] {
  const sections = Array.isArray(item.sections)
    ? item.sections
        .map((section) => ({
          heading: String(section.heading || 'Key ideas').trim(),
          paragraphs: Array.isArray(section.paragraphs)
            ? section.paragraphs.map((paragraph) => String(paragraph || '').trim()).filter(Boolean)
            : [],
        }))
        .filter((section) => section.paragraphs.length > 0)
    : [];

  if (sections.length) return sections;

  const paragraphs = String(item.transcription || '')
    .split(/\n{2,}/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return paragraphs.length
    ? [{ heading: 'Key ideas', paragraphs }]
    : [{ heading: 'Key ideas', paragraphs: ['No transcription text was returned.'] }];
}

function makeLog(message: string): WisdomLog {
  return {
    id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    at: new Date().toISOString(),
    message,
  };
}

function clampProgress(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function emptyQuota(): QuotaState {
  return {
    submissionsUsed: 0,
    submissionsLimit: 20,
    submissionsRemaining: 20,
    transcriptionsUsed: 0,
    transcriptionsLimit: 200,
    transcriptionsRemaining: 200,
    maxUrlsPerSubmission: 10,
  };
}

function PublicDemoGuardrail({ quota }: { quota: QuotaState }) {
  return (
    <div className="mass-social-demo-guardrail">
      <p>Public demo guardrail</p>
      <strong>
        {quota.submissionsUsed}/{quota.submissionsLimit} submissions · {quota.transcriptionsUsed}/
        {quota.transcriptionsLimit} transcriptions today
      </strong>
      <span>
        Capped at {quota.submissionsLimit} runs and {quota.transcriptionsLimit} URL transcriptions per day, with
        {` ${quota.maxUrlsPerSubmission}`} URLs per run. This keeps the live API demo useful without letting one visitor
        burn the whole budget.
      </span>
    </div>
  );
}

export function MassSocialWisdomDemo({
  onClose,
  githubHref,
}: {
  onClose: () => void;
  githubHref?: string;
}) {
  const [urlsText, setUrlsText] = useState(PREPARED_URLS_TEXT);
  const [quota, setQuota] = useState<QuotaState>(emptyQuota);
  const [job, setJob] = useState<WisdomJob | null>(null);
  const [jobId, setJobId] = useState<string | null>(null);
  const [submittedUrlCount, setSubmittedUrlCount] = useState(0);
  const [isStarting, setIsStarting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [activeRequestCount, setActiveRequestCount] = useState(0);
  const [isTerminalMinimised, setIsTerminalMinimised] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopRequestedRef = useRef(false);
  const grouped = useMemo(() => groupItems(job?.liveItems ?? []), [job?.liveItems]);
  const activeStage = job?.stage ?? 'Idle';
  const stages = job?.stages ?? ['Inspect', 'Route', 'Transcribe', 'Compose', 'Self-Assess', 'Categorise', 'Sort', 'Export'];
  const isRunning = job?.status === 'running' || isStarting;
  const totalUrls = job?.urls?.length || submittedUrlCount || countUrls(urlsText);
  const completedUrls = (job?.liveItems.length ?? 0) + (job?.failedUrls.length ?? 0);
  const progressPercent = useMemo(() => {
    if (isStarting && !job) return 4;
    if (!job || !totalUrls) return 0;
    if (job.status === 'done' || job.status === 'stopped') return 100;
    if (job.status === 'error') return clampProgress((completedUrls / totalUrls) * 100);

    const stageFraction = STAGE_PROGRESS[job.stage] ?? 0.12;
    const remainingUrls = Math.max(0, totalUrls - completedUrls);
    const inFlightBoost = activeRequestCount > 0
      ? Math.min(activeRequestCount, remainingUrls) * 0.18
      : 0;

    return clampProgress(((completedUrls + Math.min(0.92, stageFraction + inFlightBoost)) / totalUrls) * 100);
  }, [activeRequestCount, completedUrls, isStarting, job, totalUrls]);
  const activeUrlIndex = isRunning && totalUrls
    ? Math.min(totalUrls, completedUrls + Math.max(activeRequestCount, 1))
    : completedUrls;
  const progressStatus = isRunning
    ? activeRequestCount > 1
      ? `${activeRequestCount} URLs active · ${completedUrls}/${totalUrls || submittedUrlCount || 1} processed`
      : `URL ${activeUrlIndex}/${totalUrls || submittedUrlCount || 1} · ${activeStage}`
    : job?.status === 'error'
      ? `${completedUrls}/${totalUrls || completedUrls || 1} URLs completed before error`
      : job?.status === 'done' || job?.status === 'stopped'
        ? `${completedUrls}/${totalUrls || completedUrls || 1} URLs processed`
        : 'Ready to transcribe';
  const headerTitle = isRunning
    ? 'Transcribing...'
    : job?.status === 'error'
      ? 'Run needs attention'
      : grouped.length
        ? `${job?.liveItems.length ?? 0} item${job?.liveItems.length === 1 ? '' : 's'} processed`
        : 'Awaiting run';

  useEffect(() => {
    let isMounted = true;

    fetch('/api/mass-social-wisdom/quota')
      .then((response) => response.json())
      .then((payload) => {
        if (isMounted && payload?.submissionsLimit) setQuota(payload);
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (job && job.status !== 'running') {
      setIsStarting(false);
    }
  }, [job]);

  const handleSubmit = async () => {
    setError(null);
    setIsStarting(true);
    setActiveRequestCount(0);
    stopRequestedRef.current = false;
    setJob(null);
    setJobId(null);
    setSubmittedUrlCount(countUrls(urlsText));
    const optimisticRunId = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const startedAt = new Date().toISOString();

    setJob({
      id: optimisticRunId,
      status: 'running',
      stage: 'Inspect',
      urls: [],
      liveItems: [],
      log: [makeLog('Inspect · Starting live portfolio transcription run.')],
      failedUrls: [],
      stages: ['Inspect', 'Route', 'Transcribe', 'Compose', 'Self-Assess', 'Categorise', 'Sort', 'Export'],
      resultReady: false,
      quota,
    });

    try {
      const response = await fetch('/api/mass-social-wisdom/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urlsText }),
      });
      const payload = await response.json();

      if (!response.ok) {
        if (payload.quota) setQuota(payload.quota);
        throw new Error(payload.error || 'Could not start transcription run.');
      }

      if (payload.quota) setQuota(payload.quota);
      const runId = payload.runId || optimisticRunId;
      const urls = Array.isArray(payload.urls) ? payload.urls : [];
      if (payload.urlCount) setSubmittedUrlCount(payload.urlCount);
      setJobId(runId);

      setJob((currentJob) => ({
        ...(currentJob ?? {
          id: runId,
          status: 'running',
          stage: 'Inspect',
          liveItems: [],
          failedUrls: [],
          log: [],
          stages: ['Inspect', 'Route', 'Transcribe', 'Compose', 'Self-Assess', 'Categorise', 'Sort', 'Export'],
          resultReady: false,
        }),
        id: runId,
        urls,
        stage: 'Route',
        createdAt: startedAt,
        quota: payload.quota ?? quota,
        log: [
          ...((currentJob?.log ?? []).filter((line) => !line.message.includes('Starting live portfolio transcription run.'))),
          makeLog(`Inspect · ${urls.length} URL${urls.length === 1 ? '' : 's'} accepted for this run.`),
          makeLog('Route · Stage active.'),
        ],
      }));

      const liveItems: WisdomItem[] = [];
      const failedUrls: WisdomJob['failedUrls'] = [];
      let nextUrlIndex = 0;

      const processNextUrl = async () => {
        while (!stopRequestedRef.current) {
          const index = nextUrlIndex;
          nextUrlIndex += 1;

          if (index >= urls.length) return;

          const url = urls[index];
          setActiveRequestCount((count) => count + 1);
          setJob((currentJob) => currentJob ? {
            ...currentJob,
            stage: 'Transcribe',
            log: [
              ...currentJob.log,
              makeLog(`Route · ${index + 1}/${urls.length} queued for live processing.`),
              makeLog('Transcribe · Stage active.'),
              makeLog('Transcribe · Request sent to live API.'),
            ],
          } : currentJob);

          try {
            const processResponse = await fetch(`/api/mass-social-wisdom/runs/${runId}/process`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url, index, total: urls.length }),
            });
            const processPayload = await processResponse.json().catch(() => ({}));

            if (!processResponse.ok) {
              throw new Error(processPayload.error || 'Could not process this URL.');
            }

            if (processPayload.quota) setQuota(processPayload.quota);
            if (processPayload.item) liveItems.push(processPayload.item);
            if (processPayload.failed) failedUrls.push(processPayload.failed);

            setJob((currentJob) => {
              if (!currentJob) return currentJob;
              const existingMessages = new Set(currentJob.log.map((line) => line.message));
              const newLogs = Array.isArray(processPayload.log)
                ? processPayload.log.filter((line: WisdomLog) => !existingMessages.has(line.message))
                : [];

              return {
                ...currentJob,
                stage: 'Transcribe',
                liveItems: sortItems(liveItems),
                failedUrls: [...failedUrls],
                resultReady: liveItems.length > 0,
                log: [...currentJob.log, ...newLogs],
              };
            });
          } catch (processError) {
            const message = processError instanceof Error ? processError.message : 'Could not process this URL.';
            failedUrls.push({ url, message });
            setJob((currentJob) => currentJob ? {
              ...currentJob,
              stage: 'Transcribe',
              failedUrls: [...failedUrls],
              log: [...currentJob.log, makeLog(`Failed · ${url} · ${message}`)],
            } : currentJob);
          } finally {
            setActiveRequestCount((count) => Math.max(0, count - 1));
          }
        }
      };

      const workerCount = Math.min(CONCURRENT_TRANSCRIPTION_LIMIT, urls.length);
      await Promise.all(Array.from({ length: workerCount }, () => processNextUrl()));

      setJob((currentJob) => {
        if (!currentJob) return currentJob;
        const sortedItems = sortItems(liveItems);
        const noSuccessfulItems = !sortedItems.length && failedUrls.length > 0 && !stopRequestedRef.current;
        const nextStatus = noSuccessfulItems ? 'error' : stopRequestedRef.current ? 'stopped' : 'done';
        const nextError = noSuccessfulItems ? 'No transcriptions could be created for this run.' : currentJob.error;

        return {
          ...currentJob,
          status: nextStatus,
          stage: 'Export',
          liveItems: sortedItems,
          failedUrls: [...failedUrls],
          completedAt: new Date().toISOString(),
          resultReady: sortedItems.length > 0,
          error: nextError,
          log: [
            ...currentJob.log,
            makeLog('Sort · Stage active.'),
            makeLog('Export · Preparing output package.'),
            makeLog(`Export · ${sortedItems.length} item${sortedItems.length === 1 ? '' : 's'} ready for .docx download.`),
            ...(nextError ? [makeLog(`Error · ${nextError}`)] : []),
          ],
        };
      });
    } catch (submitError) {
      setIsStarting(false);
      setActiveRequestCount(0);
      const message = submitError instanceof Error ? submitError.message : 'Could not start transcription run.';
      setError(message);
      setJob((currentJob) => currentJob ? {
        ...currentJob,
        status: 'error',
        stage: currentJob.stage || 'Inspect',
        completedAt: new Date().toISOString(),
        error: message,
        log: [...currentJob.log, makeLog(`Error · ${message}`)],
      } : currentJob);
    }
  };

  const handleStop = () => {
    stopRequestedRef.current = true;
    setJob((currentJob) => currentJob ? {
      ...currentJob,
      log: [...currentJob.log, makeLog('Stop · Stop requested. Current URL will finish before stopping.')],
    } : currentJob);
  };

  const shouldShowDownload = Boolean(jobId && job?.resultReady && job.liveItems.length > 0);
  const canDownload = Boolean(shouldShowDownload && job?.status === 'done');

  const handleDownload = async () => {
    if (!canDownload || !job?.liveItems.length) return;

    setIsDownloading(true);
    setError(null);
    try {
      const response = await fetch('/api/mass-social-wisdom/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: job.liveItems }),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        throw new Error(payload.error || 'Could not prepare the Word export.');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `mass-social-wisdom-${job.id.slice(0, 8)}.docx`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError instanceof Error ? downloadError.message : 'Could not prepare the Word export.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <article className="mass-social-demo-shell relative mx-auto grid min-h-[calc(100svh-1.5rem)] max-w-[1560px] overflow-hidden rounded-[2.2rem] border border-white/55 bg-white/80 text-text-primary shadow-[0_30px_100px_rgba(1,8,22,0.16)] backdrop-blur-2xl lg:h-[calc(100svh-2.5rem)] lg:grid-cols-[minmax(21rem,0.42fr)_minmax(0,1fr)]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.88),transparent_32%),radial-gradient(circle_at_78%_16%,rgba(159,182,207,0.24),transparent_36%),linear-gradient(135deg,rgba(255,255,255,0.24),rgba(226,237,248,0.12))]" />

      <button
        type="button"
        aria-label="Close Mass Social Wisdom Agent demo"
        onClick={onClose}
        className="mass-social-demo-close card-glass-attachment is-active absolute right-5 top-5 z-30 md:right-7 md:top-7"
      >
        <span className="card-glass-attachment__glyph">
          <span className="card-glass-attachment__line card-glass-attachment__line-horizontal" />
          <span className="card-glass-attachment__line card-glass-attachment__line-vertical" />
        </span>
      </button>

      <section className="mass-social-demo-sidebar relative z-10 flex min-h-0 flex-col border-slate-200/70 p-5 pt-16 lg:border-r lg:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.62rem] uppercase tracking-[0.26em] text-muted">Live portfolio demo</p>
            <h2 className="mt-3 text-4xl font-semibold leading-[0.9] tracking-[-0.055em] text-text-primary md:text-5xl">
              Mass Social Wisdom Agent
            </h2>
          </div>
        </div>

        <p className="mt-5 text-sm leading-6 text-muted">
          Ten URLs from Instagram, YouTube, X, and TikTok have already been prepared for you in the field below. Press
          Transcribe to see the tool route each source, pull transcripts through the API, compose readable knowledge,
          categorise it, and prepare a Word export.
        </p>

        <div className="mt-6">
          <label htmlFor="mass-social-url-input" className="text-[0.62rem] uppercase tracking-[0.2em] text-muted">
            Paste URLs
          </label>
          <textarea
            id="mass-social-url-input"
            value={urlsText}
            onChange={(event) => setUrlsText(event.target.value)}
            placeholder={`Paste up to ${quota.maxUrlsPerSubmission} URLs here.`}
            className="mass-social-demo-textarea mt-3"
            spellCheck={false}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {githubHref ? (
            <a
              href={githubHref}
              target="_blank"
              rel="noreferrer"
              className="mass-social-demo-github-button rounded-full border border-slate-200/80 bg-white/45 px-4 py-2.5 text-sm text-muted transition duration-300 hover:bg-white/80 hover:text-text-primary"
            >
              View on GitHub
            </a>
          ) : null}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || !urlsText.trim()}
            className="mass-social-demo-transcribe card-glass-attachment card-glass-attachment--deep-dive"
          >
            <span className="card-glass-attachment__label">{isRunning ? 'Transcribing...' : 'Transcribe'}</span>
          </button>
          {job?.status === 'running' ? (
            <button
              type="button"
              onClick={handleStop}
              className="rounded-full border border-slate-200/80 bg-white/55 px-4 py-2.5 text-sm text-muted transition duration-300 hover:border-slate-300 hover:bg-white/85 hover:text-text-primary"
            >
              Stop
            </button>
          ) : null}
        </div>

        {error ? (
          <div className="mt-4 rounded-[1rem] border border-red-200 bg-red-50/80 p-3 text-sm leading-6 text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="relative z-10 flex min-h-0 flex-col p-5 lg:p-7">
        <header className="flex shrink-0 flex-col gap-4 border-b border-slate-200/70 pb-4 pr-14 lg:pr-16">
          <div className="mass-social-demo-header-main">
            <div className="mass-social-demo-heading-copy">
              <p className="text-[0.62rem] uppercase tracking-[0.24em] text-muted">Organised transcriptions</p>
              <h3
                className={`mass-social-demo-title mt-2 text-3xl font-semibold tracking-[-0.045em] text-text-primary md:text-4xl ${
                  isRunning ? 'is-loading' : ''
                }`}
              >
                {headerTitle}
              </h3>
            </div>
            <div className="mass-social-demo-stage-row">
              {stages.map((stage) => {
                const activeIndex = stages.indexOf(activeStage);
                const stageIndex = stages.indexOf(stage);
                const isActive = stage === activeStage;
                const isComplete = activeIndex > stageIndex || ['done', 'stopped'].includes(job?.status ?? '');

                return (
                  <span
                    key={stage}
                    className={`mass-social-demo-stage ${isActive ? 'is-active' : ''} ${isComplete ? 'is-complete' : ''}`}
                  >
                    {stage}
                  </span>
                );
              })}
            </div>
          </div>
          <div className={`mass-social-demo-progress-row ${shouldShowDownload ? 'has-download' : ''}`}>
            <div
              className={`mass-social-demo-progress ${isRunning ? 'is-running' : ''} ${
                job?.status === 'error' ? 'is-error' : ''
              }`}
              aria-label="Transcription progress"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={progressPercent}
              role="progressbar"
            >
              <div className="mass-social-demo-progress__meta">
                <span>{progressStatus}</span>
                <strong>{progressPercent}%</strong>
              </div>
              <div className="mass-social-demo-progress__track">
                <div className="mass-social-demo-progress__fill" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
            {shouldShowDownload ? (
              <div className="mass-social-demo-download-cta">
                <p>Use wisdom as context for your next AI project</p>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={!canDownload || isDownloading}
                  data-ready={canDownload ? 'true' : 'false'}
                  className="mass-social-demo-download card-glass-attachment card-glass-attachment--deep-dive"
                >
                  <span className="card-glass-attachment__label">
                    {isDownloading ? 'Preparing download' : 'Download transcription'}
                  </span>
                  <span className="mass-social-demo-download__glyph" aria-hidden="true">
                    <span className="mass-social-demo-download__arrow-stem" />
                    <span className="mass-social-demo-download__arrow-head" />
                    <span className="mass-social-demo-download__tray" />
                  </span>
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <div className="mass-social-demo-output mt-5 min-h-0 flex-1 overflow-y-auto pr-1">
          {!grouped.length ? (
            <div className="grid gap-4">
              <div className="mass-social-demo-empty">
                <p>Paste URLs on the left and press Transcribe.</p>
                <span>
                  Results appear here under generated category subheadings as each source finishes processing.
                </span>
              </div>
              <PublicDemoGuardrail quota={quota} />
            </div>
          ) : (
            <div className="grid gap-4">
              {grouped.map((group) => (
                <section key={group.category} className="mass-social-demo-category">
                  <div className="mass-social-demo-category__heading">
                    <span>{group.category}</span>
                    <strong>{group.items.length}</strong>
                  </div>
                  <div className="grid gap-3">
                    {group.items.map((item) => (
                      <article key={item.id} className="mass-social-demo-output-card">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-[0.58rem] uppercase tracking-[0.18em] text-muted">
                              {item.sourceLabel} · Depth {item.qualityScore}/5
                            </p>
                            <h4 className="mt-2 text-lg font-semibold leading-tight tracking-[-0.02em] text-text-primary">
                              {item.title}
                            </h4>
                          </div>
                          <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-[#5f7f9f] hover:text-text-primary">
                            Source →
                          </a>
                        </div>
                        <div className="mass-social-demo-transcription mt-4">
                          {getItemSections(item).map((section) => (
                            <section key={`${item.id}-${section.heading}`} className="mass-social-demo-transcription-section">
                              <h5>{section.heading}</h5>
                              {section.paragraphs.map((paragraph, paragraphIndex) => (
                                <p key={`${item.id}-${section.heading}-${paragraphIndex}`}>{paragraph}</p>
                              ))}
                            </section>
                          ))}
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
              <PublicDemoGuardrail quota={quota} />
            </div>
          )}
        </div>

        <footer className={`mass-social-demo-terminal mt-5 shrink-0 ${isTerminalMinimised ? 'is-minimised' : ''}`}>
          <div className="mass-social-demo-terminal__header">
            <p>Status terminal</p>
            <div className="mass-social-demo-terminal__controls">
              <button
                type="button"
                className="mass-social-demo-terminal__toggle"
                aria-expanded={!isTerminalMinimised}
                aria-controls="mass-social-status-terminal-body"
                onClick={() => setIsTerminalMinimised((value) => !value)}
              >
                <span aria-hidden="true">{isTerminalMinimised ? '+' : '-'}</span>
                <span className="sr-only">{isTerminalMinimised ? 'Expand status terminal' : 'Minimise status terminal'}</span>
              </button>
            </div>
          </div>
          <div id="mass-social-status-terminal-body" className="mass-social-demo-terminal__body">
            {job?.log.length || isStarting ? (
              <>
                {isStarting && !job ? (
                  <p data-tone="active">
                    <time>--:--:--</time>
                    Starting transcription job...
                  </p>
                ) : null}
                {job?.log.map((line) => (
                  <p key={line.id} data-tone={getLogTone(line.message)}>
                    <time>{formatLogTime(line.at)}</time>
                    {line.message}
                  </p>
                ))}
              </>
            ) : (
              <p>
                <time>--:--:--</time>
                Waiting for a transcription run.
              </p>
            )}
          </div>
        </footer>
      </section>
    </article>
  );
}
