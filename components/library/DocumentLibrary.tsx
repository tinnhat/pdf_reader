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
    <aside className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
        Thư viện PDF
      </h2>
      <ul className="space-y-2">
        {documents.map((document) => {
          const isActive = document.id === activeDocumentId;
          return (
            <li key={document.id}>
              <button
                type="button"
                onClick={() => onSelect(document.id)}
                className={`w-full rounded-lg border px-4 py-3 text-left text-sm transition focus:outline-none focus:ring-2 focus:ring-amber-400 ${
                  isActive
                    ? "border-amber-500 bg-amber-500/20 text-white"
                    : "border-white/10 bg-neutral-900 text-neutral-200 hover:border-white/30"
                }`}
              >
                <p className="font-medium">{document.title}</p>
                <p className="text-xs text-neutral-400">
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
