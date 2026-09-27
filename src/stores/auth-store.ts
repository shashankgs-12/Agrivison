import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: "farmer" | "admin";
  avatar?: string;
  location?: string;
  subscription?: string;
}

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  setUser: (user: UserAccount | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => {
        if (typeof window !== "undefined") {
          const cookieNames = [
            "agrivision_session",
            "next-auth.session-token",
            "__Secure-next-auth.session-token",
            "authjs.session-token",
            "__Secure-authjs.session-token",
            "next-auth.csrf-token",
            "authjs.csrf-token",
          ];
          const isIp = /^(\d{1,3}\.){3}\d{1,3}$/.test(window.location.hostname);
          cookieNames.forEach((name) => {
            document.cookie = `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            if (!isIp && window.location.hostname !== "localhost") {
              document.cookie = `${name}=; path=/; domain=${window.location.hostname}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
            }
          });
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "agrivision-auth-storage",
    }
  )
);

