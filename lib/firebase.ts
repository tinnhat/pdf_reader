import { initializeApp, getApps, getApp } from "firebase/app";
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

function createFirebaseApp() {
  if (typeof window === "undefined") {
    // During SSR we skip initializing Firebase.
    return undefined;
  }

  if (!firebaseConfig.apiKey) {
    console.warn("Missing Firebase configuration. Please set environment variables.");
  }

  if (!getApps().length) {
    return initializeApp(firebaseConfig);
  }

  return getApp();
}

export const firebaseApp = createFirebaseApp();
export const auth = firebaseApp ? getAuth(firebaseApp) : undefined;
export const db = firebaseApp ? getFirestore(firebaseApp) : undefined;
export const storage = firebaseApp ? getStorage(firebaseApp) : undefined;

export function getFirebaseClient() {
  if (!firebaseApp || !auth || !db || !storage) {
    throw new Error("Firebase has not been initialised. Ensure you are running this in the browser and environment variables are configured.");
  }

  return { auth, db, storage } as const;
}
