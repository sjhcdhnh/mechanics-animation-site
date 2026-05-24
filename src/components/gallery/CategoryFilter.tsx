'use client';

import type { Category } from '@/types';
import { CATEGORIES } from '@/lib/constants';

const categoryDots: Record<string, string> = {
  'four-bar': 'bg-amber-500/70',
  'serial-robot': 'bg-violet-500/70',
  aerospace: 'bg-sky-500/70',
  engineering: 'bg-emerald-500/70',
  other: 'bg-stone-500/70',
};

export function CategoryFilter({
  selected,
  onSelect,
}: {
  selected: Category | 'all';
  onSelect: (category: Category | 'all') => void;
}) {
  const allCategories = [
    { slug: 'all' as const, label: '全部' },
    ...CATEGORIES,
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {allCategories.map((cat) => {
        const isActive = selected === cat.slug;
        return (
          <button
            key={cat.slug}
            onClick={() => onSelect(cat.slug)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all duration-200 ${
              isActive
                ? 'bg-foreground/[0.06] text-foreground font-medium'
                : 'text-muted hover:text-foreground hover:bg-foreground/[0.03]'
            }`}
          >
            {cat.slug !== 'all' && (
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive
                    ? (categoryDots[cat.slug] || 'bg-accent')
                    : (categoryDots[cat.slug] || 'bg-muted/40')
                }`}
              />
            )}
            <span className="font-medium">{cat.label}</span>
          </button>
        );
      })}
    </div>
  );
}
