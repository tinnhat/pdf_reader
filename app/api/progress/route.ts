import { NextRequest, NextResponse } from "next/server";
import { DEMO_USER_ID } from "@/lib/constants";
import {
  findProgress,
  upsertProgress,
} from "@/lib/repositories/progressRepository";

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
  const progress = await findProgress(userId, documentId);
  return NextResponse.json(progress);
}

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const documentId = payload.documentId;
  const userId = resolveUserId(request, payload.userId);
  const page = Number(payload.page);
  const totalPages = Number(payload.totalPages);

  if (!documentId || Number.isNaN(page) || Number.isNaN(totalPages)) {
    return NextResponse.json(
      { error: "documentId, page and totalPages are required" },
      { status: 400 }
    );
  }

  const clampedPage = Math.max(1, Math.min(page, Math.max(totalPages, 1)));
  const progress = await upsertProgress({
    userId,
    documentId,
    page: clampedPage,
    totalPages: Math.max(totalPages, 1),
  });

  return NextResponse.json(progress, { status: 200 });
}
