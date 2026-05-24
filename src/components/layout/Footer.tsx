'use client';

import { useRef, useCallback } from 'react';
import Link from 'next/link';
import { useAdmin } from '@/components/admin/AdminProvider';

export function Footer() {
  const { openLogin } = useAdmin();
  const clicksRef = useRef({ count: 0, timer: 0 as unknown as ReturnType<typeof setTimeout> });

  const handleCopyrightClick = useCallback(() => {
    const state = clicksRef.current;
    state.count += 1;

    if (state.count === 1) {
      state.timer = setTimeout(() => {
        state.count = 0;
      }, 600);
    } else if (state.count >= 3) {
      clearTimeout(state.timer);
      state.count = 0;
      openLogin();
    }
  }, [openLogin]);

  return (
    <footer className="border-t border-border">
      <div className="max-w-7xl mx-auto px-4 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm text-muted">
          <Link href="/" className="hover:text-foreground transition-colors duration-200">
            首页
          </Link>
          <Link href="/upload" className="hover:text-foreground transition-colors duration-200">
            上传
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors duration-200"
          >
            GitHub
          </a>
        </div>
        <p
          className="text-xs text-muted/60 select-none cursor-default"
          onClick={handleCopyrightClick}
        >
          理论力学课程辅助学习平台 &middot; Next.js + Three.js
        </p>
      </div>
    </footer>
  );
}
