'use client'

import { useEffect, useMemo, useState } from 'react'
import { AppHeader } from '@/components/layout/AppHeader'
import { DocumentLibrary } from '@/components/library/DocumentLibrary'
import { NewDocumentForm } from '@/components/library/NewDocumentForm'
import { PdfReader } from '@/components/pdf/PdfReader'
import { NoteComposer } from '@/components/notes/NoteComposer'
import { NoteList } from '@/components/notes/NoteList'
import { ReaderDocument } from '@/lib/types'
import { DEMO_USER_ID } from '@/lib/constants'
import { useReadingProgress } from '@/hooks/useReadingProgress'
import { useNotes } from '@/hooks/useNotes'

export default function HomePage() {
  const [storedDocuments, setStoredDocuments] = useState<ReaderDocument[]>([])
  const documents = useMemo(() => [...storedDocuments], [storedDocuments])
  const [activeDocumentId, setActiveDocumentId] = useState<string | undefined>(
    () => documents[0]?.id
  )
  const [selectedText, setSelectedText] = useState<string>('')

  useEffect(() => {
    let cancelled = false

    async function loadDocuments() {
      try {
        const response = await fetch(`/api/documents?userId=${DEMO_USER_ID}`)
        if (!response.ok) {
          throw new Error(`Failed to fetch documents: ${response.status}`)
        }

        const payload = (await response.json()) as ReaderDocument[]
        if (!cancelled) {
          setStoredDocuments(payload)
          setActiveDocumentId(current => {
            if (!current) {
              return payload[0]?.id ?? undefined
            }

            if (current === documents[0]?.id && payload[0]) {
              return payload[0].id
            }

            return current
          })
        }
      } catch (documentsError) {
        console.error(documentsError)
      }
    }

    loadDocuments()
    return () => {
      cancelled = true
    }
  }, [])

  const activeDocument = useMemo(
    () => documents.find(document => document.id === activeDocumentId),
    [documents, activeDocumentId]
  )

  const {
    progress,
    updateProgress,
    isLoading: isProgressLoading,
  } = useReadingProgress({
    documentId: activeDocument?.id,
    userId: DEMO_USER_ID,
  })

  const {
    notes,
    addNote,
    editNote,
    deleteNote,
    isLoading: isNotesLoading,
  } = useNotes({
    documentId: activeDocument?.id,
    userId: DEMO_USER_ID,
  })

  function handleDocumentCreated(document: ReaderDocument) {
    setStoredDocuments(current => [document, ...current])
    setActiveDocumentId(document.id)
  }

  async function handleDocumentDelete(documentId: string) {
    try {
      const response = await fetch(`/api/documents/${documentId}?userId=${DEMO_USER_ID}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json();
        throw new Error(payload.error ?? "Unable to delete document");
      }

      // Remove from local state
      setStoredDocuments(current => current.filter(doc => doc.id !== documentId));

      // If the deleted document was active, switch to another one
      if (activeDocumentId === documentId) {
        const remainingDocs = storedDocuments.filter(doc => doc.id !== documentId);
        setActiveDocumentId(remainingDocs[0]?.id);
      }
    } catch (error) {
      console.error("Failed to delete document:", error);
      alert("Không thể xóa tài liệu. Vui lòng thử lại.");
    }
  }

  function onGoToNote(note: { page?: number }) { {
    if (note.page && activeDocument) {
      updateProgress({ page: note.page, totalPages: progress?.totalPages || 0 })
    }
  } }

  return (
    <div className='flex min-h-screen flex-col'>
      <AppHeader />
      <main className='mx-auto flex w-full flex-1 flex-col gap-10 px-6 py-2'>
        <section className='grid flex-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]'>
          <div className='space-y-6'>
            <DocumentLibrary
              documents={documents}
              activeDocumentId={activeDocumentId}
              onSelect={setActiveDocumentId}
              onDelete={handleDocumentDelete}
            />
            <NewDocumentForm onDocumentCreated={handleDocumentCreated} />
             <div className='glass-panel space-y-4 p-5 text-sm text-slate-600 dark:text-slate-200'>
            <div>
              <h3 className='text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400'>
                Tiến độ đọc
              </h3>             
            </div>
            {isProgressLoading ? (
              <p className='text-xs text-slate-500'>Đang tải tiến độ...</p>
            ) : progress ? (
              <dl className='grid gap-3 text-sm'>
                <div className='flex items-center justify-between rounded-lg bg-slate-100/70 px-3 py-2 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'>
                  <dt className='text-xs uppercase tracking-wide'>Trang hiện tại</dt>
                  <dd className='font-mono text-base font-semibold'>{progress.page}</dd>
                </div>
                <div className='flex items-center justify-between rounded-lg bg-slate-100/70 px-3 py-2 text-slate-700 dark:bg-slate-800/60 dark:text-slate-200'>
                  <dt className='text-xs uppercase tracking-wide'>Tổng số trang</dt>
                  <dd className='font-mono text-base font-semibold'>{progress.totalPages}</dd>
                </div>
                <div className='rounded-lg bg-slate-50/80 px-3 py-2 text-xs text-slate-500 dark:bg-slate-900/50 dark:text-slate-400'>
                  <dt className='uppercase tracking-wide'>Cập nhật lần cuối</dt>
                  <dd className='mt-1 font-mono text-sm text-slate-600 dark:text-slate-300'>
                    {new Date(progress.updatedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className='text-xs text-slate-500'>Chưa có dữ liệu tiến độ nào.</p>
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
            <div className='glass-panel flex items-center justify-center rounded-2xl border-dashed border-slate-300/60 bg-white/70 p-10 text-center text-slate-500 dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-300'>
              <div>
                <p className='text-base font-medium'>Chưa có tài liệu được chọn</p>
                <p className='mt-1 text-sm'>Thêm PDF mới hoặc chọn từ thư viện để bắt đầu.</p>
              </div>
            </div>
          )}
        </section>
        <section className='w-full'>
          <div className='space-y-6'>
            <NoteComposer
              onCreate={async note => {
                if (!activeDocument) return
                await addNote(note)
              }}
              defaultPage={progress?.page}
            />
            <NoteList 
              notes={notes} 
              isLoading={isNotesLoading} 
              onGoToNote={onGoToNote}
              onEdit={editNote}
              onDelete={deleteNote}
            />
          </div>
         
        </section>
      </main>
    </div>
  )
}
