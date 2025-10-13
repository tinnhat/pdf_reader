/**
 * Shared TypeScript interfaces used by both the server and client portions of
 * the reader. Keeping the shapes co-located makes it easier to reason about the
 * payloads exchanged with MongoDB as well as the API routes.
 */
export interface ReadingProgress {
  /** Unique identifier for the reader. In this starter we keep a single demo user. */
  userId: string;
  /** Logical identifier of the PDF document being read. */
  documentId: string;
  /** Last page that the reader visited. Page numbers are one-indexed. */
  page: number;
  /** Total amount of pages detected in the PDF. */
  totalPages: number;
  /** ISO timestamp describing when the progress was last updated. */
  updatedAt: string;
}

export interface Note {
  /** Unique identifier generated server-side for the note. */
  _id?: string;
  userId: string;
  documentId: string;
  /** Optional page reference for contextual notes. */
  page?: number;
  /** Free-form content written by the reader. */
  text: string;
  createdAt: string;
}

/**
 * Front-end representation of a document that can be opened inside the viewer.
 * A document can either be a remote URL or a locally uploaded file that is kept
 * in memory for the current session.
 */
export interface ReaderDocument {
  id: string;
  title: string;
  source: DocumentSource;
}

export type DocumentSource =
  | { type: "url"; url: string }
  | { type: "file"; data: Uint8Array; name: string };
