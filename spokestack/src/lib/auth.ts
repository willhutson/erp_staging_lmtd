// Auth compatibility layer for studio module
// Wraps Supabase auth to provide NextAuth-like interface

import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  organizationId: string;
  permissionLevel: string;
}

export interface Session {
  user: SessionUser;
}

/**
 * Get user from database based on Supabase auth
 * Used by layouts and pages to get the current user
 */
async function getUserFromDatabase(): Promise<SessionUser | null> {
  const supabaseUser = await getUser();
  if (!supabaseUser) {
    return null;
  }

  // Find user in database - try supabaseId first, then email
  let user = await prisma.user.findFirst({
    where: { supabaseId: supabaseUser.id }
  });

  // If not found by supabaseId, try email
  if (!user && supabaseUser.email) {
    user = await prisma.user.findFirst({
      where: { email: supabaseUser.email }
    });

    // Link supabaseId for future lookups
    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseId: supabaseUser.id }
      });
    }
  }

  if (!user) {
    console.error("User not found in database for:", supabaseUser.email, supabaseUser.id);
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl,
    organizationId: user.organizationId,
    permissionLevel: user.permissionLevel,
  };
}

/**
 * Get session with user data
 * Returns null if no session or user not found in database
 */
export async function auth(): Promise<Session | null> {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    const user = await getUserFromDatabase();
    if (!user) {
      return null;
    }

    return { user };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}

/**
 * Get the current user for studio pages
 * Use this in pages within /studio/* - the studio layout ensures auth
 * Throws if user not found (which shouldn't happen if layout is working)
 */
export async function getStudioUser(): Promise<SessionUser> {
  const user = await getUserFromDatabase();

  if (!user) {
    throw new Error("User not found - studio layout should have handled this");
  }

  return user;
}
