'use client';

import dynamic from 'next/dynamic';
import type { AnimationMeta } from '@/types';

// Lazy-load the actual client component — only loads JS when this component mounts
const WatchPageClient = dynamic(
  () => import('./client').then((m) => ({ default: m.WatchPageClient })),
  { ssr: false }
);

export function WatchPageWrapper({
  anim,
  src,
}: {
  anim: AnimationMeta;
  src: string;
}) {
  return <WatchPageClient anim={anim} src={src} />;
}
