'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface Props {
  slug: string;
  category: string;
  size?: 'card' | 'detail' | 'cover';
  coverImage?: string;
}

export function MechanismCover({ slug, category, size = 'card', coverImage }: Props) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (coverImage) {
    return (
      <img
        src={coverImage}
        alt=""
        className="w-full h-full object-cover"
      />
    );
  }

  // Avoid SSR/CSR floating-point mismatch — render placeholder until mounted
  if (!mounted) {
    const bg = '#12121f';
    return (
      <svg viewBox="0 0 480 300" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <rect width={480} height={300} fill={bg} />
      </svg>
    );
  }

  const isDark = theme !== 'light';
  const bg = isDark ? '#12121f' : '#eeebe4';
  const fg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
  const accent = isDark ? '#4ecdc4' : '#0d7377';
  const line = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)';
  const dot = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

  const w = 480;
  const h = size === 'card' ? 300 : 380;
  const cx = w / 2;
  const cy = h / 2;

  const renderMech = () => {
    switch (slug) {
      case 'slider-crank': return <SC cx={cx} cy={cy} a={accent} l={line} />;
      case 'crank-rocker': return <CR cx={cx} cy={cy} a={accent} l={line} />;
      case 'shaper': return <SH cx={cx} cy={cy} a={accent} l={line} />;
      case 'pumpjack': return <PJ cx={cx} cy={cy} a={accent} l={line} />;
      case 'parallelogram': return <PL cx={cx} cy={cy} a={accent} l={line} />;
      case 'serial-4r': return <S4 cx={cx} cy={cy} a={accent} l={line} />;
      case 'serial-3d': return <S3 cx={cx} cy={cy} a={accent} l={line} />;
      case 'space-station-docking': return <DK cx={cx} cy={cy} a={accent} l={line} />;
      case 'fast-feed-cabin': return <FF cx={cx} cy={cy} a={accent} l={line} />;
      case 'winch-kinematics':
      case 'winch':
        return <WN cx={cx} cy={cy} a={accent} l={line} d={slug === 'winch'} />;
      case 'cam-follower':
        return <CF cx={cx} cy={cy} a={accent} l={line} />;
      case 'double-pendulum':
        return <DP cx={cx} cy={cy} a={accent} l={line} />;
      case 'elliptic-trammel':
        return <ET cx={cx} cy={cy} a={accent} l={line} />;
      case 'spring-oscillator':
        return <SO cx={cx} cy={cy} a={accent} l={line} />;
      default:
        return <GM cx={cx} cy={cy} a={accent} l={line} />;
    }
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
      <rect width={w} height={h} fill={bg} />
      <defs>
        <pattern id={`d-${slug}`} x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="10" cy="10" r="0.6" fill={dot} />
        </pattern>
      </defs>
      <rect width={w} height={h} fill={`url(#d-${slug})`} />
      <line x1={0} y1={cy} x2={w} y2={cy} stroke={fg} strokeWidth={0.5} />
      <line x1={cx} y1={0} x2={cx} y2={h} stroke={fg} strokeWidth={0.5} />
      {renderMech()}
      <rect x={16} y={16} width={32} height={1.5} fill={accent} opacity={0.3} rx={0.75} />
      <rect x={16} y={16} width={1.5} height={32} fill={accent} opacity={0.3} rx={0.75} />
      <rect x={w - 48} y={h - 17} width={32} height={1.5} fill={accent} opacity={0.3} rx={0.75} />
      <rect x={w - 17} y={h - 48} width={1.5} height={32} fill={accent} opacity={0.3} rx={0.75} />
    </svg>
  );
}

