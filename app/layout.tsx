import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/layout/ThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
  title: 'PDF Reader',
  description: 'Đọc PDF online với tính năng lưu tiến độ.',
  keywords: ['PDF', 'Reader', 'Document Viewer', 'Next.js'],
  authors: [{ name: 'Nguyễn Nhật Tín' }],
  robots: 'index, follow',
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
  ]
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors dark:bg-slate-950 dark:text-slate-100`}
      >
        <ThemeProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(15,23,42,0.7),_transparent_55%)]">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
