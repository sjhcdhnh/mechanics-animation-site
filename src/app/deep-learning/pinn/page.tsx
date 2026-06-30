import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PINN对比演示 — 力拔·理力创见',
  description: '物理信息神经网络（PINN）核心思想的直观对比：左侧Euler-Bernoulli解析解，右侧PINN风格数据+物理约束拟合。',
};

export default function PINNPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-14">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs tracking-widest text-muted/60 uppercase">专题项目 / PINN</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            物理信息神经网络 · 悬臂梁对比演示
          </h1>
          <p className="text-base text-muted leading-relaxed max-w-xl">
            不给网络看公式，只告诉它物理规则——它能自己"悟"出答案吗？
          </p>
        </div>

        {/* 交互演示 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">动手试试</h2>
          <div className="glass-sm overflow-hidden">
            <div className="aspect-video min-h-[380px]">
              <iframe
                src="/animations/pinn-demo.html"
                className="w-full h-full border-0"
                title="PINN 对比演示"
                allow="accelerometer; clipboard-write;"
              />
            </div>
          </div>
          <p className="text-xs text-muted/60 text-center">
            拖动底部滑块增加测量点数量，右梁会逐渐逼近左梁 · 鼠标拖拽旋转视角 · 滚轮缩放
          </p>
        </section>

        {/* 一、背景 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">一、工程力学怎么求解？三种路子</h2>
          <div className="space-y-3 text-sm text-muted leading-relaxed">
            <p>你大一做的所有题——"已知F、E、A，求杆的伸长量"——用的都是<strong className="text-foreground">解析法</strong>。代公式，一步出答案。但前提是<strong className="text-accent">公式得存在</strong>。变截面杆？非线性材料？裂纹尖端的应力？对不起，人类没推出来过。</p>
            <p>那就走第二条路——<strong className="text-foreground">纯数据驱动</strong>。做1000组实验或FEM仿真，训练一个神经网络来"猜"。这方法不挑问题，但要的数据量太大，而且没了物理约束的神经网络，可能猜出一个能量不守恒的荒谬结果。</p>
            <p><strong className="text-accent">PINN 走第三条路</strong>：只给少量数据（甚至完全不给），但告诉网络"你的输出必须满足这个力学方程"。网络在学数据的同时，被物理方程约束着，最终学到一个既符合数据、又遵守物理的结果。</p>
          </div>

          <div className="glass-sm p-5">
            <p className="text-xs font-semibold text-foreground mb-3">一张表看清区别</p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-3 text-muted font-normal">方法</th>
                    <th className="text-left py-2 pr-3 text-muted font-normal">需要什么</th>
                    <th className="text-left py-2 pr-3 text-muted font-normal">优点</th>
                    <th className="text-left py-2 text-muted font-normal">局限</th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/30">
                    <td className="py-2 pr-3 font-medium text-[#a6e3a1]">解析法</td>
                    <td className="py-2 pr-3">精确公式</td>
                    <td className="py-2 pr-3">一步出答案</td>
                    <td className="py-2">复杂问题没有公式</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="py-2 pr-3 font-medium text-[#4ECDC4]">纯神经网络</td>
                    <td className="py-2 pr-3">海量数据</td>
                    <td className="py-2 pr-3">不挑问题</td>
                    <td className="py-2">数据贵，可能违反物理</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-3 font-medium text-accent">PINN</td>
                    <td className="py-2 pr-3">方程+边界条件（数据可选）</td>
                    <td className="py-2 pr-3">不挑问题，不需海量数据</td>
                    <td className="py-2">训练慢，精度不如FEM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 二、架构 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">二、PINN 长什么样？</h2>
          <div className="glass-sm overflow-hidden">
            <img src="/diagrams/pinn-architecture.svg" alt="PINN架构图" className="w-full" />
          </div>
          <p className="text-xs text-muted/60 text-center">输入坐标和时间 → 全连接神经网络 → 输出位移/应力 → 两条监督线同时工作：<span className="text-[#4ECDC4]">数据线</span>（和已知数据对比）+ <span className="text-[#F9A8D4]">物理线</span>（代入力学方程检查）</p>
          <div className="space-y-3 text-sm text-muted leading-relaxed">
            <p>和普通神经网络唯一不同的就是<strong className="text-[#F9A8D4]">那条粉色的物理线</strong>。自动微分（PyTorch/TensorFlow自带的功能）算出∂u/∂x、∂²u/∂x²这些导数，代入控制方程算残差。残差越接近零，就说明网络的输出越满足物理定律。这个残差和"数据误差"一起作为损失函数，反向传播调整网络权重。</p>
            <p>关键的地方来了：<strong className="text-accent">即使一个实验数据都不给</strong>，只告诉网络控制方程和边界条件，它也能学出正确解。数据不够的时候，物理来补。</p>
          </div>
        </section>

        {/* 三、拆解演示 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">三、上面那个演示在干什么？</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#a6e3a1]" />
                <h3 className="text-sm font-semibold text-foreground">左梁：解析法</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                用的是 Euler-Bernoulli 梁方程的正统公式
              </p>
              <p className="font-mono text-[11px] p-2 rounded bg-foreground/[0.03] text-foreground/80">
                u(x) = F/(6EI) · x²(3L−x)
              </p>
              <p className="text-xs text-muted leading-relaxed">
                给定弹性模量E、截面惯性矩I、载荷F，代入x就算出每一点的挠度。精确、一步到位。但换个变截面梁这道公式就不成立了。
              </p>
            </div>
            <div className="glass-sm p-5 space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-sm bg-[#cba6f7]" />
                <h3 className="text-sm font-semibold text-foreground">右梁：PINN模拟</h3>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                不推导任何公式。网络仅被两样东西约束：
              </p>
              <div className="space-y-1">
                <p className="font-mono text-[11px] p-1.5 rounded bg-foreground/[0.03] text-foreground/80">约束① 固定端位移为零：u(0) = 0</p>
                <p className="font-mono text-[11px] p-1.5 rounded bg-foreground/[0.03] text-foreground/80">约束② 固定端转角为零：u'(0) = 0</p>
              </div>
              <p className="text-xs text-muted leading-relaxed">
                外加<strong className="text-[#f9a8d4]">粉色数据点</strong>——在梁上装几个传感器，测出几个位置的挠度。就这么多信息。网络通过最小化"数据误差 + 物理残差"，自动找到一条既穿过数据点附近、又满足边界条件的曲线。
              </p>
            </div>
          </div>
          <div className="glass-sm p-4 text-center">
            <p className="text-xs text-muted leading-relaxed">
              <strong className="text-accent">核心体验</strong>：把滑块从3拖到20——3个点时右梁歪歪扭扭，20个点时几乎和左梁重合。<br/>
              即便只有3个点，物理约束也防止了大方向跑偏。这就是"先验知识"的价值。
            </p>
          </div>
        </section>

        {/* 四、应用场景 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">四、这有什么用？</h2>
          <p className="text-sm text-muted leading-relaxed">
            悬臂梁只是用来验证的"Hello World"。PINN真正的舞台在下面这些解析公式不存在的场景：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { t:'变截面与异形结构', d:'截面不均匀、几何不规则，FEM画网耗时，PINN撒点就行' },
              { t:'非线性材料', d:'应力-应变关系不是直线，没有封闭公式，但控制方程还在' },
              { t:'裂纹扩展', d:'裂纹每走一步FEM重画一次网，PINN无需网格直接跟上' },
              { t:'反推材料参数', d:'做了个实验测了几个点的位移 → PINN反向算出弹性模量' },
            ].map(item=>(
              <div key={item.t} className="flex items-start gap-2.5 p-3 rounded-lg bg-foreground/[0.02] border border-border/50">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">{item.t}</p>
                  <p className="text-xs text-muted leading-relaxed mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 五、DRL vs PINN */}
        <section className="space-y-4 border-t border-border pt-14">
          <h2 className="text-lg font-semibold text-foreground">五、和隔壁的深度强化学习有什么关系？</h2>
          <p className="text-sm text-muted leading-relaxed">这两个项目放在一起，恰好展示了<strong className="text-foreground">AI和力学交叉的两种完全不同的范式</strong>：</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#4ECDC4]">RL：物理在仿真器里</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>拉格朗日方程建好虚拟环境，RL智能体在里面反复试错。物理定律只管"环境怎么响应动作"，不参与"智能体怎么学习"。</p>
                <p className="p-2 rounded bg-foreground/[0.03] font-mono text-[11px] text-foreground/80">网络学什么：控制策略<br/>物理在哪里：仿真器的动力学方程<br/>物理管不管梯度：不管</p>
              </div>
            </div>
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#cba6f7]">PINN：物理在损失函数里</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>控制方程直接写成损失项。反向传播时，物理残差的梯度一路穿过网络调整权重——物理亲自下场"教"网络。</p>
                <p className="p-2 rounded bg-foreground/[0.03] font-mono text-[11px] text-foreground/80">网络学什么：物理场本身<br/>物理在哪里：损失函数的PDE项<br/>物理管不管梯度：管，自动微分穿过方程</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted/60 text-center italic">一个把物理当"规则手册"（你按规则玩，但规则不教你玩），一个把物理当"老师"（你做错了老师就拿戒尺敲你）。</p>
        </section>
      </div>
    </div>
  );
}
