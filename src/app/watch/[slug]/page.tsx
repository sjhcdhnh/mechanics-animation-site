import { getAnimationBySlugAsync } from '@/lib/animation-registry';
import { WatchPageWrapper } from './wrapper';
import { EmptyIcon } from '@/components/ui/Icons';
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

export default async function WatchPage({ params }: Props) {
  const { slug } = await params;
  const anim = await getAnimationBySlugAsync(slug);

  if (!anim) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <span className="inline-block text-muted/30">
            <EmptyIcon className="w-14 h-14" />
          </span>
          <h2 className="text-lg font-semibold text-foreground">动画未找到</h2>
          <p className="text-sm text-muted">slug: {slug}</p>
          <a href="/" className="text-sm text-accent hover:text-accent-hover transition-colors duration-200">
            返回首页
          </a>
        </div>
      </div>
    );
  }

  // Uploaded: proxy through API to strip Content-Disposition
  // Built-in: direct URL (served by Next.js static files)
  const src = anim.source === 'builtin'
    ? `/animations/${anim.fileName}`
    : `/api/animations/${anim.slug}/view`;

  return <WatchPageWrapper anim={anim} src={src} />;
}
