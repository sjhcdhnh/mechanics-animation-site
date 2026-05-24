import { NextRequest } from 'next/server';
import { getAllAnimations } from '@/lib/animation-registry';
import type { Category } from '@/types';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get('category') as Category | 'all' | null;
  const search = searchParams.get('search');
  const source = searchParams.get('source') as 'builtin' | 'uploaded' | null;

  const animations = getAllAnimations({
    category: category || 'all',
    search: search || undefined,
    source: source || undefined,
  });

  return Response.json(animations);
}
