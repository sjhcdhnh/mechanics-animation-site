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

/** Discover blob store base URL through multiple fallback strategies */
async function discoverStoreBase(): Promise<void> {
  // 1. Try list() to find _registry.json
  try {
    const { blobs } = await list({ prefix: REGISTRY_KEY });
    if (blobs.length > 0) {
      const url = new URL(blobs[0].url);
      blobStoreBase = `${url.protocol}//${url.host}`;
      return;
    }
  } catch { /* fall through */ }

  // 2. Try list() with registry/ prefix to find individual metadata files
  try {
    const { blobs } = await list({ prefix: 'registry/' });
    if (blobs.length > 0) {
      const url = new URL(blobs[0].url);
      blobStoreBase = `${url.protocol}//${url.host}`;
      return;
    }
  } catch { /* fall through */ }

  // 3. Try list() without prefix — find ANY blob to extract store host
  try {
    const { blobs } = await list();
    if (blobs.length > 0) {
      const url = new URL(blobs[0].url);
      blobStoreBase = `${url.protocol}//${url.host}`;
      return;
    }
  } catch { /* fall through */ }

  // 4. Last resort: use in-memory cache blob URLs
  if (uploadedCache && uploadedCache.length > 0) {
    try {
      const url = new URL(uploadedCache[0].blobUrl!);
      blobStoreBase = `${url.protocol}//${url.host}`;
      return;
    } catch { /* nop */ }
  }
}

/** Fetch the _registry.json blob, with fallback reconstruction from individual files */
async function fetchRegistry(): Promise<AnimationMeta[]> {
  if (!blobStoreBase) await discoverStoreBase();

  // 1. Try constructed URL (works when blob store hostname is stable)
  const url = registryUrl();
  if (url) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
    } catch { /* fall through */ }
  }

  // 2. Try finding _registry.json directly via list() + fetch its direct URL
  try {
    const { blobs } = await list({ prefix: REGISTRY_KEY });
    if (blobs.length > 0) {
      const res = await fetch(blobs[0].url);
      if (res.ok) {
        const data = await res.json();
        const parsedUrl = new URL(blobs[0].url);
        blobStoreBase = `${parsedUrl.protocol}//${parsedUrl.host}`;
        return data;
      }
    }
  } catch { /* fall through */ }

  // 3. Reconstruct registry from individual metadata files
  try {
    const { blobs } = await list({ prefix: 'registry/' });
    const entries: AnimationMeta[] = [];
    for (const b of blobs) {
      if (b.pathname.endsWith('.meta.json')) {
        try {
          const r = await fetch(b.url);
          if (r.ok) entries.push(await r.json());
        } catch { /* skip broken file */ }
      }
    }
    if (entries.length > 0) {
      try {
        const parsedUrl = new URL(blobs[0].url);
        blobStoreBase = `${parsedUrl.protocol}//${parsedUrl.host}`;
      } catch { /* nop */ }
      // Rebuild the _registry.json index for future cold starts
      try { await writeRegistry(entries); } catch { /* best-effort */ }
      return entries;
    }
  } catch { /* fall through */ }

  return [];
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
  // 1. ALWAYS save individual file first — it's the source of truth
  await put(`registry/${meta.slug}.meta.json`, JSON.stringify(meta), {
    access: 'public',
    contentType: 'application/json',
  });

  // 2. Update registry safely — never overwrite with partial data
  try {
    let entries = await fetchRegistry();

    // 3. If registry returned empty, verify against individual files before trusting it.
    //    An empty result might mean the registry is temporarily unavailable, not that
    //    there are genuinely no uploads. Overwriting in that case would orphan data.
    if (entries.length === 0) {
      try {
        const { blobs } = await list({ prefix: 'registry/' });
        const recovered: AnimationMeta[] = [];
        for (const b of blobs) {
          if (b.pathname.endsWith('.meta.json')) {
            try {
              const r = await fetch(b.url);
              if (r.ok) recovered.push(await r.json());
            } catch { /* skip broken file */ }
          }
        }
        if (recovered.length > 0) {
          entries = recovered;
          try {
            const parsedUrl = new URL(blobs[0].url);
            blobStoreBase = `${parsedUrl.protocol}//${parsedUrl.host}`;
          } catch { /* nop */ }
        }
      } catch { /* nop */ }
    }

    // 4. Merge new entry
    const idx = entries.findIndex((e) => e.slug === meta.slug);
    if (idx >= 0) {
      entries[idx] = meta;
    } else {
      entries.unshift(meta);
    }
    await writeRegistry(entries);
  } catch { /* individual file already saved */ }
}

/** Update metadata for any animation (builtin = memory only, uploaded = blob + registry) */
export async function updateAnimationMeta(slug: string, patch: Partial<AnimationMeta>): Promise<AnimationMeta | null> {
  const anim = await getAnimationBySlugAsync(slug);
  if (!anim) return null;

  const updated: AnimationMeta = { ...anim, ...patch, slug }; // slug is immutable

  if (anim.source === 'uploaded') {
    // Persist to Blob: update individual file + registry
    await saveUploadedMeta(updated);
  } else {
    // Builtin: update in-memory cache only
    const builtin = getBuiltin();
    const idx = builtin.findIndex((a) => a.slug === slug);
    if (idx >= 0) builtin[idx] = updated;
  }

  return updated;
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
      if (res.ok) {
        const meta = await res.json();
        // Update cache so subsequent lookups don't need to re-list
        if (uploadedCache) {
          const idx = uploadedCache.findIndex((e) => e.slug === slug);
          if (idx >= 0) uploadedCache[idx] = meta;
          else uploadedCache.push(meta);
        } else {
          uploadedCache = [meta];
        }
        try {
          const parsedUrl = new URL(blobs[0].url);
          blobStoreBase = `${parsedUrl.protocol}//${parsedUrl.host}`;
        } catch { /* nop */ }
        return meta;
      }
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
  // Check builtin data
  const builtin = getBuiltin();
  const builtinIdx = builtin.findIndex((a) => a.slug === slug);
  if (builtinIdx >= 0) {
    builtin.splice(builtinIdx, 1);
    return true;
  }

  // Check uploaded cache
  if (uploadedCache) {
    const uploadedIdx = uploadedCache.findIndex((a) => a.slug === slug);
    if (uploadedIdx >= 0) {
      uploadedCache.splice(uploadedIdx, 1);
      return true;
    }
  }

  return false;
}

export function getAnimationUrl(anim: AnimationMeta): string {
  if (anim.source === 'builtin') {
    return `/animations/${anim.fileName}`;
  }
  return anim.blobUrl || `/uploads/${anim.fileName}`;
}
