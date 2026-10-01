import type { NextAuthConfig } from "next-auth";

export default {
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  redirectProxyUrl: process.env.AUTH_REDIRECT_PROXY_URL,
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  providers: [],
} satisfies NextAuthConfig;
