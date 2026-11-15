import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

function cleanFirebaseConfigValue(value: string | undefined, fallback: string) {
  const cleaned = (value ?? "")
    .trim()
    .replace(/,+\s*$/, "")
    .replace(/^(["'])(.*)\1$/, "$2")
    .trim();

  return cleaned || fallback;
}

const firebaseConfig = {
  apiKey: cleanFirebaseConfigValue(process.env.NEXT_PUBLIC_FIREBASE_API_KEY, "mock-api-key"),
  authDomain: cleanFirebaseConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    "mock-domain"
  ),
  projectId: cleanFirebaseConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "mock-project-id"
  ),
  storageBucket: cleanFirebaseConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    "mock-bucket"
  ),
  messagingSenderId: cleanFirebaseConfigValue(
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    "mock-sender-id"
  ),
  appId: cleanFirebaseConfigValue(process.env.NEXT_PUBLIC_FIREBASE_APP_ID, "mock-app-id"),
};

export const isFirebasePhoneAuthConfigured = Boolean(
  /^AIza[\w-]{30,}$/.test(firebaseConfig.apiKey) &&
    /^[a-z0-9-]+$/i.test(firebaseConfig.projectId) &&
    firebaseConfig.authDomain.includes(".") &&
    /^\d+$/.test(firebaseConfig.messagingSenderId) &&
    /^1:\d+:web:[a-z0-9]+$/i.test(firebaseConfig.appId)
);

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };
