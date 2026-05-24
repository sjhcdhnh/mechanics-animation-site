'use client';

import { useState, useEffect, useRef } from 'react';
import { SearchIcon, CloseIcon } from '@/components/ui/Icons';

export function SearchBar({
  onSearch,
}: {
  onSearch: (query: string) => void;
}) {
  const [value, setValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      onSearch(value.trim());
    }, 300);
    return () => clearTimeout(timerRef.current);
  }, [value, onSearch]);

  return (
    <div className="relative w-full max-w-sm">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted/50">
        <SearchIcon className="w-4 h-4" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="搜索机构..."
        className="w-full pl-10 pr-10 py-2.5 bg-foreground/[0.03] border border-border rounded-xl text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 focus:bg-foreground/[0.05] transition-all duration-200"
      />
      {value && (
        <button
          onClick={() => setValue('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted/40 hover:text-muted transition-colors duration-200"
          aria-label="清除搜索"
        >
          <CloseIcon className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
