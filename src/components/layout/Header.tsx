'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LogoIcon } from '@/components/ui/Icons';

export function Header() {
  const pathname = usePathname();
  const isWatchPage = pathname.startsWith('/watch/');

  const navLinks = [
    { href: '/', label: '首页' },
    { href: '/agent', label: 'AI助手-力学搭子', icon: '/agent-logo.png' },
    { href: '/about', label: '关于' },
    { href: '/deep-learning', label: '深度学习' },
    { href: '/upload', label: '上传' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isWatchPage ? 'opacity-0 pointer-events-none translate-y-[-8px]' : 'opacity-100 translate-y-0'
      }`}
    >
      <nav className="mx-4 mt-4 max-w-2xl mx-auto">
        <div className="glass-sm px-5 py-2.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group" prefetch={false}>
            <span className="text-accent transition-transform duration-500 group-hover:rotate-[-8deg]">
              <LogoIcon className="w-5 h-5" />
            </span>
            <span className="text-sm font-semibold text-foreground tracking-tight">
              力拔·理力创见
            </span>
          </Link>

          <div className="flex items-center gap-0.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={`relative px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 flex items-center gap-1.5 ${
                    isActive
                      ? 'text-accent font-medium'
                      : 'text-muted hover:text-foreground'
                  }`}
                >
                  {link.icon && (
                    <img src={link.icon} alt="" className="w-5 h-5 rounded-full object-cover border border-border/50" />
                  )}
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-[2px] bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
            <div className="ml-1 pl-1 border-l border-border">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
