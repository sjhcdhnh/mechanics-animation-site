import { NextRequest } from 'next/server';
import { validateAnimationHTML } from '@/lib/validation';
import { extractMetadata } from '@/lib/metadata-extractor';
import { addAnimation } from '@/lib/animation-registry';
import type { AnimationMeta, Category } from '@/types';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

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
    const downloadable = formData.get('downloadable') !== 'false'; // 默认允许

    if (!file) {
      return Response.json({ success: false, error: '未上传文件' }, { status: 400 });
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json(
        { success: false, error: `文件过大（${(file.size / 1024 / 1024).toFixed(1)} MB），最大允许 5 MB` },
        { status: 400 }
      );
    }

    // Read file content
    const html = await file.text();

    // Validate
    const validation = validateAnimationHTML(html, file.name);
    if (!validation.valid) {
      return Response.json(
        { success: false, error: '验证失败', validationErrors: validation.errors },
        { status: 400 }
      );
    }

    // Extract metadata
    const extracted = extractMetadata(html);
    const title = customTitle || validation.extractedTitle || extracted.title;
    const subtitle = validation.extractedSubtitle || extracted.subtitle;

    // Parse tags
    let tags: string[] = extracted.tags;
    if (customTags) {
      tags = customTags
        .split(/[,，]/)
        .map((t) => t.trim())
        .filter(Boolean);
    }

    // Category
    const validCategories: Category[] = ['four-bar', 'serial-robot', 'aerospace', 'engineering', 'other'];
    const category: Category = validCategories.includes(customCategory as Category)
      ? (customCategory as Category)
      : extracted.category;

    // Generate slug
    const timestamp = Date.now().toString(36);
    const slugBase = title
      .replace(/[^一-龥a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase()
      .slice(0, 40) || 'animation';
    const slug = `${slugBase}-${timestamp}`;

    // Generate safe filename
    const fileName = `${slug}.html`;

    // Save file to public/uploads/
    const uploadsDir = join(process.cwd(), 'public', 'uploads');
    if (!existsSync(uploadsDir)) {
      mkdirSync(uploadsDir, { recursive: true });
    }
    const filePath = join(uploadsDir, fileName);
    writeFileSync(filePath, html, 'utf-8');

    // Handle cover image upload
    let coverPath: string | undefined;
    if (coverFile && coverFile.size > 0) {
      const coversDir = join(uploadsDir, 'covers');
      if (!existsSync(coversDir)) {
        mkdirSync(coversDir, { recursive: true });
      }
      const coverExt = coverFile.name.split('.').pop() || 'png';
      const coverFileName = `${slug}.${coverExt}`;
      const coverFilePath = join(coversDir, coverFileName);
      const coverBuffer = Buffer.from(await coverFile.arrayBuffer());
      writeFileSync(coverFilePath, coverBuffer);
      coverPath = `/uploads/covers/${coverFileName}`;
    }

    // Create metadata entry
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
    };

    // Add to registry (in-memory only; in production use Vercel Blob/KV)
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
