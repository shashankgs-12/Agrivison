import { create } from "zustand";

interface AuthState {
  user: unknown;
  setUser: (user: unknown) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
}));
