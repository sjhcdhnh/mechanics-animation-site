import { requireAdmin } from '@/lib/admin-auth';
import { getAnimationBySlug } from '@/lib/animation-registry';

export async function GET(
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

  const { slug: _s, fileName: _f, coverImage: _c, ...safeMeta } = anim;
  const metaJson = JSON.stringify(safeMeta, null, 2);

  const metaFileName = anim.fileName.replace(/\.html$/, '.json');

  return new Response(metaJson, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${metaFileName}"`,
    },
  });
}
