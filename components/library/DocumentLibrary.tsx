"use client";

import { ReaderDocument } from "@/lib/types";

interface DocumentLibraryProps {
  documents: ReaderDocument[];
  activeDocumentId?: string;
  onSelect: (documentId: string) => void;
}

/**
 * Renders the list of available documents. The component highlights the
 * currently active entry and allows users to quickly swap between PDFs.
 */
export function DocumentLibrary({
  documents,
  activeDocumentId,
  onSelect,
}: DocumentLibraryProps) {
  return (
    <aside className="space-y-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
          Thư viện PDF
        </h2>
        <p className="mt-1 text-xs text-slate-500/80 dark:text-slate-400">
          Chọn nhanh tài liệu bạn muốn tiếp tục.
        </p>
      </div>
      <ul className="space-y-3">
        {documents.map((document) => {
          const isActive = document.id === activeDocumentId;
          return (
            <li key={document.id}>
              <button
                type="button"
                onClick={() => onSelect(document.id)}
                className={`w-full rounded-xl border px-4 py-4 text-left text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600 ${
                  isActive
                    ? "border-sky-400 bg-sky-100/80 text-slate-900 dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-100"
                    : "border-transparent bg-white/70 text-slate-700 hover:border-slate-300/60 dark:bg-slate-900/70 dark:text-slate-200"
                }`}
              >
                <p className="font-semibold">{document.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {document.source.type === "url"
                    ? "Đường dẫn từ máy chủ"
                    : `Tệp nội bộ: ${document.source.name}`}
                </p>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
