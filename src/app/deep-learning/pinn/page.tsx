import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PINN对比演示 — 力拔·理力创见',
  description: '物理信息神经网络核心思想的三维对比演示。左侧Euler-Bernoulli梁解析解，右侧PINN风格拟合。',
};

export default function PINNPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs tracking-widest text-muted/60 uppercase">Projects / PINN</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            PINN对比演示 · 悬臂梁
          </h1>
          <p className="text-base text-muted leading-relaxed max-w-xl">
            物理驱动，数据为辅——让物理方程替代海量数据
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-muted bg-foreground/5 px-3 py-1 rounded-full border border-border">
              工程力学前沿导论
            </span>
          </div>
        </div>

        {/* Animation */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">交互演示</h2>
          <div className="glass-sm overflow-hidden">
            <div className="aspect-video min-h-[360px]">
              <iframe
                src="/animations/pinn-demo.html"
                className="w-full h-full border-0"
                title="PINN 对比演示 · 悬臂梁"
                allow="accelerometer; autoplay; clipboard-write;"
              />
            </div>
          </div>
          <p className="text-xs text-muted/60">
            提示：拖拽旋转 · 滚轮缩放。底部滑块调节右梁测量点数量，左梁始终为精确解析解。
          </p>
        </section>

        {/* 一、什么是PINN */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">一、什么是PINN？</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              物理信息神经网络（Physics-Informed Neural Networks, PINN）是2019年由Raissi、Perdikaris和Karniadakis提出的一种新型求解框架。它的核心思想很简单：让神经网络在学习数据的同时，也遵守物理定律。
            </p>
            <p>
              传统方法中，要么纯靠公式推导（解析法，但复杂问题推不动），要么纯靠数据训练（神经网络，但需要海量数据且可能违反物理规律）。PINN走第三条路——在神经网络的损失函数里加上一个物理约束项，让网络输出自动满足力学方程。
            </p>
            <div className="glass-sm p-5 space-y-2">
              <p className="text-xs font-semibold text-foreground">PINN的核心公式</p>
              <p className="text-xs text-muted leading-relaxed">
                L<sub>total</sub> = L<sub>data</sub> + λ · L<sub>PDE</sub>
              </p>
              <p className="text-xs text-muted/60">
                L<sub>data</sub>：网络预测 vs 已知数据（边界条件、测量值）的误差 · L<sub>PDE</sub>：控制方程残差（自动微分算偏导后代入力学方程检查）
              </p>
            </div>
          </div>
        </section>

        {/* 二、演示中的两种方法 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">二、演示中的两种方法</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">左梁（绿色）— 解析解</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>采用Euler-Bernoulli梁方程的解析解：</p>
                <p className="font-mono text-[11px]">u(x) = F/(6EI) · x²(3L − x)</p>
                <p>需要精确知道：弹性模量E、截面惯性矩I、载荷F。公式直接给出每一处挠度的精确值。适用于简单几何和线性材料。</p>
              </div>
            </div>
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">右梁（紫色）— PINN拟合</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>不推导解析公式。只用少量测量点+两条物理约束：</p>
                <p className="font-mono text-[11px]">约束① u(0)=0（固定端位移为零）</p>
                <p className="font-mono text-[11px]">约束② u'(0)=0（固定端斜率为零）</p>
                <p>拖动滑块增加测量点：从3个点到20个点，拟合曲线逐步逼近解析解。但即使在只有3个点时，物理约束也防止了大幅偏离。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 三、为什么要关注PINN */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">三、为什么要关注PINN？</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              悬臂梁是PINN的"Hello World"——解析解存在，所以可以看出PINN的拟合效果。但PINN真正的价值在于那些解析解不存在的场景：
            </p>
            <ul className="space-y-2 list-disc list-inside text-xs">
              <li>变截面梁（截面沿长度变化，Euler-Bernoulli推不出公式）</li>
              <li>非线性材料（应力-应变不是直线，没有封闭解）</li>
              <li>裂纹尖端的应力集中（几何复杂，FEM需不断重画网格）</li>
              <li>逆问题——从少量位移测量数据反推材料参数</li>
            </ul>
            <p>
              PINN不需要解析公式，不需要画网格，甚至可以不依赖实验数据（纯物理模式）。方程知道就行，解不出来没关系——神经网络帮你在无限可能的函数空间里找一个最好的近似。
            </p>
            <div className="glass-sm p-5 space-y-2">
              <p className="text-xs font-semibold text-foreground">与FEM的对比</p>
              <ul className="space-y-1.5 list-disc list-inside text-xs text-muted">
                <li>FEM需要网格（复杂几何画网耗时），PINN不需要网格</li>
                <li>FEM当前精度和速度碾压PINN（成熟 vs 前沿）</li>
                <li>PINN在逆问题（反推参数）和无网格场景（裂纹扩展）有独特优势</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 四、与DRL的对比 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">四、PINN vs DRL：两种AI+力学路径</h2>
          <p className="text-sm text-muted leading-relaxed">
            本栏目恰好展示了AI与力学交叉的两种范式：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">深度强化学习（RL）</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>物理用来"造训练场"——拉格朗日方程建好仿真环境，RL智能体在环境中试错，学到的是控制策略。</p>
                <p>神经网络学的是：该做哪个动作。</p>
              </div>
            </div>
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">物理信息网络（PINN）</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>物理直接参与学习过程——控制方程嵌入损失函数，参与梯度反传。</p>
                <p>神经网络学的是：位移/应力场本身。</p>
              </div>
            </div>
          </div>
        </section>

        {/* References */}
        <section className="space-y-5 border-t border-border pt-12">
          <h2 className="text-lg font-semibold text-foreground">参考资料</h2>
          <p className="text-sm text-muted leading-relaxed">
            Raissi, M., Perdikaris, P., &amp; Karniadakis, G.E. (2019). Physics-informed neural networks: A deep learning framework for solving forward and inverse problems involving nonlinear partial differential equations. <em>Journal of Computational Physics</em>, 378, 686-707.
          </p>
        </section>
      </div>
    </div>
  );
}
