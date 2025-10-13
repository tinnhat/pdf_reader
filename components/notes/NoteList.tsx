"use client";

import { Note } from "@/lib/types";

interface NoteListProps {
  notes: Note[];
  isLoading?: boolean;
}

export function NoteList({ notes, isLoading }: NoteListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-4 text-sm text-neutral-300">
        Đang tải ghi chú...
      </div>
    );
  }

  if (!notes.length) {
    return (
      <div className="rounded-lg border border-dashed border-white/10 bg-neutral-950/60 p-4 text-sm text-neutral-400">
        Chưa có ghi chú nào cho tài liệu này.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li
          key={note._id}
          className="rounded-lg border border-white/10 bg-neutral-950/80 p-4 text-sm text-neutral-100"
        >
          <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
            <span>{note.page ? `Trang ${note.page}` : "Không rõ trang"}</span>
            <time dateTime={note.createdAt}>
              {new Date(note.createdAt).toLocaleString()}
            </time>
          </div>
          <p className="whitespace-pre-line text-neutral-100">{note.text}</p>
        </li>
      ))}
    </ul>
  );
}
