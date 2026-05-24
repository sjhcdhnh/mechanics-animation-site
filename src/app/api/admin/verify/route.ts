import { requireAdmin } from '@/lib/admin-auth';

export async function POST(request: Request) {
  const auth = requireAdmin(request);
  if (!auth.authorized) {
    return Response.json({ valid: false }, { status: 401 });
  }
  return Response.json({ valid: true });
}
