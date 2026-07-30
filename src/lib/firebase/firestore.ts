import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// Collections constants
export const COLLECTIONS = {
  USERS: "users",
  FARMS: "farms",
  FIELDS: "fields",
  CROPS: "crops",
  DISEASE_DETECTIONS: "diseaseDetections",
  PLANT_IDENTIFICATIONS: "plantIdentifications",
  NOTIFICATIONS: "notifications",
  CHAT_SESSIONS: "chatSessions",
} as const;

// Types
export interface FirestoreUser {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: "admin" | "agriculture_officer" | "farmer";
  avatar?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  languagePreferences: {
    dashboard: string;
    plantInfo: string;
    weather: string;
    diseaseInfo: string;
    treatment: string;
    notifications: string;
    chat: string;
  };
  subscription: "free" | "premium";
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreFarm {
  id?: string;
  name: string;
  ownerId: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  boundary: {
    type: "Polygon";
    coordinates: [number, number][];
  };
  area: number; // in acres
  perimeter: number; // in meters
  soilType: string;
  waterSource: string;
  images?: string[];
  createdAt?: any;
  updatedAt?: any;
}

export interface FirestoreCrop {
  id?: string;
  farmId: string;
  fieldId: string;
  ownerId: string;
  name: string;
  variety?: string;
  sowingDate: string;
  expectedHarvest: string;
  growthStage: string;
  progress: number;
  waterNeed: string;
  health: string;
  createdAt?: any;
}

export interface FirestoreDiseaseDetection {
  id?: string;
  userId: string;
  imageUrl: string;
  result: {
    disease: Record<string, string>;
    confidence: number;
    severity: "low" | "medium" | "high" | "critical";
    symptoms: Record<string, string>;
    treatment: {
      organic: Record<string, string>;
      chemical: Record<string, string>;
    };
  };
  createdAt?: any;
}

// User Operations
export async function createUserDocument(user: FirestoreUser) {
  const userRef = doc(db, COLLECTIONS.USERS, user.uid);
  await setDoc(userRef, {
    ...user,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserDocument(uid: string): Promise<FirestoreUser | null> {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  const snap = await getDoc(userRef);
  return snap.exists() ? (snap.data() as FirestoreUser) : null;
}

export async function updateUserPreferences(
  uid: string,
  preferences: Partial<FirestoreUser["languagePreferences"]>
) {
  const userRef = doc(db, COLLECTIONS.USERS, uid);
  await updateDoc(userRef, {
    languagePreferences: preferences,
    updatedAt: serverTimestamp(),
  });
}

// Farm Operations
export async function createFarm(farm: Omit<FirestoreFarm, "id">) {
  const farmRef = doc(collection(db, COLLECTIONS.FARMS));
  const newFarm = {
    ...farm,
    id: farmRef.id,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(farmRef, newFarm);
  return newFarm;
}

export async function getUserFarms(ownerId: string): Promise<FirestoreFarm[]> {
  const q = query(
    collection(db, COLLECTIONS.FARMS),
    where("ownerId", "==", ownerId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestoreFarm);
}

export async function getFarmById(farmId: string): Promise<FirestoreFarm | null> {
  const farmRef = doc(db, COLLECTIONS.FARMS, farmId);
  const snap = await getDoc(farmRef);
  return snap.exists() ? (snap.data() as FirestoreFarm) : null;
}

// Disease Operations
export async function saveDiseaseDetection(detection: Omit<FirestoreDiseaseDetection, "id">) {
  const ref = doc(collection(db, COLLECTIONS.DISEASE_DETECTIONS));
  const data = {
    ...detection,
    id: ref.id,
    createdAt: serverTimestamp(),
  };
  await setDoc(ref, data);
  return data;
}

export async function getUserDiseaseDetections(userId: string): Promise<FirestoreDiseaseDetection[]> {
  const q = query(
    collection(db, COLLECTIONS.DISEASE_DETECTIONS),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as FirestoreDiseaseDetection);
}
