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
    { href: '/deep-learning', label: '专题项目' },
    { href: '/upload', label: '上传' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isWatchPage ? 'opacity-0 pointer-events-none translate-y-[-8px]' : 'opacity-100 translate-y-0'
      }`}
    >
      <nav className="px-5 pt-3.5 w-full">
        <div className="glass-sm px-6 py-3.5 flex items-center justify-between w-full">
          <Link href="/" className="flex items-center gap-3 group" prefetch={false}>
            <span className="text-accent transition-transform duration-500 group-hover:rotate-[-8deg]">
              <LogoIcon className="w-6 h-6" />
            </span>
            <span className="text-lg font-bold text-foreground tracking-tight">
              力拔·理力创见
            </span>
          </Link>

          <div className="flex items-center gap-1.5">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  prefetch={false}
                  className={`relative px-4 py-2 rounded-lg text-[15px] transition-colors duration-200 flex items-center gap-2 ${
                    isActive
                      ? 'text-accent font-semibold bg-accent/8'
                      : 'text-muted hover:text-foreground hover:bg-foreground/5'
                  }`}
                >
                  {link.icon && (
                    <img src={link.icon} alt="" className="w-6 h-6 rounded-full object-cover border border-border/50" />
                  )}
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
            <div className="ml-2 pl-2 border-l border-border">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
