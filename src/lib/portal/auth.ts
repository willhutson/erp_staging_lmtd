import { db } from "@/lib/db";
import { cookies } from "next/headers";
import crypto from "crypto";

const SESSION_COOKIE_NAME = "portal_session";
const SESSION_DURATION_DAYS = 30;
const MAGIC_LINK_EXPIRY_MINUTES = 15;

/**
 * Hash a token for storage
 */
function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generate a secure random token
 */
function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Get the current portal user from session cookie
 */
export async function getPortalUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  const session = await db.clientPortalSession.findUnique({
    where: { token: hashToken(sessionToken) },
    include: {
      user: {
        include: {
          client: true,
        },
      },
    },
  });

  if (!session || session.expiresAt < new Date()) {
    // Session expired or invalid
    return null;
  }

  return session.user;
}

/**
 * Create a magic link for client login
 */
export async function createMagicLink(email: string, organizationId: string) {
  // Find the portal user
  const user = await db.clientPortalUser.findUnique({
    where: {
      organizationId_email: {
        organizationId,
        email: email.toLowerCase(),
      },
    },
    include: { client: true },
  });

  if (!user || !user.isActive) {
    // Don't reveal if user exists
    return { success: true };
  }

  // Generate magic link token
  const token = generateToken();
  const expiresAt = new Date(Date.now() + MAGIC_LINK_EXPIRY_MINUTES * 60 * 1000);

  // Store hashed token
  await db.clientMagicLink.create({
    data: {
      userId: user.id,
      token: hashToken(token),
      expiresAt,
    },
  });

  // In production, send email with magic link
  // For now, return the token (in dev)
  const magicLinkUrl = `/portal/auth/verify?token=${token}`;

  // TODO: Send email via notification service
  console.log(`Magic link for ${email}: ${magicLinkUrl}`);

  return {
    success: true,
    // Only return in development
    ...(process.env.NODE_ENV === "development" && { magicLinkUrl, token }),
  };
}

/**
 * Verify a magic link and create session
 */
export async function verifyMagicLink(token: string) {
  const hashedToken = hashToken(token);

  const magicLink = await db.clientMagicLink.findUnique({
    where: { token: hashedToken },
    include: {
      user: {
        include: { client: true },
      },
    },
  });

  if (!magicLink) {
    return { success: false, error: "Invalid or expired link" };
  }

  if (magicLink.usedAt) {
    return { success: false, error: "This link has already been used" };
  }

  if (magicLink.expiresAt < new Date()) {
    return { success: false, error: "This link has expired" };
  }

  // Mark magic link as used
  await db.clientMagicLink.update({
    where: { id: magicLink.id },
    data: { usedAt: new Date() },
  });

  // Create session
  const sessionToken = generateToken();
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
  );

  await db.clientPortalSession.create({
    data: {
      userId: magicLink.userId,
      token: hashToken(sessionToken),
      expiresAt,
    },
  });

  // Update last login
  await db.clientPortalUser.update({
    where: { id: magicLink.userId },
    data: { lastLoginAt: new Date() },
  });

  // Set session cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
    path: "/portal/dashboard",
  });

  return {
    success: true,
    user: magicLink.user,
  };
}

/**
 * Log out the current portal user
 */
export async function logoutPortalUser() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (sessionToken) {
    // Delete session from database
    await db.clientPortalSession.deleteMany({
      where: { token: hashToken(sessionToken) },
    });

    // Clear cookie
    cookieStore.delete(SESSION_COOKIE_NAME);
  }

  return { success: true };
}

/**
 * Create or invite a portal user
 */
export async function createPortalUser(data: {
  organizationId: string;
  clientId: string;
  email: string;
  name: string;
  contactId?: string;
  sendInvite?: boolean;
}) {
  const existingUser = await db.clientPortalUser.findUnique({
    where: {
      organizationId_email: {
        organizationId: data.organizationId,
        email: data.email.toLowerCase(),
      },
    },
  });

  if (existingUser) {
    return { success: false, error: "User already exists" };
  }

  const user = await db.clientPortalUser.create({
    data: {
      organizationId: data.organizationId,
      clientId: data.clientId,
      email: data.email.toLowerCase(),
      name: data.name,
      contactId: data.contactId,
    },
    include: { client: true },
  });

  // Send invite if requested
  if (data.sendInvite) {
    await createMagicLink(data.email, data.organizationId);
  }

  return { success: true, user };
}

/**
 * Require portal authentication (for use in server components/actions)
 */
export async function requirePortalAuth() {
  const user = await getPortalUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}
