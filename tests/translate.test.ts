import { describe, expect, it, vi } from "vitest";
import {
  buildLibreTranslatePayload,
  requestTranslation,
} from "@/lib/server/translate";

describe("buildLibreTranslatePayload", () => {
  it("throws when the text is empty", () => {
    expect(() =>
      buildLibreTranslatePayload({ text: "  ", targetLanguage: "vi" })
    ).toThrowError(/must not be empty/);
  });

  it("applies defaults for source language and format", () => {
    const payload = buildLibreTranslatePayload({
      text: "Hello",
      targetLanguage: "vi",
    });

    expect(payload).toEqual({
      q: "Hello",
      source: "auto",
      target: "vi",
      format: "text",
    });
  });
});

describe("requestTranslation", () => {
  it("sends the expected payload to LibreTranslate", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ translatedText: "Xin chào" }),
    });

    const response = await requestTranslation(
      { text: "Hello", targetLanguage: "vi" },
      fetchMock
    );

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toBe(process.env.LIBRE_TRANSLATE_URL);
    expect(options?.method).toBe("POST");
    expect(options?.headers).toMatchObject({ "Content-Type": "application/json" });
    expect(options?.body).toBe(JSON.stringify({
      q: "Hello",
      source: "auto",
      target: "vi",
      format: "text",
    }));
    expect(response.translatedText).toBe("Xin chào");
  });

  it("throws a descriptive error when the HTTP call fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 502,
      text: async () => "Bad Gateway",
    });

    await expect(
      requestTranslation({ text: "Hello", targetLanguage: "vi" }, fetchMock)
    ).rejects.toThrow(/502/);
  });
});
