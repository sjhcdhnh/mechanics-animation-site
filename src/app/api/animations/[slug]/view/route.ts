import { getAnimationBySlugAsync, getAnimationUrl } from '@/lib/animation-registry';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const anim = await getAnimationBySlugAsync(slug);
  if (!anim) {
    return Response.json({ error: '动画未找到' }, { status: 404 });
  }

  const src = getAnimationUrl(anim);

  // Built-in files: redirect (same-origin, already served correctly)
  if (anim.source === 'builtin') {
    return Response.redirect(src);
  }

  // Uploaded files: proxy to strip Content-Disposition header
  // Relative paths (local uploads) need a full URL for server-side fetch
  const fullUrl = src.startsWith('http') ? src : new URL(src, request.url).toString();

  try {
    const blobRes = await fetch(fullUrl);
    if (!blobRes.ok) {
      return new Response('Blob not found', { status: 404 });
    }

    const html = await blobRes.text();
    return new Response(html, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch {
    return new Response('Blob not found', { status: 404 });
  }
}
