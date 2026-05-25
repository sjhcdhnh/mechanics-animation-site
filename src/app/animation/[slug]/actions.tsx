'use client';

import { useRouter } from 'next/navigation';
import { LikeButton } from '@/components/ui/LikeButton';
import { useAdmin } from '@/components/admin/AdminProvider';
import { useState } from 'react';
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
  const { token } = useAdmin();
  const [downloading, setDownloading] = useState(false);

  const blobDownload = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownload = async () => {
    if (!token) return;
    setDownloading(true);
    try {
      // Download HTML
      const htmlRes = await fetch(`/api/admin/download/${slug}?format=html`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (htmlRes.ok) {
        const htmlBlob = await htmlRes.blob();
        blobDownload(htmlBlob, anim.fileName);
      }

      // Download metadata JSON
      const metaRes = await fetch(`/api/admin/download/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (metaRes.ok) {
        const metaBlob = await metaRes.blob();
        blobDownload(metaBlob, anim.fileName.replace(/\.html$/, '.json'));
      }
    } catch {
      // silent
    } finally {
      setDownloading(false);
    }
  };

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

        {token && (
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3.5 glass-sm text-sm text-muted hover:text-foreground transition-all duration-200 disabled:opacity-30"
            title="下载动画（含元数据）"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {downloading ? '下载中...' : '下载'}
          </button>
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
