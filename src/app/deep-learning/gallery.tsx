'use client';

import Link from 'next/link';
import projects from '@/data/projects.json';
import { MechanismCover } from '@/components/ui/MechanismCover';

export function ProjectsGallery() {
  const items = projects as any[];

  const getLink = (proj: any) => {
    if (proj.slug === 'deep-learning-4bar-rl') return '/deep-learning';
    if (proj.slug === 'pinn-demo') return '/deep-learning/pinn';
    if (proj.slug === 'truss-solver') return '/deep-learning/truss';
    return `/animation/${proj.slug}`;
  };

  return (
    <div className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <p className="text-xs tracking-widest text-muted/60 uppercase mb-3">Projects</p>
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full bg-accent/60" />
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              专题项目
            </h1>
          </div>
          <p className="mt-3 text-sm text-muted max-w-xl leading-relaxed">
            深度强化学习、物理信息神经网络等前沿交叉课题的独立展示。每个项目都有交互式三维演示与详细说明，点击卡片即可查看。
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
          {items.map((proj: any, i: number) => (
            <Link
              key={proj.slug}
              href={getLink(proj)}
              prefetch={false}
              className="group block"
              style={{ '--i': i } as React.CSSProperties}
            >
              <div className="double-bezel">
                <div className="double-bezel-inner">
                  {/* Cover */}
                  <div className="relative h-44 overflow-hidden">
                    <MechanismCover
                      slug={proj.slug}
                      category={proj.category}
                      size="card"
                      coverImage={proj.coverImage}
                    />
                    <div className="absolute inset-0 bg-background/0 group-hover:bg-background/10 transition-colors duration-500 flex items-center justify-center">
                      <span className="opacity-0 group-hover:opacity-100 transition-all duration-400 translate-y-2 group-hover:translate-y-0 text-xs font-medium text-white bg-accent/90 px-4 py-2 rounded-full backdrop-blur-sm">
                        查看项目
                      </span>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2.5">
                    <h3 className="text-sm font-semibold text-foreground leading-snug group-hover:text-accent transition-colors line-clamp-2">
                      {proj.title}
                    </h3>
                    <p className="text-xs text-muted line-clamp-2 leading-relaxed">
                      {proj.description}
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {proj.tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="text-[10px] text-muted bg-foreground/5 px-2 py-0.5 rounded-full border border-border/50"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    {proj.author && (
                      <p className="text-[11px] text-muted/70 pt-1">
                        {proj.author}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
