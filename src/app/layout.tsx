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
  title: "力拔理力集",
  description:
    "力学拔尖基地班出品 — 将理论力学的抽象知识点转化为交互式三维动画，涵盖平面连杆机构、凸轮传动、串联机器人、航天机构、动力学与振动等方向的运动学演示。",
  keywords: [
    "理论力学",
    "力学拔尖基地班",
    "力拔理力集",
    "机构学",
    "运动学",
    "Three.js",
    "动画演示",
    "曲柄滑块",
    "四杆机构",
    "机械臂",
    "空间站对接",
    "动力学",
  ],
  authors: [{ name: "力学拔尖基地班" }],
  openGraph: {
    title: "力拔理力集",
    description: "力学拔尖基地班出品 — 将理论力学的抽象知识点转化为交互式三维动画",
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
