import { Note } from "@/lib/types";
import { Edit2, Trash2, Check, X } from "lucide-react";
import { useState } from "react";

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
  onGoToNote: (note: Note) => void;
  onEdit?: (noteId: string, content: string, page?: number) => void;
  onDelete?: (noteId: string) => void;
}

export function NoteList({ notes, isLoading, onGoToNote, onEdit, onDelete }: NoteListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editPage, setEditPage] = useState<number | undefined>();

  const startEdit = (note: Note) => {
    setEditingId(note._id!);
    setEditContent(note.content || "");
    setEditPage(note.page);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditContent("");
    setEditPage(undefined);
  };

  const saveEdit = () => {
    if (editingId && onEdit) {
      onEdit(editingId, editContent, editPage);
    }
    cancelEdit();
  };

  if (isLoading) {
    return (
      <div className="muted-card p-4 text-sm text-slate-600 dark:text-slate-300">
        Đang tải ghi chú...
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div className="muted-card border-dashed p-6 text-sm text-slate-500 dark:text-slate-300">
        Chưa có ghi chú nào cho tài liệu này.
      </div>
    );
  }

  return (
    <div className="max-h-full overflow-y-auto">
      <ul className="space-y-4">
        {notes.map((note) => {
          const isEditing = editingId === note._id;
          return (
            <li
              key={note._id}
              className="glass-panel p-5 text-sm text-slate-700 dark:text-slate-200"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Trang"
                      value={editPage || ""}
                      onChange={(e) => setEditPage(e.target.value ? Number(e.target.value) : undefined)}
                      className="w-16 rounded px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
                    />
                    <button
                      onClick={saveEdit}
                      className="rounded p-1 hover:bg-green-500/10 hover:text-green-500"
                      title="Lưu"
                    >
                      <Check size={14} />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="rounded p-1 hover:bg-red-500/10 hover:text-red-500"
                      title="Hủy"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <>
                    <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/60 px-2.5 py-1 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200 cursor-pointer" onClick={() => onGoToNote(note)}>
                      {note.page ? `Trang ${note.page}` : "Ghi chú chung"}
                    </span>
                    <div className="flex items-center gap-1">
                      {onEdit && (
                        <button
                          onClick={() => startEdit(note)}
                          className="rounded p-1 hover:bg-blue-500/10 hover:text-blue-500"
                          title="Chỉnh sửa"
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            if (confirm("Bạn có chắc muốn xóa ghi chú này?")) {
                              onDelete(note._id!);
                            }
                          }}
                          className="rounded p-1 hover:bg-red-500/10 hover:text-red-500"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                      <time dateTime={note.createdAt} className="font-mono">
                        {new Date(note.createdAt).toLocaleString()}
                      </time>
                    </div>
                  </>
                )}
              </div>
              {isEditing ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full rounded-lg border border-slate-200/70 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 dark:border-slate-700/70 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-sky-500 dark:focus:ring-sky-500/30"
                  rows={4}
                />
              ) : (
                <div
                  className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-100"
                  dangerouslySetInnerHTML={{
                    __html: note.content ?? note.text ?? "",
                  }}
                />
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
