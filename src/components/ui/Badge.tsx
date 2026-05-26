import type { Category } from '@/types';
import { CATEGORY_MAP } from '@/lib/constants';

const colors: Record<string, string> = {
  'planar-linkage': 'bg-amber-500/10 text-amber-600 border-amber-500/20',
  'cam-drive': 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  'serial-robot': 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  aerospace: 'bg-sky-500/10 text-sky-600 border-sky-500/20',
  dynamics: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
};

const darkColors: Record<string, string> = {
  'planar-linkage': 'bg-amber-500/10 text-amber-300 border-amber-500/25',
  'cam-drive': 'bg-emerald-500/10 text-emerald-300 border-emerald-500/25',
  'serial-robot': 'bg-violet-500/10 text-violet-300 border-violet-500/25',
  aerospace: 'bg-sky-500/10 text-sky-300 border-sky-500/25',
  dynamics: 'bg-rose-500/10 text-rose-300 border-rose-500/25',
};

export function Badge({ category }: { category: Category }) {
  const info = CATEGORY_MAP[category];
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${
        darkColors[category] || darkColors.dynamics
      } ${colors[category] || colors.dynamics}`}
    >
      {info?.label || category}
    </span>
  );
}

export function SourceBadge({ source }: { source: 'builtin' | 'uploaded' }) {
  return source === 'builtin' ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-accent/10 text-accent border border-accent/20">
      内置
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
      用户上传
    </span>
  );
}
