'use client';

import { MechanismCover } from '@/components/ui/MechanismCover';
import { SourceBadge } from '@/components/ui/Badge';

export function DetailThumbnail({
  slug,
  category,
  source,
  coverImage,
}: {
  slug: string;
  category: string;
  source: 'builtin' | 'uploaded';
  coverImage?: string;
}) {
  return (
    <div className="relative h-64 lg:h-full min-h-[280px] rounded-2xl border border-border overflow-hidden">
      <MechanismCover slug={slug} category={category} size="detail" coverImage={coverImage} />
      <div className="absolute top-4 right-4">
        <SourceBadge source={source} />
      </div>
    </div>
  );
}
