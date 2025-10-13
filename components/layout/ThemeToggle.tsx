"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { MoonStar, Sun } from "lucide-react";

/**
 * Small toggle button to switch between the light and dark themes. It keeps a
 * mounted state to avoid hydration mismatches when rendering on the server.
 */
export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const activeTheme = theme === "system" ? resolvedTheme : theme;
  const isDark = activeTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative inline-flex items-center gap-2 rounded-full border border-slate-300/60 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-white/90 hover:shadow dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-900"
      aria-label={isDark ? "Chuyển sang giao diện sáng" : "Chuyển sang giao diện tối"}
    >
      {isDark ? (
        <MoonStar className="h-4 w-4" aria-hidden />
      ) : (
        <Sun className="h-4 w-4" aria-hidden />
      )}
      <span className="hidden sm:inline">
        {isMounted ? (isDark ? "Tối" : "Sáng") : "..."}
      </span>
    </button>
  );
}
