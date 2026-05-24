'use client';

import { useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { Category } from '@/types';
import { CATEGORIES } from '@/lib/constants';

interface ValidationWarnings {
  valid: boolean;
  errors: string[];
  warnings: string[];
  extractedTitle?: string;
}

export function UploadForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(0); // 0=file, 1=metadata, 2=confirm
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [institution, setInstitution] = useState('');
  const [course, setCourse] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [category, setCategory] = useState<Category | ''>('');
  const [tags, setTags] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState('');
  const [downloadable, setDownloadable] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [validation, setValidation] = useState<ValidationWarnings | null>(null);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const validateFile = useCallback(async (f: File) => {
    setFile(f);
    setError('');

    const html = await f.text();

    const checks: ValidationWarnings = {
      valid: true,
      errors: [],
      warnings: [],
    };

    if (!/<html/i.test(html)) checks.errors.push('不是有效的HTML文档');
    if (!/importmap/i.test(html) || !/"three"/i.test(html))
      checks.warnings.push('未检测到 Three.js importmap');
    if (!/WebGLRenderer|THREE\./i.test(html))
      checks.warnings.push('未检测到 Three.js 渲染代码');

    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    if (titleMatch) checks.extractedTitle = titleMatch[1].trim();

    checks.valid = checks.errors.length === 0;
    setValidation(checks);

    if (titleMatch && !title) {
      setTitle(titleMatch[1].trim());
    }

    if (checks.valid) setStep(1);
  }, [title]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) validateFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateFile(f);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (title) formData.append('title', title);
      if (description) formData.append('description', description);
      if (author) formData.append('author', author);
      if (institution) formData.append('institution', institution);
      if (course) formData.append('course', course);
      if (modelDescription) formData.append('modelDescription', modelDescription);
      if (category) formData.append('category', category);
      if (tags) formData.append('tags', tags);
      formData.append('downloadable', downloadable ? 'true' : 'false');
      if (coverFile) formData.append('cover', coverFile);

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();

      if (data.success) {
        router.push(`/animation/${data.slug}`);
      } else {
        setError(data.error || '上传失败');
        if (data.validationErrors) {
          setValidation({
            valid: false,
            errors: data.validationErrors,
            warnings: validation?.warnings || [],
          });
        }
      }
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setUploading(false);
    }
  };

  const steps = [
    { num: 1, label: '选择文件' },
    { num: 2, label: '填写信息' },
    { num: 3, label: '确认上传' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Step indicators */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step >= i
                  ? 'bg-accent text-accent-fg'
                  : 'bg-foreground/5 text-muted border border-border'
              }`}
            >
              {step > i ? (
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12" />
                </svg>
              ) : s.num}
            </div>
            <span
              className={`text-xs hidden sm:inline ${
                step >= i ? 'text-foreground font-medium' : 'text-muted'
              }`}
            >
              {s.label}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`w-6 sm:w-10 h-px ${
                  step > i ? 'bg-accent' : 'bg-border'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step 0: File drop zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`glass p-10 text-center cursor-pointer transition-all ${
          dragOver ? 'border-accent bg-accent/5 scale-[1.02]' : 'hover:border-foreground/15'
        } ${file ? 'border-emerald-500/30' : ''}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm"
          onChange={handleFileChange}
          className="hidden"
        />
        {file ? (
          <div className="space-y-2">
            <p className="text-sm text-foreground font-medium">{file.name}</p>
            <p className="text-xs text-muted">
              {(file.size / 1024).toFixed(1)} KB
            </p>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setValidation(null);
                setStep(0);
              }}
              className="text-xs text-muted hover:text-red-400 transition-colors"
            >
              移除文件
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-foreground font-medium">
              拖放 HTML 文件到此处，或点击选择
            </p>
            <p className="text-xs text-muted">
              支持自包含 Three.js HTML 动画文件（最大 5 MB）
            </p>
          </div>
        )}
      </div>

      {/* Validation result */}
      {validation && (
        <div className="glass-sm p-4 space-y-2">
          <p className="text-sm font-medium text-foreground">文件检查结果</p>
          {validation.errors.length > 0 && (
            <div className="space-y-1">
              {validation.errors.map((e, i) => (
                <p key={i} className="text-xs text-red-400 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-red-400 flex-shrink-0" /> {e}
                </p>
              ))}
            </div>
          )}
          {validation.warnings.length > 0 && (
            <div className="space-y-1">
              {validation.warnings.map((w, i) => (
                <p key={i} className="text-xs text-amber-400 flex items-center gap-2">
                  <span className="inline-block w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" /> {w}
                </p>
              ))}
            </div>
          )}
          {validation.valid && validation.errors.length === 0 && (
            <p className="text-xs text-emerald-400 flex items-center gap-2">
              <span className="inline-block w-1 h-1 rounded-full bg-emerald-400 flex-shrink-0" /> 文件格式检查通过
            </p>
          )}
          {validation.extractedTitle && (
            <p className="text-xs text-muted">
              检测到标题：{validation.extractedTitle}
            </p>
          )}
        </div>
      )}

      {/* Step 1: Metadata form */}
      {file && step >= 1 && (
        <div className="glass-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">动画信息（选填）</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                动画标题
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="自动从HTML提取..."
                className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                分类
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category | '')}
                className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground focus:outline-none focus:border-accent/40 transition-all"
              >
                <option value="">自动检测...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat.slug} value={cat.slug}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                作者
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="你的姓名..."
                className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                机构/学校
              </label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="如：XX大学..."
                className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                课程
              </label>
              <input
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="如：理论力学..."
                className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                标签
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="逗号分隔，如：曲柄, 滑块, 运动学"
                className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              简要描述
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述这个动画演示了什么机构..."
              rows={2}
              className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              模型介绍
            </label>
            <textarea
              value={modelDescription}
              onChange={(e) => setModelDescription(e.target.value)}
              placeholder="描述机构的参数、自由度、运动学方程等详细技术信息..."
              rows={3}
              className="w-full px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all resize-none"
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="block text-xs font-medium text-muted mb-1.5">
              封面图片 <span className="text-muted/50">(选填，若不填则自动生成)</span>
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-shrink-0 px-4 py-2.5 border border-border rounded-lg text-xs text-muted hover:text-foreground hover:border-accent/30 cursor-pointer transition-all">
                {coverFile ? '更换封面' : '选择图片'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setCoverFile(f);
                      const url = URL.createObjectURL(f);
                      setCoverPreview(url);
                    }
                  }}
                  className="hidden"
                />
              </label>
              {coverPreview && (
                <div className="flex items-center gap-2">
                  <img
                    src={coverPreview}
                    alt="封面预览"
                    className="w-12 h-8 object-cover rounded border border-border"
                  />
                  <button
                    onClick={() => {
                      setCoverFile(null);
                      setCoverPreview('');
                    }}
                    className="text-xs text-muted hover:text-red-400 transition-colors"
                  >
                    移除
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Downloadable toggle */}
          <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-foreground/[0.02] border border-border-subtle">
            <div>
              <p className="text-sm font-medium text-foreground">允许他人下载</p>
              <p className="text-[11px] text-muted mt-0.5">
                开启后其他用户可以下载此动画文件
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={downloadable}
              onClick={() => setDownloadable((v) => !v)}
              className={`relative w-10 h-6 rounded-full transition-all duration-200 ${
                downloadable ? 'bg-accent' : 'bg-foreground/15'
              }`}
            >
              <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200 ${
                  downloadable ? 'left-[18px]' : 'left-0.5'
                }`}
              />
            </button>
          </div>

          <button
            onClick={() => setStep(2)}
            type="button"
            className="w-full py-2.5 border border-border rounded-xl text-sm text-muted hover:text-foreground hover:border-accent/30 transition-all"
          >
            继续 — 确认上传
          </button>
        </div>
      )}

      {/* Step 2: Confirm */}
      {file && step === 2 && (
        <div className="glass-sm p-5 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">确认上传信息</h3>
          <div className="text-sm text-muted space-y-1">
            {title && <p>标题：{title}</p>}
            {category && <p>分类：{CATEGORIES.find((c) => c.slug === category)?.label || category}</p>}
            {author && <p>作者：{author}</p>}
            {institution && <p>机构：{institution}</p>}
            {course && <p>课程：{course}</p>}
            <p>文件：{file.name} ({(file.size / 1024).toFixed(1)} KB)</p>
            <p>允许下载：{downloadable ? '是' : '否'}</p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={!file || !validation?.valid || uploading}
            className="w-full py-3 bg-accent text-accent-fg text-sm font-semibold rounded-xl hover:bg-accent-hover transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {uploading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                上传中...
              </span>
            ) : (
              '确认上传'
            )}
          </button>

          <button
            onClick={() => setStep(1)}
            type="button"
            className="w-full py-2 text-xs text-muted hover:text-foreground transition-colors"
          >
            ← 返回修改信息
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="glass-sm p-4 border-red-500/30">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Guidelines */}
      <div className="glass-sm p-4 text-xs text-muted leading-relaxed space-y-1">
        <p className="font-medium text-foreground mb-2">上传须知</p>
        <p>• 文件必须是自包含的 HTML 文档（含 &lt;html&gt;, &lt;body&gt; 标签）</p>
        <p>• 必须通过 ES importmap 加载 Three.js（如从 unpkg CDN）</p>
        <p>• 建议包含 OrbitControls 以支持鼠标交互</p>
        <p>• 文件大小不超过 5 MB</p>
        <p>• 请勿上传含恶意脚本的文件</p>
      </div>
    </div>
  );
}
