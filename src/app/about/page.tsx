import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '关于 — 力拔·理力创见',
  description: '力学拔尖基地班出品，将理论力学知识点转化为交互式三维动画。了解项目缘起、目标愿景与网站特色。',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-4">
          <p className="text-xs tracking-widest text-muted/60 uppercase">About</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            关于力拔·理力创见
          </h1>
          <p className="text-base text-muted leading-relaxed max-w-xl">
            力学拔尖基地班出品 &mdash; 理论力学知识点的交互式三维可视化平台
          </p>
        </div>

        {/* Section: 项目缘起 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">项目缘起</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              我们是力学拔尖基地班的学生。在学习理论力学的过程中，我们深切体会到：
              抽象的公式需要直观的印证。瞬心在哪里？急回特性如何体现？科氏加速度指向何方？
              &mdash; 这些问题的答案，往往在看到一个运动起来的机构时豁然开朗。
            </p>
            <p>
              于是，我们决定把理论力学的关键知识点逐一制作成交互式三维动画，
              让每一组公式背后都有一个可以拖拽、旋转、缩放的可视化模型。
              从曲柄滑块的内燃机活塞运动，到双摆的混沌轨迹，再到空间站交会对接的轨道力学
              &mdash; 每一个动画都对应一个明确的理论力学知识点。
            </p>
          </div>
        </section>

        {/* Section: 目标与愿景 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">目标与愿景</h2>
          <div className="space-y-3 text-sm text-muted leading-relaxed">
            <div className="flex gap-3">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
              <span>系统性地覆盖平面连杆机构、凸轮与传动、串联机器人、航天机构、动力学与振动等方向</span>
            </div>
            <div className="flex gap-3">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
              <span>每个动画对应一个明确的理论力学知识点：自由度计算、运动学正逆解、Grashof 条件、瞬心法、D-H 参数法、拉格朗日方程&hellip;&hellip;</span>
            </div>
            <div className="flex gap-3">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
              <span>服务课堂演示与课后自学，降低机构运动学的理解门槛，让力学&ldquo;看得见&rdquo;</span>
            </div>
            <div className="flex gap-3">
              <span className="mt-0.5 w-1 h-1 rounded-full bg-foreground/20 shrink-0" />
              <span>持续扩充动画库，欢迎力学方向的同学上传自己的机构动画作品</span>
            </div>
          </div>
        </section>

        {/* Section: 网站特色 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">网站特色</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2">
              <h3 className="text-sm font-medium text-foreground">三维交互</h3>
              <p className="text-xs text-muted leading-relaxed">
                基于 Three.js，支持鼠标拖拽旋转、滚轮缩放、右键平移，从任意角度观察机构运动。
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2">
              <h3 className="text-sm font-medium text-foreground">自包含动画</h3>
              <p className="text-xs text-muted leading-relaxed">
                每个动画为独立 HTML 文件，可离线使用、独立分发，不依赖任何框架运行时。
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2">
              <h3 className="text-sm font-medium text-foreground">开放上传</h3>
              <p className="text-xs text-muted leading-relaxed">
                支持用户上传自定义机构动画，通过格式校验后自动加入画廊展示。
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2">
              <h3 className="text-sm font-medium text-foreground">AI 问答</h3>
              <p className="text-xs text-muted leading-relaxed">
                内置理论力学问答助手，可针对当前机构进行运动学与原理解析。
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2">
              <h3 className="text-sm font-medium text-foreground">双主题</h3>
              <p className="text-xs text-muted leading-relaxed">
                深色/浅色模式自由切换，适配不同阅读环境与偏好。
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface/50 p-5 space-y-2">
              <h3 className="text-sm font-medium text-foreground">运动学精度</h3>
              <p className="text-xs text-muted leading-relaxed">
                所有动画均按解析运动学方程驱动（RK4 数值积分），非关键帧动画，确保物理准确性。
              </p>
            </div>
          </div>
        </section>

        {/* Section: 技术栈 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">技术栈</h2>
          <p className="text-sm text-muted leading-relaxed">
            Next.js 16 + Tailwind CSS v4 + Three.js r150+ + Vercel Blob
          </p>
        </section>

        {/* Section: 致谢 */}
        <section className="space-y-5 border-t border-border pt-12">
          <h2 className="text-lg font-semibold text-foreground">致谢</h2>
          <p className="text-sm text-muted leading-relaxed">
            感谢理论力学课程组老师的指导，以及力学拔尖基地班全体同学的贡献。
          </p>
        </section>
      </div>
    </div>
  );
}
