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

let firebaseApp: ReturnType<typeof initializeApp> | undefined;
let firebaseInitError: Error | null = null;
let authInstance: ReturnType<typeof getAuth> | undefined;
let dbInstance: ReturnType<typeof getFirestore> | undefined;
let storageInstance: ReturnType<typeof getStorage> | undefined;

if (typeof window !== "undefined") {
  const storageBucketValue = firebaseConfig.storageBucket;

  if (typeof storageBucketValue === "string" && storageBucketValue.includes(".firebasestorage.app")) {
    firebaseInitError = new Error(
      "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET đang sử dụng domain tải xuống (.firebasestorage.app). Hãy dùng tên bucket thực tế kết thúc bằng .appspot.com như hiển thị trong Firebase Console."
    );
  } else {
    if (!firebaseConfig.apiKey) {
      console.warn("Missing Firebase configuration. Please set environment variables.");
    }

    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

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
