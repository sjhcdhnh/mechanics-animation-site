import type { Metadata } from 'next';
import { UploadForm } from '@/components/upload/UploadForm';

export const metadata: Metadata = {
  title: '上传动画 — 理论力学机构动画演示',
  description: '上传你自己的 Three.js 理论力学机构动画',
};

export default function UploadPage() {
  return (
    <div className="min-h-screen pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">上传动画</h1>
          <p className="text-sm text-muted">
            分享你的 Three.js 理论力学机构动画，上传后将自动检验并添加至画廊
          </p>
        </div>

        {/* Form */}
        <UploadForm />
      </div>
    </div>
  );
}
