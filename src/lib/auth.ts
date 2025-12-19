import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
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

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    // Dev-only credentials provider for testing without Google OAuth
    ...(process.env.NODE_ENV === "development"
      ? [
          Credentials({
            name: "Dev Login",
            credentials: {
              email: { label: "Email", type: "email" },
            },
            async authorize(credentials) {
              if (!credentials?.email) return null;

              const user = await db.user.findFirst({
                where: { email: credentials.email as string },
                include: { organization: true },
              });

              if (!user) return null;

              return {
                id: user.id,
                email: user.email,
                name: user.name,
                organizationId: user.organizationId,
                permissionLevel: user.permissionLevel,
                department: user.department,
                role: user.role,
                avatarUrl: user.avatarUrl,
              };
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // For Google sign-in, verify user exists in our database
      if (account?.provider === "google" && user.email) {
        const dbUser = await db.user.findFirst({
          where: { email: user.email },
        });
        if (!dbUser) {
          return false; // User not in our system
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        // On initial sign-in, fetch full user data
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
