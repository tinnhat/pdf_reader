import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "My PDF Desk",
  description:
    "Ứng dụng Next.js đọc PDF cá nhân với đồng bộ tiến độ, ghi chú và dịch văn bản.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 text-white antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
