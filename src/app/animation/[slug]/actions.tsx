'use client';

import { useRouter } from 'next/navigation';
import { LikeButton } from '@/components/ui/LikeButton';
import type { AnimationMeta } from '@/types';

export function DetailActions({
  slug,
  anim,
  initialLikes = 0,
}: {
  slug: string;
  anim: AnimationMeta;
  initialLikes?: number;
}) {
  const router = useRouter();

  const downloadUrl =
    anim.source === 'builtin'
      ? `/animations/${anim.fileName}`
      : `/uploads/${anim.fileName}`;

  return (
    <div className="flex flex-col sm:flex-row gap-3 pt-2">
      <button
        onClick={() => router.push(`/watch/${slug}`)}
        className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent text-accent-fg text-sm font-semibold rounded-xl hover:bg-accent-hover transition-all duration-200 active:scale-[0.98] shadow-lg shadow-accent/20"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z" />
        </svg>
        进入动画演示
      </button>

      <div className="flex items-center gap-3">
        <LikeButton slug={slug} initialLikes={initialLikes} />

        {anim.downloadable !== false && (
          <a
            href={downloadUrl}
            download={anim.fileName}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 glass-sm text-sm text-muted hover:text-foreground transition-all duration-200"
            title="下载动画文件"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            下载
          </a>
        )}

        <a
          href="/"
          className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 glass-sm text-sm text-muted hover:text-foreground transition-all duration-200"
        >
          返回画廊
        </a>
      </div>
    </div>
  );
}
