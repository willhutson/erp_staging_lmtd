// Auth compatibility layer for studio module
// Wraps Supabase auth to provide NextAuth-like interface

import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { getTenant } from "@/lib/get-tenant";

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
  const session = await getSession();

  if (!session) {
    return null;
  }

  const supabaseUser = await getUser();
  if (!supabaseUser) {
    return null;
  }

  const tenant = await getTenant();

  // Find user in database
  const whereClause: Record<string, unknown> = {
    OR: [
      { supabaseId: supabaseUser.id },
      { email: supabaseUser.email ?? undefined }
    ]
  };

  if (tenant.organizationId) {
    whereClause.organizationId = tenant.organizationId;
  }

  const user = await prisma.user.findFirst({
    where: whereClause
  });

  if (!user) {
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
}
