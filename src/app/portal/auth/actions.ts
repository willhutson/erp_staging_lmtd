"use server";

import { createMagicLink, verifyMagicLink, logoutPortalUser } from "@/lib/portal/auth";

// For now, hardcode the organization ID (in production, this would come from domain/subdomain)
const ORGANIZATION_ID = "org_lmtd"; // This should match your seeded org

export async function requestMagicLink(email: string) {
  if (!email || !email.includes("@")) {
    return { success: false, error: "Please enter a valid email address" };
  }

  try {
    const result = await createMagicLink(email.toLowerCase(), ORGANIZATION_ID);
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
