import { FormEvent, useRef, useState } from "react";
import { DEMO_USER_ID } from "@/lib/constants";
import { ReaderDocument } from "@/lib/types";

interface NewDocumentFormProps {
  onDocumentCreated: (document: ReaderDocument) => void;
}

/**
 * Allows readers to add a PDF from their local machine. The file is uploaded to
 * MongoDB so that reading progress can be preserved across devices.
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

    const formData = new FormData();
    formData.set("file", file);
    formData.set("userId", DEMO_USER_ID);
    if (title.trim()) {
      formData.set("title", title.trim());
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/documents", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { error?: string }
          | null;
        throw new Error(payload?.error ?? "UPLOAD_FAILED");
      }

      const document = (await response.json()) as ReaderDocument;
      onDocumentCreated(document);
      setTitle("");
      if (fileInput.current) {
        fileInput.current.value = "";
      }
      setError(null);
    } catch (uploadError) {
      console.error(uploadError);
      setError("Không thể tải tệp lên MongoDB. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-5 text-sm text-slate-600 dark:text-slate-200">
      <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
        Thêm file PDF mới
      </h3>
      <div className="mt-4 space-y-4">
        <label className="block text-xs tracking-wide text-slate-500 dark:text-slate-400">
          Tên hiển thị (tùy chọn)
          <input
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tên hiển thị"
            className="mt-1 w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/30"
          />
        </label>
        <label className="block text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            className="mt-1 block w-full cursor-pointer text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-gradient-to-r file:from-sky-500 file:to-indigo-500 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:from-sky-400 hover:file:to-indigo-400 dark:text-slate-300"
          />
        </label>
        {error ? (
          <p className="rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-600 dark:text-red-300">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-4 py-2 font-medium text-white shadow-lg shadow-sky-500/30 transition hover:from-sky-400 hover:to-indigo-400 disabled:cursor-wait disabled:opacity-70"
        >
          {isSubmitting ? "Đang xử lý..." : "Lưu tài liệu"}
        </button>
      </div>
    </form>
  );
}
