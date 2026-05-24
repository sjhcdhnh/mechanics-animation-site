import { requireAdmin } from '@/lib/admin-auth';
import { deleteComment, deleteAllComments } from '@/lib/comments-store';

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return Response.json({ error: auth.error }, { status: auth.status });
  }

  const { slug } = await params;
  const { searchParams } = new URL(request.url);
  const commentId = searchParams.get('commentId');

  if (commentId) {
    const deleted = deleteComment(slug, commentId);
    if (!deleted) {
      return Response.json({ error: '评论不存在' }, { status: 404 });
    }
    return Response.json({ success: true, deleted: commentId });
  }

  deleteAllComments(slug);
  return Response.json({ success: true, deletedAll: true });
}
