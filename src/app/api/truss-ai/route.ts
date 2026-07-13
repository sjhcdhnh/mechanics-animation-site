import { streamExplanation } from '@/lib/ai';

export const runtime = 'nodejs';

const PARSE_PROMPT = `你是二维静定桁架建模助手。把用户描述转换成严格 JSON，只输出 JSON，不要代码围栏或说明。
格式：{"nodes":[{"id":0,"x":0,"y":0,"support":"pin"|"roller"|null,"Fx":0,"Fy":0}],"members":[{"id":0,"start":0,"end":1}]}。
规则：力的正方向为右和上；向下 10kN 写 Fy=-10；必须恰好一个 pin 和一个 roller；不要生成重复杆件。`;

const EXPLAIN_PROMPT = `你是结构力学助教。根据给定桁架模型和计算结果，用简洁、准确的中文讲解。
按“结论—支座反力—关键杆件—校核”四部分输出，总字数不超过 350 字。
只列 2 至 3 个最关键的平衡关系；正值为拉力、负值为压力；数值保留两位小数；不要复述完整输入。`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const mode = body?.mode === 'parse' ? 'parse' : 'explain';
    const content = mode === 'parse'
      ? String(body?.prompt || '').slice(0, 3000)
      : JSON.stringify({ model: body?.model, result: body?.result }).slice(0, 12000);

    if (!content.trim()) return Response.json({ error: '缺少输入内容。' }, { status: 400 });
    const stream = await streamExplanation(mode === 'parse' ? PARSE_PROMPT : EXPLAIN_PROMPT, [
      { role: 'user', content },
    ]);
    return new Response(stream, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'AI 请求失败';
    return Response.json({ error: message }, { status: 500 });
  }
}
