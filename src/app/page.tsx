import { getAllAnimations } from "@/lib/animation-registry";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { HeroGallery } from "@/components/gallery/HeroGallery";
import { MouseIcon, LayersIcon, SparkleIcon } from "@/components/ui/Icons";

export default function HomePage() {
  const animations = getAllAnimations();
  const categoryCount = [...new Set(animations.map((a) => a.category))].length;

  const stats = [
    { value: animations.length, label: '内置动画' },
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
                理论力学 &middot; 机构运动学可视化
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-tight text-balance">
                机构动画<span className="text-accent">演示</span>
              </h1>

              <p className="mt-5 text-sm sm:text-base text-muted max-w-lg leading-relaxed">
                收集曲柄滑块、四杆机构、凸轮推杆、串联机械臂、双摆、弹簧振子、
                航天器对接等经典机构的交互式运动学动画，辅助理论力学课程的可视化学习。
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
