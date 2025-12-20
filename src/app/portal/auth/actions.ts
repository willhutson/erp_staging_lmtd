"use server";

import { createMagicLink, verifyMagicLink, logoutPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";

// Look up organization by slug (in production, this would come from domain/subdomain)
const ORG_SLUG = "lmtd";

async function getOrganizationId(): Promise<string | null> {
  const org = await db.organization.findUnique({
    where: { slug: ORG_SLUG },
    select: { id: true },
  });
  return org?.id ?? null;
}

export async function requestMagicLink(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" };
  }

  const organizationId = await getOrganizationId();
  if (!organizationId) {
    console.error("Organization not found:", ORG_SLUG);
    return { success: false, error: "Portal not configured" };
  }

  try {
    const result = await createMagicLink(email.toLowerCase(), organizationId);
    return result;
  } catch (error) {
    console.error("Magic link error:", error);
    return { success: false, error: "Failed to send login link" };
  }
}

export async function verifyToken(token: string) {
  if (!token) {
    return { success: false, error: "Invalid token" };
  }

  try {
    const result = await verifyMagicLink(token);
    return result;
  } catch (error) {
    console.error("Token verification error:", error);
    return { success: false, error: "Failed to verify token" };
  }
}

export async function logout() {
  try {
    await logoutPortalUser();
    return { success: true };
  } catch (error) {
    console.error("Logout error:", error);
    return { success: false };
  }
}
