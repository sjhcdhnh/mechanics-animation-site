import { getAllAnimationsAsync, getAnimationBySlugAsync } from '@/lib/animation-registry';
import { Badge } from '@/components/ui/Badge';
import { DetailActions } from './actions';
import { DetailThumbnail } from './thumbnail';
import { CommentSection } from '@/components/viewer/CommentSection';
import { ArrowLeftIcon } from '@/components/ui/Icons';
import type { Metadata } from 'next';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const anim = await getAnimationBySlugAsync(slug);

  if (!anim) {
    return { title: '动画未找到' };
  }

  return {
    title: `${anim.title} — 力拔理力集`,
    description: anim.description || anim.subtitle,
  };
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default async function AnimationDetailPage({ params }: Props) {
  const { slug } = await params;
  const anim = await getAnimationBySlugAsync(slug);

  if (!anim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-lg font-semibold text-foreground">动画未找到</h2>
          <p className="text-sm text-muted">slug: {slug}</p>
          <a href="/" className="text-sm text-accent hover:text-accent-hover transition-colors duration-200">
            返回首页
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Breadcrumb */}
        <div className="mb-6">
          <a
            href="/"
            className="text-sm text-muted hover:text-accent transition-colors duration-200 inline-flex items-center gap-1"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            返回画廊
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: Thumbnail */}
          <div className="lg:col-span-2">
            <DetailThumbnail
              slug={anim.slug}
              category={anim.category}
              source={anim.source}
              coverImage={anim.coverImage}
            />
          </div>

          {/* Right: Metadata */}
          <div className="lg:col-span-3 space-y-6">
            {/* Title area */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">{anim.title}</h1>
              <p className="text-sm text-muted">{anim.subtitle}</p>
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <Badge category={anim.category} />
                {anim.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] text-muted bg-foreground/5 px-2 py-0.5 rounded-full border border-border"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Mechanism info */}
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">机构信息</h3>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div>
                  <span className="text-muted">机构类型</span>
                  <p className="text-foreground font-medium">{anim.mechanismType}</p>
                </div>
                {anim.author && (
                  <div>
                    <span className="text-muted">作者</span>
                    <p className="text-foreground font-medium">{anim.author}</p>
                  </div>
                )}
                {anim.institution && (
                  <div>
                    <span className="text-muted">机构/学校</span>
                    <p className="text-foreground font-medium">{anim.institution}</p>
                  </div>
                )}
                {anim.course && (
                  <div>
                    <span className="text-muted">课程</span>
                    <p className="text-foreground font-medium">{anim.course}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            {anim.description && (
              <div className="glass-sm p-5 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">动画简介</h3>
                <p className="text-sm text-muted leading-relaxed">{anim.description}</p>
              </div>
            )}

            {/* Model description */}
            {anim.modelDescription && (
              <div className="glass-sm p-5 space-y-2">
                <h3 className="text-sm font-semibold text-foreground">模型介绍</h3>
                <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                  {anim.modelDescription}
                </p>
              </div>
            )}

            {/* File info */}
            <div className="glass-sm p-5 space-y-2">
              <h3 className="text-sm font-semibold text-foreground">文件信息</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-1 text-sm">
                <div>
                  <span className="text-muted">来源</span>
                  <p className="text-foreground">
                    {anim.source === 'builtin' ? '内置' : '用户上传'}
                  </p>
                </div>
                <div>
                  <span className="text-muted">文件名</span>
                  <p className="text-foreground font-mono text-xs">{anim.fileName}</p>
                </div>
                {anim.fileSize && (
                  <div>
                    <span className="text-muted">文件大小</span>
                    <p className="text-foreground">{formatFileSize(anim.fileSize)}</p>
                  </div>
                )}
                {anim.uploadDate && (
                  <div>
                    <span className="text-muted">上传日期</span>
                    <p className="text-foreground">{formatDate(anim.uploadDate)}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <DetailActions slug={anim.slug} anim={anim} initialLikes={anim.likes ?? 0} />

            {/* Comments */}
            <div className="glass-sm p-5">
              <CommentSection slug={anim.slug} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
