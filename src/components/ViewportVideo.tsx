import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import { canSpeculativelyLoad } from '../performance/loadingPolicy';
import './viewportMedia.css';

type Connection = EventTarget & { saveData?: boolean; effectiveType?: string };

function prefersStaticPreview() {
  return !canSpeculativelyLoad();
}

type ViewportVideoProps = {
  src: string;
  poster?: string;
  className?: string;
  label: string;
  style?: CSSProperties;
};

/** Playback consent applies to one recording, including in static/data-saving modes. */
export function ViewportVideo(props: ViewportVideoProps) {
  return <ViewportVideoPlayback key={props.src} {...props} />;
}

function ViewportVideoPlayback({ src, poster, className, label, style }: ViewportVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);
  const [staticPreview, setStaticPreview] = useState(prefersStaticPreview);
  const [documentVisible, setDocumentVisible] = useState(() => typeof document === 'undefined' || !document.hidden);
  const [userPlaying, setUserPlaying] = useState<boolean | null>(null);
  const [requested, setRequested] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState(false);
  const shouldPlay = visible && documentVisible && (userPlaying ?? !staticPreview);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.05 });
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const update = () => setStaticPreview(prefersStaticPreview());
    const visibility = () => { setDocumentVisible(!document.hidden); update(); };
    media.addEventListener('change', update);
    connection?.addEventListener('change', update);
    document.addEventListener('visibilitychange', visibility);
    return () => {
      media.removeEventListener('change', update);
      connection?.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, []);

  useEffect(() => { if (shouldPlay) setRequested(true); }, [shouldPlay]);
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !requested) return;
    if (shouldPlay) void video.play().catch(() => setPlaying(false));
    else video.pause();
  }, [requested, shouldPlay, src]);

  return (
    <>
      <video
        ref={videoRef}
        src={requested ? src : undefined}
        poster={poster}
        className={className}
        style={style}
        aria-label={label}
        data-preview-state={`${visible ? 'in-view' : 'offscreen'} ${documentVisible ? 'document-visible' : 'document-hidden'} ${shouldPlay ? 'play' : 'pause'}`}
        muted loop playsInline preload="none"
        onPlay={() => { setPlaying(true); setError(false); }}
        onPause={() => setPlaying(false)}
        onError={() => { setPlaying(false); setError(true); }}
      />
      <button
        type="button"
        className="viewport-media-toggle"
        aria-label={`${playing ? 'Pause' : 'Play'} ${label}`}
        onClick={() => {
          setUserPlaying(!playing);
          if (!playing) {
            setRequested(true);
            setError(false);
            if (requested && videoRef.current) {
              if (error) videoRef.current.load();
              void videoRef.current.play().catch(() => setPlaying(false));
            }
          }
        }}
      >
        <span aria-hidden="true">{playing ? 'Ⅱ' : '▶'}</span>
        {playing ? 'Pause preview' : error ? 'Retry preview' : 'Play preview'}
      </button>
    </>
  );
}
