import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface UserAccount {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: "farmer" | "agriculture_officer" | "admin";
  avatar?: string;
  location?: string;
  subscription?: string;
}

interface AuthState {
  user: UserAccount | null;
  isAuthenticated: boolean;
  setUser: (user: UserAccount | null) => void;
  createAccount: (details: {
    name: string;
    email: string;
    phone?: string;
    role: "farmer" | "agriculture_officer" | "admin";
  }) => UserAccount;
  login: (email: string, pass?: string) => UserAccount;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      createAccount: (details) => {
        const uid = `usr-${Date.now()}`;
        const newUser: UserAccount = {
          uid,
          name: details.name || "Farmer",
          email: details.email || `${uid}@agrivision.ai`,
          phone: details.phone || "",
          role: details.role || "farmer",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(details.name || "Farmer")}`,
          location: "GPS Location Active",
          subscription: "Free Plan",
        };
        set({ user: newUser, isAuthenticated: true });
        return newUser;
      },
      login: (emailInput) => {
        const email = emailInput && emailInput.trim() ? emailInput.trim() : "farmer@agrivision.ai";
        const uid = `usr-${btoa(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 12)}`;
        const namePart = email.includes("@") ? email.split("@")[0] : email;
        const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

        const loggedUser: UserAccount = {
          uid,
          name: formattedName || "Farmer",
          email: email,
          role: "farmer",
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formattedName)}`,
          location: "GPS Location Active",
          subscription: "Premium",
        };
        set({ user: loggedUser, isAuthenticated: true });
        return loggedUser;
      },
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: "agrivision-auth-storage",
    }
  )
);

