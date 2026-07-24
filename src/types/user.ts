export type UserRole = "admin" | "agriculture_officer" | "farmer";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  languagePreferences: {
    dashboard: string;
    plantInfo: string;
    weather: string;
    diseaseInfo: string;
    treatment: string;
    notifications: string;
    chat: string;
  };
  createdAt: string;
  updatedAt: string;
}
