"use server";

/**
 * Read Receipts
 *
 * Track who has read messages in chat.
 *
 * @module chat/actions/read-receipts
 */

import { db } from "@/lib/db";
import { pusherServer } from "@/lib/pusher";

// ============================================
// TYPES
// ============================================

export interface ReadReceipt {
  userId: string;
  userName: string;
  userAvatar?: string | null;
  readAt: Date;
}

export interface MessageReadStatus {
  messageId: string;
  readBy: ReadReceipt[];
  readCount: number;
}

// ============================================
// MARK AS READ
// ============================================

/**
 * Mark a single message as read
 */
export async function markMessageAsRead(
  messageId: string,
  userId: string
): Promise<{ success: boolean }> {
  try {
    // Upsert read receipt
    await db.messageReadReceipt.upsert({
      where: {
        messageId_userId: { messageId, userId },
      },
      create: {
        messageId,
        userId,
      },
      update: {
        readAt: new Date(),
      },
    });

    // Get message channel for real-time update
    const message = await db.message.findUnique({
      where: { id: messageId },
      select: { channelId: true },
    });

    if (message) {
      // Get user info for real-time notification
      const user = await db.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, avatarUrl: true },
      });

      // Broadcast read receipt
      await pusherServer.trigger(
        `channel-${message.channelId}`,
        "message:read",
        {
          messageId,
          userId,
          userName: user?.name,
          userAvatar: user?.avatarUrl,
          readAt: new Date().toISOString(),
        }
      );
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to mark message as read:", error);
    return { success: false };
  }
}

/**
 * Mark multiple messages as read (e.g., when opening a channel)
 */
export async function markMessagesAsRead(
  messageIds: string[],
  userId: string
): Promise<{ success: boolean; count: number }> {
  try {
    // Create read receipts for all messages
    const receipts = messageIds.map((messageId) => ({
      messageId,
      userId,
    }));

    // Use createMany with skipDuplicates
    const result = await db.messageReadReceipt.createMany({
      data: receipts,
      skipDuplicates: true,
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return { success: false, count: 0 };
  }
}

/**
 * Mark all messages in a channel as read up to a certain point
 */
export async function markChannelAsRead(
  channelId: string,
  userId: string,
  upToMessageId?: string
): Promise<{ success: boolean; count: number }> {
  try {
    // Get unread messages
    let whereClause: Parameters<typeof db.message.findMany>[0]["where"] = {
      channelId,
      isDeleted: false,
      readReceipts: {
        none: { userId },
      },
    };

    // If upToMessageId specified, only mark up to that message
    if (upToMessageId) {
      const targetMessage = await db.message.findUnique({
        where: { id: upToMessageId },
        select: { createdAt: true },
      });

      if (targetMessage) {
        whereClause = {
          ...whereClause,
          createdAt: { lte: targetMessage.createdAt },
        };
      }
    }

    const unreadMessages = await db.message.findMany({
      where: whereClause,
      select: { id: true },
    });

    if (unreadMessages.length === 0) {
      return { success: true, count: 0 };
    }

    // Create read receipts
    const result = await db.messageReadReceipt.createMany({
      data: unreadMessages.map((m) => ({
        messageId: m.id,
        userId,
      })),
      skipDuplicates: true,
    });

    // Also update channel membership's lastReadAt
    await db.channelMember.updateMany({
      where: { channelId, userId },
      data: { lastReadAt: new Date() },
    });

    return { success: true, count: result.count };
  } catch (error) {
    console.error("Failed to mark channel as read:", error);
    return { success: false, count: 0 };
  }
}

// ============================================
// GET READ RECEIPTS
// ============================================

/**
 * Get who has read a specific message
 */
export async function getMessageReadReceipts(
  messageId: string
): Promise<ReadReceipt[]> {
  const receipts = await db.messageReadReceipt.findMany({
    where: { messageId },
    include: {
      // Need to join with User - but relation isn't defined
      // So we'll fetch users separately
    },
    orderBy: { readAt: "asc" },
  });

  // Get user details
  const userIds = receipts.map((r) => r.userId);
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true, avatarUrl: true },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  return receipts.map((r) => {
    const user = userMap.get(r.userId);
    return {
      userId: r.userId,
      userName: user?.name || "Unknown",
      userAvatar: user?.avatarUrl,
      readAt: r.readAt,
    };
  });
}

/**
 * Get read status for multiple messages
 */
export async function getMessagesReadStatus(
  messageIds: string[]
): Promise<Map<string, MessageReadStatus>> {
  const receipts = await db.messageReadReceipt.groupBy({
    by: ["messageId"],
    where: { messageId: { in: messageIds } },
    _count: { userId: true },
  });

  const result = new Map<string, MessageReadStatus>();

  for (const r of receipts) {
    result.set(r.messageId, {
      messageId: r.messageId,
      readBy: [], // Simplified - just count for performance
      readCount: r._count.userId,
    });
  }

  return result;
}

/**
 * Check if a specific user has read a message
 */
export async function hasUserReadMessage(
  messageId: string,
  userId: string
): Promise<boolean> {
  const receipt = await db.messageReadReceipt.findUnique({
    where: {
      messageId_userId: { messageId, userId },
    },
  });

  return receipt !== null;
}

/**
 * Get unread message count for a user in a channel
 */
export async function getUnreadMessageCount(
  channelId: string,
  userId: string
): Promise<number> {
  return db.message.count({
    where: {
      channelId,
      isDeleted: false,
      readReceipts: {
        none: { userId },
      },
    },
  });
}
