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
  return results.map((note: any) => ({
    ...note,
    content: note.content ?? note.text ?? "",
    plainText: note.plainText ?? note.text ?? "",
    _id: note._id instanceof ObjectId ? note._id.toHexString() : note._id,
  }));
}

export async function createNote(note: Omit<Note, "createdAt" | "_id"> & {
  createdAt?: string;
}): Promise<Note> {
  const db = await getMongoDatabase();
  const createdAt = note.createdAt ?? new Date().toISOString();
  const result: any = await db.collection<Note>(COLLECTIONS.notes).insertOne({
    ...note,
    plainText: note.plainText ?? note.text ?? "",
    createdAt,
  });

  return {
    _id: result.insertedId.toHexString(),
    userId: note.userId,
    documentId: note.documentId,
    page: note.page,
    content: note.content,
    plainText: note.plainText ?? note.text ?? "",
    createdAt,
  };
}

export async function deleteNotesByDocumentId(
  userId: string,
  documentId: string
): Promise<number> {
  const db = await getMongoDatabase();
  const result = await db.collection<Note>(COLLECTIONS.notes).deleteMany({
    userId,
    documentId,
  });
  return result.deletedCount;
}

export async function deleteNoteById(
  userId: string,
  noteId: string
): Promise<boolean> {
  const db = await getMongoDatabase();
  const result = await db.collection<Note>(COLLECTIONS.notes).deleteOne({
    _id: new ObjectId(noteId) as any,
    userId,
  });
  return result.deletedCount > 0;
}

export async function updateNote(
  userId: string,
  noteId: string,
  updates: Partial<Pick<Note, "content" | "plainText" | "page">>
): Promise<Note | null> {
  const db = await getMongoDatabase();
  const result = await db.collection<Note>(COLLECTIONS.notes).findOneAndUpdate(
    { _id: new ObjectId(noteId) as any, userId },
    {
      $set: {
        ...updates,
        plainText: updates.plainText ?? updates.content ?? "",
      },
    },
    { returnDocument: "after" }
  );

  if (!result) return null;

  return {
    ...result,
    _id: typeof result._id === 'string' ? result._id : (result._id as ObjectId).toHexString(),
    content: result.content ?? result.text ?? "",
    plainText: result.plainText ?? result.text ?? "",
  };
}
