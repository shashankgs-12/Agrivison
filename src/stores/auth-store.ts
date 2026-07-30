import { create } from "zustand";

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
  login: (email: string) => UserAccount;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: {
    uid: "usr-1",
    name: "Ramesh Patel",
    email: "ramesh@agrivision.ai",
    phone: "+91 9880651312",
    role: "farmer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    location: "Mandya District, Karnataka",
    subscription: "Premium",
  },
  isAuthenticated: true,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  createAccount: (details) => {
    const newUser: UserAccount = {
      uid: `usr-${Date.now()}`,
      name: details.name || "Farmer",
      email: details.email,
      phone: details.phone,
      role: details.role || "farmer",
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(details.name)}`,
      location: "Mandya District, KA",
      subscription: "Free",
    };
    set({ user: newUser, isAuthenticated: true });
    return newUser;
  },
  login: (email) => {
    const loggedUser: UserAccount = {
      uid: `usr-${Date.now()}`,
      name: email.split("@")[0] || "Farmer",
      email: email,
      role: "farmer",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      location: "Mandya District, KA",
      subscription: "Premium",
    };
    set({ user: loggedUser, isAuthenticated: true });
    return loggedUser;
  },
  logout: () => set({ user: null, isAuthenticated: false }),
}));
