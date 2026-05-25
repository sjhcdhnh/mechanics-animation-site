import { list, put, del } from '@vercel/blob';
import type { AnimationMeta, Category } from '@/types';
import registryData from '@/data/animations.json';

let cachedRegistry: AnimationMeta[] | null = null;
let uploadedCache: AnimationMeta[] | null = null;
let uploadedCacheTime = 0;

const CACHE_TTL = 5000; // 5s

function getBuiltin(): AnimationMeta[] {
  if (!cachedRegistry) {
    cachedRegistry = registryData as AnimationMeta[];
  }
  return cachedRegistry;
}

/** Fetch uploaded animation metadata from Blob */
export async function getUploadedAnimations(): Promise<AnimationMeta[]> {
  const now = Date.now();
  if (uploadedCache && now - uploadedCacheTime < CACHE_TTL) {
    return uploadedCache;
  }

  try {
    const { blobs } = await list({ prefix: 'registry/' });
    const metas: AnimationMeta[] = [];
    for (const blob of blobs) {
      if (blob.pathname.endsWith('.meta.json')) {
        try {
          const res = await fetch(blob.url);
          if (res.ok) metas.push(await res.json());
        } catch { /* corrupted entry, skip */ }
      }
    }
    uploadedCache = metas;
    uploadedCacheTime = now;
    return metas;
  } catch {
    return uploadedCache || [];
  }
}

/** Write a single uploaded animation's metadata to Blob */
export async function saveUploadedMeta(meta: AnimationMeta): Promise<void> {
  await put(`registry/${meta.slug}.meta.json`, JSON.stringify(meta), {
    access: 'public',
    contentType: 'application/json',
  });
  // Bust cache
  uploadedCache = null;
}

/** Delete uploaded animation metadata from Blob */
export async function deleteUploadedMeta(slug: string): Promise<void> {
  try {
    const { blobs } = await list({ prefix: `registry/${slug}` });
    for (const b of blobs) {
      await del(b.url);
    }
  } catch { /* non-critical */ }
  uploadedCache = null;
}

// Sync functions for built-in only (fast path, works in static generation)
export function getRegistry(): AnimationMeta[] {
  return getBuiltin();
}

export function getAllAnimations(filters?: {
  category?: Category | 'all';
  search?: string;
  source?: 'builtin' | 'uploaded';
}): AnimationMeta[] {
  let list = getBuiltin();

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

/** Merged: builtin + uploaded from Blob */
export async function getAllAnimationsAsync(filters?: {
  category?: Category | 'all';
  search?: string;
  source?: 'builtin' | 'uploaded';
}): Promise<AnimationMeta[]> {
  const builtin = getBuiltin();
  const uploaded = await getUploadedAnimations();
  let list = [...builtin, ...uploaded];

  // Sort: builtin first, then uploaded by date desc
  list.sort((a, b) => {
    if (a.source !== b.source) return a.source === 'builtin' ? -1 : 1;
    if (a.source === 'uploaded' && b.source === 'uploaded') {
      return (b.uploadDate || '').localeCompare(a.uploadDate || '');
    }
    return 0;
  });

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
  return getBuiltin().find((a) => a.slug === slug);
}

/** Check both builtin and uploaded Blob */
export async function getAnimationBySlugAsync(slug: string): Promise<AnimationMeta | undefined> {
  const builtin = getBuiltin().find((a) => a.slug === slug);
  if (builtin) return builtin;

  const uploaded = await getUploadedAnimations();
  return uploaded.find((a) => a.slug === slug);
}

export function addAnimation(meta: AnimationMeta): void {
  const registry = getBuiltin();
  registry.push(meta);
  registry.sort((a, b) => {
    if (a.source !== b.source) return a.source === 'builtin' ? -1 : 1;
    if (a.source === 'uploaded' && b.source === 'uploaded') {
      return (b.uploadDate || '').localeCompare(a.uploadDate || '');
    }
    return 0;
  });
}

export function deleteAnimation(slug: string): boolean {
  const registry = getBuiltin();
  const index = registry.findIndex((a) => a.slug === slug);
  if (index === -1) return false;
  registry.splice(index, 1);
  return true;
}

export function getAnimationUrl(anim: AnimationMeta): string {
  if (anim.source === 'builtin') {
    return `/animations/${anim.fileName}`;
  }
  return anim.blobUrl || `/uploads/${anim.fileName}`;
}
