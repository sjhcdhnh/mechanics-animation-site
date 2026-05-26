export async function streamExplanation(
  systemPrompt: string,
  messages: { role: 'user' | 'assistant'; content: string }[]
): Promise<ReadableStream<Uint8Array>> {
  const apiKey = process.env.AI_API_KEY;
  const apiBase = process.env.AI_API_BASE || 'https://api.deepseek.com/v1';
  const model = process.env.AI_MODEL || 'deepseek-chat';

  if (!apiKey) {
    throw new Error('AI_API_KEY 未配置。请在环境变量中设置 AI_API_KEY。');
  }

  const body = {
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      ...messages,
    ],
    stream: true,
    temperature: 0.7,
    max_tokens: 1500,
  };

  const response = await fetch(`${apiBase}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`AI API 请求失败 (${response.status}): ${errText}`);
  }

  if (!response.body) {
    throw new Error('AI API 未返回流式响应');
  }

  const decoder = new TextDecoder();
  const reader = response.body.getReader();

  return new ReadableStream({
    async start(controller) {
      let buffer = '';
      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data: ')) continue;
            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              controller.close();
              return;
            }
            try {
              const json = JSON.parse(data);
              const content = json.choices?.[0]?.delta?.content;
              if (content) {
                controller.enqueue(new TextEncoder().encode(content));
              }
            } catch {
              // skip unparseable lines
            }
          }
        }
        controller.close();
      } catch (e) {
        controller.error(e);
      }
    },
  });
}

export function buildExplainSystemPrompt(animMeta: {
  title: string;
  subtitle: string;
  mechanismType: string;
  category: string;
  description?: string;
}): string {
  return `你是一位理论力学教授，专门解释机械机构的运动学和动力学原理。
你正在"力拔理力集"平台上辅助学生理解机构运动学动画。请用中文回答学生的问题。

当前演示的机构信息：
- 名称：${animMeta.title}
- 英文对照：${animMeta.subtitle}
- 机构类型：${animMeta.mechanismType}
- 分类：${animMeta.category}
${animMeta.description ? `- 简介：${animMeta.description}` : ''}

回答要求：
1. 使用理论力学的专业术语（如自由度、约束、运动学正解/逆解、Grashof条件、急回特性、瞬心法、达朗贝尔原理、D-H参数法、拉格朗日方程等）
2. 结合当前这个具体机构进行解释，给出关键公式推导和物理解释
3. 语言简洁明了，适合正在学习理论力学的本科生理解
4. 如果学生问开放式问题，先给出概述再逐步深入
5. 涉及公式时务必使用标准 LaTeX 语法，且 $ 或 $$ 前后换行：
   - 行内公式用单个 $ 包裹，如：滑块速度 $v_B = -r\omega(\sin\phi + \frac{\lambda\sin\phi\cos\phi}{\sqrt{1-\lambda^2\sin^2\phi}})$
   - 独立公式用双 $$ 包裹，如：$$\omega_{AB} = \frac{\lambda\cos\phi}{\sqrt{1-\lambda^2\sin^2\phi}}\omega$$
   - 希腊字母：\omega \alpha \beta \theta \phi \lambda
   - 分数：\frac{分子}{分母}
   - 根号：\sqrt{}
6. 回答控制在 300-500 字，避免过度冗长`;
}
