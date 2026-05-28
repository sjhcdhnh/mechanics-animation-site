'use client';

import { useState, useEffect, useCallback } from 'react';

const SLIDES = [
  { src: '/images/hero/fast-feed-cabin.gif', alt: 'FAST馈源舱姿态模拟' },
  { src: '/images/hero/space-station-docking.gif', alt: '空间站交会对接' },
  { src: '/images/hero/mechanism-demo.gif', alt: '机构运动学演示' },
];

const INTERVAL = 4000;

export function HeroGallery() {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (hovered) return;
    const timer = setInterval(next, INTERVAL);
    return () => clearInterval(timer);
  }, [hovered, next]);

  return (
    <div
      className="relative w-full max-w-[640px] mx-auto lg:mx-0"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Main image stack */}
      <div className="relative aspect-[16/10]">
        {SLIDES.map((slide, i) => {
          const offset = ((i - current + SLIDES.length) % SLIDES.length);
          const isActive = offset === 0;

          return (
            <div
              key={slide.src}
              className="absolute inset-0 transition-all duration-700"
              style={{
                transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
                opacity: isActive ? 1 : 0,
                transform: isActive
                  ? 'translateY(0) scale(1) rotate(0deg)'
                  : 'translateY(12px) scale(0.97) rotate(0deg)',
                pointerEvents: isActive ? 'auto' : 'none',
                zIndex: isActive ? 3 : 1,
              }}
            >
              <div className="w-full h-full rounded-2xl overflow-hidden border border-border shadow-lg shadow-black/10">
                <img
                  src={slide.src}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                  loading={i === 0 ? 'eager' : 'lazy'}
                />
              </div>
            </div>
          );
        })}

        {/* Ambient glow behind active card */}
        <div
          className="absolute -inset-6 rounded-[32px] opacity-25 pointer-events-none transition-all duration-700"
          style={{
            background: 'radial-gradient(ellipse at center, var(--accent) 0%, transparent 65%)',
            transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>

      {/* Dots + counter */}
      <div className="flex items-center justify-between mt-4 px-1">
        <div className="flex items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`rounded-full transition-all duration-300 ${
                i === current
                  ? 'w-5 h-1.5 bg-accent'
                  : 'w-1.5 h-1.5 bg-border hover:bg-muted'
              }`}
              aria-label={`切换到第 ${i + 1} 张图`}
            />
          ))}
        </div>
        <span className="text-[10px] text-muted/60 tabular-nums">
          {current + 1} / {SLIDES.length}
        </span>
      </div>
    </div>
  );
}
