"use client";

import { FormEvent, useRef, useState } from "react";
import { ReaderDocument } from "@/lib/types";

interface NewDocumentFormProps {
  onDocumentCreated: (document: ReaderDocument) => void;
}

/**
 * Allows readers to add a PDF from their local machine. The file is held in
 * memory for the duration of the session and never leaves the browser.
 */
export function NewDocumentForm({ onDocumentCreated }: NewDocumentFormProps) {
  const fileInput = useRef<HTMLInputElement | null>(null);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const file = fileInput.current?.files?.[0];
    if (!file) {
      setError("Vui lòng chọn một tệp PDF");
      return;
    }

    if (file.type !== "application/pdf") {
      setError("Chỉ hỗ trợ tệp PDF");
      return;
    }

    setIsSubmitting(true);
    try {
      const buffer = new Uint8Array(await file.arrayBuffer());
      const document: ReaderDocument = {
        id: crypto.randomUUID(),
        title: title || file.name.replace(/\.pdf$/i, ""),
        source: { type: "file", data: buffer, name: file.name },
      };
      onDocumentCreated(document);
      setTitle("");
      if (fileInput.current) {
        fileInput.current.value = "";
      }
    } catch (uploadError) {
      console.error(uploadError);
      setError("Không thể đọc tệp, vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-lg border border-white/10 bg-neutral-900/80 p-4 text-sm text-neutral-200"
    >
      <h3 className="mb-3 font-semibold text-white">Thêm tài liệu cá nhân</h3>
      <div className="space-y-3">
        <label className="block text-xs uppercase tracking-wide text-neutral-400">
          Tiêu đề tùy chọn
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tên hiển thị"
            className="mt-1 w-full rounded-md border border-white/10 bg-neutral-950 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
          />
        </label>
        <label className="block text-xs uppercase tracking-wide text-neutral-400">
          Tệp PDF
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            className="mt-1 block w-full text-sm text-neutral-300 file:mr-4 file:rounded-md file:border-0 file:bg-amber-500 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-neutral-900 hover:file:bg-amber-400"
          />
        </label>
        {error ? (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-md bg-amber-500 px-4 py-2 font-medium text-neutral-900 transition hover:bg-amber-400 disabled:cursor-wait disabled:bg-amber-700/70"
        >
          {isSubmitting ? "Đang xử lý..." : "Lưu tài liệu"}
        </button>
      </div>
    </form>
  );
}
