import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import { deleteNoteById, updateNote } from "@/lib/repositories/notesRepository";
import {
  extractPlainText,
  sanitizeNoteContent,
} from "@/lib/server/sanitize";

export const runtime = "nodejs";
export const revalidate = 0;

function resolveUserId(request: NextRequest, explicitUserId?: string | null) {
  return explicitUserId ?? request.headers.get("x-user-id") ?? DEMO_USER_ID;
}

export async function PUT(request: NextRequest, context: any) {
  const params = await context.params;
  const { noteId } = params;
  const userId = resolveUserId(request, request.nextUrl.searchParams.get("userId"));
  const payload = await request.json();

  const rawContent = typeof payload.content === "string" ? payload.content : "";
  const sanitizedContent = sanitizeNoteContent(rawContent);
  const plainText = extractPlainText(sanitizedContent);
  const page = payload.page ? Number(payload.page) : undefined;

  const hasContent =
    Boolean(plainText) || /<img\b/i.test(sanitizedContent ?? "");

  if (!sanitizedContent || !hasContent) {
    return NextResponse.json(
      { error: "Nội dung ghi chú là bắt buộc" },
      { status: 400 }
    );
  }

  const updatedNote = await updateNote(userId, noteId, {
    content: sanitizedContent,
    plainText,
    page: page && !Number.isNaN(page) ? page : undefined,
  });

  if (!updatedNote) {
    return NextResponse.json(
      { error: "Note not found or update failed" },
      { status: 404 }
    );
  }

  return NextResponse.json(updatedNote);
}

export async function DELETE(request: NextRequest, context: any) {
  const params = await context.params;
  const { noteId } = params;
  const userId = resolveUserId(request, request.nextUrl.searchParams.get("userId"));

  const deleted = await deleteNoteById(userId, noteId);

  if (!deleted) {
    return NextResponse.json(
      { error: "Note not found or already deleted" },
      { status: 404 }
    );
  }

  return NextResponse.json({ success: true });
}