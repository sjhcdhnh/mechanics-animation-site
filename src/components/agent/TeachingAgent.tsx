'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { LatexRenderer } from '@/components/viewer/LatexRenderer';
import {
  TEACHING_PRESET_QUESTIONS,
  FLAT_PRESET_QUESTIONS,
} from '@/lib/agent-knowledge';
import { SparkleIcon } from '@/components/ui/Icons';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/** Rotate through a small pool of featured questions to keep chips fresh */
const FEATURED_INDICES = [0, 3, 6, 9, 12, 15];
const FEATURED_QUESTIONS = FEATURED_INDICES.map(
  (i) => FLAT_PRESET_QUESTIONS[i]
).filter(Boolean);

export function TeachingAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Core send logic ──
  const sendQuestion = useCallback(
    async (question: string) => {
      if (loading || !question.trim()) return;

      setError('');
      const userMsg: ChatMessage = { role: 'user', content: question };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);
      setShowAllQuestions(false);

      try {
        const history = messages.map((m) => ({
          role: m.role,
          content: m.content,
        }));

        const response = await fetch('/api/agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, history }),
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
            copy[copy.length - 1] = {
              role: 'assistant',
              content: assistantContent,
            };
            return copy;
          });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'AI 服务不可用');
        setMessages((prev) => prev.filter((m) => m.content !== ''));
      } finally {
        setLoading(false);
      }
    },
    [loading, messages]
  );

  // ── Clear chat ──
  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  return (
    <div className="glass flex flex-col min-h-[560px]">
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-accent/15 flex items-center justify-center">
            <SparkleIcon className="w-4.5 h-4.5 text-accent" />
          </div>
          <div>
            <span className="text-sm font-semibold text-foreground">
              AI 理论力学助教
            </span>
            <span className="ml-2 text-[10px] text-muted bg-accent/8 px-1.5 py-0.5 rounded-full border border-accent/10">
              同济版
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-[11px] text-muted hover:text-foreground transition-colors px-2.5 py-1 rounded-md hover:bg-foreground/5"
            >
              清空对话
            </button>
          )}
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
          </span>
        </div>
      </div>

      {/* ── Compact preset chips (horizontal scroll) ── */}
      <div className="px-5 py-3 border-b border-border/50 bg-foreground/[0.02]">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted/70 whitespace-nowrap flex-shrink-0">
            快捷提问:
          </span>

          {/* Featured chips — horizontal scroll on mobile */}
          <div className="flex items-center gap-1.5 overflow-x-auto flex-1 scrollbar-none">
            {FEATURED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => sendQuestion(q.text)}
                disabled={loading}
                className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-foreground/[0.04] border border-border/50 text-muted hover:text-foreground hover:border-accent/20 hover:bg-accent/[0.06] transition-all disabled:opacity-40 truncate max-w-[200px]"
                title={q.text}
              >
                {q.text.length > 22
                  ? q.text.slice(0, 22) + '...'
                  : q.text}
              </button>
            ))}

            {/* "More" dropdown trigger */}
            <button
              onClick={() => setShowAllQuestions(!showAllQuestions)}
              className={`flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full border transition-all flex items-center gap-1 ${
                showAllQuestions
                  ? 'bg-accent/10 border-accent/30 text-accent'
                  : 'bg-foreground/[0.04] border-border/50 text-muted hover:text-foreground hover:border-accent/20'
              }`}
            >
              更多
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  showAllQuestions ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Expandable chapter list */}
        {showAllQuestions && (
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/30">
            {TEACHING_PRESET_QUESTIONS.map((chapter) => (
              <div key={chapter.chapter}>
                <p className="text-[10px] font-semibold text-muted uppercase tracking-wider mb-2">
                  {chapter.label}
                </p>
                <div className="space-y-1">
                  {chapter.questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendQuestion(q)}
                      disabled={loading}
                      className="w-full text-left text-[11px] px-2.5 py-1.5 rounded-lg hover:bg-accent/[0.06] hover:text-foreground text-muted transition-colors disabled:opacity-40 leading-relaxed"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Messages area ── */}
      <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 min-h-[340px] max-h-[520px]">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-16">
            <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
              <SparkleIcon className="w-8 h-8 text-accent/40" />
            </div>
            <div>
              <p className="text-sm text-muted font-medium">
                我是基于同济版《理论力学》教材的 AI 助教
              </p>
              <p className="text-[11px] text-muted/60 mt-1.5 max-w-sm">
                点击上方快捷提问或在输入框输入你的问题，我将为你解答
                静力学、运动学、动力学、分析力学等方面的疑问。
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[78%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-accent/12 text-foreground border border-accent/15'
                  : 'bg-foreground/[0.04] text-foreground/90 border border-border'
              }`}
            >
              {msg.content ? (
                msg.role === 'assistant' ? (
                  <LatexRenderer text={msg.content} />
                ) : (
                  <span className="whitespace-pre-wrap">{msg.content}</span>
                )
              ) : (
                <span className="flex items-center gap-2 text-muted">
                  <span className="flex gap-0.5">
                    <span
                      className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    />
                    <span
                      className="w-1.5 h-1.5 bg-accent rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    />
                  </span>
                  <span className="text-xs">思考中...</span>
                </span>
              )}
            </div>
          </div>
        ))}

        {error && (
          <div className="text-center">
            <p className="text-xs text-red-400 bg-red-500/8 border border-red-500/15 rounded-lg px-4 py-2.5">
              {error}
            </p>
            {error.includes('未配置') && (
              <p className="text-[11px] text-muted mt-2">
                请在环境变量中设置{' '}
                <code className="text-accent bg-accent/10 px-1 rounded">
                  AI_API_KEY
                </code>
              </p>
            )}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input area ── */}
      <div className="px-4 py-3.5 border-t border-border">
        <div className="flex gap-2.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendQuestion(input)}
            placeholder="输入理论力学问题，按 Enter 发送..."
            disabled={loading}
            className="flex-1 px-4 py-2.5 bg-foreground/[0.04] border border-border rounded-xl text-sm text-foreground placeholder:text-muted/60 focus:outline-none focus:border-accent/30 focus:bg-foreground/[0.06] transition-all disabled:opacity-50"
          />
          <button
            onClick={() => sendQuestion(input)}
            disabled={loading || !input.trim()}
            className="px-5 py-2.5 bg-accent text-accent-fg text-sm font-medium rounded-xl hover:bg-accent-hover transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
          >
            {loading ? (
              <span className="flex items-center gap-1">
                <span className="w-3.5 h-3.5 border-2 border-accent-fg/30 border-t-accent-fg rounded-full animate-spin" />
              </span>
            ) : (
              '发送'
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted/60 mt-2.5 text-center">
          AI 回答仅供参考，请以教材和教师授课为准 · 基于同济版《理论力学》
        </p>
      </div>
    </div>
  );
}
