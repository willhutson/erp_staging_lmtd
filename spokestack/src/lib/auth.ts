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
  try {
    const session = await getSession();

    if (!session) {
      return null;
    }

    const supabaseUser = await getUser();
    if (!supabaseUser) {
      return null;
    }

    let tenantOrgId = "";
    try {
      const tenant = await getTenant();
      tenantOrgId = tenant.organizationId || "";
    } catch (error) {
      console.error("Error getting tenant in auth:", error);
    }

    // Build OR conditions properly - don't include undefined values
    const orConditions: Array<{ supabaseId: string } | { email: string }> = [
      { supabaseId: supabaseUser.id }
    ];
    if (supabaseUser.email) {
      orConditions.push({ email: supabaseUser.email });
    }

    // Find user in database - first try with org filter, then without
    let user = await prisma.user.findFirst({
      where: {
        OR: orConditions,
        ...(tenantOrgId ? { organizationId: tenantOrgId } : {})
      }
    });

    // If not found with org filter, try without (for default tenant)
    if (!user && tenantOrgId) {
      user = await prisma.user.findFirst({
        where: { OR: orConditions }
      });
    }

    if (!user) {
      console.error("User not found in database for:", supabaseUser.email);
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
