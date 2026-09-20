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
  login: (
    emailInput: string,
    pass?: string,
    roleParam?: "farmer" | "agriculture_officer" | "admin",
    nameParam?: string,
    phoneParam?: string
  ) => UserAccount;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => {
        if (typeof window !== "undefined") {
          if (user) {
            document.cookie = "agrivision_session=true; path=/; max-age=28800; SameSite=Lax";
          } else {
            document.cookie = "agrivision_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
          }
        }
        set({ user, isAuthenticated: !!user });
      },
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
        if (typeof window !== "undefined") {
          document.cookie = "agrivision_session=true; path=/; max-age=28800; SameSite=Lax";
        }
        set({ user: newUser, isAuthenticated: true });
        return newUser;
      },
      login: (emailInput, _pass, roleParam, nameParam, phoneParam) => {
        const email = emailInput && emailInput.trim() ? emailInput.trim() : "farmer@agrivision.ai";
        const uid = `usr-${encodeURIComponent(email).replace(/[^a-zA-Z0-9]/g, "").slice(0, 16)}`;
        const namePart = email.includes("@") ? email.split("@")[0] : email;
        const formattedName = nameParam || (namePart.charAt(0).toUpperCase() + namePart.slice(1));
        const userRole = roleParam || (email.includes("officer") ? "agriculture_officer" : email.includes("admin") ? "admin" : "farmer");

        const loggedUser: UserAccount = {
          uid,
          name: formattedName || "Farmer",
          email: email,
          phone: phoneParam || "",
          role: userRole,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(formattedName)}`,
          location: "GPS Location Active",
          subscription: "Premium",
        };
        if (typeof window !== "undefined") {
          document.cookie = "agrivision_session=true; path=/; max-age=28800; SameSite=Lax";
        }
        set({ user: loggedUser, isAuthenticated: true });
        return loggedUser;
      },
      logout: () => {
        if (typeof window !== "undefined") {
          document.cookie = "agrivision_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: "agrivision-auth-storage",
    }
  )
);

