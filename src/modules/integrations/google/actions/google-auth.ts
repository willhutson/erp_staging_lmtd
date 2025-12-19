"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// Google OAuth configuration
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI = process.env.NEXTAUTH_URL + "/api/integrations/google/callback";

// Scopes for Google Workspace APIs
const GOOGLE_SCOPES = [
  "https://www.googleapis.com/auth/calendar",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/documents",
  "https://www.googleapis.com/auth/spreadsheets",
  "https://www.googleapis.com/auth/presentations",
].join(" ");

interface GoogleTokens {
  access_token: string;
  refresh_token?: string;
  expiry_date: number;
}

/**
 * Generate Google OAuth authorization URL
 */
export async function getGoogleAuthUrl(): Promise<string> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: "code",
    scope: GOOGLE_SCOPES,
    access_type: "offline",
    prompt: "consent",
    state: session.user.organizationId,
  });

  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: GOOGLE_REDIRECT_URI,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expiry_date: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  return {
    access_token: data.access_token,
    refresh_token: refreshToken, // Keep the original refresh token
    expiry_date: Date.now() + data.expires_in * 1000,
  };
}

/**
 * Save Google integration credentials
 */
export async function saveGoogleCredentials(
  organizationId: string,
  tokens: GoogleTokens
): Promise<void> {
  await db.integration.upsert({
    where: {
      organizationId_provider: {
        organizationId,
        provider: "google",
      },
    },
    update: {
      isEnabled: true,
      credentials: tokens as object,
      updatedAt: new Date(),
    },
    create: {
      organizationId,
      provider: "google",
      isEnabled: true,
      credentials: tokens as object,
    },
  });
}

/**
 * Get valid access token (refreshes if expired)
 */
export async function getValidAccessToken(organizationId: string): Promise<string | null> {
  const integration = await db.integration.findUnique({
    where: {
      organizationId_provider: {
        organizationId,
        provider: "google",
      },
    },
  });

  if (!integration?.credentials || !integration.isEnabled) {
    return null;
  }

  const tokens = integration.credentials as unknown as GoogleTokens;

  // Check if token is expired (with 5 min buffer)
  if (tokens.expiry_date < Date.now() + 5 * 60 * 1000) {
    if (!tokens.refresh_token) {
      return null;
    }

    try {
      const newTokens = await refreshAccessToken(tokens.refresh_token);
      await saveGoogleCredentials(organizationId, newTokens);
      return newTokens.access_token;
    } catch {
      return null;
    }
  }

  return tokens.access_token;
}

/**
 * Check if Google integration is connected
 */
export async function isGoogleConnected(organizationId: string): Promise<boolean> {
  const token = await getValidAccessToken(organizationId);
  return token !== null;
}

/**
 * Disconnect Google integration
 */
export async function disconnectGoogle(): Promise<void> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  await db.integration.update({
    where: {
      organizationId_provider: {
        organizationId: session.user.organizationId,
        provider: "google",
      },
    },
    data: {
      isEnabled: false,
      credentials: undefined,
    },
  });
}