/* Slider-Crank */
function SC({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const ox = cx - 60, oy = cy + 20, r = 35, ang = -0.6;
  const jx = ox + r * Math.cos(ang), jy = oy + r * Math.sin(ang);
  const bx = jx + 150;
  return (
    <g>
      <circle cx={ox} cy={oy} r={6} fill={a} opacity={0.6} />
      <circle cx={ox} cy={oy} r={3} fill={a} />
      <circle cx={ox} cy={oy} r={r} fill="none" stroke={l} strokeWidth={1} strokeDasharray="4 4" />
      <line x1={ox} y1={oy} x2={jx} y2={jy} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <circle cx={jx} cy={jy} r={5} fill={a} opacity={0.5} />
      <line x1={jx} y1={jy} x2={bx} y2={oy} stroke={l} strokeWidth={2} strokeLinecap="round" />
      <rect x={bx - 14} y={oy - 20} width={28} height={40} fill="none" stroke={a} strokeWidth={2} rx={4} />
      <rect x={bx - 160} y={oy - 1} width={320} height={2} fill={l} opacity={0.3} />
      <line x1={bx - 160} y1={oy - 16} x2={bx - 160} y2={oy + 16} stroke={l} strokeWidth={1.5} opacity={0.5} />
    </g>
  );
}

/* Crank-Rocker */
function CR({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const o1x = cx - 70, o1y = cy + 30, o2x = cx + 70, o2y = cy + 30;
  const r1 = 35, ang = -0.8;
  const ax = o1x + r1 * Math.cos(ang), ay = o1y + r1 * Math.sin(ang);
  const dx = ax - o2x, dy = ay - o2y;
  const d = Math.sqrt(dx * dx + dy * dy);
  const r3 = 90;
  const bx = o2x + (dx / d) * r3 * 0.95, by = o2y + (dy / d) * r3 * 0.95;
  return (
    <g>
      <circle cx={o1x} cy={o1y} r={5} fill={a} />
      <circle cx={o2x} cy={o2y} r={5} fill={a} opacity={0.6} />
      <circle cx={o1x} cy={o1y} r={r1} fill="none" stroke={l} strokeWidth={1} strokeDasharray="4 4" />
      <line x1={o1x} y1={o1y} x2={ax} y2={ay} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={l} strokeWidth={2} strokeLinecap="round" />
      <line x1={o2x} y1={o2y} x2={bx} y2={by} stroke={a} strokeWidth={2.5} strokeLinecap="round" opacity={0.6} />
      <line x1={o1x} y1={o1y} x2={o2x} y2={o2y} stroke={l} strokeWidth={1.5} opacity={0.3} />
      <circle cx={ax} cy={ay} r={4} fill={a} opacity={0.4} />
      <circle cx={bx} cy={by} r={4} fill={a} opacity={0.4} />
    </g>
  );
}

/* Shaper */
function SH({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const o1x = cx - 50, o1y = cy + 60, o2x = cx - 50, o2y = cy - 60;
  const r = 45, ang = 0.5;
  const px = o1x + r * Math.cos(ang), py = o1y + r * Math.sin(ang);
  const slotLen = 200;
  const sa = Math.atan2(py - o2y, px - o2x);
  const slx = o2x + slotLen * 1.2 * Math.cos(sa);
  const sly = o2y + slotLen * 1.2 * Math.sin(sa);
  const deg = (sa * 180) / Math.PI;
  return (
    <g>
      <circle cx={o1x} cy={o1y} r={5} fill={a} />
      <circle cx={o1x} cy={o1y} r={r} fill="none" stroke={l} strokeWidth={1} strokeDasharray="4 4" />
      <circle cx={o2x} cy={o2y} r={5} fill={a} opacity={0.6} />
      <line x1={o1x} y1={o1y} x2={px} y2={py} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <line x1={o2x} y1={o2y} x2={slx} y2={sly} stroke={l} strokeWidth={2.5} strokeLinecap="round" />
      <rect x={px - 10} y={py - 6} width={20} height={12} fill="none" stroke={a} strokeWidth={2} rx={3}
        transform={`rotate(${deg} ${px} ${py})`} />
      <rect x={slx - 5} y={sly - 20} width={30} height={40} fill="none" stroke={a} strokeWidth={2} rx={3} />
      <line x1={slx - 120} y1={sly} x2={slx + 80} y2={sly} stroke={l} strokeWidth={1} opacity={0.3} />
    </g>
  );
}

/* Pumpjack */
function PJ({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const bx = cx, by = cy + 50;
  const bl = 140, ba = -0.15;
  const bx1 = bx - bl * 0.55, by1 = by + Math.sin(ba) * bl * 0.55;
  const bx2 = bx + bl * 0.45, by2 = by - Math.sin(ba) * bl * 0.45;
  const ckx = bx - 80, cky = by + 90, ckr = 40;
  return (
    <g>
      <line x1={bx - 15} y1={by} x2={bx} y2={by - 80} stroke={l} strokeWidth={2} opacity={0.4} />
      <line x1={bx + 15} y1={by} x2={bx} y2={by - 80} stroke={l} strokeWidth={2} opacity={0.4} />
      <line x1={bx - 25} y1={by} x2={bx + 25} y2={by} stroke={l} strokeWidth={1.5} opacity={0.3} />
      <line x1={bx1} y1={by1} x2={bx2} y2={by2} stroke={a} strokeWidth={3.5} strokeLinecap="round" />
      <circle cx={bx} cy={by - 8} r={5} fill={a} />
      <circle cx={ckx} cy={cky} r={ckr} fill="none" stroke={l} strokeWidth={1} strokeDasharray="4 4" />
      <circle cx={ckx} cy={cky} r={4} fill={a} opacity={0.6} />
      <line x1={ckx} y1={cky - ckr} x2={bx1} y2={by1} stroke={l} strokeWidth={2} strokeLinecap="round" />
      <path d={`M ${bx2} ${by2} Q ${bx2 + 30} ${by2 - 40} ${bx2 + 10} ${by2 - 60}`}
        fill="none" stroke={a} strokeWidth={2} opacity={0.6} />
      <line x1={bx2 + 8} y1={by2 - 55} x2={bx2 + 2} y2={by2 + 60} stroke={a} strokeWidth={2} opacity={0.5} />
    </g>
  );
}

/* Parallelogram */
function PL({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const o1x = cx - 65, o1y = cy + 10, o2x = cx + 65, o2y = cy + 10;
  const r = 45, ang = 0.4;
  const ax = o1x + r * Math.cos(ang), ay = o1y + r * Math.sin(ang);
  const bx = o2x + r * Math.cos(ang), by = o2y + r * Math.sin(ang);
  return (
    <g>
      <circle cx={o1x} cy={o1y} r={5} fill={a} />
      <circle cx={o2x} cy={o2y} r={5} fill={a} />
      <line x1={o1x} y1={o1y} x2={o2x} y2={o2y} stroke={l} strokeWidth={1.5} opacity={0.4} />
      <line x1={o1x} y1={o1y} x2={ax} y2={ay} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <line x1={o2x} y1={o2y} x2={bx} y2={by} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <line x1={ax} y1={ay} x2={bx} y2={by} stroke={l} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={ax} cy={ay} r={4} fill={a} opacity={0.4} />
      <circle cx={bx} cy={by} r={4} fill={a} opacity={0.4} />
      <circle cx={ax} cy={ay} r={r} fill="none" stroke={l} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.3} />
      <circle cx={bx} cy={by} r={r} fill="none" stroke={l} strokeWidth={0.8} strokeDasharray="3 3" opacity={0.3} />
    </g>
  );
}

/* Serial 4R */
function S4({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const bx = cx - 80, by = cy + 70;
  const cfgs: [number, number][] = [[55, -1.2], [50, -0.3], [45, 0.6], [40, -0.4]];
  let px = bx, py = by;
  const jts: [number, number][] = [[px, py]];
  cfgs.forEach(([len, ang]) => { px += len * Math.cos(ang); py += len * Math.sin(ang); jts.push([px, py]); });
  return (
    <g>
      <rect x={bx - 20} y={by} width={40} height={15} fill={l} rx={3} opacity={0.4} />
      {jts.slice(0, -1).map((_, i) => (
        <g key={i}>
          <line x1={jts[i][0]} y1={jts[i][1]} x2={jts[i + 1][0]} y2={jts[i + 1][1]}
            stroke={i === 0 ? a : l} strokeWidth={i === 0 ? 3 : 2.5} strokeLinecap="round" />
          <circle cx={jts[i][0]} cy={jts[i][1]} r={i === 0 ? 5 : 4} fill={a} opacity={i === 0 ? 0.8 : 0.4} />
        </g>
      ))}
      <circle cx={jts[jts.length - 1][0]} cy={jts[jts.length - 1][1]} r={5} fill={a} />
      <circle cx={jts[jts.length - 1][0]} cy={jts[jts.length - 1][1]} r={10}
        fill="none" stroke={a} strokeWidth={1} opacity={0.3} strokeDasharray="2 2" />
    </g>
  );
}

/* Serial 3D */
function S3({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const bx = cx - 70, by = cy + 80;
  const segs = [{ len: 50, ang: -1.0, t: 3 }, { len: 45, ang: -0.6, t: 2.5 }, { len: 40, ang: -0.1, t: 2 }, { len: 35, ang: 0.5, t: 2 }, { len: 30, ang: 0.2, t: 1.5 }];
  let px = bx, py = by;
  const pts: [number, number][] = [[px, py]];
  segs.forEach(s => { px += s.len * Math.cos(s.ang); py += s.len * Math.sin(s.ang) * 0.7; pts.push([px, py]); });
  return (
    <g>
      <ellipse cx={bx} cy={by} rx={25} ry={10} fill="none" stroke={l} strokeWidth={1.5} opacity={0.4} />
      <rect x={bx - 20} y={by - 2} width={40} height={12} fill={l} rx={2} opacity={0.3} />
      {pts.slice(0, -1).map((_, i) => (
        <g key={i}>
          <line x1={pts[i][0]} y1={pts[i][1]} x2={pts[i + 1][0]} y2={pts[i + 1][1]}
            stroke={i === 0 ? a : l} strokeWidth={segs[i].t} strokeLinecap="round" />
          <circle cx={pts[i][0]} cy={pts[i][1]} r={i === 0 ? 5 : 3.5} fill={a} opacity={i === 0 ? 0.8 : 0.4} />
        </g>
      ))}
      <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r={4} fill={a} />
    </g>
  );
}

/* Docking */
function DK({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const stars: [number, number][] = [[cx - 180, cy - 80], [cx - 100, cy - 100], [cx + 50, cy - 90], [cx + 150, cy - 60], [cx + 180, cy + 80], [cx - 150, cy + 70], [cx + 80, cy + 90], [cx - 60, cy + 100]];
  return (
    <g>
      {stars.map(([sx, sy], i) => (<circle key={i} cx={sx} cy={sy} r={i % 3 === 0 ? 1.5 : 0.8} fill={a} opacity={0.25 + i * 0.04} />))}
      <rect x={cx - 140} y={cy - 22} width={110} height={44} fill="none" stroke={l} strokeWidth={2} rx={8} />
      <rect x={cx - 130} y={cy - 12} width={25} height={24} fill={a} opacity={0.15} rx={3} />
      <rect x={cx - 95} y={cy - 12} width={25} height={24} fill={a} opacity={0.1} rx={3} />
      <line x1={cx - 30} y1={cy - 25} x2={cx - 30} y2={cy + 25} stroke={a} strokeWidth={3} opacity={0.6} />
      <rect x={cx - 160} y={cy - 35} width={18} height={70} fill={a} opacity={0.08} rx={2} />
      <line x1={cx - 151} y1={cy - 35} x2={cx - 151} y2={cy + 35} stroke={l} strokeWidth={0.5} opacity={0.3} />
      <rect x={cx + 40} y={cy - 12} width={35} height={24} fill="none" stroke={a} strokeWidth={2.5} rx={5} />
      <circle cx={cx + 42} cy={cy} r={5} fill={a} opacity={0.3} />
      <line x1={cx - 30} y1={cy} x2={cx + 40} y2={cy} stroke={a} strokeWidth={0.8} opacity={0.2} strokeDasharray="6 4" />
      <circle cx={cx + 170} cy={cy - 90} r={50} fill="none" stroke={a} strokeWidth={1} opacity={0.1} />
      <path d={`M ${cx + 140} ${cy - 105} Q ${cx + 185} ${cy - 120} ${cx + 200} ${cy - 90}`} fill="none" stroke={a} strokeWidth={1} opacity={0.15} />
    </g>
  );
}

/* FAST */
function FF({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const cabinX = cx, cabinY = cy - 10, r = 100;
  const angles = [-60, -36, -12, 12, 36, 60];
  const anchors: [number, number][] = [[-18, -12], [18, -12], [-18, 10], [18, 10]];
  return (
    <g>
      <path d={`M ${cx - r} ${cy + 30} Q ${cx} ${cy + r + 40} ${cx + r} ${cy + 30}`} fill="none" stroke={l} strokeWidth={1.5} opacity={0.3} />
      {angles.map((angle, i) => {
        const rad = (angle * Math.PI) / 180;
        const tx = cx + r * 1.3 * Math.cos(rad);
        const ty = i < 3 ? cy - r * 1.1 : cy + r * 1.1;
        return <line key={i} x1={cabinX} y1={cabinY} x2={tx} y2={ty} stroke={l} strokeWidth={0.8} opacity={0.2 + i * 0.04} />;
      })}
      <rect x={cabinX - 22} y={cabinY - 16} width={44} height={32} fill={a} opacity={0.12} rx={6} />
      <rect x={cabinX - 22} y={cabinY - 16} width={44} height={32} fill="none" stroke={a} strokeWidth={2} rx={6} />
      <rect x={cabinX - 10} y={cabinY + 16} width={20} height={8} fill={a} opacity={0.2} rx={2} />
      {anchors.map(([dx, dy], i) => (<circle key={i} cx={cabinX + dx} cy={cabinY + dy} r={2} fill={a} opacity={0.5} />))}
    </g>
  );
}

/* Winch */
function WN({ cx, cy, a, l, d }: { cx: number; cy: number; a: string; l: string; d: boolean }) {
  const dx = cx - 30, dy = cy - 20, dr = 28, loadY = cy + 70;
  return (
    <g>
      <circle cx={dx} cy={dy} r={dr} fill="none" stroke={a} strokeWidth={2.5} />
      <circle cx={dx} cy={dy} r={8} fill={a} opacity={0.3} />
      <circle cx={dx} cy={dy} r={3} fill={a} />
      <line x1={dx - 50} y1={dy - dr - 10} x2={dx + 50} y2={dy - dr - 10} stroke={l} strokeWidth={2} opacity={0.4} />
      <line x1={dx} y1={dy - dr - 10} x2={dx} y2={dy - dr - 30} stroke={l} strokeWidth={1.5} opacity={0.3} />
      <line x1={dx} y1={dy + dr} x2={dx} y2={loadY - 15} stroke={l} strokeWidth={1.5} />
      <rect x={dx - 22} y={loadY - 10} width={44} height={30} fill="none" stroke={a} strokeWidth={2.5} rx={5} />
      <text x={dx} y={loadY + 6} textAnchor="middle" fill={a} fontSize={11} fontWeight="bold" opacity={0.6}>m</text>
      {d && (
        <g>
          <line x1={dx} y1={loadY - 15} x2={dx} y2={loadY - 42} stroke={a} strokeWidth={2} opacity={0.5} />
          <polygon points={`${dx - 4},${loadY - 36} ${dx},${loadY - 46} ${dx + 4},${loadY - 36}`} fill={a} opacity={0.5} />
          <line x1={dx} y1={loadY + 20} x2={dx} y2={loadY + 48} stroke={l} strokeWidth={2} opacity={0.5} />
          <polygon points={`${dx - 4},${loadY + 42} ${dx},${loadY + 52} ${dx + 4},${loadY + 42}`} fill={l} opacity={0.5} />
        </g>
      )}
    </g>
  );
}

/* Cam-Follower */
function CF({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const camCx = cx, camCy = cy + 30, e = 14, r = 38;
  const centerX = camCx, centerY = camCy - e;
  const rodY = camCy - r - e - 8;
  return (
    <g>
      <circle cx={centerX} cy={centerY} r={3} fill={a} />
      <circle cx={centerX} cy={centerY} r={e} fill="none" stroke={l} strokeWidth={1} strokeDasharray="3 3" />
      <circle cx={camCx} cy={camCy} r={r} fill="none" stroke={a} strokeWidth={2.5} />
      <line x1={centerX} y1={centerY} x2={camCx} y2={camCy} stroke={a} strokeWidth={2} />
      <rect x={camCx - 22} y={rodY - 4} width={44} height={12} fill="none" stroke={a} strokeWidth={2.5} rx={2} />
      <line x1={camCx - 20} y1={rodY + 2} x2={camCx} y2={camCy - r} stroke={a} strokeWidth={2} opacity={0.5} />
      <line x1={camCx + 20} y1={rodY + 2} x2={camCx} y2={camCy - r} stroke={a} strokeWidth={2} opacity={0.5} />
      <rect x={camCx - 28} y={rodY - 30} width={4} height={60} fill={l} rx={1} opacity={0.4} />
      <rect x={camCx + 24} y={rodY - 30} width={4} height={60} fill={l} rx={1} opacity={0.4} />
    </g>
  );
}

/* Double Pendulum */
function DP({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const px = cx, py = cy - 60;
  const a1 = 0.9, a2 = 0.5, len1 = 80, len2 = 65;
  const j1x = px + len1 * Math.sin(a1), j1y = py + len1 * Math.cos(a1);
  const j2x = j1x + len2 * Math.sin(a2), j2y = j1y + len2 * Math.cos(a2);
  const tracePts = 6;
  const trace = Array.from({ length: tracePts }, (_, i) => {
    const aa = a2 - 0.4 + i * 0.8 / tracePts;
    return { x: j1x + len2 * Math.sin(aa), y: j1y + len2 * Math.cos(aa) };
  });
  return (
    <g>
      <rect x={px - 15} y={py - 8} width={30} height={10} fill={l} rx={2} opacity={0.4} />
      <circle cx={px} cy={py} r={5} fill={a} />
      <line x1={px} y1={py} x2={j1x} y2={j1y} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <circle cx={j1x} cy={j1y} r={7} fill={a} opacity={0.5} />
      <line x1={j1x} y1={j1y} x2={j2x} y2={j2y} stroke={l} strokeWidth={2.5} strokeLinecap="round" />
      <circle cx={j2x} cy={j2y} r={8} fill={a} opacity={0.35} />
      <circle cx={j2x} cy={j2y} r={3} fill={a} />
      {trace.map((t, i) => (
        <circle key={i} cx={t.x} cy={t.y} r={1.2} fill={a} opacity={0.08 + i * 0.04} />
      ))}
    </g>
  );
}

/* Elliptic Trammel */
function ET({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const rw = 220, rh = 140;
  const rx = cx, ry = cy;
  const ang = 0.65;
  const rodLen = 140;
  const ax = rx - (rodLen / 2) * Math.cos(ang), ay = ry + (rodLen / 2) * Math.sin(ang);
  const bx = rx + (rodLen / 2) * Math.cos(ang), by = ry - (rodLen / 2) * Math.sin(ang);
  const mx = bx + 50 * Math.cos(ang) * 0.95, my = by - 50 * Math.sin(ang) * 0.95;
  const eRx = rodLen / 2 + 50, eRy = 50;
  return (
    <g>
      <line x1={rx - rw / 2} y1={ry} x2={rx + rw / 2} y2={ry} stroke={l} strokeWidth={2} opacity={0.35} />
      <line x1={rx} y1={ry - rh / 2} x2={rx} y2={ry + rh / 2} stroke={l} strokeWidth={2} opacity={0.35} />
      <rect x={ax - 8} y={ry - 7} width={16} height={14} fill="none" stroke={a} strokeWidth={2} rx={3} />
      <rect x={rx - 7} y={by - 8} width={14} height={16} fill="none" stroke={a} strokeWidth={2} rx={3} />
      <line x1={ax} y1={ry} x2={bx} y2={by} stroke={a} strokeWidth={3} strokeLinecap="round" />
      <circle cx={mx} cy={my} r={4} fill={a} />
      <ellipse cx={rx} cy={ry} rx={eRx} ry={eRy} fill="none" stroke={a} strokeWidth={1} opacity={0.2} strokeDasharray="5 3" />
      <circle cx={rx} cy={ry - eRy} r={2} fill={l} opacity={0.4} />
      <circle cx={rx} cy={ry + eRy} r={2} fill={l} opacity={0.4} />
    </g>
  );
}

/* Spring Oscillator */
function SO({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  const wallX = cx - 90, massX = cx + 20, massY = cy - 10;
  const coils = 8, springLen = massX - wallX - 26;
  const pathParts: string[] = [];
  const sx = wallX + 12;
  for (let i = 0; i <= coils * 2; i++) {
    const t = i / (coils * 2);
    const px = sx + t * springLen;
    const py = massY + (i % 2 === 0 ? 16 : -16);
    pathParts.push(`${i === 0 ? 'M' : 'L'} ${px} ${py}`);
  }
  return (
    <g>
      <rect x={wallX - 8} y={massY - 50} width={12} height={100} fill={l} rx={2} opacity={0.4} />
      <line x1={wallX + 4} y1={massY - 45} x2={wallX + 4} y2={massY + 45} stroke={l} strokeWidth={0.5} opacity={0.2} />
      <line x1={wallX + 4} y1={massY - 8} x2={sx} y2={massY - 8} stroke={l} strokeWidth={1} opacity={0.3} />
      <path d={pathParts.join(' ')} fill="none" stroke={a} strokeWidth={2} strokeLinecap="round" />
      <line x1={sx + springLen} y1={massY - 8} x2={massX - 14} y2={massY - 8} stroke={l} strokeWidth={1} opacity={0.3} />
      <rect x={massX - 14} y={massY - 22} width={28} height={28} fill="none" stroke={a} strokeWidth={2.5} rx={5} />
      <text x={massX} y={massY - 1} textAnchor="middle" fill={a} fontSize={10} fontWeight="bold" opacity={0.6}>m</text>
      <line x1={wallX - 12} y1={massY + 28} x2={massX + 30} y2={massY + 28} stroke={l} strokeWidth={1} opacity={0.25} />
      <rect x={massX + 16} y={massY - 10} width={18} height={8} fill="none" stroke={l} strokeWidth={1.5} rx={2} opacity={0.4} />
      <line x1={massX + 25} y1={massY - 6} x2={massX + 25} y2={massY + 28} stroke={l} strokeWidth={1} opacity={0.3} strokeDasharray="4 4" />
      <circle cx={massX + 25} cy={massY + 30} r={5} fill="none" stroke={l} strokeWidth={1.5} opacity={0.5} />
    </g>
  );
}

/* Generic */
function GM({ cx, cy, a, l }: { cx: number; cy: number; a: string; l: string }) {
  return (
    <g>
      <circle cx={cx} cy={cy} r={80} fill="none" stroke={l} strokeWidth={1} opacity={0.2} />
      <circle cx={cx} cy={cy} r={50} fill="none" stroke={a} strokeWidth={1} opacity={0.15} strokeDasharray="6 4" />
      <circle cx={cx} cy={cy} r={20} fill={a} opacity={0.1} />
      <circle cx={cx} cy={cy} r={6} fill={a} opacity={0.3} />
    </g>
  );
}
