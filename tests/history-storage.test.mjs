import assert from "node:assert/strict";
import test from "node:test";

const historyKey = "agrivision-history-storage";
const dataUrl = `data:image/jpeg;base64,${"A".repeat(1_000_000)}`;
const values = new Map();
let quota = Number.POSITIVE_INFINITY;

function storageSize(exceptKey = "") {
  let size = 0;
  for (const [key, value] of values) {
    if (key !== exceptKey) size += key.length + value.length;
  }
  return size;
}

globalThis.window = {
  localStorage: {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      if (storageSize(key) + key.length + value.length > quota) {
        const error = new Error("Storage quota exceeded");
        error.name = "QuotaExceededError";
        throw error;
      }
      values.set(key, String(value));
    },
    removeItem(key) {
      values.delete(key);
    },
  },
};

values.set(
  historyKey,
  JSON.stringify({
    version: 0,
    state: {
      diseaseRecords: [
        {
          id: "legacy-disease",
          timestamp: "2026-09-28T09:30:00.000Z",
          imageUrl: dataUrl,
          diseaseName: "Leaf blight",
          confidence: 91,
          severity: "high",
          symptoms: "Spots",
          organicTreatment: "Remove affected leaves",
          chemicalTreatment: "Use approved treatment",
        },
      ],
      plantRecords: [],
    },
  })
);

test("migrates oversized legacy images out of persisted scan history", async () => {
  const { useHistoryStore } = await import("../src/stores/history-store.ts");

  const legacyRecord = useHistoryStore.getState().diseaseRecords[0];
  assert.equal(legacyRecord?.id, "legacy-disease");
  assert.equal(legacyRecord?.imageUrl, undefined);

  const persisted = JSON.parse(values.get(historyKey));
  assert.equal(persisted.version, 1);
  assert.equal(persisted.state.diseaseRecords[0].imageUrl, undefined);
  assert.ok(values.get(historyKey).length < 5_000);
});

test("new scan history excludes data URLs and survives localStorage quota errors", async () => {
  const { useHistoryStore } = await import("../src/stores/history-store.ts");
  const store = useHistoryStore.getState();

  assert.doesNotThrow(() =>
    store.addDiseaseRecord({
      imageUrl: dataUrl,
      diseaseName: "Test diagnosis",
      confidence: 88,
      severity: "medium",
      symptoms: "Leaf spots",
      organicTreatment: "Remove affected leaves",
      chemicalTreatment: "Follow local agricultural guidance",
    })
  );
  assert.equal(useHistoryStore.getState().diseaseRecords[0].imageUrl, undefined);
  assert.equal(values.get(historyKey).includes("data:image"), false);

  assert.doesNotThrow(() =>
    useHistoryStore.getState().addPlantRecord({
      imageUrl: dataUrl,
      plantName: "Test crop",
      scientificName: "Example species",
      family: "Example family",
      confidence: 90,
      growingSeason: "Warm season",
      optimalSoil: "Well drained",
      waterRequirement: "Moderate",
      harvestCycle: "90 days",
    })
  );
  assert.equal(useHistoryStore.getState().plantRecords[0].imageUrl, undefined);
  assert.equal(values.get(historyKey).includes("data:image"), false);

  quota = 18_000;
  for (let index = 0; index < 25; index += 1) {
    assert.doesNotThrow(() =>
      useHistoryStore.getState().addDiseaseRecord({
        diseaseName: `Diagnosis ${index}`,
        confidence: 80,
        severity: "low",
        symptoms: "S".repeat(800),
        organicTreatment: "O".repeat(800),
        chemicalTreatment: "C".repeat(800),
      })
    );
  }

  const inMemoryCount = useHistoryStore.getState().diseaseRecords.length;
  const persisted = JSON.parse(values.get(historyKey));
  assert.equal(inMemoryCount, 25);
  assert.ok(persisted.state.diseaseRecords.length < inMemoryCount);
  assert.equal(values.get(historyKey).includes("data:image"), false);

  await useHistoryStore.persist.rehydrate();
  assert.equal(useHistoryStore.getState().diseaseRecords.length, persisted.state.diseaseRecords.length);
  assert.equal(useHistoryStore.getState().diseaseRecords[0].imageUrl, undefined);
});
