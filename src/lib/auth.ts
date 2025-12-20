import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { PermissionLevel } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      organizationId: string;
      permissionLevel: PermissionLevel;
      department: string;
      role: string;
      avatarUrl?: string | null;
    };
  }
}

// JWT-only auth - no database adapter
export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          const user = await db.user.findFirst({
            where: { email },
          });

          if (!user || !user.passwordHash) {
            return null;
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          if (!isValidPassword) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Credentials auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-in, verify user exists in our database
      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await db.user.findFirst({
            where: { email: user.email },
          });
          if (!dbUser) {
            console.log(`User ${user.email} not found in database`);
            return false;
          }
          console.log(`User ${user.email} found, allowing sign in`);
        } catch (error) {
          console.error("Error checking user:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      // On initial sign-in, fetch full user data from our database
      if ((account && user) || (user && !token.organizationId)) {
        try {
          const dbUser = await db.user.findFirst({
            where: { email: token.email! },
          });

          if (dbUser) {
            token.id = dbUser.id;
            token.organizationId = dbUser.organizationId;
            token.permissionLevel = dbUser.permissionLevel;
            token.department = dbUser.department;
            token.role = dbUser.role;
            token.avatarUrl = dbUser.avatarUrl;
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.organizationId = token.organizationId as string;
        session.user.permissionLevel = token.permissionLevel as PermissionLevel;
        session.user.department = token.department as string;
        session.user.role = token.role as string;
        session.user.avatarUrl = token.avatarUrl as string | null;
      }
      return session;
    },
  },
});
