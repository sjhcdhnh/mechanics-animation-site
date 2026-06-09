'use client';

import { useState } from 'react';
import { TeachingAgent } from './TeachingAgent';
import { SparkleIcon } from '@/components/ui/Icons';

export function AgentSection() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="space-y-0">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-1 h-5 rounded-full bg-accent/60" />
          <h2 className="text-lg font-bold text-foreground tracking-tight">
            AI 理论力学助教
          </h2>
          <span className="text-[11px] text-muted bg-accent/8 px-2 py-0.5 rounded-full border border-accent/15">
            Beta
          </span>
        </div>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-1.5 text-xs text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg hover:bg-foreground/5"
        >
          <span>{collapsed ? '展开面板' : '收起面板'}</span>
          <svg
            className={`w-3.5 h-3.5 transition-transform duration-300 ${
              collapsed ? '' : 'rotate-180'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* Agent content */}
      <div
        className={`transition-all duration-500 ease-out overflow-hidden ${
          collapsed
            ? 'max-h-0 opacity-0'
            : 'max-h-[2000px] opacity-100'
        }`}
      >
        {/* Decorative top glow */}
        <div className="relative">
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-[500px] h-[120px] pointer-events-none opacity-[0.04] rounded-full"
            style={{ background: 'radial-gradient(ellipse, var(--accent) 0%, transparent 70%)' }}
          />
        </div>

        <TeachingAgent />
      </div>
    </div>
  );
}
