'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SAMPLE_TRUSS, checkTruss, normalizeTruss, solveTruss, type SupportType, type TrussModel, type TrussResult } from '@/lib/truss';

type Mode = 'select' | 'node' | 'member' | 'delete';
const WIDTH = 900, HEIGHT = 560, PAD = 65, STEP = 64, MAX_X = 12, MAX_Y = 7;

const cloneSample = () => JSON.parse(JSON.stringify(SAMPLE_TRUSS)) as TrussModel;
const sx = (x: number) => PAD + x * STEP;
const sy = (y: number) => HEIGHT - PAD - y * STEP;

function readStream(response: Response, onChunk?: (text: string) => void) {
  if (!response.ok) return response.text().then((text) => { throw new Error(text || '请求失败'); });
  if (!response.body) throw new Error('服务器未返回内容');
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let output = '';
  return (async () => {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      output += decoder.decode(value, { stream: true });
      onChunk?.(output);
    }
    return output;
  })();
}

export function TrussWorkbench() {
  const [model, setModelState] = useState<TrussModel>(cloneSample);
  const [mode, setMode] = useState<Mode>('select');
  const [selectedNode, setSelectedNode] = useState<number | null>(2);
  const [memberStart, setMemberStart] = useState<number | null>(null);
  const [result, setResult] = useState<TrussResult | null>(null);
  const [error, setError] = useState('');
  const [aiPrompt, setAiPrompt] = useState('建立一个跨度 8m 的三角形桁架，两端分别为铰支座和滚动支座，跨中顶点受向下 10kN 荷载。');
  const [aiText, setAiText] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [jsonText, setJsonText] = useState('');
  const check = useMemo(() => checkTruss(model), [model]);
  const activeNode = model.nodes.find((node) => node.id === selectedNode);

  const setModel = (next: TrussModel) => {
    setModelState(next);
    setResult(null);
    setError('');
  };

  const addNode = (x: number, y: number) => {
    if (model.nodes.some((node) => node.x === x && node.y === y)) return;
    const id = Math.max(-1, ...model.nodes.map((node) => node.id)) + 1;
    setModel({ ...model, nodes: [...model.nodes, { id, x, y, support: null, Fx: 0, Fy: 0 }] });
    setSelectedNode(id);
  };

  const onCanvasClick = (event: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'node') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = ((event.clientX - rect.left) / rect.width) * WIDTH;
    const py = ((event.clientY - rect.top) / rect.height) * HEIGHT;
    const x = Math.max(0, Math.min(MAX_X, Math.round((px - PAD) / STEP)));
    const y = Math.max(0, Math.min(MAX_Y, Math.round((HEIGHT - PAD - py) / STEP)));
    addNode(x, y);
  };

  const onNodeClick = (id: number) => {
    if (mode === 'delete') {
      setModel({ nodes: model.nodes.filter((node) => node.id !== id), members: model.members.filter((m) => m.start !== id && m.end !== id) });
      if (selectedNode === id) setSelectedNode(null);
      return;
    }
    if (mode === 'member') {
      if (memberStart === null) return setMemberStart(id);
      if (memberStart === id) return setMemberStart(null);
      const duplicate = model.members.some((m) => (m.start === memberStart && m.end === id) || (m.start === id && m.end === memberStart));
      if (!duplicate) {
        const nextId = Math.max(-1, ...model.members.map((m) => m.id)) + 1;
        setModel({ ...model, members: [...model.members, { id: nextId, start: memberStart, end: id }] });
      }
      setMemberStart(null);
      return;
    }
    setSelectedNode(id);
  };

  const updateNode = (patch: { support?: SupportType; Fx?: number; Fy?: number }) => {
    if (selectedNode === null) return;
    setModel({ ...model, nodes: model.nodes.map((node) => node.id === selectedNode ? { ...node, ...patch } : node) });
  };

  const runSolve = () => {
    try { setResult(solveTruss(model)); setError(''); }
    catch (e) { setResult(null); setError(e instanceof Error ? e.message : '求解失败'); }
  };

  const askAi = async (kind: 'parse' | 'explain') => {
    setAiBusy(true); setError('');
    try {
      const response = await fetch('/api/truss-ai', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(kind === 'parse' ? { mode: kind, prompt: aiPrompt } : { mode: kind, model, result }),
      });
      if (kind === 'explain') {
        setAiText('');
        await readStream(response, setAiText);
      } else {
        const text = await readStream(response);
        const clean = text.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
        const next = normalizeTruss(JSON.parse(clean));
        setModel(next); setSelectedNode(next.nodes[0]?.id ?? null); setMode('select');
      }
    } catch (e) { setError(e instanceof Error ? e.message : 'AI 请求失败'); }
    finally { setAiBusy(false); }
  };

  const importJson = () => {
    try { const next = normalizeTruss(JSON.parse(jsonText)); setModel(next); setSelectedNode(next.nodes[0]?.id ?? null); }
    catch (e) { setError(e instanceof Error ? e.message : 'JSON 导入失败'); }
  };

  return (
    <main className="min-h-screen px-4 pb-16 pt-24 sm:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <Link href="/deep-learning" className="text-xs text-muted transition-colors hover:text-accent">← 返回专题项目</Link>
            <p className="mt-5 text-[11px] uppercase tracking-[0.24em] text-accent/70">Structural Analysis · AI Assisted</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">平面桁架问题求解器</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">在网格上直接建模、连接杆件并施加载荷，随后用节点平衡方程求解。AI 只负责建模辅助与简明讲解，数值结果由确定性求解器计算。</p>
          </div>
          <div className="flex gap-2 text-xs">
            <Status label={`${model.nodes.length} 节点`} ok />
            <Status label={`${model.members.length} 杆件`} ok />
            <Status label={check.determinate ? '静定条件满足' : `${check.unknowns}/${check.equations} 未静定`} ok={check.determinate && check.supportsValid} />
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="double-bezel overflow-hidden">
            <div className="double-bezel-inner overflow-hidden">
              <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-3">
                {([['select','选择/载荷'],['node','添加节点'],['member','连接杆件'],['delete','删除']] as [Mode,string][]).map(([value, label]) => (
                  <button key={value} data-testid={`mode-${value}`} onClick={() => { setMode(value); setMemberStart(null); }} className={`rounded-lg border px-3 py-2 text-xs transition ${mode === value ? 'border-accent/50 bg-accent/15 text-accent' : 'border-border bg-foreground/[0.03] text-muted hover:text-foreground'}`}>{label}</button>
                ))}
                <span className="ml-auto text-[11px] text-muted">{mode === 'member' && memberStart !== null ? `已选节点 N${memberStart}，请选择终点` : '坐标自动吸附到网格'}</span>
              </div>
              <div className="relative bg-[#101017] p-2 sm:p-4">
                <svg data-testid="truss-canvas" aria-label="桁架绘图网格" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className={`block w-full rounded-xl border border-white/10 bg-[#12121b] ${mode === 'node' ? 'cursor-crosshair' : ''}`} onClick={onCanvasClick}>
                  <defs>
                    <pattern id="truss-small-grid" width={STEP} height={STEP} patternUnits="userSpaceOnUse" x={PAD} y={PAD - 17}>
                      <path d={`M ${STEP} 0 L 0 0 0 ${STEP}`} fill="none" stroke="rgba(167,139,250,.15)" strokeWidth="1" />
                      <circle cx="0" cy="0" r="2.2" fill="rgba(167,139,250,.32)" />
                    </pattern>
                  </defs>
                  <rect width={WIDTH} height={HEIGHT} fill="url(#truss-small-grid)" />
                  <line x1={PAD} y1={sy(0)} x2={sx(MAX_X)} y2={sy(0)} stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
                  <line x1={PAD} y1={sy(0)} x2={PAD} y2={sy(MAX_Y)} stroke="rgba(255,255,255,.18)" strokeWidth="1.5" />
                  {Array.from({length: MAX_X + 1}, (_, i) => <text key={`x${i}`} x={sx(i)} y={HEIGHT - 24} textAnchor="middle" fill="rgba(255,255,255,.35)" fontSize="12">{i}</text>)}
                  {Array.from({length: MAX_Y + 1}, (_, i) => <text key={`y${i}`} x={35} y={sy(i)+4} textAnchor="middle" fill="rgba(255,255,255,.35)" fontSize="12">{i}</text>)}

                  {model.members.map((member) => {
                    const a = model.nodes.find((n) => n.id === member.start), b = model.nodes.find((n) => n.id === member.end);
                    if (!a || !b) return null;
                    const force = result?.memberForces[member.id];
                    const color = force === undefined ? '#d4d4d8' : Math.abs(force) < 1e-6 ? '#34d399' : force > 0 ? '#fb7185' : '#60a5fa';
                    return <g key={member.id} onClick={(e) => { e.stopPropagation(); if (mode === 'delete') setModel({...model, members:model.members.filter((m)=>m.id!==member.id)}); }}>
                      <line x1={sx(a.x)} y1={sy(a.y)} x2={sx(b.x)} y2={sy(b.y)} stroke="transparent" strokeWidth="18" className={mode === 'delete' ? 'cursor-pointer' : ''} />
                      <line x1={sx(a.x)} y1={sy(a.y)} x2={sx(b.x)} y2={sy(b.y)} stroke={color} strokeWidth="5" strokeLinecap="round" />
                      <text x={(sx(a.x)+sx(b.x))/2} y={(sy(a.y)+sy(b.y))/2-9} textAnchor="middle" fill={color} fontSize="13" fontWeight="600">M{member.id}{force !== undefined ? ` ${force.toFixed(2)}` : ''}</text>
                    </g>;
                  })}

                  {model.nodes.map((node) => <g key={node.id} onClick={(e) => { e.stopPropagation(); onNodeClick(node.id); }} className="cursor-pointer">
                    {node.support === 'pin' && <path d={`M ${sx(node.x)} ${sy(node.y)+8} l -18 24 h 36 z`} fill="rgba(167,139,250,.18)" stroke="#a78bfa" strokeWidth="2" />}
                    {node.support === 'roller' && <g><path d={`M ${sx(node.x)} ${sy(node.y)+8} l -18 20 h 36 z`} fill="rgba(78,205,196,.16)" stroke="#4ecdc4" strokeWidth="2"/><circle cx={sx(node.x)-9} cy={sy(node.y)+34} r="4" fill="#4ecdc4"/><circle cx={sx(node.x)+9} cy={sy(node.y)+34} r="4" fill="#4ecdc4"/></g>}
                    {(node.Fx !== 0 || node.Fy !== 0) && <LoadArrow node={node} />}
                    <circle cx={sx(node.x)} cy={sy(node.y)} r={memberStart === node.id ? 13 : selectedNode === node.id ? 11 : 9} fill="#12121b" stroke={memberStart === node.id ? '#fbbf24' : selectedNode === node.id ? '#a78bfa' : '#f4f4f5'} strokeWidth="3" />
                    <text x={sx(node.x)+13} y={sy(node.y)-13} fill="#f4f4f5" fontSize="13" fontWeight="700">N{node.id}</text>
                  </g>)}
                </svg>
                <div className="pointer-events-none absolute bottom-6 left-7 rounded-md border border-white/10 bg-black/45 px-2 py-1 text-[10px] text-zinc-400 backdrop-blur">红：拉杆　蓝：压杆　绿色：零杆</div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <Panel title="节点属性" eyebrow={activeNode ? `N${activeNode.id} · (${activeNode.x}, ${activeNode.y})` : '请在图中选择节点'}>
              {activeNode ? <div className="space-y-4">
                <div><Label>支座类型</Label><div className="grid grid-cols-3 gap-2">{([null,'pin','roller'] as SupportType[]).map((value)=><button key={value ?? 'none'} onClick={()=>updateNode({support:value})} className={`rounded-md border px-2 py-2 text-xs ${activeNode.support===value?'border-accent/50 bg-accent/15 text-accent':'border-border text-muted'}`}>{value===null?'无':value==='pin'?'铰支座':'滚动'}</button>)}</div></div>
                <div className="grid grid-cols-2 gap-3"><NumberField label="Fx / kN" value={activeNode.Fx} onChange={(Fx)=>updateNode({Fx})}/><NumberField label="Fy / kN" value={activeNode.Fy} onChange={(Fy)=>updateNode({Fy})}/></div>
                <p className="text-[11px] leading-5 text-muted">正方向：向右、向上。向下 10 kN 请填写 −10。</p>
              </div> : <p className="text-xs text-muted">切换到“选择/载荷”，再点击任意节点。</p>}
            </Panel>

            <Panel title="AI 快速建模" eyebrow="复用网站 AI API">
              <textarea value={aiPrompt} onChange={(e)=>setAiPrompt(e.target.value)} rows={4} className="w-full resize-none rounded-lg border border-border bg-background/70 p-3 text-xs leading-5 text-foreground outline-none focus:border-accent/50" />
              <button disabled={aiBusy || !aiPrompt.trim()} onClick={()=>askAi('parse')} className="mt-3 w-full rounded-lg bg-accent px-4 py-2.5 text-xs font-semibold text-white transition hover:brightness-110 disabled:opacity-50">{aiBusy?'AI 处理中…':'根据描述生成模型'}</button>
            </Panel>

            <Panel title="模型数据" eyebrow="JSON 导入 / 导出">
              <textarea value={jsonText} onChange={(e)=>setJsonText(e.target.value)} placeholder="粘贴模型 JSON…" rows={3} className="w-full resize-none rounded-lg border border-border bg-background/70 p-3 font-mono text-[11px] text-foreground outline-none focus:border-accent/50" />
              <div className="mt-2 grid grid-cols-2 gap-2"><button onClick={importJson} className="rounded-lg border border-border py-2 text-xs text-muted hover:text-foreground">导入 JSON</button><button onClick={()=>setJsonText(JSON.stringify(model,null,2))} className="rounded-lg border border-border py-2 text-xs text-muted hover:text-foreground">导出到文本框</button></div>
            </Panel>
          </aside>
        </div>

        <section className="mt-5 grid gap-5 lg:grid-cols-[360px_minmax(0,1fr)]">
          <Panel title="静力求解" eyebrow={`未知量 ${check.unknowns} · 方程 ${check.equations}`}>
            <div className="grid grid-cols-2 gap-2"><button data-testid="solve" onClick={runSolve} className="rounded-lg bg-accent px-4 py-3 text-sm font-semibold text-white hover:brightness-110">开始求解</button><button data-testid="sample" onClick={()=>{setModel(cloneSample());setSelectedNode(2);setMode('select');}} className="rounded-lg border border-border px-4 py-3 text-sm text-muted hover:text-foreground">载入示例</button></div>
            <button data-testid="clear" onClick={()=>{setModel({nodes:[],members:[]});setSelectedNode(null);setMode('node');}} className="mt-2 w-full rounded-lg border border-border px-4 py-2 text-xs text-muted hover:text-foreground">清空并从网格建模</button>
            {error && <p className="mt-3 rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs leading-5 text-red-300">{error}</p>}
            {result && <div className="mt-4 space-y-2 text-xs text-muted">{Object.entries(result.reactions).map(([id,r])=><div key={id} className="flex justify-between"><span>N{id} 反力</span><span className="font-mono text-foreground">({r.Rx.toFixed(2)}, {r.Ry.toFixed(2)}) kN</span></div>)}<div className="flex justify-between border-t border-border pt-2"><span>最大平衡残差</span><span className="font-mono text-emerald-400">{result.residual.toExponential(1)}</span></div></div>}
          </Panel>
          <Panel title="AI 简明讲解" eyebrow="结论 → 反力 → 关键杆件 → 校核">
            <div className="min-h-32 whitespace-pre-wrap text-sm leading-7 text-muted">{aiText || (result ? '数值求解完成。点击下方按钮，让 AI 用不超过 350 字说明关键结论。' : '先完成一次数值求解，再生成针对当前模型的讲解。')}</div>
            <button disabled={!result || aiBusy} onClick={()=>askAi('explain')} className="mt-3 rounded-lg border border-accent/40 bg-accent/10 px-4 py-2.5 text-xs font-medium text-accent hover:bg-accent/15 disabled:opacity-40">{aiBusy?'生成中…':'生成简明讲解'}</button>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function LoadArrow({ node }: { node: TrussModel['nodes'][number] }) {
  const mag = Math.hypot(node.Fx, node.Fy), scale = 52 / Math.max(mag, 1);
  const ex = sx(node.x) - node.Fx * scale, ey = sy(node.y) + node.Fy * scale;
  return <g><defs><marker id={`arrow-${node.id}`} markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#fbbf24"/></marker></defs><line x1={ex} y1={ey} x2={sx(node.x)} y2={sy(node.y)} stroke="#fbbf24" strokeWidth="3" markerEnd={`url(#arrow-${node.id})`}/><text x={ex} y={ey-8} textAnchor="middle" fill="#fbbf24" fontSize="12">{mag.toFixed(1)} kN</text></g>;
}

function Panel({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return <div className="glass rounded-xl border border-border p-4"><div className="mb-4"><p className="text-[10px] uppercase tracking-widest text-muted">{eyebrow}</p><h2 className="mt-1 text-sm font-semibold text-foreground">{title}</h2></div>{children}</div>;
}
function Status({ label, ok }: { label: string; ok: boolean }) { return <span className={`rounded-full border px-3 py-1.5 ${ok?'border-emerald-400/20 bg-emerald-400/10 text-emerald-300':'border-amber-400/20 bg-amber-400/10 text-amber-300'}`}>{label}</span>; }
function Label({ children }: { children: React.ReactNode }) { return <p className="mb-2 text-[11px] text-muted">{children}</p>; }
function NumberField({ label, value, onChange }: { label:string; value:number; onChange:(value:number)=>void }) { return <label><Label>{label}</Label><input type="number" value={value} onChange={(e)=>onChange(Number(e.target.value)||0)} className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground outline-none focus:border-accent/50"/></label>; }
