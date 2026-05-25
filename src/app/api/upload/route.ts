import { NextRequest } from 'next/server';
import { put } from '@vercel/blob';
import { validateAnimationHTML } from '@/lib/validation';
import { extractMetadata } from '@/lib/metadata-extractor';
import { addAnimation } from '@/lib/animation-registry';
import type { AnimationMeta, Category } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const customTitle = formData.get('title') as string | null;
    const customDescription = formData.get('description') as string | null;
    const customAuthor = formData.get('author') as string | null;
    const customInstitution = formData.get('institution') as string | null;
    const customCourse = formData.get('course') as string | null;
    const customModelDescription = formData.get('modelDescription') as string | null;
    const customCategory = formData.get('category') as string | null;
    const customTags = formData.get('tags') as string | null;
    const coverFile = formData.get('cover') as File | null;
    const downloadable = formData.get('downloadable') !== 'false';

    if (!file) {
      return Response.json({ success: false, error: '未上传文件' }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json(
        { success: false, error: `文件过大（${(file.size / 1024 / 1024).toFixed(1)} MB），最大允许 5 MB` },
        { status: 400 }
      );
    }

    const html = await file.text();

    const validation = validateAnimationHTML(html, file.name);
    if (!validation.valid) {
      return Response.json(
        { success: false, error: '验证失败', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    const extracted = extractMetadata(html);
    const title = customTitle || validation.extractedTitle || extracted.title;
    const subtitle = validation.extractedSubtitle || extracted.subtitle;

    let tags: string[] = extracted.tags;
    if (customTags) {
      tags = customTags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);
    }

    const validCategories: Category[] = ['four-bar', 'serial-robot', 'aerospace', 'engineering', 'other'];
    const category: Category = validCategories.includes(customCategory as Category)
      ? (customCategory as Category)
      : extracted.category;

    const timestamp = Date.now().toString(36);
    const slugBase = title
      .replace(/[^一-龥a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .slice(0, 40) || 'animation';
    const slug = `${slugBase}-${timestamp}`;
    const fileName = `${slug}.html`;

    // Upload HTML to Vercel Blob
    const blob = await put(fileName, html, {
      access: 'public',
      contentType: 'text/html; charset=utf-8',
    });

    // Upload cover image to Vercel Blob (if provided)
    let coverPath: string | undefined;
    if (coverFile && coverFile.size > 0) {
      const coverExt = coverFile.name.split('.').pop() || 'png';
      const coverFileName = `covers/${slug}.${coverExt}`;
      const coverBuffer = await coverFile.arrayBuffer();
      const coverBlob = await put(coverFileName, Buffer.from(coverBuffer), {
        access: 'public',
        contentType: coverFile.type || 'image/png',
      });
      coverPath = coverBlob.url;
    }

    const meta: AnimationMeta = {
      slug,
      title,
      subtitle,
      category,
      tags,
      mechanismType: extracted.mechanismType,
      fileName,
      source: 'uploaded',
      uploadDate: new Date().toISOString(),
      fileSize: file.size,
      description: customDescription || undefined,
      author: customAuthor || undefined,
      institution: customInstitution || undefined,
      course: customCourse || undefined,
      modelDescription: customModelDescription || undefined,
      coverImage: coverPath,
      downloadable,
      blobUrl: blob.url,
    };

    addAnimation(meta);

    return Response.json({ success: true, slug, animation: meta, validationWarnings: validation.warnings });
  } catch (err) {
    console.error('Upload error:', err);
    return Response.json(
      { success: false, error: '服务器内部错误，请稍后重试' },
      { status: 500 }
    );
  }
}
