'use client';

import { TeachingAgent } from '@/components/agent/TeachingAgent';

export function AgentPageClient() {
  return (
    <div className="min-h-screen pt-28 pb-16 px-4 sm:px-6 max-w-4xl mx-auto">
      {/* Page header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <img src="/agent-logo.png" alt="" className="w-10 h-10 rounded-full object-cover border-2 border-accent/30" />
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              AI助手-力学搭子
            </h1>
          </div>
          <span className="text-xs text-muted bg-accent/8 px-2.5 py-1 rounded-full border border-accent/15">
            Beta
          </span>
        </div>
        <p className="text-base text-muted max-w-lg leading-relaxed">
          基于《理论力学》教材+练习册+课件，涵盖静力学、运动学、
          动力学、分析力学与振动理论。随时向我提问，力学搭子陪你一起学。
        </p>
      </div>

      {/* Agent chat panel */}
      <TeachingAgent />
    </div>
  );
}
