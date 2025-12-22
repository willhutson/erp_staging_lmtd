"use server";

/**
 * Chat Notification Preferences
 *
 * User-configurable settings for chat notifications.
 *
 * @module chat/actions/notification-preferences
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export interface NotificationPreferences {
  // Global settings
  enabled: boolean;
  soundEnabled: boolean;
  desktopEnabled: boolean;

  // When to notify
  notifyOnDirectMessage: boolean;
  notifyOnMention: boolean;
  notifyOnChannelMessage: boolean;
  notifyOnThreadReply: boolean;
  notifyOnReaction: boolean;

  // Quiet hours
  quietHoursEnabled: boolean;
  quietHoursStart: string; // "22:00"
  quietHoursEnd: string; // "08:00"
  quietHoursTimezone: string; // "Asia/Dubai"

  // Channel-specific overrides
  channelOverrides: Record<
    string,
    {
      muted: boolean;
      notifyOn: "all" | "mentions" | "none";
    }
  >;

  // Keywords to always notify
  keywords: string[];
}

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  enabled: true,
  soundEnabled: true,
  desktopEnabled: true,

  notifyOnDirectMessage: true,
  notifyOnMention: true,
  notifyOnChannelMessage: false,
  notifyOnThreadReply: true,
  notifyOnReaction: false,

  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  quietHoursTimezone: "Asia/Dubai",

  channelOverrides: {},
  keywords: [],
};

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { chatPreferences: true },
  });

  if (!user?.chatPreferences) {
    return DEFAULT_PREFERENCES;
  }

  // Merge with defaults to ensure all fields exist
  return {
    ...DEFAULT_PREFERENCES,
    ...(user.chatPreferences as Partial<NotificationPreferences>),
  };
}

/**
 * Update user's notification preferences
 */
export async function updateNotificationPreferences(
  userId: string,
  updates: Partial<NotificationPreferences>
): Promise<NotificationPreferences> {
  const current = await getNotificationPreferences(userId);

  const updated = {
    ...current,
    ...updates,
  };

  await db.user.update({
    where: { id: userId },
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatPreferences: updated as any,
    },
  });

  revalidatePath("/chat");
  return updated;
}

/**
 * Reset preferences to defaults
 */
export async function resetNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  await db.user.update({
    where: { id: userId },
    data: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      chatPreferences: DEFAULT_PREFERENCES as any,
    },
  });

  revalidatePath("/chat");
  return DEFAULT_PREFERENCES;
}

// ============================================
// CHANNEL-SPECIFIC SETTINGS
// ============================================

/**
 * Mute a channel
 */
export async function muteChannel(
  userId: string,
  channelId: string
): Promise<void> {
  const prefs = await getNotificationPreferences(userId);

  prefs.channelOverrides[channelId] = {
    ...prefs.channelOverrides[channelId],
    muted: true,
    notifyOn: "none",
  };

  await updateNotificationPreferences(userId, {
    channelOverrides: prefs.channelOverrides,
  });
}

/**
 * Unmute a channel
 */
export async function unmuteChannel(
  userId: string,
  channelId: string
): Promise<void> {
  const prefs = await getNotificationPreferences(userId);

  if (prefs.channelOverrides[channelId]) {
    prefs.channelOverrides[channelId].muted = false;
    prefs.channelOverrides[channelId].notifyOn = "mentions";

    await updateNotificationPreferences(userId, {
      channelOverrides: prefs.channelOverrides,
    });
  }
}

/**
 * Set channel notification level
 */
export async function setChannelNotificationLevel(
  userId: string,
  channelId: string,
  level: "all" | "mentions" | "none"
): Promise<void> {
  const prefs = await getNotificationPreferences(userId);

  prefs.channelOverrides[channelId] = {
    ...prefs.channelOverrides[channelId],
    muted: level === "none",
    notifyOn: level,
  };

  await updateNotificationPreferences(userId, {
    channelOverrides: prefs.channelOverrides,
  });
}

/**
 * Check if channel is muted
 */
