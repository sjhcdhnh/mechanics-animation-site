'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnimationMeta } from '@/types';
import { AnimationViewer } from '@/components/viewer/AnimationViewer';
import { ViewerToolbar } from '@/components/viewer/ViewerToolbar';
import { ExplainPanel } from '@/components/viewer/ExplainPanel';
import { MechanismCover } from '@/components/ui/MechanismCover';

export function WatchPageClient({
  anim,
  src,
}: {
  anim: AnimationMeta;
  src: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [explainOpen, setExplainOpen] = useState(false);

  const toggleExplain = useCallback(() => {
    setExplainOpen((prev) => !prev);
  }, []);

  const handleStop = useCallback(() => {
    setPlaying(false);
    setExplainOpen(false);
  }, []);

  const handleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  }, []);

  // Resource cleanup on unmount
  useEffect(() => {
    return () => {
      setPlaying(false);
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-background">
      {/* Toolbar */}
      {playing && (
        <ViewerToolbar
          anim={anim}
          onToggleExplain={toggleExplain}
          onStop={handleStop}
          onFullscreen={handleFullscreen}
          explainOpen={explainOpen}
        />
      )}

      {/* Cover / Animation */}
      {!playing ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-8">
            <div className="w-72 h-48 mx-auto rounded-2xl overflow-hidden border border-border shadow-lg">
              <MechanismCover slug={anim.slug} category={anim.category} size="cover" coverImage={anim.coverImage} />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold text-foreground">{anim.title}</h1>
              <p className="text-sm text-muted max-w-md">{anim.subtitle}</p>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                {anim.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-muted bg-foreground/5 px-2 py-0.5 rounded-full border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            <button
              onClick={() => setPlaying(true)}
              className="group relative inline-flex items-center gap-3 px-8 py-4 bg-accent text-accent-fg text-base font-semibold rounded-2xl hover:bg-accent-hover transition-all duration-200 active:scale-[0.98]"
            >
              <svg
                className="w-5 h-5 transition-transform group-hover:scale-110"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
              点击播放动画
            </button>

            <p className="text-[11px] text-muted">
              加载动画需要消耗 GPU 资源
            </p>
          </div>
        </div>
      ) : (
        <AnimationViewer src={src} playing={playing} />
      )}

      {/* Explain panel */}
      <ExplainPanel
        anim={anim}
        isOpen={explainOpen}
        onClose={() => setExplainOpen(false)}
      />

      {/* Floating action buttons (visible when playing, explain closed) */}
      {playing && !explainOpen && (
        <div className="fixed bottom-6 right-6 z-30 flex flex-col gap-2">
          <button
            onClick={toggleExplain}
            title="AI 解释"
            className="w-10 h-10 rounded-full bg-surface border border-border text-muted hover:text-accent hover:border-accent/30 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>
          <button
            onClick={handleFullscreen}
            title="全屏"
            className="w-10 h-10 rounded-full bg-surface border border-border text-muted hover:text-foreground hover:border-border flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>
          <button
            onClick={handleStop}
            title="停止播放"
            className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/30 flex items-center justify-center transition-all duration-200 backdrop-blur-sm"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" strokeWidth={1.5} />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
