import { getAnimationBySlug } from '@/lib/animation-registry';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const anim = getAnimationBySlug(slug);

  if (!anim) {
    return Response.json({ error: '动画未找到' }, { status: 404 });
  }

  return Response.json(anim);
}
