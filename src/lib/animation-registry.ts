import { list, put, del } from '@vercel/blob';
import type { AnimationMeta, Category } from '@/types';
import registryData from '@/data/animations.json';

const REGISTRY_KEY = '_registry.json';

let cachedBuiltin: AnimationMeta[] | null = null;
let uploadedCache: AnimationMeta[] | null = null;
let registryBlobUrl: string | null = null;

function getBuiltin(): AnimationMeta[] {
  if (!cachedBuiltin) {
    cachedBuiltin = registryData as AnimationMeta[];
  }
  return cachedBuiltin;
}

/** Fetch the single _registry.json blob (cache URL and data aggressively) */
async function fetchRegistry(): Promise<AnimationMeta[]> {
  // Find the registry blob URL if not cached
  if (!registryBlobUrl) {
    try {
      const { blobs } = await list({ prefix: REGISTRY_KEY, limit: 1 });
      if (blobs.length > 0) {
        registryBlobUrl = blobs[0].url;
      }
    } catch { /* will try again next time */ }
  }

  if (!registryBlobUrl) return [];

  try {
    const res = await fetch(registryBlobUrl, {
      // Use no-cache to avoid stale CDN responses
      cache: 'no-cache',
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/** Uploaded animations — read from single _registry.json blob */
export async function getUploadedAnimations(): Promise<AnimationMeta[]> {
  if (uploadedCache) return uploadedCache;
  uploadedCache = await fetchRegistry();
  return uploadedCache!;
}

/** Write updated registry back to Blob */
async function writeRegistry(entries: AnimationMeta[]): Promise<void> {
  // Delete old registry blob if URL cached
  if (registryBlobUrl) {
    try { await del(registryBlobUrl); } catch { /* non-critical */ }
  }

  const blob = await put(REGISTRY_KEY, JSON.stringify(entries), {
    access: 'public',
    contentType: 'application/json',
  });
  registryBlobUrl = blob.url;
  uploadedCache = entries;
}

/** Save uploaded metadata: read registry, upsert, write back */
export async function saveUploadedMeta(meta: AnimationMeta): Promise<void> {
  const entries = await fetchRegistry();
  const idx = entries.findIndex((e) => e.slug === meta.slug);
  if (idx >= 0) {
    entries[idx] = meta;
  } else {
    entries.unshift(meta);
  }
  await writeRegistry(entries);
}

/** Delete uploaded metadata: read registry, filter, write back */
export async function deleteUploadedMeta(slug: string): Promise<void> {
  const entries = await fetchRegistry();
  await writeRegistry(entries.filter((e) => e.slug !== slug));
}

// ── Sync built-in-only functions (fast) ──

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

export async function getAllAnimationsAsync(filters?: {
  category?: Category | 'all';
  search?: string;
  source?: 'builtin' | 'uploaded';
}): Promise<AnimationMeta[]> {
  const builtin = getBuiltin();
  const uploaded = await getUploadedAnimations();
  let list = [...builtin, ...uploaded];

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
