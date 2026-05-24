import { verifyPassword, createToken } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const password = (body.password || '').trim();

    if (!password) {
      return Response.json({ error: '请输入密码' }, { status: 400 });
    }

    if (!verifyPassword(password)) {
      return Response.json({ error: '密码错误' }, { status: 401 });
    }

    const token = createToken();
    return Response.json({ token });
  } catch {
    return Response.json({ error: '服务器错误' }, { status: 500 });
  }
}
