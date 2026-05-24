'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAdmin } from './AdminProvider';
import type { AnimationMeta, Comment } from '@/types';

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
      }
    } catch {
      // silent
    } finally {
      setDeleting(null);
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
                        {anim.source === 'builtin' ? '内置' : '上传'} &middot; {anim.category}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteAnimation(anim.slug, anim.title)}
                      disabled={deleting === anim.slug}
                      className="shrink-0 px-3 py-1.5 text-[11px] text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-md transition-all duration-200 disabled:opacity-30"
                    >
                      {deleting === anim.slug ? '删除中...' : '删除'}
                    </button>
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
    </div>
  );
}
