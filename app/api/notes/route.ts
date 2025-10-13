import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import { createNote, listNotes } from "@/lib/repositories/notesRepository";

export const runtime = "nodejs";
export const revalidate = 0;

function resolveUserId(request: NextRequest, explicitUserId?: string | null) {
  return explicitUserId ?? request.headers.get("x-user-id") ?? DEMO_USER_ID;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const documentId = searchParams.get("documentId");
  if (!documentId) {
    return NextResponse.json(
      { error: "documentId is required" },
      { status: 400 }
    );
  }

  const userId = resolveUserId(request, searchParams.get("userId"));
  const notes = await listNotes(userId, documentId);
  return NextResponse.json(notes);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const documentId = payload.documentId;
  const userId = resolveUserId(request, payload.userId);
  const text = payload.text?.trim();
  const page = payload.page ? Number(payload.page) : undefined;

  if (!documentId || !text) {
    return NextResponse.json(
      { error: "documentId and text are required" },
      { status: 400 }
    );
  }

  const note = await createNote({
    userId,
    documentId,
    text,
    page: page && !Number.isNaN(page) ? page : undefined,
  });

  return NextResponse.json(note, { status: 201 });
}
