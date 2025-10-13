"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { DocumentSource, ReadingProgress } from "@/lib/types";

// Configure the PDF.js worker once on the client.
if (typeof window !== "undefined") {
  const workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
  if (pdfjs.GlobalWorkerOptions.workerSrc !== workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;
  }
}

interface PdfReaderProps {
  documentId: string;
  title: string;
  source: DocumentSource;
  progress: ReadingProgress | null | undefined;
  onProgressCommit: (progress: { page: number; totalPages: number }) => void;
  onTextSelected?: (text: string) => void;
}

/**
 * Wrapper around `react-pdf` that surfaces navigation controls and reports
 * reading progress back to the caller.
 */
export function PdfReader({
  documentId,
  title,
  source,
  progress,
  onProgressCommit,
  onTextSelected,
}: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [numPages, setNumPages] = useState(progress?.totalPages ?? 0);
  const [pageNumber, setPageNumber] = useState(progress?.page ?? 1);
  const [loadError, setLoadError] = useState<string | null>(null);

  // When the server notifies about a change we resynchronise local state.
  useEffect(() => {
    if (progress) {
      setNumPages(progress.totalPages);
      setPageNumber(progress.page);
    }
  }, [documentId, progress?.page, progress?.totalPages]);

  // Guard to ensure we only send updates after the document is ready.
  const isDocumentReady = useMemo(() => numPages > 0, [numPages]);

  const reactPdfSource = useMemo(() => {
    if (source.type === "url") {
      return source.url;
    }
    return { data: source.data };
  }, [source]);

  function handleLoadSuccess({ numPages: detectedPages }: { numPages: number }) {
    setNumPages(detectedPages);
    // Persist the detected number of pages and ensure the stored page is valid.
    onProgressCommit({
      page: Math.min(pageNumber, detectedPages),
      totalPages: detectedPages,
    });
    setLoadError(null);
  }

  function handleLoadError(error: Error) {
    console.error(error);
    setLoadError("Không thể tải tài liệu PDF.");
  }

  function goToPage(newPage: number) {
    const safePage = Math.max(1, Math.min(newPage, Math.max(numPages, 1)));
    setPageNumber(safePage);
    if (isDocumentReady) {
      onProgressCommit({ page: safePage, totalPages: Math.max(numPages, 1) });
    }
  }

  useEffect(() => {
    if (!onTextSelected) return;
    const element = containerRef.current;
    if (!element) return;

    const handleMouseUp = () => {
      const selection = window.getSelection();
      const text = selection?.toString()?.trim();
      const anchorNode = selection?.anchorNode;
      if (!text || !anchorNode) return;
      if (element.contains(anchorNode)) {
        onTextSelected(text);
      }
    };

    element.addEventListener("mouseup", handleMouseUp);
    return () => element.removeEventListener("mouseup", handleMouseUp);
  }, [onTextSelected]);

  return (
    <section className="glass-panel flex h-full flex-1 flex-col overflow-hidden text-slate-900 dark:text-slate-100">
      <header className="flex flex-col gap-4 border-b border-slate-200/60 px-6 py-5 dark:border-slate-800/60 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h2>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Mã tài liệu: <span className="font-mono">{documentId}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <button
            type="button"
            onClick={() => goToPage(pageNumber - 1)}
            className="rounded-lg border border-slate-200/60 px-3 py-2 transition hover:border-sky-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700/60 dark:hover:border-sky-500 dark:hover:text-white dark:focus-visible:ring-sky-500/30"
          >
            Trang trước
          </button>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-800/70 dark:text-slate-200">
            {pageNumber}/{numPages || "-"}
          </span>
          <button
            type="button"
            onClick={() => goToPage(pageNumber + 1)}
            className="rounded-lg border border-slate-200/60 px-3 py-2 transition hover:border-sky-300 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-200 dark:border-slate-700/60 dark:hover:border-sky-500 dark:hover:text-white dark:focus-visible:ring-sky-500/30"
          >
            Trang sau
          </button>
        </div>
      </header>
      <div className="flex flex-col gap-3 border-b border-slate-200/60 px-6 py-4 dark:border-slate-800/60">
        <div className="flex items-center justify-between text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <span>Tiến độ</span>
          <span>{Math.round((pageNumber / Math.max(numPages, 1)) * 100)}%</span>
        </div>
        <input
          type="range"
          min={1}
          max={Math.max(numPages, 1)}
          value={pageNumber}
          onChange={(event) => goToPage(Number(event.target.value))}
          className="h-1.5 w-full cursor-pointer rounded-full bg-slate-200 accent-sky-500 dark:bg-slate-800"
        />
      </div>
      <div
        ref={containerRef}
        className="pdf-viewer flex flex-1 justify-center overflow-auto bg-slate-100/80 p-6 dark:bg-slate-950"
      >
        <Document
          file={reactPdfSource}
          onLoadSuccess={handleLoadSuccess}
          onLoadError={handleLoadError}
          className="flex justify-center"
        >
          <Page
            className="pdf-viewer-page shadow-lg shadow-black/50"
            pageNumber={pageNumber}
            width={720}
            renderAnnotationLayer
            renderTextLayer
          />
        </Document>
        {loadError ? (
          <p className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300">
            {loadError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
