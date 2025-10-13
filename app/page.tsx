"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  Timestamp,
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Document, Page, pdfjs } from "react-pdf";
import type { PDFDocumentProxy } from "pdfjs-dist";

import { getFirebaseClient } from "@/lib/firebase";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

type DocumentRecord = {
  id: string;
  name: string;
  ownerId: string;
  storagePath: string;
  createdAt?: Date | null;
};

type NoteRecord = {
  id: string;
  userId: string;
  displayName?: string;
  pageNumber?: number;
  text: string;
  translatedText?: string;
  createdAt?: Date | null;
};

type FirebaseServices = ReturnType<typeof getFirebaseClient>;

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const languages = [
  { code: "vi", label: "Tiếng Việt" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "ko", label: "한국어" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "zh", label: "中文" },
];

function formatRelative(date?: Date | null) {
  if (!date) return "";
  const delta = Date.now() - date.getTime();
  const minutes = Math.floor(delta / 60000);
  if (minutes < 1) return "Vừa xong";
  if (minutes < 60) return `${minutes} phút trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} ngày trước`;
  return date.toLocaleDateString();
}

function timestampToDate(value: unknown): Date | null {
  if (value instanceof Timestamp) {
    return value.toDate();
  }
  return null;
}

export default function Home() {
  const [services, setServices] = useState<FirebaseServices | null>(null);
  const [firebaseError, setFirebaseError] = useState<string | null>(null);
  const [initialisingAuth, setInitialisingAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [lastSyncedPage, setLastSyncedPage] = useState<number | null>(null);
  const [lastSyncedTotalPages, setLastSyncedTotalPages] = useState<number | null>(null);
  const [notes, setNotes] = useState<NoteRecord[]>([]);
  const [newNote, setNewNote] = useState<string>("");
  const [targetLanguage, setTargetLanguage] = useState<string>("vi");
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!statusMessage) return;
    const timeout = window.setTimeout(() => setStatusMessage(null), 5000);
    return () => window.clearTimeout(timeout);
  }, [statusMessage]);

  useEffect(() => {
    try {
      const firebase = getFirebaseClient();
      setServices(firebase);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể khởi tạo Firebase.";
      setFirebaseError(message);
      setInitialisingAuth(false);
    }
  }, []);

  useEffect(() => {
    if (!services?.auth) return;

    const unsubscribe = onAuthStateChanged(services.auth, (firebaseUser) => {
      setUser(firebaseUser);
      setInitialisingAuth(false);
    });

    return () => unsubscribe();
  }, [services?.auth]);

  useEffect(() => {
    if (!services?.db || !user) {
      setDocuments([]);
      return;
    }

    const documentsRef = collection(services.db, "documents");
    const documentsQuery = query(
      documentsRef,
      where("ownerId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(documentsQuery, (snapshot) => {
      const docs = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          name: String(data.name ?? "Tài liệu"),
          ownerId: String(data.ownerId ?? user.uid),
          storagePath: String(data.storagePath ?? ""),
          createdAt: timestampToDate(data.createdAt) ?? null,
        } satisfies DocumentRecord;
      });
      setDocuments(docs);
    });

    return () => unsubscribe();
  }, [services?.db, user]);

  useEffect(() => {
    if (documents.length === 0) {
      setSelectedDocumentId(null);
      return;
    }

    setSelectedDocumentId((previous) => previous ?? documents[0]?.id ?? null);
  }, [documents]);

  const selectedDocument = useMemo(
    () => documents.find((doc) => doc.id === selectedDocumentId) ?? null,
    [documents, selectedDocumentId]
  );

  useEffect(() => {
    if (!services?.storage || !selectedDocument) {
      setPdfUrl(null);
      setTotalPages(0);
      setCurrentPage(1);
      setLastSyncedPage(null);
      return;
    }

    let isCancelled = false;
    const fetchUrl = async () => {
      try {
        const fileRef = ref(services.storage, selectedDocument.storagePath);
        const url = await getDownloadURL(fileRef);
        if (!isCancelled) {
          setPdfUrl(url);
        }
      } catch (error) {
        console.error("Tải file thất bại", error);
        if (!isCancelled) {
          setStatusMessage("Không thể lấy file PDF. Kiểm tra quyền truy cập hoặc cấu hình Firebase Storage.");
        }
      }
    };

    fetchUrl();

    return () => {
      isCancelled = true;
    };
  }, [services?.storage, selectedDocument]);

  useEffect(() => {
    if (!services?.db || !user || !selectedDocument) {
      setNotes([]);
      return;
    }

    const notesRef = collection(services.db, "documents", selectedDocument.id, "notes");
    const notesQuery = query(notesRef, orderBy("createdAt", "desc"), limit(100));

    const unsubscribe = onSnapshot(notesQuery, (snapshot) => {
      const items: NoteRecord[] = snapshot.docs.map((noteDoc) => {
        const data = noteDoc.data();
        return {
          id: noteDoc.id,
          userId: String(data.userId ?? ""),
          displayName: data.displayName ? String(data.displayName) : undefined,
          pageNumber: typeof data.pageNumber === "number" ? data.pageNumber : undefined,
          text: String(data.text ?? ""),
          translatedText: data.translatedText ? String(data.translatedText) : undefined,
          createdAt: timestampToDate(data.createdAt),
        };
      });
      setNotes(items);
    });

    return () => unsubscribe();
  }, [services?.db, selectedDocument, user]);

  useEffect(() => {
    if (!services?.db || !user || !selectedDocument) {
      setLastSyncedPage(null);
      return;
    }

    const progressRef = doc(services.db, "documents", selectedDocument.id, "users", user.uid);

    const unsubscribe = onSnapshot(progressRef, (snapshot) => {
      if (!snapshot.exists()) {
        setLastSyncedPage(null);
        setLastSyncedTotalPages(null);
        setCurrentPage(1);
        return;
      }

      const data = snapshot.data();
      const page = typeof data.page === "number" && data.page > 0 ? data.page : 1;
      const total = typeof data.numPages === "number" && data.numPages > 0 ? data.numPages : undefined;
      setLastSyncedPage(page);
      setLastSyncedTotalPages(total ?? null);
      setCurrentPage(page);
      if (total) {
        setTotalPages(total);
      }
    });

    return () => unsubscribe();
  }, [services?.db, selectedDocument, user]);

  useEffect(() => {
    if (!services?.db || !user || !selectedDocument) return;
    if (currentPage <= 0) return;
    const normalisedTotal = totalPages > 0 ? totalPages : null;
    if (lastSyncedPage === currentPage && lastSyncedTotalPages === normalisedTotal) return;

    const updateProgress = async () => {
      try {
        const db = services.db;
        if (!db) return;
        const progressRef = doc(db, "documents", selectedDocument.id, "users", user.uid);
        setLastSyncedPage(currentPage);
        setLastSyncedTotalPages(normalisedTotal);
        await setDoc(
          progressRef,
          {
            page: currentPage,
            numPages: normalisedTotal,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Cập nhật tiến độ thất bại", error);
      }
    };

    updateProgress();
  }, [
    services?.db,
    selectedDocument,
    user,
    currentPage,
    totalPages,
    lastSyncedPage,
    lastSyncedTotalPages,
  ]);

  const handleUpload = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!services?.storage || !services.db || !user) {
        setStatusMessage("Cần đăng nhập và cấu hình Firebase để tải PDF.");
        return;
      }

      const file = fileInputRef.current?.files?.[0];
      if (!file) {
        setStatusMessage("Vui lòng chọn một file PDF.");
        return;
      }

      setIsUploading(true);
      try {
        const storagePath = `pdfs/${user.uid}/${Date.now()}-${file.name}`;
        const storageRef = ref(services.storage, storagePath);
        await uploadBytes(storageRef, file, {
          contentType: file.type || "application/pdf",
        });

        const documentsRef = collection(services.db, "documents");
        const newDocRef = await addDoc(documentsRef, {
          name: file.name,
          ownerId: user.uid,
          storagePath,
          createdAt: serverTimestamp(),
        });

        setSelectedDocumentId(newDocRef.id);
        setStatusMessage("Tải PDF thành công.");
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (error) {
        console.error("Upload PDF error", error);
        setStatusMessage("Không thể tải file. Hãy kiểm tra quyền Storage và thử lại.");
      } finally {
        setIsUploading(false);
      }
    },
    [services?.db, services?.storage, user]
  );

  const handleAddNote = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (!services?.db || !user || !selectedDocument) {
        setStatusMessage("Bạn cần chọn tài liệu và đăng nhập để ghi chú.");
        return;
      }

      const trimmed = newNote.trim();
      if (!trimmed) {
        setStatusMessage("Nội dung ghi chú không được để trống.");
        return;
      }

      setIsSubmittingNote(true);
      try {
        const response = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmed, target: targetLanguage }),
        });

        if (!response.ok) {
          throw new Error("Translation failed");
        }

        const result: { translatedText?: string } = await response.json();

        const notesRef = collection(services.db, "documents", selectedDocument.id, "notes");
        await addDoc(notesRef, {
          userId: user.uid,
          displayName: user.displayName ?? user.email ?? "Người dùng",
          pageNumber: currentPage,
          text: trimmed,
          translatedText: result.translatedText ?? null,
          createdAt: serverTimestamp(),
        });

        setNewNote("");
        setStatusMessage("Đã lưu ghi chú.");
      } catch (error) {
        console.error("Add note error", error);
        setStatusMessage("Không thể dịch hoặc lưu ghi chú. Hãy thử lại sau.");
      } finally {
        setIsSubmittingNote(false);
      }
    },
    [services?.db, selectedDocument, user, newNote, targetLanguage, currentPage]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      if (page < 1) return;
      if (totalPages && page > totalPages) return;
      setCurrentPage(page);
    },
    [totalPages]
  );

  const handleSignIn = async () => {
    if (!services?.auth) {
      setStatusMessage("Firebase Authentication chưa được cấu hình.");
      return;
    }

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(services.auth, provider);
    } catch (error) {
      console.error("Sign in error", error);
      setStatusMessage("Không thể đăng nhập. Hãy kiểm tra cấu hình OAuth.");
    }
  };

  const handleSignOut = async () => {
    if (!services?.auth) return;
    try {
      await signOut(services.auth);
      setSelectedDocumentId(null);
      setNotes([]);
      setPdfUrl(null);
    } catch (error) {
      console.error("Sign out error", error);
    }
  };

  const progressPercent = totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0;

  return (
    <div className="min-h-screen px-4 py-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 rounded-3xl bg-white/70 p-6 shadow ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-700 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold md:text-3xl">PDF Sync Reader</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Đọc tài liệu PDF cá nhân, đồng bộ tiến độ theo thời gian thực, ghi chú có dịch tự động với LibreTranslate.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.displayName ?? user.email ?? "Tài khoản"}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Đang đăng nhập</p>
                </div>
                <button
                  onClick={handleSignOut}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-blue-500"
              >
                Đăng nhập với Google
              </button>
            )}
          </div>
        </header>

        {firebaseError && (
          <div className="rounded-2xl border border-red-400 bg-red-50/80 p-4 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-900/30 dark:text-red-200">
            {firebaseError}
          </div>
        )}

        {statusMessage && (
          <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-200">
            {statusMessage}
          </div>
        )}

        {initialisingAuth ? (
          <div className="flex items-center justify-center rounded-3xl bg-white/70 p-10 text-sm text-slate-600 shadow dark:bg-slate-900/60 dark:text-slate-300">
            Đang kiểm tra trạng thái đăng nhập...
          </div>
        ) : !user ? (
          <div className="rounded-3xl bg-white/80 p-10 text-center shadow ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-700">
            <p className="text-base text-slate-600 dark:text-slate-300">
              Vui lòng đăng nhập để bắt đầu quản lý thư viện PDF cá nhân của bạn.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
            <aside className="flex flex-col gap-6">
              <section className="rounded-3xl bg-white/80 p-6 shadow ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-700">
                <h2 className="text-lg font-semibold">Thư viện của bạn</h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Tải PDF lên Firebase Storage và quản lý trong Firestore.
                </p>
                <form onSubmit={handleUpload} className="mt-4 flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="application/pdf"
                    className="block w-full cursor-pointer rounded-xl border border-dashed border-slate-300 bg-white/60 px-4 py-3 text-sm text-slate-600 focus:border-blue-400 focus:outline-none dark:border-slate-600 dark:bg-slate-900/60 dark:text-slate-300"
                  />
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-wait disabled:bg-blue-400"
                  >
                    {isUploading ? "Đang tải..." : "Tải PDF"}
                  </button>
                </form>

                <div className="mt-6 space-y-2">
                  {documents.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Chưa có tài liệu nào. Hãy tải PDF đầu tiên của bạn.
                    </p>
                  ) : (
                    documents.map((docItem) => (
                      <button
                        key={docItem.id}
                        onClick={() => setSelectedDocumentId(docItem.id)}
                        className={`w-full rounded-2xl border px-4 py-3 text-left text-sm transition ${
                          selectedDocumentId === docItem.id
                            ? "border-blue-400 bg-blue-50 text-blue-900 dark:border-blue-400/80 dark:bg-blue-500/20 dark:text-blue-100"
                            : "border-slate-200 bg-white/60 text-slate-700 hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-200"
                        }`}
                      >
                        <p className="font-medium">{docItem.name}</p>
                        {docItem.createdAt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            {formatRelative(docItem.createdAt)}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </section>

              {selectedDocument && (
                <section className="rounded-3xl bg-white/80 p-6 shadow ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-700">
                  <h2 className="text-lg font-semibold">Tiến độ đọc</h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Đồng bộ thời gian thực qua Firestore.
                  </p>
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm font-medium">
                      <span>Trang {currentPage}</span>
                      <span>{totalPages > 0 ? `${progressPercent}%` : "--"}</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-2 rounded-full bg-blue-500 transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                </section>
              )}
            </aside>

            <main className="flex flex-col gap-6">
              <section className="rounded-3xl bg-white/80 p-6 shadow ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-700">
                {selectedDocument ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-semibold">{selectedDocument.name}</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Theo dõi tiến độ và ghi chú cùng lúc.
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200"
                        >
                          Trang trước
                        </button>
                        <span className="min-w-[80px] text-center font-medium">
                          {totalPages > 0 ? `${currentPage} / ${totalPages}` : `Trang ${currentPage}`}
                        </span>
                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="rounded-full border border-slate-200 px-3 py-1 font-semibold text-slate-600 transition hover:border-blue-300 hover:text-blue-600 dark:border-slate-700 dark:text-slate-200"
                        >
                          Trang sau
                        </button>
                      </div>
                    </div>

                    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner dark:border-slate-700 dark:bg-slate-900/40">
                      {pdfUrl ? (
                        <Document
                          file={pdfUrl}
                          onLoadSuccess={(documentProxy: PDFDocumentProxy) => {
                            setTotalPages(documentProxy.numPages);
                          }}
                          onLoadError={(error) => {
                            console.error("PDF load error", error);
                            setStatusMessage("Không thể hiển thị PDF. Hãy thử tải lại trang.");
                          }}
                          className="flex justify-center"
                        >
                          <Page pageNumber={currentPage} width={800} renderAnnotationLayer renderTextLayer />
                        </Document>
                      ) : (
                        <div className="flex h-96 items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                          Đang tải PDF...
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex h-96 items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                    Hãy chọn hoặc tải lên một tài liệu để bắt đầu đọc.
                  </div>
                )}
              </section>

              <section className="rounded-3xl bg-white/80 p-6 shadow ring-1 ring-slate-200 backdrop-blur dark:bg-slate-900/60 dark:ring-slate-700">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Ghi chú &amp; dịch</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Ghi chú được đồng bộ với Firestore và tự động dịch qua LibreTranslate.
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="target-lang" className="text-slate-600 dark:text-slate-300">
                      Ngôn ngữ đích
                    </label>
                    <select
                      id="target-lang"
                      value={targetLanguage}
                      onChange={(event) => setTargetLanguage(event.target.value)}
                      className="rounded-full border border-slate-200 bg-white/60 px-3 py-1 text-sm text-slate-700 focus:border-blue-400 focus:outline-none dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100"
                    >
                      {languages.map((lang) => (
                        <option key={lang.code} value={lang.code}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <form onSubmit={handleAddNote} className="mt-4 flex flex-col gap-3">
                  <textarea
                    value={newNote}
                    onChange={(event) => setNewNote(event.target.value)}
                    placeholder="Nhập ghi chú của bạn..."
                    className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white/70 px-4 py-3 text-sm text-slate-700 shadow-inner focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-100 dark:focus:border-blue-400"
                  />
                  <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500 dark:text-slate-400">
                    <span>Trang hiện tại: {currentPage}</span>
                    <button
                      type="submit"
                      disabled={isSubmittingNote || !selectedDocument}
                      className="rounded-full bg-emerald-600 px-4 py-2 font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-emerald-400"
                    >
                      {isSubmittingNote ? "Đang lưu..." : "Lưu ghi chú"}
                    </button>
                  </div>
                </form>

                <div className="mt-6 space-y-4">
                  {notes.length === 0 ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Chưa có ghi chú nào cho tài liệu này. Hãy thêm ghi chú đầu tiên!
                    </p>
                  ) : (
                    notes.map((note) => (
                      <div
                        key={note.id}
                        className="rounded-2xl border border-slate-200 bg-white/70 p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900/40"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-700 dark:text-slate-100">
                            {note.displayName ?? "Người dùng"}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                            {note.pageNumber && <span>Trang {note.pageNumber}</span>}
                            {note.createdAt && <span>{formatRelative(note.createdAt)}</span>}
                          </div>
                        </div>
                        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">{note.text}</p>
                        {note.translatedText && (
                          <p className="mt-2 rounded-xl bg-blue-500/10 px-3 py-2 text-sm text-blue-900 dark:bg-blue-500/20 dark:text-blue-100">
                            {note.translatedText}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </section>
            </main>
          </div>
        )}
      </div>
    </div>
  );
}
