import { streamExplanation } from '@/lib/ai';
import { getAgentSystemPrompt } from '@/lib/agent-knowledge';

export async function POST(request: Request) {
  try {
    const body: {
      question: string;
      history?: { role: 'user' | 'assistant'; content: string }[];
      context?: string;
    } = await request.json();

    const { question, history = [], context } = body;

    if (!question || !question.trim()) {
      return Response.json({ error: '请提供 question 参数' }, { status: 400 });
    }

    const systemPrompt = getAgentSystemPrompt(context);

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
    console.error('Agent error:', err);
    const message =
      err instanceof Error ? err.message : 'AI 教学助手服务暂不可用';
    return Response.json({ error: message }, { status: 500 });
  }
}
