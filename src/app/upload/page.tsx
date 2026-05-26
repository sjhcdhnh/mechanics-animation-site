import type { Metadata } from 'next';
import { UploadForm } from '@/components/upload/UploadForm';

export const metadata: Metadata = {
  title: '上传动画 — 力拔·理力创见',
  description: '上传你自己的 Three.js 机构动画，通过校验后加入画廊展示',
};

export default function UploadPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">上传动画</h1>
          <p className="text-sm text-muted">
            上传你的 Three.js 机构动画，通过校验后自动加入画廊展示
          </p>
        </div>

        {/* Form */}
        <UploadForm />
      </div>
    </div>
  );
}
