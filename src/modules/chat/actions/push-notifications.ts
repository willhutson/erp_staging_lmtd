"use server";

/**
 * Push Notification Service
 *
 * Web Push notifications for chat messages.
 * Works on desktop browsers and mobile devices (PWA).
 *
 * @module chat/actions/push-notifications
 */

import { db } from "@/lib/db";
import webpush from "web-push";

// ============================================
// CONFIGURATION
// ============================================

// VAPID keys for web push (generate once and store in env)
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || "";
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || "mailto:admin@teamlmtd.com";

// Initialize web-push
if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

// ============================================
// TYPES
// ============================================

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    url?: string;
    channelId?: string;
    messageId?: string;
    type?: "dm" | "mention" | "message" | "thread" | "reaction";
  };
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Save a push subscription for a user
 */
export async function savePushSubscription(
  userId: string,
  subscription: PushSubscription,
  deviceInfo?: {
    userAgent?: string;
    platform?: string;
    deviceName?: string;
  }
): Promise<{ success: boolean; subscriptionId?: string; error?: string }> {
  try {
    // Check if subscription already exists
    const existing = await db.pushSubscription.findFirst({
      where: {
        userId,
        endpoint: subscription.endpoint,
      },
    });

    if (existing) {
      // Update existing subscription
      await db.pushSubscription.update({
        where: { id: existing.id },
        data: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
          userAgent: deviceInfo?.userAgent,
          platform: deviceInfo?.platform,
          deviceName: deviceInfo?.deviceName,
          updatedAt: new Date(),
        },
      });
      return { success: true, subscriptionId: existing.id };
    }

    // Create new subscription
    const sub = await db.pushSubscription.create({
      data: {
        userId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        userAgent: deviceInfo?.userAgent,
        platform: deviceInfo?.platform,
        deviceName: deviceInfo?.deviceName,
      },
    });

    return { success: true, subscriptionId: sub.id };
  } catch (error) {
    console.error("Failed to save push subscription:", error);
    return { success: false, error: "Failed to save subscription" };
  }
}

/**
 * Remove a push subscription
 */
export async function removePushSubscription(
  userId: string,
  endpoint: string
): Promise<{ success: boolean }> {
  try {
    await db.pushSubscription.deleteMany({
      where: {
        userId,
        endpoint,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Failed to remove push subscription:", error);
    return { success: false };
  }
}

/**
 * Get all subscriptions for a user
 */
export async function getUserSubscriptions(userId: string) {
  return db.pushSubscription.findMany({
    where: { userId },
    select: {
      id: true,
      endpoint: true,
      platform: true,
      deviceName: true,
      createdAt: true,
    },
  });
}

// ============================================
// SEND PUSH NOTIFICATIONS
// ============================================

/**
 * Send push notification to a user
 */
export async function sendPushToUser(
  userId: string,
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
    console.warn("VAPID keys not configured, skipping push notification");
    return { sent: 0, failed: 0 };
  }

  const subscriptions = await db.pushSubscription.findMany({
    where: { userId },
  });

  let sent = 0;
  let failed = 0;

  for (const sub of subscriptions) {
    try {
      await webpush.sendNotification(
        {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
        },
        JSON.stringify(payload)
      );
      sent++;
    } catch (error: unknown) {
      failed++;

      // Remove invalid subscriptions (410 Gone or 404 Not Found)
      if (error && typeof error === "object" && "statusCode" in error) {
        const statusCode = (error as { statusCode: number }).statusCode;
        if (statusCode === 410 || statusCode === 404) {
          await db.pushSubscription.delete({ where: { id: sub.id } });
        }
      }
    }
  }

  return { sent, failed };
}

/**
 * Send push notification to multiple users
 */
export async function sendPushToUsers(
  userIds: string[],
  payload: PushNotificationPayload
): Promise<{ sent: number; failed: number }> {
  let totalSent = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const { sent, failed } = await sendPushToUser(userId, payload);
    totalSent += sent;
    totalFailed += failed;
  }

  return { sent: totalSent, failed: totalFailed };
}

// ============================================
// NOTIFICATION HELPERS
// ============================================

/**
 * Send notification for new direct message
 */
export async function notifyNewDM(
  recipientId: string,
  senderName: string,
  messagePreview: string,
  channelId: string,
  messageId: string
) {
  return sendPushToUser(recipientId, {
    title: `Message from ${senderName}`,
    body: messagePreview.slice(0, 100),
    icon: "/icons/chat-192.png",
    badge: "/icons/badge-72.png",
    tag: `dm-${channelId}`,
    data: {
      url: `/chat/${channelId}`,
      channelId,
      messageId,
      type: "dm",
    },
    actions: [
      { action: "reply", title: "Reply" },
      { action: "dismiss", title: "Dismiss" },
    ],
  });
}

/**
 * Send notification for @mention
 */
export async function notifyMention(
  recipientId: string,
  senderName: string,
  channelName: string,
  messagePreview: string,
  channelId: string,
  messageId: string
) {
  return sendPushToUser(recipientId, {
    title: `${senderName} mentioned you in #${channelName}`,
    body: messagePreview.slice(0, 100),
    icon: "/icons/mention-192.png",
    badge: "/icons/badge-72.png",
    tag: `mention-${messageId}`,
    data: {
      url: `/chat/${channelId}?message=${messageId}`,
      channelId,
      messageId,
      type: "mention",
    },
  });
}

/**
 * Send notification for thread reply
 */
export async function notifyThreadReply(
  recipientId: string,
  senderName: string,
  channelName: string,
  messagePreview: string,
  channelId: string,
  parentId: string,
  messageId: string
) {
  return sendPushToUser(recipientId, {
    title: `${senderName} replied to your thread`,
    body: messagePreview.slice(0, 100),
    icon: "/icons/thread-192.png",
    badge: "/icons/badge-72.png",
    tag: `thread-${parentId}`,
    data: {
      url: `/chat/${channelId}?thread=${parentId}`,
      channelId,
      messageId,
      type: "thread",
    },
  });
}

/**
 * Send notification for reaction
 */
export async function notifyReaction(
  recipientId: string,
  reactorName: string,
  emoji: string,
  messagePreview: string,
  channelId: string,
  messageId: string
) {
  return sendPushToUser(recipientId, {
    title: `${reactorName} reacted ${emoji}`,
    body: `To: "${messagePreview.slice(0, 50)}..."`,
    icon: "/icons/reaction-192.png",
    badge: "/icons/badge-72.png",
    tag: `reaction-${messageId}`,
    data: {
      url: `/chat/${channelId}?message=${messageId}`,
      channelId,
      messageId,
      type: "reaction",
    },
  });
}

// ============================================
// VAPID KEY GENERATION (run once)
// ============================================

/**
 * Generate VAPID keys (run once, store in .env)
 * Call this from a script to generate keys
 */
export function generateVapidKeys(): { publicKey: string; privateKey: string } {
  return webpush.generateVAPIDKeys();
}

/**
 * Get public VAPID key for client
 */
export function getPublicVapidKey(): string {
  return VAPID_PUBLIC_KEY;
}
