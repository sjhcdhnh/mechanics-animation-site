'use client';

import { useState, useRef, useEffect } from 'react';
import type { AnimationMeta } from '@/types';
import { PRESET_QUESTIONS } from '@/lib/constants';
import { LatexRenderer } from './LatexRenderer';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function ExplainPanel({
  anim,
  isOpen,
  onClose,
}: {
  anim: AnimationMeta;
  isOpen: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Filter preset questions by category
  const relevantQuestions = PRESET_QUESTIONS.filter(
    (q) => q.category === 'all' || q.category === anim.category
  ).slice(0, 5);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendQuestion = async (question: string) => {
    if (loading || !question.trim()) return;

    setError('');
    const userMsg: ChatMessage = { role: 'user', content: question };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: anim.slug, question, history }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || '请求失败');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('无响应流');

      const decoder = new TextDecoder();
      let assistantContent = '';
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const copy = [...prev];
          copy[copy.length - 1] = { role: 'assistant', content: assistantContent };
          return copy;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'AI 服务不可用');
      setMessages((prev) => prev.filter((m) => m.content !== ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] glass border-l border-border flex flex-col transition-all duration-300 ${
        isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div>
          <h3 className="text-sm font-semibold text-foreground">AI 知识解析</h3>
          <p className="text-[11px] text-muted mt-0.5">{anim.mechanismType}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-muted hover:text-foreground hover:bg-foreground/6 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              选择下方预设问题或输入你的问题，AI 将结合当前机构的运动学原理为你解答。
            </p>
            <div className="flex flex-wrap gap-2">
              {relevantQuestions.map((q) => (
                <button
                  key={q.id}
                  onClick={() => sendQuestion(q.text)}
                  disabled={loading}
                  className="text-xs px-3 py-2 rounded-lg bg-foreground/5 border border-border text-muted hover:text-foreground hover:border-accent/20 hover:bg-accent/5 transition-all text-left"
                >
                  {q.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent/15 text-foreground border border-accent/20'
                  : 'bg-foreground/5 text-foreground/90 border border-border'
              }`}
            >
              {msg.content ? (
                msg.role === 'assistant' ? (
                  <LatexRenderer text={msg.content} />
                ) : (
                  msg.content
                )
              ) : (
                <span className="flex items-center gap-1 text-muted">
                  <span className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
                  思考中...
                </span>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-2.5">
              {error}
            </p>
            {error.includes('未配置') && (
              <p className="text-[11px] text-muted mt-2">
                请在后端环境变量中设置 <code className="text-accent bg-accent/10 px-1 rounded">AI_API_KEY</code>
              </p>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-border">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendQuestion(input)}
            placeholder="输入你的理论力学问题..."
            disabled={loading}
            className="flex-1 px-3.5 py-2.5 bg-foreground/5 border border-border rounded-lg text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent/40 transition-all disabled:opacity-50"
          />
          <button
            onClick={() => sendQuestion(input)}
            disabled={loading || !input.trim()}
            className="px-4 py-2.5 bg-accent text-accent-fg text-sm font-medium rounded-lg hover:bg-accent-hover transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            发送
          </button>
        </div>
        <p className="text-[10px] text-muted mt-2 text-center">
          AI 回答仅供参考，请以教材和教师授课为准
        </p>
      </div>
    </div>
  );
}
