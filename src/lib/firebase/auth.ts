import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User as FirebaseUser,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
} from "firebase/auth";
import { auth } from "./config";

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  role: "farmer" | "agriculture_officer" | "admin";
  subscription: "free" | "premium";
}

/**
 * Register user with email and password
 */
export async function signUpWithEmail(
  email: string,
  pass: string,
  name: string,
  role: "farmer" | "agriculture_officer" | "admin" = "farmer"
) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  return { user: userCredential.user, role };
}

/**
 * Sign in user with email and password
 */
export async function signInWithEmail(email: string, pass: string) {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  return userCredential.user;
}

/**
 * Sign in with Google SSO
 */
export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

/**
 * Sign out current user
 */
export async function signOutUser() {
  await firebaseSignOut(auth);
}

/**
 * Listen to auth state changes
 */
export function subscribeToAuthState(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}
