import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const HISTORY_STORAGE_VERSION = 1;
const MAX_HISTORY_RECORDS = 25;
const MAX_REFERENCE_LENGTH = 512;
const MAX_TEXT_LENGTH = 800;

export interface DiseaseRecord {
  id: string;
  userId?: string;
  /** A small, durable URL only. Data URLs and blob URLs are never stored. */
  imageUrl?: string;
  timestamp: string;
  diseaseName: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  symptoms: string;
  organicTreatment: string;
  chemicalTreatment: string;
  cropName?: string;
}

export interface PlantIDRecord {
  id: string;
  userId?: string;
  /** A small, durable URL only. Data URLs and blob URLs are never stored. */
  imageUrl?: string;
  timestamp: string;
  plantName: string;
  scientificName: string;
  family: string;
  confidence: number;
  growingSeason: string;
  optimalSoil: string;
  waterRequirement: string;
  harvestCycle: string;
}

type PersistedHistoryState = Pick<HistoryState, "diseaseRecords" | "plantRecords">;

interface HistoryState {
  diseaseRecords: DiseaseRecord[];
  plantRecords: PlantIDRecord[];
  addDiseaseRecord: (record: Omit<DiseaseRecord, "id" | "timestamp">) => DiseaseRecord;
  addPlantRecord: (record: Omit<PlantIDRecord, "id" | "timestamp">) => PlantIDRecord;
  deleteDiseaseRecord: (id: string) => void;
  deletePlantRecord: (id: string) => void;
  getDiseaseRecordsByUser: (userId?: string) => DiseaseRecord[];
  getPlantRecordsByUser: (userId?: string) => PlantIDRecord[];
}

