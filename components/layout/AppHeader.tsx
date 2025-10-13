"use client";

import Link from "next/link";

/**
 * Top level navigation for the reader. The component intentionally keeps the
 * markup lightweight to focus on clarity while still showcasing Tailwind usage.
 */
export function AppHeader() {
  return (</* navigation */>
    <header className="sticky top-0 z-30 border-b border-white/10 bg-neutral-900/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-900/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4 text-white">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">My PDF Desk</h1>
          <p className="text-sm text-neutral-300">
            Đọc, ghi chú và dịch nội dung PDF cá nhân của bạn.
          </p>
        </div>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="https://libretranslate.com/"
            target="_blank"
            rel="noreferrer"
            className="rounded-md bg-amber-500 px-3 py-1 font-medium text-neutral-900 transition hover:bg-amber-400"
          >
            LibreTranslate
          </Link>
          <Link
            href="https://github.com/mongodb/node-mongodb-native"
            target="_blank"
            rel="noreferrer"
            className="rounded-md border border-white/20 px-3 py-1 transition hover:border-white/40"
          >
            MongoDB Driver
          </Link>
        </nav>
      </div>
    </header>
  );
}
