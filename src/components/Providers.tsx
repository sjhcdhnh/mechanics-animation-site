'use client';

import { ThemeProvider } from 'next-themes';
import { AdminProvider } from './admin/AdminProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="data-theme" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
      <AdminProvider>
        {children}
      </AdminProvider>
    </ThemeProvider>
  );
}
