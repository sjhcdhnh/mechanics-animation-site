import type { AnimationMeta, Category } from '@/types';
import registryData from '@/data/animations.json';

let cachedRegistry: AnimationMeta[] | null = null;

export function getRegistry(): AnimationMeta[] {
  if (!cachedRegistry) {
    cachedRegistry = registryData as AnimationMeta[];
  }
  return cachedRegistry;
}

export function getAllAnimations(filters?: {
  category?: Category | 'all';
  search?: string;
  source?: 'builtin' | 'uploaded';
}): AnimationMeta[] {
  let list = getRegistry();

  if (filters?.category && filters.category !== 'all') {
    list = list.filter((a) => a.category === filters.category);
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.mechanismType.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (filters?.source) {
    list = list.filter((a) => a.source === filters.source);
  }

  return list;
}

export function getAnimationBySlug(slug: string): AnimationMeta | undefined {
  return getRegistry().find((a) => a.slug === slug);
}

export function addAnimation(meta: AnimationMeta): void {
  const registry = getRegistry();
  registry.push(meta);
  // Sort: builtin first, then by uploadDate descending
  registry.sort((a, b) => {
    if (a.source !== b.source) return a.source === 'builtin' ? -1 : 1;
    if (a.source === 'uploaded' && b.source === 'uploaded') {
      return (b.uploadDate || '').localeCompare(a.uploadDate || '');
    }
    return 0;
  });
}

export function deleteAnimation(slug: string): boolean {
  const registry = getRegistry();
  const index = registry.findIndex((a) => a.slug === slug);
  if (index === -1) return false;
  registry.splice(index, 1);
  return true;
}

export function getAnimationUrl(anim: AnimationMeta): string {
  if (anim.source === 'builtin') {
    return `/animations/${anim.fileName}`;
  }
  return `/uploads/${anim.fileName}`;
}
