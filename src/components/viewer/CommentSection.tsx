'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Comment } from '@/types';

export function CommentSection({ slug }: { slug: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [showNameField, setShowNameField] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetching, setFetching] = useState(true);

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/animations/${slug}/comments`);
      const data = await res.json();
      setComments(data);
    } catch {
      // silent
    } finally {
      setFetching(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/animations/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: trimmed,
          author: showNameField ? author.trim() : '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '提交失败');
        return;
      }

      setComments((prev) => [data, ...prev]);
      setContent('');
      setShowNameField(false);
      setAuthor('');
    } catch {
      setError('网络错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} 分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} 小时前`;
    return d.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-5">
      <h3 className="text-sm font-semibold text-foreground">
        评论
        {comments.length > 0 && (
          <span className="ml-2 text-xs text-muted font-normal">{comments.length}</span>
        )}
      </h3>

      {/* Input */}
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的想法..."
          rows={3}
          maxLength={500}
          className="w-full px-4 py-3 bg-foreground/[0.03] border border-border rounded-xl text-sm text-foreground placeholder:text-muted/50 focus:outline-none focus:border-accent/30 focus:bg-foreground/[0.05] transition-all duration-200 resize-none"
        />

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setShowNameField((v) => !v)}
            className={`text-xs transition-colors duration-200 ${
              showNameField
                ? 'text-accent'
                : 'text-muted hover:text-foreground'
            }`}
          >
            {showNameField ? '匿名提交' : '署名'}
          </button>

          <div className="flex items-center gap-2">
            {showNameField && (
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="你的名字"
                maxLength={20}
                className="w-28 px-3 py-1.5 bg-foreground/[0.03] border border-border rounded-lg text-xs text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/30 transition-all duration-200"
              />
            )}
            <button
              onClick={handleSubmit}
              disabled={!content.trim() || loading}
              className="px-4 py-1.5 bg-accent text-accent-fg text-xs font-medium rounded-lg hover:bg-accent-hover transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? '提交中...' : '发表'}
            </button>
          </div>
        </div>

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}
      </div>

      {/* List */}
      {fetching ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="animate-shimmer h-16 rounded-xl" />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-xs text-muted/50 text-center py-6">
          暂无评论，来写第一条吧
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => (
            <div key={c.id} className="glass-sm p-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-foreground">
                  {c.author}
                </span>
                <span className="text-[10px] text-muted/50">
                  {formatDate(c.createdAt)}
                </span>
              </div>
              <p className="text-sm text-muted leading-relaxed whitespace-pre-line">
                {c.content}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
