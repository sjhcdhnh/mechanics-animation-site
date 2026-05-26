import { getAllAnimations } from "@/lib/animation-registry";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { HeroGallery } from "@/components/gallery/HeroGallery";
import { MouseIcon, LayersIcon, SparkleIcon } from "@/components/ui/Icons";

export default function HomePage() {
  const animations = getAllAnimations();
  const categoryCount = [...new Set(animations.map((a) => a.category))].length;

  const stats = [
    { value: animations.length, label: '机构动画' },
    { value: '3D', label: '可交互' },
    { value: categoryCount, label: '分类' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero — split layout: text left, gallery right */}
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Ambient light */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, var(--accent) 0%, transparent 70%)' }}
          />
        </div>

        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.022]"
          style={{
            backgroundImage: 'radial-gradient(circle, currentColor 0.5px, transparent 0.5px)',
            backgroundSize: '30px 30px',
          }}
        />

        <div className="relative max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10 items-start">
            {/* Left: Text — 2/5 */}
            <div className="lg:col-span-2 max-w-xl lg:pt-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-foreground/[0.04] border border-border text-[11px] text-muted font-medium mb-8">
                <span className="w-1.5 h-1.5 rounded-full bg-accent/60" />
                力学拔尖基地班 &middot; 理论力学可视化
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight text-balance">
                力拔理力<span className="text-accent">集</span>
              </h1>

              <p className="mt-5 text-sm sm:text-base text-muted max-w-lg leading-relaxed">
                力学拔尖基地班出品。将理论力学的抽象知识点转化为交互式三维动画
                &mdash; 从曲柄滑块到空间站对接，让每一组公式背后都有一个可以拖拽、旋转、缩放的可视化模型。
              </p>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-8">
                {stats.map((s) => (
                  <div key={s.label} className="flex items-center gap-2">
                    <span className="text-lg font-semibold text-foreground tabular-nums">
                      {s.value}
                    </span>
                    <span className="text-xs text-muted">{s.label}</span>
                  </div>
                ))}
              </div>

              {/* Feature row */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-8">
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-muted/40"><MouseIcon className="w-3.5 h-3.5" /></span>
                  拖拽旋转 / 滚轮缩放
                </div>
                <span className="text-border/50 hidden sm:inline">|</span>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-muted/40"><SparkleIcon className="w-3.5 h-3.5" /></span>
                  运动学原理解析
                </div>
                <span className="text-border/50 hidden sm:inline">|</span>
                <div className="flex items-center gap-2 text-xs text-muted">
                  <span className="text-muted/40"><LayersIcon className="w-3.5 h-3.5" /></span>
                  支持上传自定义动画
                </div>
              </div>
            </div>

            {/* Right: Image gallery — 3/5 */}
            <div className="lg:col-span-3 flex justify-center lg:justify-end">
              <HeroGallery />
            </div>
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section className="px-4 sm:px-6 pb-24 max-w-7xl mx-auto">
        <GalleryGrid animations={animations} />
      </section>
    </div>
  );
}
