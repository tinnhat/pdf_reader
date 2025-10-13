import { WithId } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants";
import { ReadingProgress } from "@/lib/types";

/**
 * Fetches the stored progress document for the given user and document. The
 * helper returns null when no progress has been tracked yet.
 */
export async function findProgress(
  userId: string,
  documentId: string
): Promise<ReadingProgress | null> {
  const db = await getMongoDatabase();
  const raw = await db.collection<ReadingProgress>(COLLECTIONS.progress).findOne({
    userId,
    documentId,
  });
  return raw ?? null;
}

/**
 * Inserts or updates the progress entry for a document. The method stores the
 * page and total page count as well as a timestamp marking the latest update.
 */
export async function upsertProgress(
  progress: Omit<ReadingProgress, "updatedAt"> & { updatedAt?: string }
): Promise<ReadingProgress> {
  const db = await getMongoDatabase();
  const updatedAt = progress.updatedAt ?? new Date().toISOString();
  await db.collection<ReadingProgress>(COLLECTIONS.progress).updateOne(
    { userId: progress.userId, documentId: progress.documentId },
    {
      $set: {
        page: progress.page,
        totalPages: progress.totalPages,
        updatedAt,
      },
    },
    { upsert: true }
  );

  return {
    userId: progress.userId,
    documentId: progress.documentId,
    page: progress.page,
    totalPages: progress.totalPages,
    updatedAt,
  };
}

/**
 * Utility that converts change stream payloads into plain progress objects.
 */
export function mapChangeStreamDocument(
  payload: WithId<ReadingProgress>
): ReadingProgress {
  return {
    userId: payload.userId,
    documentId: payload.documentId,
    page: payload.page,
    totalPages: payload.totalPages,
    updatedAt: payload.updatedAt,
  };
}
