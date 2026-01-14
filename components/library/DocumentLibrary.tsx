import { ReaderDocument } from "@/lib/types";
import { Trash2 } from "lucide-react";

interface DocumentLibraryProps {
  documents: ReaderDocument[];
  activeDocumentId?: string;
  onSelect: (documentId: string) => void;
  onDelete?: (documentId: string) => void;
}

export function DocumentLibrary({
  documents,
  activeDocumentId,
  onSelect,
  onDelete,
}: DocumentLibraryProps) {
  return (
    <aside className="space-y-4">
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">
          Thư viện PDF
        </h2>
      </div>
      <ul className="space-y-3">
        {documents.map((document) => {
          const isActive = document.id === activeDocumentId;
          return (
            <li key={document.id} className="relative">
              <button
                type="button"
                onClick={() => onSelect(document.id)}
                className={`w-full rounded-xl border px-4 py-4 pr-12 text-left text-sm shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-300 dark:focus:ring-sky-600 ${
                  isActive
                    ? "border-sky-400 bg-sky-100/80 text-slate-900 dark:border-sky-500 dark:bg-sky-500/10 dark:text-sky-100"
                    : "border-transparent bg-white/70 text-slate-700 hover:border-slate-300/60 dark:bg-slate-900/70 dark:text-slate-200"
                }`}
              >
                <p className="font-semibold">{document.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {document.source.type === "url"
                    ? "Đường dẫn từ máy chủ"
                    : `File: ${document.source.fileName}`}
                </p>
              </button>
              {onDelete && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Bạn có chắc muốn xóa tài liệu này và tất cả ghi chú liên quan?")) {
                      onDelete(document.id);
                    }
                  }}
                  className="absolute right-2 top-2 rounded-lg p-1.5 text-slate-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                  title="Xóa tài liệu"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