export async function isChannelMuted(
  userId: string,
  channelId: string
): Promise<boolean> {
  const prefs = await getNotificationPreferences(userId);
  return prefs.channelOverrides[channelId]?.muted ?? false;
}

// ============================================
// KEYWORDS
// ============================================

/**
 * Add a notification keyword
 */
export async function addKeyword(
  userId: string,
  keyword: string
): Promise<void> {
  const prefs = await getNotificationPreferences(userId);
  const normalized = keyword.toLowerCase().trim();

  if (!prefs.keywords.includes(normalized)) {
    prefs.keywords.push(normalized);
    await updateNotificationPreferences(userId, {
      keywords: prefs.keywords,
    });
  }
}

/**
 * Remove a notification keyword
 */
export async function removeKeyword(
  userId: string,
  keyword: string
): Promise<void> {
  const prefs = await getNotificationPreferences(userId);
  const normalized = keyword.toLowerCase().trim();

  prefs.keywords = prefs.keywords.filter((k) => k !== normalized);

  await updateNotificationPreferences(userId, {
    keywords: prefs.keywords,
  });
}

// ============================================
// NOTIFICATION DECISION
// ============================================

interface NotificationContext {
  userId: string;
  type: "dm" | "mention" | "channel" | "thread" | "reaction" | "keyword";
  channelId?: string;
  messageContent?: string;
}

/**
 * Check if user should receive notification
 */
export async function shouldNotify(
  context: NotificationContext
): Promise<{ notify: boolean; reason?: string }> {
  const prefs = await getNotificationPreferences(context.userId);

  // Global disable
  if (!prefs.enabled) {
    return { notify: false, reason: "notifications_disabled" };
  }

  // Check quiet hours
  if (prefs.quietHoursEnabled) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: prefs.quietHoursTimezone,
    });

    const [startHour, startMin] = prefs.quietHoursStart.split(":").map(Number);
    const [endHour, endMin] = prefs.quietHoursEnd.split(":").map(Number);
    const [nowHour, nowMin] = timeStr.split(":").map(Number);

    const nowMinutes = nowHour * 60 + nowMin;
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    const inQuietHours =
      startMinutes < endMinutes
        ? nowMinutes >= startMinutes && nowMinutes < endMinutes
        : nowMinutes >= startMinutes || nowMinutes < endMinutes;

    if (inQuietHours) {
      return { notify: false, reason: "quiet_hours" };
    }
  }

  // Check channel-specific override
  if (context.channelId) {
    const override = prefs.channelOverrides[context.channelId];
    if (override?.muted) {
      return { notify: false, reason: "channel_muted" };
    }
    if (override?.notifyOn === "none") {
      return { notify: false, reason: "channel_notifications_off" };
    }
    if (override?.notifyOn === "mentions" && context.type === "channel") {
      return { notify: false, reason: "channel_mentions_only" };
    }
  }

  // Check notification type
  switch (context.type) {
    case "dm":
      if (!prefs.notifyOnDirectMessage) {
        return { notify: false, reason: "dm_notifications_off" };
      }
      break;
    case "mention":
      if (!prefs.notifyOnMention) {
        return { notify: false, reason: "mention_notifications_off" };
      }
      break;
    case "channel":
      if (!prefs.notifyOnChannelMessage) {
        return { notify: false, reason: "channel_notifications_off" };
      }
      break;
    case "thread":
      if (!prefs.notifyOnThreadReply) {
        return { notify: false, reason: "thread_notifications_off" };
      }
      break;
    case "reaction":
      if (!prefs.notifyOnReaction) {
        return { notify: false, reason: "reaction_notifications_off" };
      }
      break;
  }

  // Check keywords
  if (context.messageContent && prefs.keywords.length > 0) {
    const lowerContent = context.messageContent.toLowerCase();
    const matchedKeyword = prefs.keywords.find((kw) =>
      lowerContent.includes(kw)
    );
    if (matchedKeyword) {
      return { notify: true, reason: `keyword_match:${matchedKeyword}` };
    }
  }

  return { notify: true };
}
