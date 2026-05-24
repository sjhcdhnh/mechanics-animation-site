'use client';

import { useState, useCallback, useMemo } from 'react';
import type { AnimationMeta, Category } from '@/types';
import { AnimationCard } from './AnimationCard';
import { SearchBar } from './SearchBar';
import { CategoryFilter } from './CategoryFilter';
import { GallerySkeleton } from '@/components/ui/Skeleton';
import { EmptyIcon } from '@/components/ui/Icons';

export function GalleryGrid({
  animations: initialAnimations,
}: {
  animations: AnimationMeta[];
}) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category | 'all'>('all');
  const [loading] = useState(false);

  const handleSearch = useCallback((query: string) => {
    setSearch(query);
  }, []);

  const filtered = useMemo(() => {
    let list = initialAnimations;

    if (category !== 'all') {
      list = list.filter((a) => a.category === category);
    }

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.subtitle.toLowerCase().includes(q) ||
          a.mechanismType.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    return list;
  }, [initialAnimations, category, search]);

  if (loading) return <GallerySkeleton />;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <SearchBar onSearch={handleSearch} />
      </div>

      <CategoryFilter selected={category} onSelect={setCategory} />

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-muted/40 mb-5">
            <EmptyIcon className="w-14 h-14" />
          </span>
          <p className="text-sm text-muted">
            {search
              ? `未找到与"${search}"相关的动画`
              : '该分类暂无动画'}
          </p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="mt-4 text-sm text-accent hover:text-accent-hover transition-colors duration-200"
            >
              清除搜索条件
            </button>
          )}
        </div>
      ) : (
        <>
          <p className="text-xs text-muted/60">
            {filtered.length} 个动画
            {category !== 'all' && '  · 已筛选'}
            {search && `  · "${search}"`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((anim, i) => (
              <AnimationCard key={anim.slug} anim={anim} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
