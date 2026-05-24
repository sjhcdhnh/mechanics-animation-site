import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AdminLoginModal } from "@/components/admin/AdminLoginModal";
import { AdminPanel } from "@/components/admin/AdminPanel";
import { Toaster } from "react-hot-toast";
import "katex/dist/katex.min.css";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "理论力学 · 机构动画演示",
  description:
    "交互式平面与空间机构运动学动画演示平台 — 曲柄滑块、曲柄摇杆、牛头刨床、抽油机、机械臂、空间站对接等三维交互动画，辅助理论力学课程学习。",
  keywords: [
    "理论力学",
    "机构学",
    "运动学",
    "Three.js",
    "动画演示",
    "曲柄滑块",
    "四杆机构",
    "机械臂",
    "空间站对接",
  ],
  authors: [{ name: "机构动画演示项目" }],
  openGraph: {
    title: "理论力学 · 机构动画演示",
    description: "交互式平面与空间机构运动学动画演示平台",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.setAttribute('data-theme', 'light');
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <AdminLoginModal />
          <AdminPanel />
          <Toaster
            position="bottom-center"
            toastOptions={{
              style: {
                background: "var(--surface)",
                color: "var(--foreground)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                fontSize: "13px",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
