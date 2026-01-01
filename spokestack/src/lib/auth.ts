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

    // Find user in database by supabaseId or email (no org filter - let page handle that)
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { supabaseId: supabaseUser.id },
          ...(supabaseUser.email ? [{ email: supabaseUser.email }] : [])
        ]
      }
    });

    if (!user) {
      console.error("User not found in database for:", supabaseUser.email, supabaseUser.id);
      return null;
    }

    // Link supabaseId if not already linked
    if (!user.supabaseId) {
      await prisma.user.update({
        where: { id: user.id },
        data: { supabaseId: supabaseUser.id }
      });
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
