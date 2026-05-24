import { getAnimationBySlug } from '@/lib/animation-registry';
import { streamExplanation, buildExplainSystemPrompt } from '@/lib/ai';
import type { ExplainRequest } from '@/types';

export async function POST(request: Request) {
  try {
    const body: ExplainRequest = await request.json();
    const { slug, question, history = [] } = body;

    if (!slug || !question) {
      return Response.json({ error: '请提供 slug 和 question 参数' }, { status: 400 });
    }

    const anim = getAnimationBySlug(slug);
    if (!anim) {
      return Response.json({ error: '动画未找到' }, { status: 404 });
    }

    const systemPrompt = buildExplainSystemPrompt({
      title: anim.title,
      subtitle: anim.subtitle,
      mechanismType: anim.mechanismType,
      category: anim.category,
      description: anim.description,
    });

    const messages = [
      ...history,
      { role: 'user' as const, content: question },
    ];

    const stream = await streamExplanation(systemPrompt, messages);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    });
  } catch (err) {
    console.error('Explain error:', err);
    const message = err instanceof Error ? err.message : 'AI 解释服务暂不可用';
    return Response.json({ error: message }, { status: 500 });
  }
}
