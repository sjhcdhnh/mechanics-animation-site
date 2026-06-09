import type { Metadata } from 'next';
import { AgentPageClient } from './client';

export const metadata: Metadata = {
  title: 'AI 理论力学助教 — 力拔·理力创见',
  description:
    '基于同济版《理论力学》教材的 AI 教学助手，涵盖静力学、运动学、动力学、分析力学与振动理论，随时解答你的理论力学问题。',
};

export default function AgentPage() {
  return <AgentPageClient />;
}
