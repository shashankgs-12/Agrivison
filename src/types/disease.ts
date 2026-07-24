export interface DiseaseDetection {
  id: string;
  userId: string;
  imageUrl: string;
  confidence: number;
  severity: "low" | "medium" | "high" | "critical";
  result: Record<string, unknown>;
  createdAt: string;
}
