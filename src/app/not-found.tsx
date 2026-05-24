import Link from 'next/link';
import { EmptyIcon } from '@/components/ui/Icons';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center space-y-5">
        <span className="inline-block text-muted/30">
          <EmptyIcon className="w-16 h-16" />
        </span>
        <h2 className="text-lg font-semibold text-foreground">页面未找到</h2>
        <p className="text-sm text-muted max-w-sm mx-auto">
          你访问的页面不存在，可能已被移动或删除
        </p>
        <Link
          href="/"
          className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-foreground text-background text-sm font-medium hover:bg-foreground/90 transition-all duration-200 active:scale-[0.98]"
        >
          返回首页
        </Link>
      </div>
    </div>
  );
}
