import type { Metadata } from 'next';
import { ProjectsGallery } from './gallery';

export const metadata: Metadata = {
  title: '专题项目 — 力拔·理力创见',
  description: '深度强化学习、PINN物理信息网络等前沿交叉项目展示。',
};

export default function ProjectsPage() {
  return <ProjectsGallery />;
}
