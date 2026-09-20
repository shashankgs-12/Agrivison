import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import authConfig from "@/auth.config";
import { credentialsSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || "agrivision-super-secret-key-9880651312-secure-token",
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = credentialsSchema.safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const email = parsedCredentials.data.email.toLowerCase();
        const inputPassword = parsedCredentials.data.password;

        // 1. Try PostgreSQL / Prisma DB authentication first
        try {
          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (user) {
            if (user.passwordHash && user.isActive) {
              const passwordMatches = await compare(inputPassword, user.passwordHash);
              if (passwordMatches) {
                return {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  image: user.image,
                  role: user.role,
                  phone: user.phone,
                  location: user.location,
                  subscription: user.subscription,
                };
              } else {
                // Password DOES NOT match user in PostgreSQL DB!
                console.warn(`Authentication failed for ${email}: Incorrect password.`);
                return null;
              }
            }
            return null;
          }
        } catch (dbErr) {
          console.warn("Database connection issue during authentication:", dbErr);
        }

        // 2. Demo & Preset Accounts Authentication
        if (email === "farmer@agrivision.ai" || email === "farmer@agrivision.com") {
          if (inputPassword === "password123") {
            return {
              id: "usr-demo-farmer",
              name: "Demo Farmer",
              email: "farmer@agrivision.ai",
              image: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoFarmer",
              role: "FARMER" as const,
              phone: "+91 9880651312",
              location: "Karnataka, India",
              subscription: "PREMIUM" as const,
            };
          }
          return null;
        }

        if (email === "officer@agrivision.ai" || email === "officer@agrivision.com") {
          if (inputPassword === "password123") {
            return {
              id: "usr-demo-officer",
              name: "Agri Officer Inspector",
              email: "officer@agrivision.ai",
              image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Officer",
              role: "AGRICULTURE_OFFICER" as const,
              phone: "+91 9448123456",
              location: "District Agri Office",
              subscription: "PREMIUM" as const,
            };
          }
          return null;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const u = user as {
          id?: string;
          role?: "FARMER" | "AGRICULTURE_OFFICER" | "ADMIN";
          phone?: string | null;
          location?: string | null;
          subscription?: "FREE" | "PREMIUM";
        };
        token.id = u.id;
        token.role = u.role || "FARMER";
        token.phone = u.phone || null;
        token.location = u.location || null;
        token.subscription = u.subscription || "FREE";
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const t = token as {
          id?: string;
          role?: "FARMER" | "AGRICULTURE_OFFICER" | "ADMIN";
          phone?: string | null;
          location?: string | null;
          subscription?: "FREE" | "PREMIUM";
        };
        session.user = {
          ...session.user,
          id: (t.id as string) || session.user.id,
          role: t.role || "FARMER",
          phone: t.phone || null,
          location: t.location || null,
          subscription: t.subscription || "FREE",
        };
      }

      return session;
    },
  },
});
