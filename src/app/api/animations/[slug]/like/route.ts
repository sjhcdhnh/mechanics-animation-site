import { getAnimationBySlug } from '@/lib/animation-registry';

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const anim = getAnimationBySlug(slug);

  if (!anim) {
    return Response.json({ error: '动画不存在' }, { status: 404 });
  }

  // In-memory counter (resets on cold start — use KV/DB in production)
  if (anim.likes === undefined) anim.likes = 0;
  anim.likes += 1;

  return Response.json({ likes: anim.likes });
}
