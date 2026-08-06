import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcrypt";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import authConfig from "@/auth.config";
import { credentialsSchema } from "@/lib/auth/validation";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 60,
  },
  providers: [
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
        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash || !user.isActive) {
          return null;
        }

        const passwordMatches = await compare(
          parsedCredentials.data.password,
          user.passwordHash
        );

        if (!passwordMatches) {
          return null;
        }

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
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.phone = user.phone;
        token.location = user.location;
        token.subscription = user.subscription;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id && token.role) {
        session.user = {
          ...session.user,
          id: token.id,
          role: token.role,
          phone: token.phone ?? null,
          location: token.location ?? null,
          subscription: token.subscription ?? "FREE",
        };
      }

      return session;
    },
  },
});
