import type { NextAuthConfig } from "next-auth";

export default {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "agrivision-super-secret-key-9880651312-secure-token",
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
} satisfies NextAuthConfig;
