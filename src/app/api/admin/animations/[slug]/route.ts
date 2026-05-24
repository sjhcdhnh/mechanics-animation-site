import { requireAdmin } from '@/lib/admin-auth';
import { deleteAnimation, getAnimationBySlug } from '@/lib/animation-registry';
import { deleteAllComments } from '@/lib/comments-store';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

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

  // Remove file from disk
  try {
    const dir = anim.source === 'builtin' ? 'animations' : 'uploads';
    const filePath = join(process.cwd(), 'public', dir, anim.fileName);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  } catch {
    // File may already be gone — non-critical
  }

  // Clean up comments
  deleteAllComments(slug);

  // Remove from registry
  deleteAnimation(slug);

  return Response.json({ success: true });
}
