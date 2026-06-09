'use client';

import { TeachingAgent } from '@/components/agent/TeachingAgent';

export function AgentPageClient() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-1 h-5 rounded-full bg-accent/60" />
          <h1 className="text-xl font-bold text-foreground tracking-tight">
            AI 理论力学助教
          </h1>
          <span className="text-[11px] text-muted bg-accent/8 px-2 py-0.5 rounded-full border border-accent/15">
            Beta
          </span>
        </div>
        <p className="text-sm text-muted max-w-lg">
          基于同济大学《理论力学》教材的知识体系，涵盖静力学、运动学、
          动力学、分析力学与振动理论。随时向我提问，我将为你逐步讲解。
        </p>
      </div>

      {/* Agent chat panel */}
      <TeachingAgent />
    </div>
  );
}
