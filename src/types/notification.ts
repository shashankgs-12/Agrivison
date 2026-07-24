export interface Notification {
  id: string;
  userId: string;
  type: "weather" | "disease" | "harvest" | "irrigation" | "fertilizer" | "system";
  title: Record<string, string>;
  message: Record<string, string>;
  severity: "info" | "warning" | "critical";
  read: boolean;
  createdAt: string;
}
