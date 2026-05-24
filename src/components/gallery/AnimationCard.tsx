import Link from 'next/link';
import type { AnimationMeta } from '@/types';
import { Badge, SourceBadge } from '@/components/ui/Badge';
import { MechanismCover } from '@/components/ui/MechanismCover';

export function AnimationCard({ anim, index }: { anim: AnimationMeta; index: number }) {
  return (
    <Link
      href={`/animation/${anim.slug}`}
      prefetch={false}
      className="group block"
      style={{ '--i': index } as React.CSSProperties}
    >
      <div className="double-bezel">
        <div className="double-bezel-inner">
          {/* Cover */}
          <div className="relative h-44 overflow-hidden">
            <MechanismCover slug={anim.slug} category={anim.category} size="card" coverImage={anim.coverImage} />
            <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors duration-500 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0 text-xs font-medium text-white bg-accent/90 px-4 py-2 rounded-full backdrop-blur-sm">
                观看演示
              </span>
            </div>
            <div className="absolute top-3 right-3">
              <SourceBadge source={anim.source} />
            </div>
          </div>

          {/* Info */}
          <div className="p-4 space-y-2.5">
            <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-accent transition-colors duration-300">
              {anim.title}
            </h3>
            <p className="text-xs text-muted line-clamp-2 leading-relaxed">
              {anim.description || anim.subtitle}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge category={anim.category} />
              {anim.tags.slice(0, 2).map((tag) => (
                <span
                  key={tag}
                  className="text-[10px] text-muted/70 bg-foreground/[0.03] px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
