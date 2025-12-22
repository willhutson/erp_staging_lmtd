"use server";

/**
 * Chat Module - Presence Actions
 *
 * Manage user presence/online status with real-time updates.
 *
 * @module chat/actions/presence-actions
 */

import { db } from "@/lib/db";
import { pusherServer, PUSHER_EVENTS } from "@/lib/pusher";
import type { PresenceStatus } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface UserPresenceData {
  userId: string;
  status: PresenceStatus;
  statusText?: string | null;
  statusEmoji?: string | null;
  lastSeenAt: Date;
}

export interface PresenceUpdateInput {
  userId: string;
  status: PresenceStatus;
  statusText?: string;
  statusEmoji?: string;
}

// ============================================
// PRESENCE MANAGEMENT
// ============================================

/**
 * Update user presence status
 */
export async function updatePresence(input: PresenceUpdateInput) {
  const presence = await db.userPresence.upsert({
    where: { userId: input.userId },
    update: {
      status: input.status,
      statusText: input.statusText,
      statusEmoji: input.statusEmoji,
      lastSeenAt: new Date(),
      lastActiveAt: input.status === "ONLINE" ? new Date() : undefined,
    },
    create: {
      userId: input.userId,
      status: input.status,
      statusText: input.statusText,
      statusEmoji: input.statusEmoji,
      lastSeenAt: new Date(),
      lastActiveAt: new Date(),
    },
  });

  // Broadcast presence update to all subscribed clients
  await pusherServer.trigger(
    `presence-global`,
    PUSHER_EVENTS.PRESENCE_CHANGED,
    {
      userId: input.userId,
      status: input.status,
      statusText: input.statusText,
      statusEmoji: input.statusEmoji,
      lastSeenAt: presence.lastSeenAt,
    }
  );

  return presence;
}

/**
 * Set user as online (called on page load/focus)
 */
export async function setOnline(userId: string) {
  return updatePresence({ userId, status: "ONLINE" });
}

/**
 * Set user as away (called on page blur/idle)
 */
export async function setAway(userId: string) {
  return updatePresence({ userId, status: "AWAY" });
}

/**
 * Set user as offline (called on page unload)
 */
export async function setOffline(userId: string) {
  return updatePresence({ userId, status: "OFFLINE" });
}

/**
 * Set custom status
 */
export async function setCustomStatus(
  userId: string,
  statusText: string,
  statusEmoji?: string
) {
  const presence = await db.userPresence.upsert({
    where: { userId },
    update: {
      statusText,
      statusEmoji,
    },
    create: {
      userId,
      status: "ONLINE",
      statusText,
      statusEmoji,
    },
  });

  // Broadcast update
  await pusherServer.trigger(
    `presence-global`,
    PUSHER_EVENTS.PRESENCE_CHANGED,
    {
      userId,
      status: presence.status,
      statusText,
      statusEmoji,
      lastSeenAt: presence.lastSeenAt,
    }
  );

  return presence;
}

/**
 * Clear custom status
 */
export async function clearCustomStatus(userId: string) {
  const presence = await db.userPresence.update({
    where: { userId },
    data: {
      statusText: null,
      statusEmoji: null,
    },
  });

  // Broadcast update
  await pusherServer.trigger(
    `presence-global`,
    PUSHER_EVENTS.PRESENCE_CHANGED,
    {
      userId,
      status: presence.status,
      statusText: null,
      statusEmoji: null,
      lastSeenAt: presence.lastSeenAt,
    }
  );

  return presence;
}

/**
 * Get presence for a single user
 */
export async function getPresence(userId: string): Promise<UserPresenceData | null> {
  const presence = await db.userPresence.findUnique({
    where: { userId },
  });

  if (!presence) return null;

  return {
    userId: presence.userId,
    status: presence.status,
    statusText: presence.statusText,
    statusEmoji: presence.statusEmoji,
    lastSeenAt: presence.lastSeenAt,
  };
}

/**
 * Get presence for multiple users
 */
export async function getPresences(userIds: string[]): Promise<Map<string, UserPresenceData>> {
  const presences = await db.userPresence.findMany({
    where: { userId: { in: userIds } },
  });

  const presenceMap = new Map<string, UserPresenceData>();

  for (const presence of presences) {
    presenceMap.set(presence.userId, {
      userId: presence.userId,
      status: presence.status,
      statusText: presence.statusText,
      statusEmoji: presence.statusEmoji,
      lastSeenAt: presence.lastSeenAt,
    });
  }

  // Add offline status for users without presence records
  for (const userId of userIds) {
    if (!presenceMap.has(userId)) {
      presenceMap.set(userId, {
        userId,
        status: "OFFLINE",
        statusText: null,
        statusEmoji: null,
        lastSeenAt: new Date(0),
      });
    }
  }

  return presenceMap;
}

/**
 * Get all online users in an organization
 */
export async function getOnlineUsers(organizationId: string): Promise<UserPresenceData[]> {
  const presences = await db.userPresence.findMany({
    where: {
      status: { in: ["ONLINE", "AWAY", "DND"] },
      user: { organizationId },
    },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  return presences.map((p) => ({
    userId: p.userId,
    status: p.status,
    statusText: p.statusText,
    statusEmoji: p.statusEmoji,
    lastSeenAt: p.lastSeenAt,
  }));
}

/**
 * Heartbeat - update last seen time without changing status
 */
export async function heartbeat(userId: string) {
  await db.userPresence.upsert({
    where: { userId },
    update: {
      lastActiveAt: new Date(),
    },
    create: {
      userId,
      status: "ONLINE",
      lastActiveAt: new Date(),
      lastSeenAt: new Date(),
    },
  });
}

/**
 * Cleanup stale presences (users who haven't sent heartbeat)
 * Should be run periodically via cron job
 */
export async function cleanupStalePresences(staleThresholdMinutes = 5) {
  const staleThreshold = new Date(Date.now() - staleThresholdMinutes * 60 * 1000);

  const stalePresences = await db.userPresence.findMany({
    where: {
      status: { in: ["ONLINE", "AWAY"] },
      lastActiveAt: { lt: staleThreshold },
    },
  });

  // Update stale users to offline
  for (const presence of stalePresences) {
    await db.userPresence.update({
      where: { id: presence.id },
      data: { status: "OFFLINE" },
    });

    // Broadcast offline status
    await pusherServer.trigger(
      `presence-global`,
      PUSHER_EVENTS.PRESENCE_CHANGED,
      {
        userId: presence.userId,
        status: "OFFLINE",
        statusText: presence.statusText,
        statusEmoji: presence.statusEmoji,
        lastSeenAt: new Date(),
      }
    );
  }

  return stalePresences.length;
}
