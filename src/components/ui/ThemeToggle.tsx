'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { SunIcon, MoonIcon } from '@/components/ui/Icons';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-8 h-8" />;
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/5 transition-all duration-200"
      title={isDark ? '切换浅色模式' : '切换深色模式'}
      aria-label="切换主题"
    >
      <span className="block transition-transform duration-500 rotate-0">
        {isDark ? <MoonIcon className="w-4 h-4" /> : <SunIcon className="w-4 h-4" />}
      </span>
    </button>
  );
}
