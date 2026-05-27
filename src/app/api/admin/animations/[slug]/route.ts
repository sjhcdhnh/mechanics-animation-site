import { requireAdmin } from '@/lib/admin-auth';
import { deleteAnimation, getAnimationBySlugAsync, deleteUploadedMeta, updateAnimationMeta } from '@/lib/animation-registry';
import { deleteAllComments } from '@/lib/comments-store';
import { del } from '@vercel/blob';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  try {
    const patch = await request.json();
    const updated = await updateAnimationMeta(slug, patch);
    if (!updated) {
      return Response.json({ error: '动画不存在' }, { status: 404 });
    }
    return Response.json(updated);
  } catch {
    return Response.json({ error: '无效的请求数据' }, { status: 400 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const anim = await getAnimationBySlugAsync(slug);

  if (!anim) {
    return Response.json({ error: '动画不存在' }, { status: 404 });
  }

  // Delete from Vercel Blob (uploaded files only)
  if (anim.source === 'uploaded') {
    // Delete HTML blob
    if (anim.blobUrl) {
      try { await del(anim.blobUrl); } catch { /* non-critical */ }
    }
    // Delete cover image blob
    if (anim.coverImage?.includes('blob.vercel-storage.com')) {
      try { await del(anim.coverImage); } catch { /* non-critical */ }
    }
    // Delete metadata from blob registry
    await deleteUploadedMeta(slug);
  }

  deleteAllComments(slug);
  deleteAnimation(slug);

  return Response.json({ success: true });
}
