import { ObjectId } from "mongodb";
import { getMongoDatabase } from "@/lib/mongodb";
import { COLLECTIONS } from "@/lib/constants";
import { Note } from "@/lib/types";

export async function listNotes(
  userId: string,
  documentId: string
): Promise<Note[]> {
  const db = await getMongoDatabase();
  const cursor = db
    .collection<Note>(COLLECTIONS.notes)
    .find({ userId, documentId })
    .sort({ createdAt: -1 });
  const results = await cursor.toArray();
  return results.map((note) => ({
    ...note,
    _id: note._id instanceof ObjectId ? note._id.toHexString() : note._id,
  }));
}

export async function createNote(note: Omit<Note, "createdAt" | "_id"> & {
  createdAt?: string;
}): Promise<Note> {
  const db = await getMongoDatabase();
  const createdAt = note.createdAt ?? new Date().toISOString();
  const result = await db.collection<Note>(COLLECTIONS.notes).insertOne({
    ...note,
    createdAt,
  });

  return {
    _id: result.insertedId.toHexString(),
    userId: note.userId,
    documentId: note.documentId,
    page: note.page,
    text: note.text,
    createdAt,
  };
}
