'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import type { AnimationMeta } from '@/types';
import { ArrowLeftIcon } from '@/components/ui/Icons';

export function ViewerToolbar({
  anim,
  onToggleExplain,
  onStop,
  onFullscreen,
  explainOpen,
}: {
  anim: AnimationMeta;
  onToggleExplain: () => void;
  onStop: () => void;
  onFullscreen: () => void;
  explainOpen: boolean;
}) {
  const [visible, setVisible] = useState(true);
  const [idleTimer, setIdleTimer] = useState<ReturnType<typeof setTimeout>>();

  const resetTimer = useCallback(() => {
    setVisible(true);
    if (idleTimer) clearTimeout(idleTimer);
    const timer = setTimeout(() => setVisible(false), 3000);
    setIdleTimer(timer);
  }, [idleTimer]);

  useEffect(() => {
    resetTimer();
    window.addEventListener('mousemove', resetTimer);
    return () => {
      window.removeEventListener('mousemove', resetTimer);
      if (idleTimer) clearTimeout(idleTimer);
    };
  }, []);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'
      }`}
      onMouseEnter={() => {
        setVisible(true);
        if (idleTimer) clearTimeout(idleTimer);
      }}
    >
      <div className="glass-sm mx-4 mt-3 px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href="/"
            className="flex-shrink-0 p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/6 transition-all duration-200"
            title="返回首页"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </Link>
          <div className="min-w-0">
            <h2 className="text-sm font-semibold text-foreground truncate">{anim.title}</h2>
            <p className="text-[11px] text-muted truncate">{anim.mechanismType}</p>
          </div>
        </div>

        {/* Right: Action buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={onToggleExplain}
            className={`p-2 rounded-lg text-sm transition-all duration-200 ${
              explainOpen
                ? 'bg-accent/20 text-accent'
                : 'text-muted hover:text-foreground hover:bg-foreground/6'
            }`}
            title="AI 解释"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </button>

          <button
            onClick={onFullscreen}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-foreground/6 transition-all duration-200"
            title="全屏"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
            </svg>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-foreground/6 transition-all duration-200"
            title="复制链接"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </button>

          <span className="w-px h-5 bg-border mx-0.5" />

          <button
            onClick={onStop}
            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200"
            title="停止播放"
          >
            <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="6" width="12" height="12" rx="1" strokeWidth={1.5} />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
