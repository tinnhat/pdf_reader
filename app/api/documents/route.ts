import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  insertStoredDocument,
  listStoredDocuments,
} from "@/lib/repositories/documentsRepository";

export const runtime = "nodejs";
export const revalidate = 0;

function resolveUserId(request: NextRequest, explicitUserId?: string | null) {
  return explicitUserId ?? request.headers.get("x-user-id") ?? DEMO_USER_ID;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = resolveUserId(request, searchParams.get("userId"));

  const documents = await listStoredDocuments(userId);
  return NextResponse.json(
    documents.map((document) => ({
      id: document.id,
      title: document.title,
      source: {
        type: "stored" as const,
        documentId: document.id,
        fileName: document.fileName,
      },
    }))
  );
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: "file is required" },
      { status: 400 }
    );
  }

  if (file.type !== "application/pdf") {
    return NextResponse.json(
      { error: "Only PDF files are supported" },
      { status: 400 }
    );
  }

  const titleEntry = formData.get("title");
  const userId = resolveUserId(request, formData.get("userId")?.toString() ?? null);
  const title = (typeof titleEntry === "string" && titleEntry.trim()) ||
    file.name.replace(/\.pdf$/i, "");

  const buffer = Buffer.from(await file.arrayBuffer());

  const document = await insertStoredDocument({
    userId,
    title,
    fileName: file.name,
    mimeType: file.type || "application/pdf",
    data: buffer,
  });

  return NextResponse.json(
    {
      id: document.id,
      title: document.title,
      source: {
        type: "stored" as const,
        documentId: document.id,
        fileName: document.fileName,
      },
    },
    { status: 201 }
  );
}
