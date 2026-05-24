'use client';

import { useEffect } from 'react';
import { AlertIcon } from '@/components/ui/Icons';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-5">
        <span className="inline-block text-muted/30">
          <AlertIcon className="w-14 h-14" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">页面出错了</h2>
        <p className="text-sm text-muted max-w-sm mx-auto">
          {error.message || '发生了意外错误，请稍后重试'}
        </p>
        <div className="flex items-center justify-center gap-3 pt-1">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-all duration-200 active:scale-[0.98]"
          >
            重试
          </button>
          <a
            href="/"
            className="px-5 py-2.5 rounded-xl glass-sm text-sm text-muted hover:text-foreground transition-all duration-200"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
