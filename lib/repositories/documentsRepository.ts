import { Binary, ObjectId } from "mongodb";
import { COLLECTIONS } from "@/lib/constants";
import { getMongoDatabase } from "@/lib/mongodb";

interface DocumentRecord {
  userId: string;
  title: string;
  fileName: string;
  mimeType: string;
  data: Buffer | Binary;
  createdAt: string;
}

export interface StoredDocumentMetadata {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  createdAt: string;
}

export interface StoredDocumentFile {
  id: string;
  title: string;
  fileName: string;
  mimeType: string;
  data: Buffer;
}

function normaliseBinaryData(data: Buffer | Binary): Buffer {
  if (data instanceof Buffer) {
    return data;
  }

  // MongoDB stores Buffer instances as Binary. Access the underlying bytes and
  // create a fresh Buffer so downstream consumers (e.g. the Response body)
  // receive contiguous, uncompressed data.
  if (data.buffer instanceof Buffer) {
    return Buffer.from(data.buffer.subarray(0, data.length()));
  }

  return Buffer.from(data.buffer);
}

export async function listStoredDocuments(
  userId: string
): Promise<StoredDocumentMetadata[]> {
  const db = await getMongoDatabase();
  const collection = db.collection<DocumentRecord>(COLLECTIONS.documents);
  const documents = await collection
    .find<StoredDocumentMetadata & { _id: ObjectId }>({ userId }, {
      projection: { data: 0 },
      sort: { createdAt: -1 },
    })
    .toArray();

  return documents.map((document) => ({
    id: document._id.toString(),
    title: document.title,
    fileName: document.fileName,
    mimeType: document.mimeType,
    createdAt: document.createdAt,
  }));
}

export async function insertStoredDocument(payload: {
  userId: string;
  title: string;
  fileName: string;
  mimeType: string;
  data: Buffer;
}): Promise<StoredDocumentMetadata> {
  const db = await getMongoDatabase();
  const collection = db.collection<DocumentRecord>(COLLECTIONS.documents);
  const createdAt = new Date().toISOString();

  const result = await collection.insertOne({
    userId: payload.userId,
    title: payload.title,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    data: payload.data,
    createdAt,
  });

  return {
    id: result.insertedId.toString(),
    title: payload.title,
    fileName: payload.fileName,
    mimeType: payload.mimeType,
    createdAt,
  };
}

export async function findStoredDocumentFile(
  userId: string,
  documentId: string
): Promise<StoredDocumentFile | null> {
  const db = await getMongoDatabase();
  const collection = db.collection<DocumentRecord>(COLLECTIONS.documents);
  let objectId: ObjectId;
  try {
    objectId = new ObjectId(documentId);
  } catch {
    return null;
  }

  const document = await collection.findOne({
    _id: objectId,
    userId,
  });

  if (!document) {
    return null;
  }

  return {
    id: document._id!.toString(),
    title: document.title,
    fileName: document.fileName,
    mimeType: document.mimeType,
    data: normaliseBinaryData(document.data),
  };
}
