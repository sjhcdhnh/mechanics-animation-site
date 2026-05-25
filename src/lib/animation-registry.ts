import { list, put, del } from '@vercel/blob';
import type { AnimationMeta, Category } from '@/types';
import registryData from '@/data/animations.json';

const REGISTRY_KEY = '_registry.json';

let cachedBuiltin: AnimationMeta[] | null = null;
let uploadedCache: AnimationMeta[] | null = null;
let blobStoreBase: string | null = null;

function getBuiltin(): AnimationMeta[] {
  if (!cachedBuiltin) {
    cachedBuiltin = registryData as AnimationMeta[];
  }
  return cachedBuiltin;
}

function registryUrl(): string | null {
  return blobStoreBase ? `${blobStoreBase}/${REGISTRY_KEY}` : null;
}

/** Discover blob store base URL: try list() then head() as fallback */
async function discoverStoreBase(): Promise<void> {
  // Try list() to find _registry.json
  try {
    const { blobs } = await list({ prefix: REGISTRY_KEY });
    if (blobs.length > 0) {
      const url = new URL(blobs[0].url);
      blobStoreBase = `${url.protocol}//${url.host}`;
      return;
    }
  } catch { /* fall through */ }

  // Fallback: try constructing URL from any known blob
  // If we have uploadedCache entries, use their blobUrl to derive store base
  if (uploadedCache && uploadedCache.length > 0) {
    try {
      const url = new URL(uploadedCache[0].blobUrl!);
      blobStoreBase = `${url.protocol}//${url.host}`;
      return;
    } catch { /* nop */ }
  }
}

/** Fetch the _registry.json blob */
async function fetchRegistry(): Promise<AnimationMeta[]> {
  // On cold start, discover the blob store
  if (!blobStoreBase) {
    await discoverStoreBase();
  }

  const url = registryUrl();
  if (!url) return [];

  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function getUploadedAnimations(): Promise<AnimationMeta[]> {
  if (uploadedCache) return uploadedCache;
  uploadedCache = await fetchRegistry();
  return uploadedCache!;
}

async function writeRegistry(entries: AnimationMeta[]): Promise<void> {
  try {
    const blob = await put(REGISTRY_KEY, JSON.stringify(entries), {
      access: 'public',
      contentType: 'application/json',
    });
    const url = new URL(blob.url);
    blobStoreBase = `${url.protocol}//${url.host}`;
    uploadedCache = entries;
  } catch { /* best-effort, individual files are the source of truth */ }
}

/** Save uploaded metadata: individual file (primary) + registry update (best-effort) */
export async function saveUploadedMeta(meta: AnimationMeta): Promise<void> {
  // Individual file is source of truth
  await put(`registry/${meta.slug}.meta.json`, JSON.stringify(meta), {
    access: 'public',
    contentType: 'application/json',
  });

  // Registry update is best-effort; never throw
  try {
    const entries = await fetchRegistry();
    const idx = entries.findIndex((e) => e.slug === meta.slug);
    if (idx >= 0) {
      entries[idx] = meta;
    } else {
      entries.unshift(meta);
    }
    await writeRegistry(entries);
  } catch { /* individual file already saved */ }
}

export async function deleteUploadedMeta(slug: string): Promise<void> {
  // Delete individual backup file
  try {
    const { blobs } = await list({ prefix: `registry/${slug}.` });
    for (const b of blobs) await del(b.url);
  } catch { /* non-critical */ }

  // Update index
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

  // Try the registry index first
  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) {
      uploadedCache = null;
      blobStoreBase = null;
      await new Promise((r) => setTimeout(r, 800));
    }
    const uploaded = await getUploadedAnimations();
    const found = uploaded.find((a) => a.slug === slug);
    if (found) return found;
  }

  // Fallback: fetch individual metadata file directly by listing its prefix
  try {
    const { blobs } = await list({ prefix: `registry/${slug}.` });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      if (res.ok) return await res.json();
    }
  } catch { /* nop */ }

  return undefined;
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
