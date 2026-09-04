'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, Loader2, Play, RefreshCw } from 'lucide-react';

type PreloadMode = 'none' | 'metadata' | 'auto';

interface LazyVideoProps {
  /** The video URL. No bytes are fetched until the element is close to the viewport. */
  src: string;
  /** Classes for the wrapper (sizing / aspect ratio / background). */
  className?: string;
  /** Classes for the <video> element (object-fit, etc.). */
  videoClassName?: string;
  /**
   * How much of the video to load once it starts loading.
   * `metadata` (default) shows the first frame without downloading the whole file.
   */
  preload?: PreloadMode;
  /**
   * Extra space around the viewport (CSS length) that triggers loading,
   * e.g. `'300px'` or `'0px 0px 400px 0px'`.
   */
  rootMargin?: string;
  /**
   * Completely defer the download until the user presses play.
   * Recommended for large showcase videos so a page with several videos
   * only fetches the ones the visitor actually watches.
   */
  clickToPlay?: boolean;
  /** Show native controls once the video is loaded. */
  controls?: boolean;
  muted?: boolean;
  loop?: boolean;
  playsInline?: boolean;
  /** Optional poster image shown while the video isn't loaded yet. */
  poster?: string;
  /** Accessible label for the play/retry button. */
  label?: string;
}

export default function LazyVideo({
  src,
  className = '',
  videoClassName = '',
  preload = 'metadata',
  rootMargin = '300px',
  clickToPlay = false,
  controls = false,
  muted = false,
  loop = false,
  playsInline = false,
  poster,
  label = 'Play video',
}: LazyVideoProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [nearViewport, setNearViewport] = useState(false);
  const [started, setStarted] = useState(false); // user asked to play
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Attach <video src> only when the media is actually needed:
  //  - clickToPlay: only after the user presses play (nothing is downloaded before that)
  //  - otherwise:   once the element is within rootMargin of the viewport
  const attachSrc = clickToPlay ? started : nearViewport || started;

  // Defer loading until the element is close to the viewport.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (typeof IntersectionObserver === 'undefined') {
      setNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setNearViewport(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  // Once the user asked to play, start playback as soon as data is available.
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !started || !attachSrc) return;

    const tryPlay = () => {
      video
        .play()
        .then(() => {
          setLoading(false);
          setPlaying(true);
        })
        .catch(() => {
          setLoading(false);
          setFailed(true);
        });
    };

    if (video.readyState >= 2) {
      tryPlay();
    } else {
      video.addEventListener('loadeddata', tryPlay);
      video.addEventListener('canplay', tryPlay);
    }

    return () => {
      video.removeEventListener('loadeddata', tryPlay);
      video.removeEventListener('canplay', tryPlay);
    };
  }, [started, attachSrc]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      setLoading(true);
      setFailed(false);
      video
        .play()
        .then(() => {
          setLoading(false);
          setPlaying(true);
        })
        .catch(() => {
          setLoading(false);
          setFailed(true);
        });
    } else {
      video.pause();
    }
  }, []);

  const handlePlayClick = useCallback(() => {
    setFailed(false);
    const video = videoRef.current;

    if (clickToPlay && !started) {
      // First interaction — now it's OK to fetch the file.
      setStarted(true);
      setLoading(true);
      return;
    }

    if (!video || !video.src) {
      // The source hasn't been attached yet — attach it and autoplay once ready.
      setStarted(true);
      setLoading(true);
      return;
    }

    togglePlay();
  }, [clickToPlay, started, togglePlay]);

  const handleRetry = useCallback(() => {
    setFailed(false);
    setLoading(true);
    setStarted(true);
    // Remount the <video> element to force a fresh request.
    setReloadKey((k) => k + 1);
  }, []);

  const showSpinner = loading && !failed;
  const showCenterButton =
    failed ||
    (clickToPlay && !started && !loading) ||
    (!clickToPlay && !playing && !loading && !failed);

  return (
    <div ref={containerRef} className={`relative overflow-hidden ${className}`}>
      {attachSrc ? (
        <video
          key={reloadKey}
          ref={videoRef}
          src={src}
          preload={preload}
          controls={controls}
          muted={muted}
          loop={loop}
          playsInline={playsInline}
          poster={poster}
          onClick={controls ? undefined : handlePlayClick}
          onPlay={() => {
            setPlaying(true);
            setLoading(false);
          }}
          onPause={() => setPlaying(false)}
          onWaiting={() => setLoading(true)}
          onPlaying={() => {
            setLoading(false);
            setPlaying(true);
          }}
          onCanPlay={() => setLoading(false)}
          onError={() => {
            setLoading(false);
            setPlaying(false);
            setFailed(true);
          }}
          className={`block h-full w-full ${videoClassName}`}
          aria-label={label}
        />
      ) : (
        poster && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={poster} alt={label} className="h-full w-full object-cover" />
        )
      )}

      {showSpinner && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-white drop-shadow" />
        </div>
      )}

      {showCenterButton && (
        <button
          type="button"
          onClick={handlePlayClick}
          aria-label={failed ? `Retry ${label}` : label}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          {failed ? (
            <span className="flex items-center gap-2 rounded-full bg-black/70 px-4 py-2 text-sm font-medium text-white">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Couldn&apos;t load
              <RefreshCw className="h-4 w-4" />
            </span>
          ) : (
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white transition hover:bg-black/70">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </span>
          )}
        </button>
      )}
    </div>
  );
}