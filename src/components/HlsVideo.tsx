import { useEffect, useRef } from 'react';
import Hls from 'hls.js';

type HlsVideoProps = {
  src: string;
  className?: string;
  overlayClassName?: string;
  flipped?: boolean;
};

export function HlsVideo({ src, className = '', overlayClassName, flipped = false }: HlsVideoProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;

    let hls: Hls | undefined;
    const play = () => {
      void video.play().catch(() => {
        // Autoplay can be refused in unusual browser states. The muted video remains decorative.
      });
    };

    if (Hls.isSupported()) {
      hls = new Hls({
        enableWorker: true,
        lowLatencyMode: false,
      });
      hls.loadSource(src);
      hls.attachMedia(video);
      hls.on(Hls.Events.MANIFEST_PARSED, play);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src;
      video.addEventListener('loadedmetadata', play);
    }

    return () => {
      video.removeEventListener('loadedmetadata', play);
      hls?.destroy();
    };
  }, [src]);

  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      <video
        ref={videoRef}
        crossOrigin="anonymous"
        data-glass-media
        muted
        loop
        autoPlay
        playsInline
        className={`absolute left-1/2 top-1/2 min-h-full min-w-full -translate-x-1/2 -translate-y-1/2 object-cover ${
          flipped ? 'scale-y-[-1]' : ''
        }`}
      />
      {overlayClassName ? <div className={`absolute inset-0 ${overlayClassName}`} /> : null}
    </div>
  );
}
