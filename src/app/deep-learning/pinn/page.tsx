import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PINN对比演示 — 力拔·理力创见',
  description: '物理信息神经网络核心思想的直观对比演示。左侧Euler-Bernoulli梁解析解，右侧PINN风格拟合。',
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
        </div>

        {/* 交互演示 — 2D Canvas */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">交互演示</h2>
          <div className="glass-sm overflow-hidden p-4">
            <div className="relative bg-[#0a0a14] rounded-lg" style={{ height: 400 }}>
              <canvas
                id="pinn-canvas"
                className="w-full h-full"
                style={{ display: 'block' }}
              />
              <div
                id="pinn-controls"
                className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 rounded-full bg-black/60 border border-white/10 text-xs text-white/80"
              >
                <span>测量点</span>
                <input id="pinn-slider" type="range" min="3" max="20" defaultValue="5" className="w-32 accent-[#cba6f7]" />
                <span id="pinn-count" className="text-[#cba6f7] font-semibold w-4 text-center">5</span>
                <span className="text-white/40">|</span>
                <span className="text-[#a6e3a1]">━ 解析解</span>
                <span className="text-[#cba6f7]">━ PINN拟合</span>
                <span className="text-[#f9a8d4]">● 测量点</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted/60">拖动滑块增加右梁测量点数，观察拟合曲线如何逼近左梁解析解。</p>
        </section>

        {/* Canvas script — inline for simplicity */}
        <script dangerouslySetInnerHTML={{ __html: `
(function(){
  const canvas=document.getElementById('pinn-canvas');
  const slider=document.getElementById('pinn-slider');
  const countEl=document.getElementById('pinn-count');
  if(!canvas)return;

  function resize(){
    const r=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=r.width*dpr;canvas.height=r.height*dpr;
    draw(+slider.value);
  }

  const L=2,maxD=0.5;
  function ana(x){if(x<0)x=0;if(x>L)x=L;return -maxD*x*x*(3*L-x)/(2*L*L*L);}

  function pinnFit(xs,ys){
    const allX=[0,0.005,...xs],allY=[0,0,...ys];
    const idx=allX.map((_,i)=>i).sort((a,b)=>allX[a]-allX[b]);
    const sx=idx.map(i=>allX[i]),sy=idx.map(i=>allY[i]);
    const n=sx.length-1,h=[];for(let i=0;i<n;i++)h[i]=sx[i+1]-sx[i];
    const a=Array(n).fill(0);for(let i=1;i<n;i++)a[i]=3*(sy[i+1]-sy[i])/h[i]-3*(sy[i]-sy[i-1])/h[i-1];
    const c=Array(n+1).fill(0),l=Array(n+1).fill(0),mu=Array(n+1).fill(0),z=Array(n+1).fill(0);l[0]=1;
    for(let i=1;i<n;i++){l[i]=2*(sx[i+1]-sx[i-1])-h[i-1]*mu[i-1];mu[i]=h[i]/l[i];z[i]=(a[i]-h[i-1]*z[i-1])/l[i];}l[n]=1;
    const b=Array(n).fill(0),d=Array(n).fill(0);for(let j=n-1;j>=0;j--){c[j]=z[j]-mu[j]*c[j+1];b[j]=(sy[j+1]-sy[j])/h[j]-h[j]*(c[j+1]+2*c[j])/3;d[j]=(c[j+1]-c[j])/(3*h[j]);}
    return function(x){if(x<=sx[0])return sy[0];if(x>=sx[n])return sy[n];let i=0;for(let j=0;j<n;j++)if(x>=sx[j]&&x<=sx[j+1]){i=j;break;}const dx=x-sx[i];return sy[i]+b[i]*dx+c[i]*dx*dx+d[i]*dx*dx*dx;};
  }

  function draw(n){
    const ctx=canvas.getContext('2d');
    const w=canvas.width,h=canvas.height,dpr=Math.min(window.devicePixelRatio||1,2);
    ctx.clearRect(0,0,w,h);
    const pad=50*dpr,plotW=(w-2*pad)/2,plotH=h-2*pad;
    const x0=pad,y0=pad;
    function plot(ox,oy,f,pn,title,color,dots){
      // Grid
      ctx.strokeStyle='#1a1a2e';ctx.lineWidth=1;
      for(let i=0;i<=5;i++){const y=oy+i*plotH/5;ctx.beginPath();ctx.moveTo(ox,y);ctx.lineTo(ox+plotW,y);ctx.stroke();}
      for(let i=0;i<=5;i++){const x=ox+i*plotW/5;ctx.beginPath();ctx.moveTo(x,oy);ctx.lineTo(x,oy+plotH);ctx.stroke();}
      // Axes
      ctx.strokeStyle='#3f3f46';ctx.lineWidth=1.5*dpr;
      const baseY=oy+plotH*0.85;
      ctx.beginPath();ctx.moveTo(ox,baseY);ctx.lineTo(ox+plotW,baseY);ctx.stroke();
      // Fixed end mark
      ctx.fillStyle='#52525b';ctx.fillRect(ox-6*dpr,baseY-14*dpr,10*dpr,28*dpr);
      // Undeformed line
      ctx.strokeStyle='#3f3f46';ctx.setLineDash([4*dpr,6*dpr]);ctx.lineWidth=1*dpr;
      ctx.beginPath();ctx.moveTo(ox,baseY);ctx.lineTo(ox+plotW,baseY);ctx.stroke();ctx.setLineDash([]);
      // Curve
      ctx.strokeStyle=color;ctx.lineWidth=2.5*dpr;ctx.beginPath();
      const segs=200;
      for(let i=0;i<=segs;i++){const x=i/segs*L;const defl=f(x);const sx=ox+x/L*plotW;const sy=baseY+defl*plotH*1.6;if(i===0)ctx.moveTo(sx,sy);else ctx.lineTo(sx,sy);}
      ctx.stroke();
      // Data points
      if(dots)dots.forEach(d=>{ctx.fillStyle='#f9a8d4';ctx.beginPath();const sx=ox+d.x/L*plotW,sy=baseY+d.y*plotH*1.6;ctx.arc(sx,sy,3.5*dpr,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#f9a8d4';ctx.lineWidth=0.8*dpr;ctx.stroke();});
      // Label
      ctx.fillStyle='white';ctx.font=Math.round(12*dpr)+'px "Microsoft YaHei","PingFang SC",sans-serif';ctx.textAlign='center';
      ctx.fillText(title,ox+plotW/2,oy-12*dpr);
      ctx.fillStyle='#71717a';ctx.font=Math.round(9*dpr)+'px "Microsoft YaHei","PingFang SC",sans-serif';
      ctx.fillText('固定端',ox-8*dpr,baseY+20*dpr);
      ctx.fillText('自由端→',ox+plotW-20*dpr,baseY+18*dpr);
    }
    // Generate measurement points
    const xs=[],ys=[];for(let i=0;i<n;i++){const r=(i+1)/(n+1),x=r*L*0.94+0.03;xs.push(x);ys.push(ana(x)+(Math.sin(i*7.31)+Math.cos(i*13.7))*maxD*0.08);}
    const pinn=pinnFit(xs,ys);
    const dots=xs.map((x,i)=>({x,y:ys[i]}));
    // Left: analytical
    plot(x0,y0,ana,5,'解析解 (Euler-Bernoulli)','#a6e3a1',null);
    // Right: PINN
    plot(x0+plotW+10*dpr,y0,pinn,n,'PINN 拟合','#cba6f7',dots);
    countEl.textContent=n;
  }

  let resizeTimer;
  window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(resize,200);});
  slider.addEventListener('input',()=>draw(+slider.value));
  setTimeout(resize,100);
})();
`}} />

        {/* 一、什么是PINN */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">一、什么是PINN？</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              物理信息神经网络（Physics-Informed Neural Networks, PINN）是2019年由Raissi、Perdikaris和Karniadakis提出的新型求解框架。核心思想：<strong className="text-foreground">让神经网络在学习数据的同时，也遵守物理定律。</strong>
            </p>
            <p>
              传统方法中，要么纯靠公式推导（解析法——精确但复杂问题推不动），要么纯靠数据训练（神经网络——灵活但需要海量数据且可能违反物理规律）。PINN走第三条路——在神经网络的损失函数里加上一个物理约束项。
            </p>

            {/* 三种方法对比图 */}
            <div className="glass-sm p-5">
              <p className="text-xs font-semibold text-foreground mb-3">三种求解范式对比</p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="bg-foreground/[0.03] rounded-lg p-3 text-center">
                  <p className="font-medium text-[#a6e3a1] mb-1">解析法</p>
                  <p className="text-muted leading-relaxed">公式推导→精确解<br/>需要公式存在<br/>复杂问题推不动</p>
                </div>
                <div className="bg-foreground/[0.03] rounded-lg p-3 text-center">
                  <p className="font-medium text-[#4ECDC4] mb-1">纯神经网络</p>
                  <p className="text-muted leading-relaxed">海量数据→黑箱预测<br/>不依赖公式<br/>可能违反物理定律</p>
                </div>
                <div className="bg-accent/[0.06] rounded-lg p-3 text-center border border-accent/20">
                  <p className="font-medium text-accent mb-1">⭐ PINN</p>
                  <p className="text-muted leading-relaxed">少量数据+物理方程<br/>物理约束嵌入损失函数<br/>数据不够物理来补</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 二、核心架构 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">二、核心架构</h2>
          <div className="glass-sm overflow-hidden">
            <img
              src="/diagrams/pinn-architecture.svg"
              alt="PINN架构图"
              className="w-full"
            />
          </div>
          <p className="text-xs text-muted/60 text-center">输入(x,y,z,t) → 全连接NN → 输出(u,σ,p) → 双分支损失：数据损失 + 物理损失 → L = L<sub>data</sub> + λ·L<sub>PDE</sub></p>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              PINN独特之处在于<strong className="text-foreground">物理损失 L<sub>PDE</sub></strong>：在求解域随机撒"配置点"，用自动微分计算偏导数（如∂u/∂x、∂²u/∂x²），代入控制方程计算残差。残差越接近零，网络的输出就越满足物理定律。
            </p>
            <p>
              即使<strong className="text-accent">一个实验数据都没有</strong>（纯物理模式），只要给定了控制方程和边界条件，PINN也能学会正确的解。本演示中的右梁就是纯物理模式——没有实验数据，仅靠悬臂梁方程和固定端约束。
            </p>
          </div>
        </section>

        {/* 三、两种方法对比 */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">三、演示中的两种方法</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#a6e3a1]">左：解析解</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>采用Euler-Bernoulli梁方程精确公式：</p>
                <p className="font-mono text-[11px] p-2 rounded bg-foreground/[0.03]">u(x) = F/(6EI) · x²(3L−x)</p>
                <p>需要精确知道E、I、F。输入x直接算出挠度u。精确、可解释，但只适用于简单几何和线性材料。</p>
              </div>
            </div>
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#cba6f7]">右：PINN拟合</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>不推导解析公式。只用了两样东西：</p>
                <div className="space-y-1">
                  <p className="font-mono text-[11px] p-2 rounded bg-foreground/[0.03]">约束① u(0)=0 (固定端)</p>
                  <p className="font-mono text-[11px] p-2 rounded bg-foreground/[0.03]">约束② u′(0)=0 (斜率)</p>
                </div>
                <p>+ <strong className="text-[#f9a8d4]">粉色测量点</strong>（模拟传感器采集的稀疏数据）。公式不存在，但物理规律仍在约束着结果。</p>
              </div>
            </div>
          </div>
          <p className="text-xs text-muted/60 text-center italic mt-2">
            拖动滑块从3→20个点，观察右梁如何从不准确收敛到几乎与左梁重合
          </p>
        </section>

        {/* 四、为什么关注PINN */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">四、为什么要关注PINN？</h2>
          <div className="space-y-4 text-sm text-muted leading-relaxed">
            <p>
              悬臂梁是PINN的"Hello World"——解析解存在，方便验证PINN是否准确。但PINN真正价值在<strong className="text-foreground">解析解不存在</strong>的场景：
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { t:'变截面梁', d:'截面沿长度变化，Euler-Bernoulli推不出封闭公式' },
                { t:'非线性材料', d:'应力-应变关系不是直线，无解析解' },
                { t:'裂纹扩展', d:'FEM需不断重画网格，PINN无需网格' },
                { t:'逆问题', d:'从少量位移测量数据反推材料弹性模量' },
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
            <p>PINN不需要解析公式，不需要画网格——方程知道就行，解不出来没关系，神经网络帮你在无限可能的函数空间里找一个最好的近似。</p>
          </div>
        </section>

        {/* 五、PINN vs DRL */}
        <section className="space-y-5">
          <h2 className="text-lg font-semibold text-foreground">五、两种AI+力学路径</h2>
          <p className="text-sm text-muted leading-relaxed">
            本栏目恰好展示了AI与力学交叉的两种范式：
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#4ECDC4]">深度强化学习（RL）</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>物理用来<b className="text-foreground">造训练场</b>——拉格朗日方程建仿真环境，RL智能体在环境中试错。</p>
                <p className="p-2 rounded bg-foreground/[0.03] font-mono text-[11px]">网络学的：该做哪个动作？<br/>物理在哪：仿真器里</p>
              </div>
            </div>
            <div className="glass-sm p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#cba6f7]">物理信息网络（PINN）</h3>
              <div className="space-y-2 text-xs text-muted leading-relaxed">
                <p>物理<b className="text-foreground">直接参与学习</b>——控制方程嵌入损失函数，参与梯度反传。</p>
                <p className="p-2 rounded bg-foreground/[0.03] font-mono text-[11px]">网络学的：位移/应力是多少？<br/>物理在哪：损失函数里</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
