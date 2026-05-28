'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './AdminProvider';
import type { AnimationMeta, Category, Comment } from '@/types';
import { CATEGORIES } from '@/lib/constants';

type Tab = 'animations' | 'comments';

interface AnimWithComments {
  anim: AnimationMeta;
  comments: Comment[];
}

export function AdminPanel() {
  const { token, isPanelOpen, closePanel, setToken } = useAdmin();
  const [tab, setTab] = useState<Tab>('animations');
  const [animations, setAnimations] = useState<AnimationMeta[]>([]);
  const [animWithComments, setAnimWithComments] = useState<AnimWithComments[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editing, setEditing] = useState<AnimationMeta | null>(null);
  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      if (tab === 'animations') {
        const res = await fetch('/api/animations');
        const data = await res.json();
        setAnimations(data);
      } else {
        const [animRes] = await Promise.all([
          fetch('/api/animations'),
        ]);
        const anims: AnimationMeta[] = await animRes.json();

        const withComments = await Promise.all(
          anims.map(async (anim) => {
            const res = await fetch(`/api/animations/${anim.slug}/comments`);
            const comments: Comment[] = await res.json();
            return { anim, comments };
          })
        );

        setAnimWithComments(withComments.filter((a) => a.comments.length > 0));
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    if (isPanelOpen) fetchData();
  }, [isPanelOpen, fetchData]);

  const handleDeleteAnimation = async (slug: string, title: string) => {
    if (!confirm(`确定删除动画「${title}」？此操作不可撤销。`)) return;

    setDeleting(slug);
    try {
      const res = await fetch(`/api/admin/animations/${slug}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setAnimations((prev) => prev.filter((a) => a.slug !== slug));
        setMessage('删除成功');
      } else {
        const data = await res.json();
        setMessage(data.error || '删除失败');
      }
    } catch {
      setMessage('网络错误');
    } finally {
      setDeleting(null);
    }
  };

  const handleUpdate = async (slug: string, patch: Partial<AnimationMeta>) => {
    try {
      const res = await fetch(`/api/admin/animations/${slug}`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (res.ok) {
        const updated = await res.json();
        setAnimations((prev) => prev.map((a) => (a.slug === slug ? updated : a)));
        setMessage('更新成功');
        setEditing(null);
      } else {
        const data = await res.json();
        setMessage(data.error || '更新失败');
      }
    } catch {
      setMessage('网络错误');
    }
  };

  const handleDeleteComment = async (slug: string, commentId: string) => {
    setDeleting(commentId);
    try {
      const res = await fetch(`/api/admin/comments/${slug}?commentId=${commentId}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setAnimWithComments((prev) =>
          prev.map((a) =>
            a.anim.slug === slug
              ? { ...a, comments: a.comments.filter((c) => c.id !== commentId) }
              : a
          ).filter((a) => a.comments.length > 0)
        );
      }
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAllComments = async (slug: string) => {
    if (!confirm('确定删除该动画的所有评论？')) return;

    setDeleting(slug);
    try {
      const res = await fetch(`/api/admin/comments/${slug}`, {
        method: 'DELETE',
        headers,
      });
      if (res.ok) {
        setAnimWithComments((prev) => prev.filter((a) => a.anim.slug !== slug));
      }
    } catch {
      // silent
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    setToken(null);
    closePanel();
  };

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closePanel}
      />
      <div className="relative w-full max-w-lg bg-background border-l border-border h-full overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-foreground">管理面板</h2>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="text-xs text-muted hover:text-red-400 transition-colors duration-200"
            >
              退出
            </button>
            <button
              onClick={closePanel}
              className="text-xs text-muted hover:text-foreground transition-colors duration-200"
            >
              关闭
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6">
          {([
            ['animations', '动画管理'],
            ['comments', '评论管理'],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-3 text-xs font-medium transition-all duration-200 border-b-2 -mb-[1px] ${
                tab === key
                  ? 'text-accent border-accent'
                  : 'text-muted border-transparent hover:text-foreground'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Message */}
        {message && (
          <div className="mx-6 mt-4 flex items-center justify-between glass-sm p-3 text-xs">
            <span className={message.includes('成功') ? 'text-emerald-400' : 'text-red-400'}>{message}</span>
            <button onClick={() => setMessage('')} className="text-muted hover:text-foreground text-xs ml-2">关闭</button>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-shimmer h-14 rounded-lg" />
              ))}
            </div>
          ) : tab === 'animations' ? (
            animations.length === 0 ? (
              <p className="text-xs text-muted/50 text-center py-12">暂无动画</p>
            ) : (
              <div className="space-y-2">
                {animations.map((anim) => (
                  <div
                    key={anim.slug}
                    className="flex items-center justify-between p-3 glass-sm gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-foreground truncate">{anim.title}</p>
                      <p className="text-[10px] text-muted/60">
                        {anim.source === 'builtin' ? '内置' : '上传'} &middot; {CATEGORIES.find(c => c.slug === anim.category)?.label || anim.category}
                        {anim.author ? ` · ${anim.author}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditing(anim)}
                        className="shrink-0 px-3 py-1.5 text-[11px] text-accent hover:bg-accent/10 rounded-md transition-all duration-200"
                      >
                        编辑
                      </button>
                      <button
                        onClick={() => handleDeleteAnimation(anim.slug, anim.title)}
                        disabled={deleting === anim.slug}
                        className="shrink-0 px-3 py-1.5 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-all duration-200 disabled:opacity-30"
                      >
                        {deleting === anim.slug ? '删除中...' : '删除'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : animWithComments.length === 0 ? (
            <p className="text-xs text-muted/50 text-center py-12">暂无评论</p>
          ) : (
            <div className="space-y-6">
              {animWithComments.map(({ anim, comments }) => (
                <div key={anim.slug} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-medium text-foreground truncate flex-1 min-w-0">
                      {anim.title}
                    </p>
                    <button
                      onClick={() => handleDeleteAllComments(anim.slug)}
                      disabled={deleting === anim.slug}
                      className="shrink-0 ml-2 text-[10px] text-muted hover:text-red-400 transition-colors duration-200 disabled:opacity-30"
                    >
                      清空全部
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {comments.map((c) => (
                      <div
                        key={c.id}
                        className="flex items-start justify-between p-3 glass-sm gap-2"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[11px] font-medium text-foreground">
                              {c.author}
                            </span>
                            <span className="text-[10px] text-muted/50">
                              {new Date(c.createdAt).toLocaleDateString('zh-CN')}
                            </span>
                          </div>
                          <p className="text-xs text-muted line-clamp-2">{c.content}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(anim.slug, c.id)}
                          disabled={deleting === c.id}
                          className="shrink-0 text-[10px] text-muted hover:text-red-400 transition-colors duration-200 disabled:opacity-30 mt-0.5"
                        >
                          删除
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          anim={editing}
          onSave={(patch) => handleUpdate(editing.slug, patch)}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function EditModal({
  anim,
  onSave,
  onClose,
}: {
  anim: AnimationMeta;
  onSave: (patch: Partial<AnimationMeta>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState({
    title: anim.title,
    subtitle: anim.subtitle,
    category: anim.category,
    tags: anim.tags.join(', '),
    mechanismType: anim.mechanismType,
    description: anim.description || '',
    modelDescription: anim.modelDescription || '',
    author: anim.author || '',
    institution: anim.institution || '',
    course: anim.course || '',
  });
  const [saving, setSaving] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const patch: Partial<AnimationMeta> = {
      title: form.title.trim(),
      subtitle: form.subtitle.trim(),
      category: form.category as Category,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      mechanismType: form.mechanismType.trim(),
      description: form.description.trim() || undefined,
      modelDescription: form.modelDescription.trim() || undefined,
      author: form.author.trim() || undefined,
      institution: form.institution.trim() || undefined,
      course: form.course.trim() || undefined,
    };
    onSave(patch);
  }

  const fields: { key: keyof typeof form; label: string; type: 'text' | 'select' | 'textarea'; options?: { value: string; label: string }[] }[] = [
    { key: 'title', label: '标题', type: 'text' },
    { key: 'subtitle', label: '英文对照', type: 'text' },
    { key: 'category', label: '分类', type: 'select', options: CATEGORIES.map((c) => ({ value: c.slug, label: c.label })) },
    { key: 'mechanismType', label: '机构类型', type: 'text' },
    { key: 'tags', label: '标签（逗号分隔）', type: 'text' },
    { key: 'author', label: '作者', type: 'text' },
    { key: 'institution', label: '机构/学校', type: 'text' },
    { key: 'course', label: '课程', type: 'text' },
    { key: 'description', label: '动画简介', type: 'textarea' },
    { key: 'modelDescription', label: '模型介绍', type: 'textarea' },
  ];

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <form onSubmit={handleSubmit} className="glass-sm p-6 w-full max-w-lg space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-semibold text-sm">编辑: {anim.slug}</h3>
          <span className="text-[10px] text-muted">{anim.source === 'builtin' ? '内置（重启后恢复默认）' : '上传（持久保存）'}</span>
        </div>

        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1">
              <label className="text-[11px] text-muted font-medium">{f.label}</label>
              {f.type === 'select' ? (
                <select
                  value={form[f.key] as string}
                  onChange={(e) => update(f.key, e.target.value as never)}
                  className="w-full px-3 py-2 rounded-lg bg-foreground/[0.06] border border-border text-foreground text-sm outline-none focus:border-accent/50 transition-colors"
                >
                  {f.options?.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              ) : f.type === 'textarea' ? (
                <textarea
                  value={form[f.key] as string}
                  onChange={(e) => update(f.key, e.target.value as never)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-foreground/[0.06] border border-border text-foreground text-sm outline-none focus:border-accent/50 transition-colors resize-y"
                />
              ) : (
                <input
                  type="text"
                  value={form[f.key] as string}
                  onChange={(e) => update(f.key, e.target.value as never)}
                  className="w-full px-3 py-2 rounded-lg bg-foreground/[0.06] border border-border text-foreground text-sm outline-none focus:border-accent/50 transition-colors"
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="text-xs px-4 py-2 rounded-lg text-muted hover:text-foreground transition-colors border border-border"
          >
            取消
          </button>
          <button
            type="submit"
            disabled={saving}
            className="text-xs px-4 py-2 rounded-lg bg-accent text-accent-fg font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? '保存中...' : '保存'}
          </button>
        </div>
      </form>
    </div>
  );
}
