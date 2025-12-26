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

// ============================================
// ORG CONTEXT HELPER (Phase 0)
// ============================================

export interface OrgContext {
  userId: string;
  organizationId: string;
  permissionLevel: PermissionLevel;
  email: string;
  name: string;
  department: string;
  role: string;
}

/**
 * Get the authenticated user's organization context.
 * Use this in Server Actions and API routes to ensure tenant isolation.
 *
 * @throws Error if user is not authenticated
 * @returns OrgContext with userId, organizationId, and role
 */
export async function getOrgContext(): Promise<OrgContext> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized: No active session");
  }

  if (!session.user.organizationId) {
    throw new Error("Unauthorized: User has no organization");
  }

  return {
    userId: session.user.id,
    organizationId: session.user.organizationId,
    permissionLevel: session.user.permissionLevel,
    email: session.user.email,
    name: session.user.name,
    department: session.user.department,
    role: session.user.role,
  };
}

/**
 * Get the org context or null if not authenticated.
 * Useful for optional authentication scenarios.
 */
export async function getOrgContextOrNull(): Promise<OrgContext | null> {
  try {
    return await getOrgContext();
  } catch {
    return null;
  }
}

// ============================================
// NEXTAUTH CONFIGURATION
// ============================================

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
        console.log("[AUTH] Authorize called with email:", credentials?.email);

        if (!credentials?.email || !credentials?.password) {
          console.log("[AUTH] Missing credentials");
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        try {
          console.log("[AUTH] Looking up user:", email);
          const user = await db.user.findFirst({
            where: { email },
          });

          console.log("[AUTH] User found:", !!user, "Has password:", !!user?.passwordHash);

          if (!user || !user.passwordHash) {
            console.log("[AUTH] No user or no password hash");
            return null;
          }

          const isValidPassword = await bcrypt.compare(password, user.passwordHash);
          console.log("[AUTH] Password valid:", isValidPassword);

          if (!isValidPassword) {
            return null;
          }

          console.log("[AUTH] Login successful for:", user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("[AUTH] Credentials auth error:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google sign-in, verify user exists and bind googleSub
      if (account?.provider === "google" && user.email && profile?.sub) {
        const googleSub = profile.sub;

        try {
          // First, try to find user by googleSub (most secure)
          let dbUser = await db.user.findFirst({
            where: { googleSub },
          });

          if (dbUser) {
            // googleSub matches - allow login
            console.log(`User ${user.email} authenticated via googleSub`);
            return true;
          }

          // Fallback: find by email
          dbUser = await db.user.findFirst({
            where: { email: user.email },
          });

          if (!dbUser) {
            console.log(`User ${user.email} not found in database`);
            return false;
          }

          // Security check: if user has a different googleSub stored, block login
          if (dbUser.googleSub && dbUser.googleSub !== googleSub) {
            console.error(
              `SECURITY WARNING: User ${user.email} attempted login with different Google account. ` +
              `Stored sub: ${dbUser.googleSub}, Attempted sub: ${googleSub}`
            );
            return false;
          }

          // Bind googleSub to user on first successful Google login
          if (!dbUser.googleSub) {
            await db.user.update({
              where: { id: dbUser.id },
              data: { googleSub },
            });
            console.log(`Bound googleSub ${googleSub} to user ${user.email}`);
          }

          console.log(`User ${user.email} found, allowing sign in`);
          return true;
        } catch (error) {
          console.error("Error during Google sign-in:", error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, profile }) {
      // On initial sign-in, fetch full user data from our database
      if ((account && user) || (user && !token.organizationId)) {
        try {
          // For Google auth, prefer lookup by googleSub
          let dbUser = null;
          if (account?.provider === "google" && profile?.sub) {
            dbUser = await db.user.findFirst({
              where: { googleSub: profile.sub },
            });
          }

          // Fallback to email lookup
          if (!dbUser && token.email) {
            dbUser = await db.user.findFirst({
              where: { email: token.email },
            });
          }

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
