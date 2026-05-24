import type { Comment } from '@/types';
import { getComments, addComment } from '@/lib/comments-store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  return Response.json(getComments(slug));
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const body = await request.json();

  const content = (body.content || '').trim();
  if (!content) {
    return Response.json({ error: '评论内容不能为空' }, { status: 400 });
  }
  if (content.length > 500) {
    return Response.json({ error: '评论内容不能超过 500 字' }, { status: 400 });
  }

  const author = (body.author || '').trim() || '匿名';

  const comment: Comment = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    author,
    content,
    createdAt: new Date().toISOString(),
  };

  addComment(slug, comment);
  return Response.json(comment, { status: 201 });
}
