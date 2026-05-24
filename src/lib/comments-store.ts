import type { Comment } from '@/types';

// Shared in-memory store (resets on cold start)
const commentsStore = new Map<string, Comment[]>();

export function getComments(slug: string): Comment[] {
  return commentsStore.get(slug) || [];
}

export function addComment(slug: string, comment: Comment): void {
  const existing = getComments(slug);
  existing.unshift(comment);
  commentsStore.set(slug, existing);
}

export function deleteComment(slug: string, commentId: string): boolean {
  const existing = getComments(slug);
  const index = existing.findIndex((c) => c.id === commentId);
  if (index === -1) return false;
  existing.splice(index, 1);
  commentsStore.set(slug, existing);
  return true;
}

export function deleteAllComments(slug: string): void {
  commentsStore.delete(slug);
}
