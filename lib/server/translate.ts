import { getEnvironment } from "@/lib/env";

export interface LibreTranslatePayload {
  q: string;
  source: string;
  target: string;
  format: "text" | "html";
}

export interface TranslationRequestBody {
  text: string;
  targetLanguage: string;
  sourceLanguage?: string;
}

export interface TranslationResponse {
  translatedText: string;
}

/**
 * Builds the request payload expected by the LibreTranslate API while enforcing
 * sane defaults (auto-detection for the source language and plain text format).
 */
export function buildLibreTranslatePayload(
  request: TranslationRequestBody
): LibreTranslatePayload {
  if (!request.text || !request.text.trim()) {
    throw new Error("Translation text must not be empty");
  }

  const targetLanguage = request.targetLanguage?.trim();
  if (!targetLanguage) {
    throw new Error("targetLanguage is required");
  }

  return {
    q: request.text,
    source: request.sourceLanguage?.trim() || "auto",
    target: targetLanguage,
    format: "text",
  };
}

/**
 * Performs the remote call against the LibreTranslate endpoint.
 */
export async function requestTranslation(
  request: TranslationRequestBody,
  fetchImpl: typeof fetch = fetch
): Promise<TranslationResponse> {
  const payload = buildLibreTranslatePayload(request);
  const { libreTranslateUrl } = getEnvironment();

  const response = await fetchImpl(libreTranslateUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LibreTranslate request failed with status ${response.status}: ${errorText}`
    );
  }

  const json = (await response.json()) as TranslationResponse;
  if (!json.translatedText) {
    throw new Error("Unexpected LibreTranslate response shape");
  }

  return json;
}
