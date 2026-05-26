'use client';

import { useState, useRef, useEffect } from 'react';

export function AnimationViewer({ src, playing }: { src: string; playing: boolean }) {
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Destroy Three.js resources when iframe unmounts
  useEffect(() => {
    return () => {
      if (iframeRef.current) {
        // Clear src to stop all rendering loops and release WebGL context
        iframeRef.current.src = 'about:blank';
        iframeRef.current.remove();
      }
    };
  }, []);

  // When playing stops, clean up the iframe
  useEffect(() => {
    if (!playing && iframeRef.current) {
      iframeRef.current.src = 'about:blank';
      setLoaded(false);
    }
  }, [playing]);

  if (!playing) return null;

  return (
    <div className="relative w-full h-full bg-background">
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
            <p className="text-sm text-muted">加载动画中...</p>
          </div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        className="w-full h-full border-0"
        onLoad={() => setLoaded(true)}
        title="力拔·理力创见"
        allow="accelerometer; autoplay; clipboard-write;"
      />
    </div>
  );
}
