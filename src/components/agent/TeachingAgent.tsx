'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { LatexRenderer } from '@/components/viewer/LatexRenderer';
import { TEACHING_PRESET_QUESTIONS } from '@/lib/agent-knowledge';
import { SparkleIcon } from '@/components/ui/Icons';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export function TeachingAgent() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(TEACHING_PRESET_QUESTIONS.map((c) => c.chapter))
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ── Auto-scroll ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ── Toggle chapter collapse ──
  const toggleSection = (chapter: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(chapter)) next.delete(chapter);
      else next.add(chapter);
      return next;
    });
  };

  // ── Core send logic ──
  const sendQuestion = useCallback(
    async (question: string) => {
      if (loading || !question.trim()) return;

      setError('');
      const userMsg: ChatMessage = { role: 'user', content: question };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setLoading(true);

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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[520px]">
      {/* ═══ Left sidebar: intro + preset questions ═══ */}
      <div className="lg:col-span-1 space-y-5">
        {/* Intro */}
        <div className="glass-sm p-5 space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-accent/15 flex items-center justify-center flex-shrink-0">
              <SparkleIcon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                AI 理论力学助教
              </h3>
              <p className="text-[11px] text-muted">
                基于同济版《理论力学》教材
              </p>
            </div>
          </div>
          <p className="text-xs text-muted leading-relaxed">
            我是你的私人理论力学导师。我可以帮你理解概念、推导公式、
            分析机构运动、解答疑难问题。点击下方预设问题或直接输入你的困惑，
            我都会耐心解答。
          </p>
        </div>

        {/* Preset questions by chapter */}
        <div className="glass-sm p-4 space-y-1">
          <p className="text-[11px] font-medium text-muted uppercase tracking-wider mb-3">
            快速提问
          </p>
          {TEACHING_PRESET_QUESTIONS.map((chapter) => (
            <div key={chapter.chapter}>
              <button
                onClick={() => toggleSection(chapter.chapter)}
                className="w-full flex items-center justify-between py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
              >
                <span>{chapter.label}</span>
                <svg
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    expandedSections.has(chapter.chapter) ? 'rotate-180' : ''
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
              {expandedSections.has(chapter.chapter) && (
                <div className="space-y-1 pb-2">
                  {chapter.questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => sendQuestion(q)}
                      disabled={loading}
                      className="w-full text-left text-[11px] px-3 py-2 rounded-lg bg-foreground/[0.03] border border-border/40 text-muted hover:text-foreground hover:border-accent/20 hover:bg-accent/[0.04] transition-all disabled:opacity-40"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ═══ Right: chat window ═══ */}
      <div className="lg:col-span-3 glass flex flex-col">
        {/* Chat header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="text-xs text-muted">
              {messages.length > 0
                ? `已对话 ${messages.length} 条`
                : '随时可以提问'}
            </span>
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearChat}
              className="text-[11px] text-muted hover:text-foreground transition-colors px-2 py-1 rounded-md hover:bg-foreground/5"
            >
              清空对话
            </button>
          )}
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 min-h-[360px] max-h-[460px]">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-3 py-12">
              <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center">
                <SparkleIcon className="w-7 h-7 text-accent/50" />
              </div>
              <div>
                <p className="text-sm text-muted font-medium">
                  开始和 AI 理论力学助教对话
                </p>
                <p className="text-[11px] text-muted/60 mt-1 max-w-xs">
                  左侧选择一个预设问题，或在下方输入你的问题
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
                className={`max-w-[82%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
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

        {/* Input area */}
        <div className="px-4 py-3.5 border-t border-border">
          <div className="flex gap-2.5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendQuestion(input)}
              placeholder="输入你的理论力学问题，按 Enter 发送..."
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
    </div>
  );
}
