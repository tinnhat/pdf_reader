"use client";

import { ThemeToggle } from "./ThemeToggle";

/**
 * Top level navigation for the reader with a polished light/dark switcher.
 */
export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/75 backdrop-blur-xl transition-colors dark:border-slate-800/70 dark:bg-slate-950/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-4 text-slate-900 sm:flex-row sm:items-center sm:justify-between dark:text-slate-100">
        <div className="space-y-2">
          <span className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-sky-500/20 to-indigo-500/20 px-3 py-1 text-xs font-medium text-sky-600 dark:from-sky-400/20 dark:to-indigo-400/20 dark:text-sky-200">
            <span className="inline-block h-2 w-2 rounded-full bg-sky-500" aria-hidden />
            Workspace cá nhân
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My PDF Desk</h1>
            <p className="mt-1 max-w-xl text-sm text-slate-600 dark:text-slate-300">
              Đọc tài liệu, ghi chú phong phú và đồng bộ tiến độ của bạn trên mọi thiết bị.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <div className="hidden h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 text-sm font-semibold text-white shadow-md sm:flex">
            VT
          </div>
        </div>
      </div>
    </header>
  );
}
