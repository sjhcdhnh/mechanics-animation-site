import { requireAdmin } from '@/lib/admin-auth';
import { deleteAnimation, getAnimationBySlug } from '@/lib/animation-registry';
import { deleteAllComments } from '@/lib/comments-store';
import { del } from '@vercel/blob';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const anim = getAnimationBySlug(slug);

  if (!anim) {
    return Response.json({ error: '动画不存在' }, { status: 404 });
  }

  // Delete from Vercel Blob (uploaded files only)
  if (anim.source === 'uploaded' && anim.blobUrl) {
    try {
      await del(anim.blobUrl);
    } catch {
      // blob may already be gone — non-critical
    }
    // Also delete cover image if on blob
    if (anim.coverImage?.includes('blob.vercel-storage.com')) {
      try {
        await del(anim.coverImage);
      } catch {
        // non-critical
      }
    }
  }

  deleteAllComments(slug);
  deleteAnimation(slug);

  return Response.json({ success: true });
}
