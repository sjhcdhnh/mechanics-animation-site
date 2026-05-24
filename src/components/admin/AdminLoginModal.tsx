'use client';

import { useState, useRef, useEffect } from 'react';
import { useAdmin } from './AdminProvider';

export function AdminLoginModal() {
  const { isLoginOpen, closeLogin, setToken, openPanel } = useAdmin();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoginOpen) {
      setPassword('');
      setError('');
      inputRef.current?.focus();
    }
  }, [isLoginOpen]);

  if (!isLoginOpen) return null;

  const handleSubmit = async () => {
    const trimmed = password.trim();
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: trimmed }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      setToken(data.token);
      closeLogin();
      openPanel();
    } catch {
      setError('网络错误');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') closeLogin();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={closeLogin}
      />
      <div className="relative glass-sm p-8 w-full max-w-sm mx-4 space-y-5 shadow-2xl">
        <div className="space-y-1.5">
          <h2 className="text-base font-semibold text-foreground">管理员登录</h2>
          <p className="text-xs text-muted">请输入管理员密码以继续</p>
        </div>

        <input
          ref={inputRef}
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setError('');
          }}
          onKeyDown={handleKeyDown}
          placeholder="密码"
          autoComplete="off"
          className="w-full px-4 py-2.5 bg-foreground/[0.04] border border-border rounded-lg text-sm text-foreground placeholder:text-muted/40 focus:outline-none focus:border-accent/40 transition-colors duration-200"
        />

        {error && (
          <p className="text-xs text-red-400">{error}</p>
        )}

        <div className="flex items-center gap-3 justify-end">
          <button
            onClick={closeLogin}
            className="px-4 py-2 text-xs text-muted hover:text-foreground transition-colors duration-200"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!password.trim() || loading}
            className="px-5 py-2 bg-accent text-accent-fg text-xs font-medium rounded-lg hover:bg-accent-hover transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {loading ? '验证中...' : '登录'}
          </button>
        </div>
      </div>
    </div>
  );
}
