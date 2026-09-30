import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createRemoteJWKSet, jwtVerify } from "jose";
import authConfig from "@/auth.config";
import { credentialsSchema } from "@/lib/auth/validation";
import { findUserByPhone } from "@/lib/auth/phone-lookup";
import { toSessionImage } from "@/lib/auth/profile-image";
import { getFirebaseProjectId, getGoogleOAuthConfig } from "@/lib/auth/provider-config";
import { prisma } from "@/lib/prisma";

const firebaseSigningKeys = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

function getSafeAuthDiagnostic(error: unknown) {
  const authTypes = new Set([
    "AdapterError",
    "CallbackRouteError",
    "InvalidCheck",
    "JWTSessionError",
    "MissingSecret",
    "OAuthCallbackError",
    "OAuthProfileParseError",
    "UntrustedHost",
  ]);
  const causeNames = new Set([
    "Error",
    "PrismaClientInitializationError",
    "PrismaClientKnownRequestError",
    "PrismaClientRustPanicError",
    "PrismaClientUnknownRequestError",
    "PrismaClientValidationError",
    "TypeError",
  ]);
  let type = "Unknown";
  let cause: string | undefined;
  let prismaCode: string | undefined;
  let current = error;

  for (let depth = 0; depth < 4 && current && typeof current === "object"; depth++) {
    const record = current as Record<string, unknown>;
    if (typeof record.type === "string" && authTypes.has(record.type)) type = record.type;
    if (typeof record.name === "string" && causeNames.has(record.name)) cause = record.name;
    if (typeof record.code === "string" && /^P\d{4}$/.test(record.code)) {
      prismaCode = record.code;
    }
    current = record.cause ?? record.err;
  }

  return { type, cause, prismaCode };
}

async function authorizeFirebasePhone(idToken: unknown) {
  const projectId = getFirebaseProjectId();
  if (typeof idToken !== "string" || !idToken || !projectId) return null;

  try {
    const { payload } = await jwtVerify(idToken, firebaseSigningKeys, {
      issuer: `https://securetoken.google.com/${projectId}`,
      audience: projectId,
      algorithms: ["RS256"],
    });

    const firebaseClaim =
      payload.firebase && typeof payload.firebase === "object"
        ? (payload.firebase as Record<string, unknown>)
        : {};
    const firebaseUid =
      typeof payload.user_id === "string" ? payload.user_id : payload.sub;
    const phone = payload.phone_number;

    if (
      firebaseClaim.sign_in_provider !== "phone" ||
      typeof firebaseUid !== "string" ||
      firebaseUid.length < 1 ||
      firebaseUid.length > 128 ||
      typeof phone !== "string" ||
      !/^\+[1-9]\d{7,14}$/.test(phone)
    ) {
      return null;
    }

    const existingPhoneUser = await findUserByPhone(phone);
    const user = existingPhoneUser
      ? await prisma.user.update({
          where: { id: existingPhoneUser.id },
          data: { phone },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            location: true,
            role: true,
            subscription: true,
            isActive: true,
          },
        })
      : await prisma.user.upsert({
          where: { id: `firebase-phone:${firebaseUid}` },
          create: {
            id: `firebase-phone:${firebaseUid}`,
            phone,
            role: "FARMER",
            subscription: "FREE",
          },
          update: { phone },
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            phone: true,
            location: true,
            role: true,
            subscription: true,
            isActive: true,
          },
        });

    if (!user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

const googleConfig = getGoogleOAuthConfig();

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
    logger: {
      error(error) {
        console.error("[auth] request failed", JSON.stringify(getSafeAuthDiagnostic(error)));
      },
    },
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  providers: [
    // Google verifies the email it returns. Allow Auth.js to attach this
    // provider to an existing password account with the same verified email.
    ...(googleConfig
      ? [Google({ ...googleConfig, allowDangerousEmailAccountLinking: true })]
      : []),
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

        // Keep demo credentials out of production unless explicitly enabled.
        const demoLoginEnabled =
          process.env.NODE_ENV !== "production" ||
          process.env.ENABLE_DEMO_LOGIN === "true";
        if (
          demoLoginEnabled &&
          (email === "farmer@agrivision.ai" || email === "farmer@agrivision.com")
        ) {
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

        return null;
      },
    }),
    Credentials({
      id: "firebase-phone",
      name: "Firebase phone verification",
      credentials: {
        idToken: { label: "Firebase ID token", type: "text" },
      },
      async authorize(credentials) {
        return authorizeFirebasePhone(credentials?.idToken);
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account, trigger }) {
      if (account?.provider) token.authProvider = account.provider;

      if (user) {
        const u = user as {
          id?: string;
          name?: string | null;
          image?: string | null;
          role?: "FARMER" | "ADMIN";
          phone?: string | null;
          location?: string | null;
          subscription?: "FREE" | "PREMIUM";
          authProvider?: string;
          profileComplete?: boolean;
        };
        token.id = u.id;
        token.picture = toSessionImage(u.image);
        token.role = u.role || "FARMER";
        token.phone = u.phone || null;
        token.location = u.location || null;
        token.subscription = u.subscription || "FREE";
        token.profileComplete = Boolean(
          u.name?.trim() && u.phone?.trim() && u.location?.trim()
        );
      }

      if (trigger === "update" && typeof token.id === "string") {
        const profile = await prisma.user.findUnique({
          where: { id: token.id },
          select: {
            name: true,
            image: true,
            phone: true,
            location: true,
            role: true,
            subscription: true,
          },
        });

        if (profile) {
          token.name = profile.name;
          token.picture = toSessionImage(profile.image);
          token.phone = profile.phone;
          token.location = profile.location;
          token.role = profile.role;
          token.subscription = profile.subscription;
          token.profileComplete = Boolean(
            profile.name?.trim() && profile.phone?.trim() && profile.location?.trim()
          );
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const t = token as {
          id?: string;
          role?: "FARMER" | "ADMIN";
          phone?: string | null;
          location?: string | null;
          subscription?: "FREE" | "PREMIUM";
          authProvider?: string;
          profileComplete?: boolean;
        };
        session.user = {
          ...session.user,
          id: (t.id as string) || session.user.id,
          role: t.role || "FARMER",
          phone: t.phone || null,
          location: t.location || null,
          subscription: t.subscription || "FREE",
          authProvider: t.authProvider,
          requiresProfileCompletion:
            ((t.authProvider === "google" || t.authProvider === "firebase-phone") &&
              !t.profileComplete) || false,
        };
      }

      return session;
    },
  },
});
