import { NextRequest, NextResponse } from "next/server";
import {
  requestTranslation,
  TranslationRequestBody,
} from "@/lib/server/translate";

export const runtime = "nodejs";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as TranslationRequestBody;

  try {
    const translation = await requestTranslation(payload);
    return NextResponse.json(translation);
  } catch (error) {
    console.error("Translation request failed", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
