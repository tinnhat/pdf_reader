"use client";

import useSWR from "swr";
import { useCallback, useEffect } from "react";
import { ReadingProgress } from "@/lib/types";

const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch progress: ${response.status}`);
  }
  return (await response.json()) as ReadingProgress | null;
};

interface UseReadingProgressOptions {
  documentId?: string;
  userId: string;
}

export function useReadingProgress({
  documentId,
  userId,
}: UseReadingProgressOptions) {
  const shouldFetch = Boolean(documentId);
  const { data, error, isLoading, mutate } = useSWR<ReadingProgress | null>(
    shouldFetch ? `/api/progress?documentId=${documentId}&userId=${userId}` : null,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    if (!documentId) return;

    const eventSource = new EventSource(
      `/api/progress/stream?documentId=${documentId}&userId=${userId}`
    );

    eventSource.onmessage = (event) => {
      const payload = JSON.parse(event.data) as ReadingProgress;
      mutate(payload, { revalidate: false });
    };

    eventSource.onerror = () => {
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [documentId, userId, mutate]);

  const updateProgress = useCallback(
    async (next: { page: number; totalPages: number }) => {
      if (!documentId) return;

      const optimistic: ReadingProgress = {
        userId,
        documentId,
        page: next.page,
        totalPages: next.totalPages,
        updatedAt: new Date().toISOString(),
      };

      mutate(optimistic, { revalidate: false });
      try {
        const response = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId,
            userId,
            page: next.page,
            totalPages: next.totalPages,
          }),
        });
        if (!response.ok) {
          throw new Error(`Failed to persist progress: ${response.status}`);
        }
      } catch (persistError) {
        console.error(persistError);
        // Force a refetch to resynchronise with the server state.
        mutate();
        throw persistError;
      }
    },
    [documentId, userId, mutate]
  );

  return {
    progress: data ?? null,
    isLoading,
    error,
    updateProgress,
  };
}
