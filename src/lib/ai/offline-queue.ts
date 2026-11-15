export interface QueuedDiseaseScan {
  image: string;
  language: string;
  cropId?: string;
  queuedAt: number;
}

function queueKey(userId: string) {
  return `agrivision:pending-disease-scans:${userId}`;
}

export function getQueuedDiseaseScan(userId: string): QueuedDiseaseScan | null {
  try {
    const raw = localStorage.getItem(queueKey(userId));
    if (!raw) return null;
    const records = JSON.parse(raw) as unknown;
    if (!Array.isArray(records)) return null;
    const record = records.find((item) => item && typeof item === "object") as Partial<QueuedDiseaseScan> | undefined;
    if (
      !record ||
      typeof record.image !== "string" ||
      record.image.length > 320 * 1024 ||
      !record.image.startsWith("data:image/jpeg;base64,") ||
      typeof record.language !== "string"
    ) return null;
    return {
      image: record.image,
      language: record.language,
      cropId: typeof record.cropId === "string" ? record.cropId : undefined,
      queuedAt: typeof record.queuedAt === "number" ? record.queuedAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function saveQueuedDiseaseScan(userId: string, scan: Omit<QueuedDiseaseScan, "queuedAt">): boolean {
  if (!scan.image.startsWith("data:image/jpeg;base64,") || scan.image.length > 320 * 1024) return false;
  try {
    localStorage.setItem(queueKey(userId), JSON.stringify([{ ...scan, queuedAt: Date.now() }]));
    return true;
  } catch {
    return false;
  }
}

export function clearQueuedDiseaseScan(userId: string) {
  try {
    localStorage.removeItem(queueKey(userId));
  } catch {
    // Nothing else needs to happen if browser storage is disabled.
  }
}
