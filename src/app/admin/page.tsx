'use client';

import { useState, useEffect, useCallback } from 'react';
import type { AnimationMeta, Category } from '@/types';
import { CATEGORIES } from '@/lib/constants';

const TOKEN_KEY = 'admin_token';

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem(TOKEN_KEY);
    if (saved) {
      fetch('/api/admin/verify', {
        method: 'POST',
        headers: { Authorization: `Bearer ${saved}` },
      })
        .then((r) => {
          if (r.ok) setToken(saved);
          else localStorage.removeItem(TOKEN_KEY);
        })
        .catch(() => {})
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={setToken} />;
  }

  return <AdminDashboard token={token} onLogout={() => { localStorage.removeItem(TOKEN_KEY); setToken(null); }} />;
}

function AdminLogin({ onLogin }: { onLogin: (t: string) => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem(TOKEN_KEY, data.token);
        onLogin(data.token);
      } else {
        setError(data.error || '登录失败');
      }
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <form onSubmit={handleSubmit} className="glass-sm p-8 w-full max-w-sm space-y-5">
        <h1 className="text-xl font-bold text-foreground text-center">管理后台</h1>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="管理员密码"
          className="w-full px-4 py-2.5 rounded-lg bg-foreground/[0.06] border border-border text-foreground text-sm placeholder:text-muted/50 outline-none focus:border-accent/50 transition-colors"
          autoFocus
        />
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-accent text-accent-fg text-sm font-semibold hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </form>
    </div>
  );
}

function AdminDashboard({ token, onLogout }: { token: string; onLogout: () => void }) {
  const [animations, setAnimations] = useState<AnimationMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<AnimationMeta | null>(null);
  const [deleting, setDeleting] = useState<AnimationMeta | null>(null);
  const [message, setMessage] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/animations');
      if (res.ok) setAnimations(await res.json());
    } catch { /* nop */ }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleDelete(slug: string) {
    try {
      const res = await fetch(`/api/admin/animations/${slug}`, { method: 'DELETE', headers });
      if (res.ok) {
        setAnimations((prev) => prev.filter((a) => a.slug !== slug));
        setMessage('删除成功');
        setDeleting(null);
      } else {
        const data = await res.json();
        setMessage(data.error || '删除失败');
      }
    } catch {
      setMessage('网络错误');
    }
  }

  async function handleUpdate(slug: string, patch: Partial<AnimationMeta>) {
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
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      </div>
    );
  }

  const builtin = animations.filter((a) => a.source === 'builtin');
  const uploaded = animations.filter((a) => a.source === 'uploaded');

  return (
    <div className="min-h-screen bg-background px-4 py-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">动画管理</h1>
            <p className="text-xs text-muted mt-0.5">
              内置 {builtin.length} 个 · 上传 {uploaded.length} 个
            </p>
          </div>
          <button
            onClick={onLogout}
            className="text-xs text-muted hover:text-foreground transition-colors px-3 py-1.5 rounded-lg border border-border"
          >
            退出登录
          </button>
        </div>

        {message && (
          <div className="flex items-center justify-between glass-sm p-3 text-sm">
            <span className={message.includes('成功') ? 'text-emerald-400' : 'text-red-400'}>{message}</span>
            <button onClick={() => setMessage('')} className="text-muted hover:text-foreground text-xs">关闭</button>
          </div>
        )}

        {/* Table */}
        <div className="glass-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-muted text-xs">
                  <th className="text-left px-4 py-3 font-medium">标题</th>
                  <th className="text-left px-4 py-3 font-medium hidden sm:table-cell">分类</th>
                  <th className="text-left px-4 py-3 font-medium hidden md:table-cell">来源</th>
                  <th className="text-left px-4 py-3 font-medium hidden lg:table-cell">作者</th>
                  <th className="text-right px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody>
                {animations.map((anim) => (
                  <tr key={anim.slug} className="border-b border-border/50 hover:bg-foreground/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{anim.title}</div>
                      <div className="text-[11px] text-muted font-mono">{anim.slug}</div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-xs text-muted bg-foreground/5 px-2 py-0.5 rounded-full border border-border">
                        {CATEGORIES.find((c) => c.slug === anim.category)?.label || anim.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className={`text-xs ${anim.source === 'builtin' ? 'text-muted' : 'text-accent'}`}>
                        {anim.source === 'builtin' ? '内置' : '上传'}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-muted text-xs">{anim.author || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setEditing(anim)}
                          className="text-xs px-2.5 py-1 rounded-md text-accent hover:bg-accent/10 transition-colors"
                        >
                          编辑
                        </button>
                        {anim.source === 'uploaded' && (
                          <button
                            onClick={() => setDeleting(anim)}
                            className="text-xs px-2.5 py-1 rounded-md text-red-400 hover:bg-red-400/10 transition-colors"
                          >
                            删除
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-[11px] text-muted/60 text-center">
          内置动画的修改仅在当前服务实例内存中生效，重启后恢复默认值。上传动画的修改持久保存至 Blob 存储。
        </p>
      </div>

      {/* Edit Modal */}
      {editing && (
        <EditModal
          anim={editing}
          onSave={(patch) => handleUpdate(editing.slug, patch)}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Delete Confirm */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
          <div className="glass-sm p-6 w-full max-w-sm space-y-4">
            <h3 className="text-foreground font-semibold">确认删除</h3>
            <p className="text-sm text-muted">
              将永久删除 <span className="text-foreground font-medium">{deleting.title}</span> 的 HTML 文件、元数据和评论。此操作不可撤销。
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="text-xs px-4 py-2 rounded-lg text-muted hover:text-foreground transition-colors border border-border"
              >
                取消
              </button>
              <button
                onClick={() => handleDelete(deleting.slug)}
                className="text-xs px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors border border-red-500/30"
              >
                确认删除
              </button>
            </div>
          </div>
        </div>
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
    setSaving(false);
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm px-4 py-8 overflow-y-auto">
      <form onSubmit={handleSubmit} className="glass-sm p-6 w-full max-w-lg space-y-4 my-8">
        <div className="flex items-center justify-between">
          <h3 className="text-foreground font-semibold">编辑: {anim.slug}</h3>
          <span className="text-[11px] text-muted">{anim.source === 'builtin' ? '内置（重启后恢复）' : '上传（持久保存）'}</span>
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
