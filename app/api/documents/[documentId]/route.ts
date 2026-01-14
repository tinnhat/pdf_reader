import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import { deleteStoredDocument } from "@/lib/repositories/documentsRepository";
import { deleteNotesByDocumentId } from "@/lib/repositories/notesRepository";
import { deleteProgressByDocumentId } from "@/lib/repositories/progressRepository";

export const runtime = "nodejs";
export const revalidate = 0;

function resolveUserId(request: NextRequest, explicitUserId?: string | null) {
  return explicitUserId ?? request.headers.get("x-user-id") ?? DEMO_USER_ID;
}

export async function DELETE(request: NextRequest, context: any) {
  const params = await context.params;
  const { documentId } = params;
  const userId = resolveUserId(request, request.nextUrl.searchParams.get("userId"));

  // Delete notes first
  await deleteNotesByDocumentId(userId, documentId);

  // Delete progress
  await deleteProgressByDocumentId(userId, documentId);

  // Then delete the document
  const deleted = await deleteStoredDocument(userId, documentId);

  if (!deleted) {
    return NextResponse.json(
      { error: "Document not found or already deleted" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}