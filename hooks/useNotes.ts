"use client";

import useSWR from "swr";
import { useCallback } from "react";
import { Note } from "@/lib/types";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch notes: ${response.status}`);
  }
  return (await response.json()) as Note[];
};

interface UseNotesOptions {
  documentId?: string;
  userId: string;
}

export function useNotes({ documentId, userId }: UseNotesOptions) {
  const shouldFetch = Boolean(documentId);
  const { data, error, isLoading, mutate } = useSWR<Note[]>(
    shouldFetch ? `/api/notes?documentId=${documentId}&userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  const addNote = useCallback(
    async ({ content, page }: { content: string; page?: number }) => {
      if (!documentId) {
        throw new Error("Không có tài liệu nào đang được chọn");
      }

      const response = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentId,
          userId,
          content,
          page,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to create note");
      }

      const created = (await response.json()) as Note;
      mutate((current) => [created, ...(current ?? [])], {
        revalidate: false,
      });
    },
    [documentId, userId, mutate]
  );

  const editNote = useCallback(
    async (noteId: string, content: string, page?: number) => {
      const response = await fetch(`/api/notes/${noteId}?userId=${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content,
          page,
        }),
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to update note");
      }

      const updated = (await response.json()) as Note;
      mutate((current) =>
        current?.map((note) => (note._id === noteId ? updated : note)) ?? [],
        {
          revalidate: false,
        }
      );
    },
    [userId, mutate]
  );

  const deleteNote = useCallback(
    async (noteId: string) => {
      const response = await fetch(`/api/notes/${noteId}?userId=${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to delete note");
      }

      mutate((current) =>
        current?.filter((note) => note._id !== noteId) ?? [],
        {
          revalidate: false,
        }
      );
    },
    [userId, mutate]
  );

  return {
    notes: data ?? [],
    isLoading,
    error,
    addNote,
    editNote,
    deleteNote,
  };
}
