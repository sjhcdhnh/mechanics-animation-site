'use client';

import { useState, useCallback } from 'react';

export function LikeButton({ slug, initialLikes = 0 }: { slug: string; initialLikes?: number }) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(false);
  const [animating, setAnimating] = useState(false);

  const handleLike = useCallback(async () => {
    if (liked) return;
    setLiked(true);
    setLikes((prev) => prev + 1);
    setAnimating(true);
    setTimeout(() => setAnimating(false), 400);

    try {
      const res = await fetch(`/api/animations/${slug}/like`, { method: 'POST' });
      const data = await res.json();
      if (data.likes !== undefined) {
        setLikes(data.likes);
      }
    } catch {
      // Silently fail — keep optimistic count
    }
  }, [slug, liked]);

  return (
    <button
      onClick={handleLike}
      disabled={liked}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all select-none ${
        liked
          ? 'bg-accent/15 text-accent border border-accent/30 cursor-default'
          : 'bg-foreground/5 text-muted border border-border hover:border-accent/30 hover:text-accent cursor-pointer'
      }`}
    >
      <svg
        className={`w-3.5 h-3.5 transition-transform ${animating ? 'scale-125' : ''}`}
        viewBox="0 0 24 24"
        fill={liked ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"
        />
      </svg>
      {likes > 0 && <span>{likes}</span>}
    </button>
  );
}
