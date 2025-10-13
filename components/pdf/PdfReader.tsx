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
    <section className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl border border-white/10 bg-neutral-950/80 text-neutral-100">
      <header className="flex items-center justify-between border-b border-white/5 px-6 py-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <p className="text-xs text-neutral-400">Mã tài liệu: {documentId}</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-neutral-300">
          <button
            type="button"
            onClick={() => goToPage(pageNumber - 1)}
            className="rounded-md border border-white/10 px-3 py-1 transition hover:border-white/30"
          >
            Trang trước
          </button>
          <span className="text-xs font-mono">
            {pageNumber}/{numPages || "-"}
          </span>
          <button
            type="button"
            onClick={() => goToPage(pageNumber + 1)}
            className="rounded-md border border-white/10 px-3 py-1 transition hover:border-white/30"
          >
            Trang sau
          </button>
        </div>
      </header>
      <div className="flex items-center gap-3 border-b border-white/5 px-6 py-3">
        <input
          type="range"
          min={1}
          max={Math.max(numPages, 1)}
          value={pageNumber}
          onChange={(event) => goToPage(Number(event.target.value))}
          className="flex-1 accent-amber-500"
        />
        <span className="text-xs text-neutral-400">{Math.round((pageNumber / Math.max(numPages, 1)) * 100)}%</span>
      </div>
      <div
        ref={containerRef}
        className="pdf-viewer flex flex-1 justify-center overflow-auto bg-neutral-950 p-6"
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
          <p className="mt-6 rounded-md border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {loadError}
          </p>
        ) : null}
      </div>
    </section>
  );
}
