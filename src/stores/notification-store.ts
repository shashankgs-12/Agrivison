import { create } from "zustand";

interface NotificationState {
  notifications: unknown[];
  setNotifications: (notifications: unknown[]) => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  setNotifications: (notifications) => set({ notifications }),
}));
