"use client";

import { FormEvent, useEffect, useState } from "react";

interface NoteComposerProps {
  onCreate: (note: { text: string; page?: number }) => Promise<void> | void;
  defaultPage?: number;
}

/**
 * Simple text area for creating notes tied to the current page.
 */
export function NoteComposer({ onCreate, defaultPage }: NoteComposerProps) {
  const [text, setText] = useState("");
  const [page, setPage] = useState<number | "">(defaultPage ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPage(defaultPage ?? "");
  }, [defaultPage]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Nội dung ghi chú không được bỏ trống");
      return;
    }

    try {
      setIsSubmitting(true);
      const pageNumber = typeof page === "number" ? page : undefined;
      await onCreate({ text, page: pageNumber });
      setText("");
    } catch (submitError) {
      console.error(submitError);
      setError("Không thể lưu ghi chú. Hãy thử lại");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 rounded-lg border border-white/10 bg-neutral-950/60 p-4"
    >
      <div className="flex items-center gap-3">
        <label className="text-xs uppercase tracking-wide text-neutral-400">
          Trang
          <input
            type="number"
            value={page}
            min={1}
            className="mt-1 w-20 rounded-md border border-white/10 bg-neutral-900 px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none"
            onChange={(event) =>
              setPage(event.target.value ? Number(event.target.value) : "")
            }
          />
        </label>
      </div>
      <label className="block text-xs uppercase tracking-wide text-neutral-400">
        Ghi chú
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder="Lưu ý quan trọng, câu hỏi hay ý tưởng cần tìm hiểu thêm..."
          className="mt-1 w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        />
      </label>
      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
      ) : null}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-emerald-400 disabled:cursor-wait disabled:bg-emerald-700/70"
      >
        {isSubmitting ? "Đang lưu..." : "Lưu ghi chú"}
      </button>
    </form>
  );
}
