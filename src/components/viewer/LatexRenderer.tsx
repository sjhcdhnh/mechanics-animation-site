'use client';

import katex from 'katex';
import { useMemo } from 'react';

function renderLatex(text: string): string {
  const parts: string[] = [];
  let remaining = text;

  // Process block math $$...$$ first, then inline $...$
  const regex = /(\$\$[\s\S]*?\$\$|\$[^$\n]+?\$)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(remaining)) !== null) {
    // Push text before math
    const before = remaining.slice(lastIndex, match.index);
    parts.push(escapeHtml(before));

    const math = match[0];
    try {
      if (math.startsWith('$$')) {
        const formula = math.slice(2, -2);
        parts.push(
          katex.renderToString(formula, {
            displayMode: true,
            throwOnError: false,
            trust: false,
          })
        );
      } else {
        const formula = math.slice(1, -1);
        parts.push(
          katex.renderToString(formula, {
            displayMode: false,
            throwOnError: false,
            trust: false,
          })
        );
      }
    } catch {
      parts.push(escapeHtml(math));
    }

    lastIndex = regex.lastIndex;
  }

  // Push remaining text
  parts.push(escapeHtml(remaining.slice(lastIndex)));

  return parts.join('');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    // Support markdown-style bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Support markdown-style inline code
    .replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>')
    // Convert newlines to <br> for non-block-math content
    .replace(/\n/g, '<br>');
}

export function LatexRenderer({ text }: { text: string }) {
  const html = useMemo(() => renderLatex(text), [text]);

  return (
    <div
      className="latex-content"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