function asObject(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function compactText(value: unknown, limit = MAX_TEXT_LENGTH): string {
  return typeof value === "string" ? value.trim().slice(0, limit) : "";
}

function compactOptionalText(value: unknown, limit = 160): string | undefined {
  const text = compactText(value, limit);
  return text || undefined;
}

function compactImageReference(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const reference = value.trim();
  if (!reference || reference.length > MAX_REFERENCE_LENGTH) return undefined;
  if (/^(data:|blob:)/i.test(reference)) return undefined;

  // Keep only durable web or same-origin references. Arbitrary strings and
  // base64 payloads must never become part of browser history storage.
  if (reference.startsWith("/") && !reference.startsWith("//")) return reference;
  try {
    const url = new URL(reference);
    return url.protocol === "https:" || url.protocol === "http:"
      ? reference
      : undefined;
  } catch {
    return undefined;
  }
}

function compactDiseaseRecord(value: unknown): DiseaseRecord | null {
  const record = asObject(value);
  if (!record) return null;
  const id = compactText(record.id, 80);
  const timestamp = compactText(record.timestamp, 40);
  const diseaseName = compactText(record.diseaseName, 180);
  if (!id || !timestamp || !diseaseName || !Number.isFinite(Date.parse(timestamp))) return null;

  const severity = record.severity;
  return {
    id,
    userId: compactOptionalText(record.userId, 160),
    imageUrl: compactImageReference(record.imageUrl),
    timestamp,
    diseaseName,
    confidence:
      typeof record.confidence === "number" && Number.isFinite(record.confidence)
        ? Math.max(0, Math.min(100, record.confidence))
        : 0,
    severity:
      severity === "low" || severity === "medium" || severity === "high" || severity === "critical"
        ? severity
        : "medium",
    symptoms: compactText(record.symptoms),
    organicTreatment: compactText(record.organicTreatment),
    chemicalTreatment: compactText(record.chemicalTreatment),
    cropName: compactOptionalText(record.cropName, 160),
  };
}

function compactPlantRecord(value: unknown): PlantIDRecord | null {
  const record = asObject(value);
  if (!record) return null;
  const id = compactText(record.id, 80);
  const timestamp = compactText(record.timestamp, 40);
  const plantName = compactText(record.plantName, 180);
  if (!id || !timestamp || !plantName || !Number.isFinite(Date.parse(timestamp))) return null;

  return {
    id,
    userId: compactOptionalText(record.userId, 160),
    imageUrl: compactImageReference(record.imageUrl),
    timestamp,
    plantName,
    scientificName: compactText(record.scientificName, 180),
    family: compactText(record.family, 120),
    confidence:
      typeof record.confidence === "number" && Number.isFinite(record.confidence)
        ? Math.max(0, Math.min(100, record.confidence))
        : 0,
    growingSeason: compactText(record.growingSeason),
    optimalSoil: compactText(record.optimalSoil),
    waterRequirement: compactText(record.waterRequirement),
    harvestCycle: compactText(record.harvestCycle),
  };
}

function newestFirst<T extends { timestamp: string }>(records: T[]): T[] {
  return records.sort(
    (left, right) => Date.parse(right.timestamp) - Date.parse(left.timestamp)
  );
}

function compactHistoryState(value: unknown, recordLimit = MAX_HISTORY_RECORDS): PersistedHistoryState {
  const state = asObject(value);
  const diseaseRecords = Array.isArray(state?.diseaseRecords)
    ? state.diseaseRecords.map(compactDiseaseRecord).filter((record): record is DiseaseRecord => record !== null)
    : [];
  const plantRecords = Array.isArray(state?.plantRecords)
    ? state.plantRecords.map(compactPlantRecord).filter((record): record is PlantIDRecord => record !== null)
    : [];

  return {
    diseaseRecords: newestFirst(diseaseRecords).slice(0, recordLimit),
    plantRecords: newestFirst(plantRecords).slice(0, recordLimit),
  };
}

function isQuotaError(error: unknown): boolean {
  const candidate = error as { name?: string; code?: number } | null;
  return (
    candidate?.name === "QuotaExceededError" ||
    candidate?.name === "NS_ERROR_DOM_QUOTA_REACHED" ||
    candidate?.code === 22 ||
    candidate?.code === 1014
  );
}

/**
 * Zustand's default localStorage adapter lets setItem failures escape into the
 * action that saved a scan. This adapter compacts legacy data, retries with a
 * smaller bounded history when storage is full, and never lets storage errors
 * break a successful scan.
 */
const safeHistoryStorage = {
  getItem(name: string): string | null {
    try {
      return typeof window === "undefined" ? null : window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem(name: string, serializedValue: string): void {
    if (typeof window === "undefined") return;

    let envelope: Record<string, unknown>;
    try {
      const parsed: unknown = JSON.parse(serializedValue);
      const parsedObject = asObject(parsed);
      if (!parsedObject) return;
      envelope = parsedObject;
    } catch {
      return;
    }

    const state = envelope.state;
    const limits = [MAX_HISTORY_RECORDS, 10, 3, 0];
    for (const limit of limits) {
      const compactedValue = JSON.stringify({
        ...envelope,
        state: compactHistoryState(state, limit),
        version: HISTORY_STORAGE_VERSION,
      });
      try {
        window.localStorage.setItem(name, compactedValue);
        return;
      } catch (error) {
        if (!isQuotaError(error)) return;
      }
    }

    // A legacy oversized value may itself be preventing replacement. Remove
    // only this history key, then make one final best-effort compact write.
    try {
      window.localStorage.removeItem(name);
      window.localStorage.setItem(
        name,
        JSON.stringify({
          state: compactHistoryState(state, 3),
          version: HISTORY_STORAGE_VERSION,
        })
      );
    } catch {
      // Persistence is best effort. In-memory history remains available.
    }
  },
  removeItem(name: string): void {
    try {
      if (typeof window !== "undefined") window.localStorage.removeItem(name);
    } catch {
      // Ignore browser storage restrictions during logout/cleanup.
    }
  },
};

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      diseaseRecords: [],
      plantRecords: [],
      addDiseaseRecord: (record) => {
        const newRecord = compactDiseaseRecord({
          ...record,
          id: `dis-${Date.now()}`,
          timestamp: new Date().toISOString(),
        })!;
        set((state) => ({
          diseaseRecords: newestFirst([newRecord, ...state.diseaseRecords.map(compactDiseaseRecord).filter((item): item is DiseaseRecord => item !== null)]).slice(0, MAX_HISTORY_RECORDS),
        }));
        return newRecord;
      },
      addPlantRecord: (record) => {
        const newRecord = compactPlantRecord({
          ...record,
          id: `plt-${Date.now()}`,
          timestamp: new Date().toISOString(),
        })!;
        set((state) => ({
          plantRecords: newestFirst([newRecord, ...state.plantRecords.map(compactPlantRecord).filter((item): item is PlantIDRecord => item !== null)]).slice(0, MAX_HISTORY_RECORDS),
        }));
        return newRecord;
      },
      deleteDiseaseRecord: (id) =>
        set((state) => ({
          diseaseRecords: state.diseaseRecords.filter((record) => record.id !== id),
        })),
      deletePlantRecord: (id) =>
        set((state) => ({
          plantRecords: state.plantRecords.filter((record) => record.id !== id),
        })),
      getDiseaseRecordsByUser: (userId) => {
        const state = get();
        if (!userId) return [];
        return state.diseaseRecords.filter((record) => record.userId === userId);
      },
      getPlantRecordsByUser: (userId) => {
        const state = get();
        if (!userId) return [];
        return state.plantRecords.filter((record) => record.userId === userId);
      },
    }),
    {
      name: "agrivision-history-storage",
      version: HISTORY_STORAGE_VERSION,
      storage: createJSONStorage(() => safeHistoryStorage),
      partialize: (state) => compactHistoryState(state),
      migrate: (persistedState) => compactHistoryState(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...compactHistoryState(persistedState),
      }),
    }
  )
);
