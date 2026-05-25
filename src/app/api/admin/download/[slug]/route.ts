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

  const format = new URL(request.url).searchParams.get('format');

  if (format === 'html') {
    // Fetch HTML content (from Blob for uploaded, or local for built-in)
    let html: string;
    if (anim.source === 'builtin') {
      const { readFileSync } = await import('fs');
      const { join } = await import('path');
      const filePath = join(process.cwd(), 'public', 'animations', anim.fileName);
      html = readFileSync(filePath, 'utf-8');
    } else if (anim.blobUrl) {
      const res = await fetch(anim.blobUrl);
      if (!res.ok) {
        return Response.json({ error: '文件不存在' }, { status: 404 });
      }
      html = await res.text();
    } else {
      return Response.json({ error: '文件不存在' }, { status: 404 });
    }

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `attachment; filename="${anim.fileName}"`,
      },
    });
  }

  // Default: return metadata JSON
  const { slug: _s, fileName: _f, coverImage: _c, blobUrl: _b, ...safeMeta } = anim;
  const metaJson = JSON.stringify(safeMeta, null, 2);
  const metaFileName = anim.fileName.replace(/\.html$/, '.json');

  return new Response(metaJson, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${metaFileName}"`,
    },
  });
}
