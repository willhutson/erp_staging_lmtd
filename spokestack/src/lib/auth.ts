// Auth compatibility layer for studio module
// Wraps Supabase auth to provide NextAuth-like interface

import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";

interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
  organizationId: string;
  permissionLevel: string;
}

interface Session {
  user: SessionUser;
}

export async function auth(): Promise<Session | null> {
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

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
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        organizationId: user.organizationId,
        permissionLevel: user.permissionLevel,
      }
    };
  } catch (error) {
    console.error("Auth error:", error);
    return null;
  }
}
