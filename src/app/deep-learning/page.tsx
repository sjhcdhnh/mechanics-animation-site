import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '深度学习 — 力拔·理力创见',
  description:
    '四连杆检测机器人的数据驱动抓物探索：从模型建立到静力学、动力学分析，再到深度强化学习控制。涵盖拉格朗日方法、达朗贝尔原理与RL训练阶段可视化。',
};

export default function DeepLearningPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto space-y-16">
        {/* Header */}
        <div className="space-y-3">
          <p className="text-xs tracking-widest text-muted/60 uppercase">Deep Learning</p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            四连杆检测机器人的数据驱动抓物探索
          </h1>
          <p className="text-base text-muted leading-relaxed max-w-xl">
            棋局方正，志探刚体；深度驱动，力学不息
          </p>
          <div className="flex items-center gap-3 pt-1">
            <span className="text-xs text-muted bg-foreground/5 px-3 py-1 rounded-full border border-border">
              赵大志 / 深度探索组
            </span>
          </div>
        </div>

        {/* Animation */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">交互演示</h2>
          <div className="glass-sm overflow-hidden">
            <div className="aspect-video min-h-[360px]">
              <iframe
                src="/animations/deep-learning-4bar-rl.html"
                className="w-full h-full border-0"
                title="四连杆检测机器人 · 深度强化学习控制探索"
                allow="accelerometer; autoplay; clipboard-write;"
              />
            </div>
          </div>
          <p className="text-xs text-muted/60">
            提示：拖拽旋转 · 滚轮缩放 · 右键平移。动画演示RL训练的四个收敛阶段，自动循环切换目标点。
          </p>
        </section>

        {/* 一、模型建立 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">一、模型建立</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              将实际四连杆检测机器人简化为平面4自由度串联机械臂模型。机械臂包含4个转动副（Revolute
              joints），各连杆长度分别为 L₁、L₂、L₃、L₄，末端检测器视为集中质量。
            </p>
            <p>
              自由度数 F = 4（每个转动副贡献1个自由度）。末端执行器在平面内具有2个位置自由度，系统存在运动学冗余（4 &gt; 2），这为RL训练中的探索策略提供了灵活性。
            </p>
            <div className="glass-sm p-5 space-y-2">
              <p className="text-xs font-semibold text-foreground">模型参数</p>
              <ul className="space-y-1.5 list-disc list-inside text-xs">
                <li>连杆 L₁~L₄（长度待定，可调节）</li>
                <li>4个转动关节 θ₁~θ₄（转角范围 ±π）</li>
                <li>正运动学：连乘变换矩阵求末端位姿</li>
                <li>逆运动学：冗余系统，CCD迭代法求解</li>
                <li>末端执行器需移动到目标点完成检测任务</li>
              </ul>
            </div>
          </div>
        </section>

        {/* 二、静力学演示 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">二、静力学演示</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              机械臂在重力场中保持静止位形时，各关节需要提供平衡力矩以克服连杆自重产生的重力矩。关节力矩 = 连杆重量 × 力臂（质心到关节的水平距离）。
            </p>
            <p>
              对第 i 个关节，其后的所有杆件和末端载荷都会产生重力矩。离关节越远，力臂越长，需要的力矩越大。静力学分析先告诉我们&ldquo;哪个关节更吃力&rdquo;。
            </p>
            <div className="glass-sm p-5 space-y-2">
              <p className="text-xs font-semibold text-foreground">关节力矩公式</p>
              <p className="text-xs text-muted leading-relaxed">
                τᵢ = Σⱼ mⱼg · rᵢⱼ + mₑg · rᵢₑ
              </p>
              <p className="text-xs text-muted/60">
                其中 rᵢⱼ 表示第 j 根杆质心到第 i 个关节的水平力臂，rᵢₑ
                表示末端载荷到第 i 个关节的水平力臂。
              </p>
            </div>
          </div>
        </section>

        {/* 三、动力学演示 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">三、动力学演示</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>机构动力学采用两种互补方法建模，视角不同但殊途同归：</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">拉格朗日方法</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>从系统整体能量出发，选取关节角为广义坐标 q = [θ₁, θ₂, θ₃, θ₄]ᵀ。</p>
                <p>拉格朗日量 L = T − V（动能 − 势能）</p>
                <p>关节驱动力矩由拉格朗日方程给出：</p>
                <p className="font-mono text-[11px]">d/dt (∂L/∂q̇) − ∂L/∂q = τ</p>
              </div>
            </div>
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-foreground">达朗贝尔原理</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>从&ldquo;受力平衡&rdquo;出发，引入惯性力将动力学问题转化为动态平衡问题。</p>
                <p>第 i 根杆件的惯性力：Fᵢ* = −mᵢaᵢ</p>
                <p>外力 + 约束力 + 惯性力 = 0，再由此求出关节驱动力矩。</p>
                <p>两种方法视角不同，但都在描述同一个四连杆动力学问题。</p>
              </div>
            </div>
          </div>
        </section>

        {/* 四、深度强化学习 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">四、深度强化学习控制探索</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              受纪录片《The Thinking Game》启发：AI
              不一定被一步步写好答案，而是可以通过尝试、反馈和修正逐渐形成策略。
            </p>
            <p>
              我们把四连杆机械臂放进仿真环境中，让它反复尝试不同动作，并根据&ldquo;是否更接近目标点&rdquo;获得反馈，逐渐学习一套控制策略。强化学习在这里不是替代力学分析，而是基于已有模型的一次控制探索。
            </p>
          </div>
          <div className="glass-sm p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">RL问题形式化</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1.5">
                <p className="font-medium text-foreground">状态空间 S</p>
                <p className="text-muted leading-relaxed">4个关节角 θ₁~θ₄ + 末端位置 (x, y) + 目标位置 (xₜ, yₜ)</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-medium text-foreground">动作空间 A</p>
                <p className="text-muted leading-relaxed">4个关节的力矩增量 Δτ₁~Δτ₄（连续动作空间）</p>
              </div>
              <div className="space-y-1.5">
                <p className="font-medium text-foreground">奖励函数 R</p>
                <p className="text-muted leading-relaxed">R = −|末端位置 − 目标位置|（距离越近奖励越高）</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">训练阶段</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="glass-sm p-4 space-y-1.5">
                <p className="text-xs font-medium text-foreground">50k 次交互 — 早期探索</p>
                <p className="text-xs text-muted">大噪声随机动作，末端位置不稳定，距目标较远</p>
              </div>
              <div className="glass-sm p-4 space-y-1.5">
                <p className="text-xs font-medium text-foreground">100k 次交互 — 中期收敛</p>
                <p className="text-xs text-muted">减小探索噪声，末端开始靠近目标，奖励反馈起作用</p>
              </div>
              <div className="glass-sm p-4 space-y-1.5">
                <p className="text-xs font-medium text-foreground">200k 次交互 — 后期优化</p>
                <p className="text-xs text-muted">平滑接近目标，残余误差逐渐减少</p>
              </div>
              <div className="glass-sm p-4 space-y-1.5">
                <p className="text-xs font-medium text-foreground">500k 次交互 — 最终策略</p>
                <p className="text-xs text-muted">精准到达目标，轨迹直接高效，形成可用控制策略</p>
              </div>
            </div>
          </div>
        </section>

        {/* Download */}
        <section className="space-y-5 border-t border-border pt-12">
          <h2 className="text-lg font-semibold text-foreground">下载资源</h2>
          <div className="glass-sm p-5 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <p className="text-sm text-foreground font-medium truncate">赵大志教改部分 V2.pptx</p>
              <p className="text-xs text-muted/60 mt-0.5">完整PPT演示文稿（16页）</p>
            </div>
            <a
              href="/deep-learning/赵大志教改部分 V2.pptx"
              download
              className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-accent text-accent-fg text-sm font-semibold rounded-xl hover:bg-accent-hover transition-colors duration-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              下载 PPT
            </a>
          </div>
        </section>

        {/* References */}
        <section className="space-y-5 border-t border-border pt-12">
          <h2 className="text-lg font-semibold text-foreground">参考资料</h2>
          <p className="text-sm text-muted leading-relaxed">
            本页内容基于赵大志教改部分 V2 演示文稿。深度强化学习部分展示基于策略梯度的连续动作空间控制框架（如PPO/SAC），在仿真环境中通过反复试错学习四连杆机械臂的最优控制策略。拉格朗日方程和达朗贝尔原理的详细推导见理论力学教材。
          </p>
        </section>
      </div>
    </div>
  );
}
