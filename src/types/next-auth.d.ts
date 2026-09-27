import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/auth/roles";

declare module "next-auth" {
  interface User {
    role: UserRole;
    phone?: string | null;
    location?: string | null;
    subscription?: "FREE" | "PREMIUM";
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      phone: string | null;
      location: string | null;
      subscription: "FREE" | "PREMIUM";
      authProvider?: string;
      requiresProfileCompletion: boolean;
    } & DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    phone?: string | null;
    location?: string | null;
    subscription?: "FREE" | "PREMIUM";
    authProvider?: string;
    profileComplete?: boolean;
  }
}
