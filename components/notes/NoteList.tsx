import { Note } from "@/lib/types";

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
  onGoToNote: (note: Note) => void;
}

export function NoteList({ notes, isLoading, onGoToNote }: NoteListProps) {
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
    <ul className="space-y-4">
      {notes.map((note) => (
        <li
          key={note._id}
          className="glass-panel p-5 text-sm text-slate-700 dark:text-slate-200"
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100/60 px-2.5 py-1 font-semibold text-sky-700 dark:bg-sky-500/10 dark:text-sky-200 cursor-pointer" onClick={() => onGoToNote(note)}>
              {note.page ? `Trang ${note.page}` : "Ghi chú chung"}
            </span>
            <time dateTime={note.createdAt} className="font-mono">
              {new Date(note.createdAt).toLocaleString()}
            </time>
          </div>
          <div
            className="prose prose-sm max-w-none text-slate-700 dark:prose-invert dark:text-slate-100"
            dangerouslySetInnerHTML={{
              __html: note.content ?? note.text ?? "",
            }}
          />
        </li>
      ))}
    </ul>
  );
}
