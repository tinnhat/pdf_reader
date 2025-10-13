"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/layout/AppHeader";
import { DocumentLibrary } from "@/components/library/DocumentLibrary";
import { NewDocumentForm } from "@/components/library/NewDocumentForm";
import { PdfReader } from "@/components/pdf/PdfReader";
import { NoteComposer } from "@/components/notes/NoteComposer";
import { NoteList } from "@/components/notes/NoteList";
import { TranslationPanel } from "@/components/translation/TranslationPanel";
import { ReaderDocument } from "@/lib/types";
import { DEMO_USER_ID } from "@/lib/constants";
import { useReadingProgress } from "@/hooks/useReadingProgress";
import { useNotes } from "@/hooks/useNotes";

const DEFAULT_DOCUMENTS: ReaderDocument[] = [
  {
    id: "sample",
    title: "Hướng dẫn sử dụng My PDF Desk",
    source: { type: "url", url: "/sample.pdf" },
  },
];

export default function HomePage() {
  const [documents, setDocuments] = useState<ReaderDocument[]>(DEFAULT_DOCUMENTS);
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>(
    DEFAULT_DOCUMENTS[0]?.id
  );
  const [selectedText, setSelectedText] = useState<string>("");

  const activeDocument = useMemo(
    () => documents.find((document) => document.id === activeDocumentId),
    [documents, activeDocumentId]
  );

  const { progress, updateProgress, isLoading: isProgressLoading } =
    useReadingProgress({
      documentId: activeDocument?.id,
      userId: DEMO_USER_ID,
    });

  const { notes, addNote, isLoading: isNotesLoading } = useNotes({
    documentId: activeDocument?.id,
    userId: DEMO_USER_ID,
  });

  function handleDocumentCreated(document: ReaderDocument) {
    setDocuments((current) => [document, ...current]);
    setActiveDocumentId(document.id);
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-6 py-8">
        <section className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-6">
            <DocumentLibrary
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSelect={setActiveDocumentId}
            />
            <NewDocumentForm onDocumentCreated={handleDocumentCreated} />
            <div className="rounded-lg border border-white/10 bg-neutral-950/60 p-4 text-sm text-neutral-200">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-neutral-400">
                Tiến độ đọc
              </h3>
              {isProgressLoading ? (
                <p>Đang tải tiến độ...</p>
              ) : progress ? (
                <dl className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <dt>Trang hiện tại</dt>
                    <dd className="font-mono text-white">{progress.page}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt>Tổng số trang</dt>
                    <dd className="font-mono text-white">{progress.totalPages}</dd>
                  </div>
                  <div className="flex justify-between text-xs text-neutral-400">
                    <dt>Cập nhật lần cuối</dt>
                    <dd>{new Date(progress.updatedAt).toLocaleString()}</dd>
                  </div>
                </dl>
              ) : (
                <p>Chưa có dữ liệu tiến độ nào.</p>
              )}
            </div>
          </div>
          {activeDocument ? (
            <PdfReader
              documentId={activeDocument.id}
              title={activeDocument.title}
              source={activeDocument.source}
              progress={progress}
              onProgressCommit={updateProgress}
              onTextSelected={setSelectedText}
            />
          ) : (
            <div className="flex items-center justify-center rounded-2xl border border-dashed border-white/10 bg-neutral-950/50 text-neutral-300">
              Chọn hoặc thêm một tài liệu để bắt đầu đọc.
            </div>
          )}
        </section>
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-4">
            <NoteComposer
              onCreate={async (note) => {
                if (!activeDocument) return;
                await addNote(note);
              }}
              defaultPage={progress?.page}
            />
            <NoteList notes={notes} isLoading={isNotesLoading} />
          </div>
          <TranslationPanel selectedText={selectedText} />
        </section>
      </main>
    </div>
  );
}
