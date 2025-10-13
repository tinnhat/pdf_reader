import { NextRequest, NextResponse } from "next/server";

type LibreTranslateResponse = {
  translatedText?: string;
  translated_text?: string;
  translation?: string;
};

type RequestPayload = {
  text: string;
  source?: string;
  target: string;
};

export async function POST(request: NextRequest) {
  const { text, source = "auto", target }: RequestPayload = await request.json();

  if (!text?.trim() || !target?.trim()) {
    return NextResponse.json({ error: "Missing text or target language." }, { status: 400 });
  }

  const endpoint = process.env.LIBRETRANSLATE_URL ?? "https://libretranslate.com";
  const apiKey = process.env.LIBRETRANSLATE_API_KEY;

  try {
    const response = await fetch(`${endpoint.replace(/\/$/, "")}/translate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        q: text,
        source,
        target,
        format: "text",
        api_key: apiKey?.trim() ? apiKey : undefined,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("LibreTranslate error", response.status, errorBody);
      return NextResponse.json(
        { error: "LibreTranslate request failed." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as LibreTranslateResponse;
    const translatedText = data.translatedText ?? data.translated_text ?? data.translation;

    return NextResponse.json({ translatedText });
  } catch (error) {
    console.error("LibreTranslate request error", error);
    return NextResponse.json(
      { error: "Failed to reach LibreTranslate." },
      { status: 500 }
    );
  }
}
