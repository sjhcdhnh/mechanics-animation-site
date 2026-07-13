import type { Metadata } from 'next';
import { TrussWorkbench } from './TrussWorkbench';

export const metadata: Metadata = {
  title: '桁架问题求解器 | 力拔·理力创见',
  description: '支持网格绘图、杆件连接、支座荷载设置、静定桁架求解与 AI 简明讲解。',
};

export default function TrussSolverPage() {
  return <TrussWorkbench />;
}
