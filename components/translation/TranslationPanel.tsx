"use client";

import { FormEvent, useEffect, useState } from "react";

const SUPPORTED_LANGUAGES = [
  { code: "en", label: "English" },
  { code: "vi", label: "Tiếng Việt" },
  { code: "fr", label: "Français" },
  { code: "es", label: "Español" },
  { code: "de", label: "Deutsch" },
];

interface TranslationPanelProps {
  selectedText?: string;
}

/**
 * Provides a small UI to call into the LibreTranslate-backed API route. The
 * component is intentionally resilient and will surface helpful errors when the
 * remote service is not reachable.
 */
export function TranslationPanel({ selectedText }: TranslationPanelProps) {
  const [sourceLanguage, setSourceLanguage] = useState("auto");
  const [targetLanguage, setTargetLanguage] = useState("vi");
  const [text, setText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedText) {
      setText(selectedText);
    }
  }, [selectedText]);

  async function handleTranslate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!text.trim()) {
      setError("Vui lòng nhập nội dung cần dịch");
      return;
    }

    try {
      setIsLoading(true);
      const response = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          targetLanguage,
          sourceLanguage: sourceLanguage === "auto" ? undefined : sourceLanguage,
        }),
      });

      if (!response.ok) {
        const json = await response.json();
        throw new Error(json.error ?? "Yêu cầu dịch thất bại");
      }

      const json = (await response.json()) as { translatedText: string };
      setTranslatedText(json.translatedText);
    } catch (translateError) {
      console.error(translateError);
      setError(
        translateError instanceof Error
          ? translateError.message
          : "Không thể kết nối tới dịch vụ dịch"
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-neutral-950/70 p-5 text-sm text-neutral-200">
      <h2 className="mb-4 text-lg font-semibold text-white">Dịch nhanh</h2>
      <form className="space-y-3" onSubmit={handleTranslate}>
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-neutral-400">
          <label className="flex flex-col gap-1">
            Ngôn ngữ nguồn
            <select
              value={sourceLanguage}
              onChange={(event) => setSourceLanguage(event.target.value)}
              className="rounded-md border border-white/10 bg-neutral-900 px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              <option value="auto">Tự động</option>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1">
            Ngôn ngữ đích
            <select
              value={targetLanguage}
              onChange={(event) => setTargetLanguage(event.target.value)}
              className="rounded-md border border-white/10 bg-neutral-900 px-2 py-1 text-sm text-white focus:border-amber-500 focus:outline-none"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={4}
          placeholder="Dán hoặc chọn nội dung từ tài liệu để dịch..."
          className="w-full rounded-md border border-white/10 bg-neutral-900 px-3 py-2 text-sm text-white focus:border-amber-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-md bg-sky-500 px-4 py-2 text-sm font-semibold text-neutral-900 transition hover:bg-sky-400 disabled:cursor-wait disabled:bg-sky-700/70"
        >
          {isLoading ? "Đang dịch..." : "Dịch ngay"}
        </button>
      </form>
      {error ? (
        <p className="mt-3 rounded-md border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-300">{error}</p>
      ) : null}
      {translatedText ? (
        <article className="mt-4 rounded-md border border-emerald-500/40 bg-emerald-500/10 p-3 text-sm text-emerald-100">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-200">
            Kết quả
          </h3>
          <p className="whitespace-pre-line">{translatedText}</p>
        </article>
      ) : null}
    </section>
  );
}
