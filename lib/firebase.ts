import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

type NormalisedBucket = {
  value?: string;
  advisoryMessage?: string;
};

function normaliseStorageBucket(rawValue: string | undefined): NormalisedBucket {
  if (!rawValue) {
    return { value: undefined };
  }

  let trimmed = rawValue.trim();
  if (!trimmed) {
    return { value: undefined };
  }

  if (trimmed.startsWith("gs://")) {
    trimmed = trimmed.slice("gs://".length);
  }

  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    try {
      const url = new URL(trimmed);
      trimmed = url.hostname;
    } catch (error) {
      console.warn("Không thể phân tích NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET dưới dạng URL", error);
    }
  }

  if (trimmed.endsWith(".firebasestorage.app")) {
    const bucketRoot = trimmed.replace(/\.firebasestorage\.app$/, "");
    if (bucketRoot) {
      return {
        value: `${bucketRoot}.appspot.com`,
        advisoryMessage:
          "Đã tự động chuyển NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET sang tên bucket .appspot.com. Hãy cập nhật biến môi trường để tránh lỗi CORS trong các phiên tiếp theo.",
      };
    }
  }

  return { value: trimmed };
}

let firebaseApp: ReturnType<typeof initializeApp> | undefined;
let firebaseInitError: Error | null = null;
let authInstance: ReturnType<typeof getAuth> | undefined;
let dbInstance: ReturnType<typeof getFirestore> | undefined;
let storageInstance: ReturnType<typeof getStorage> | undefined;

if (typeof window !== "undefined") {
  const { value: normalisedBucket, advisoryMessage } = normaliseStorageBucket(
    firebaseConfig.storageBucket
  );

  if (advisoryMessage) {
    console.warn(advisoryMessage);
  }

  if (!normalisedBucket) {
    firebaseInitError = new Error(
      "Không xác định được tên bucket Firebase Storage. Kiểm tra lại biến NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET."
    );
  } else {
    const clientConfig = { ...firebaseConfig, storageBucket: normalisedBucket } as const;

    if (!clientConfig.apiKey) {
      console.warn("Missing Firebase configuration. Please set environment variables.");
    }

    firebaseApp = getApps().length ? getApp() : initializeApp(clientConfig);

    authInstance = getAuth(firebaseApp);
    dbInstance = getFirestore(firebaseApp);
    storageInstance = getStorage(firebaseApp);
  }
}

export { firebaseApp };
export const auth = authInstance;
export const db = dbInstance;
export const storage = storageInstance;

export function getFirebaseClient() {
  if (firebaseInitError) {
    throw firebaseInitError;
  }

  if (!firebaseApp || !authInstance || !dbInstance || !storageInstance) {
    throw new Error("Firebase has not been initialised. Ensure you are running this in the browser and environment variables are configured.");
  }

  return { auth: authInstance, db: dbInstance, storage: storageInstance } as const;
}
