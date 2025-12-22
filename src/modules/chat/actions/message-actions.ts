"use server";

/**
 * Chat Module - Message Actions
 *
 * CRUD operations for chat messages with Pusher real-time updates.
 *
 * @module chat/actions/message-actions
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { pusherServer, PUSHER_EVENTS } from "@/lib/pusher";
import type { MessageFormat } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface SendMessageInput {
  organizationId: string;
  channelId: string;
  userId: string;
  content: string;
  contentFormat?: MessageFormat;
  parentId?: string; // For thread replies
  mentionedUserIds?: string[];
  mentionedChannelIds?: string[];
  hasMentionAll?: boolean;
}

export interface MessageWithDetails {
  id: string;
  channelId: string;
  content: string;
  contentFormat: MessageFormat;
  parentId: string | null;
  replyCount: number;
  isEdited: boolean;
  editedAt: Date | null;
  isDeleted: boolean;
  mentionedUserIds: string[];
  createdAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
    department: string;
    role: string;
  };
  reactions: {
    id: string;
    emoji: string;
    userId: string;
    user: {
      id: string;
      name: string;
    };
  }[];
  attachments: {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    thumbnailUrl: string | null;
  }[];
}

// ============================================
// HELPER: Extract mentions from content
// ============================================

function extractMentions(content: string): {
  userIds: string[];
  channelIds: string[];
  hasMentionAll: boolean;
} {
  const userMentions: string[] = [];
  const channelMentions: string[] = [];
  let hasMentionAll = false;

  // Match @user mentions (format: @[userId])
  const userPattern = /@\[([a-z0-9]+)\]/gi;
  let match;
  while ((match = userPattern.exec(content)) !== null) {
    userMentions.push(match[1]);
  }

  // Match #channel mentions (format: #[channelId])
  const channelPattern = /#\[([a-z0-9]+)\]/gi;
  while ((match = channelPattern.exec(content)) !== null) {
    channelMentions.push(match[1]);
  }

  // Check for @channel, @here, @everyone
  if (/@(channel|here|everyone)/i.test(content)) {
    hasMentionAll = true;
  }

  return {
    userIds: [...new Set(userMentions)],
    channelIds: [...new Set(channelMentions)],
    hasMentionAll,
  };
}

// ============================================
// MESSAGE CRUD
// ============================================

/**
 * Send a new message
 */
export async function sendMessage(input: SendMessageInput) {
  // Extract mentions if not provided
  const mentions = input.mentionedUserIds
    ? {
        userIds: input.mentionedUserIds,
        channelIds: input.mentionedChannelIds || [],
        hasMentionAll: input.hasMentionAll || false,
      }
    : extractMentions(input.content);

  // Create the message
  const message = await db.message.create({
    data: {
      organizationId: input.organizationId,
      channelId: input.channelId,
      userId: input.userId,
      content: input.content,
      contentFormat: input.contentFormat || "TIPTAP",
      parentId: input.parentId,
      mentionedUserIds: mentions.userIds,
      mentionedChannelIds: mentions.channelIds,
      hasMentionAll: mentions.hasMentionAll,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          department: true,
          role: true,
        },
      },
      reactions: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      attachments: true,
    },
  });

  // Update channel's lastMessageAt and messageCount
  await db.channel.update({
    where: { id: input.channelId },
    data: {
      lastMessageAt: new Date(),
      messageCount: { increment: 1 },
    },
  });

  // If this is a reply, increment parent's reply count
  if (input.parentId) {
    await db.message.update({
      where: { id: input.parentId },
      data: { replyCount: { increment: 1 } },
    });
  }

  // Send real-time update via Pusher
  await pusherServer.trigger(
    `channel-${input.channelId}`,
    PUSHER_EVENTS.MESSAGE_SENT,
    {
      message,
      channelId: input.channelId,
    }
  );

  // If there are mentions, send notifications
  if (mentions.userIds.length > 0) {
    await pusherServer.trigger(
      mentions.userIds.map((id) => `user-${id}`),
      PUSHER_EVENTS.MENTION_RECEIVED,
      {
        message,
        channelId: input.channelId,
        mentionedBy: message.user,
      }
    );
  }

  return message;
}

/**
 * Get a single message by ID
 */
export async function getMessage(
  messageId: string
): Promise<MessageWithDetails | null> {
  const message = await db.message.findUnique({
    where: { id: messageId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          department: true,
          role: true,
        },
      },
      reactions: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      attachments: true,
    },
  });

  return message as MessageWithDetails | null;
}

/**
 * Get messages for a channel with pagination
 */
export async function getMessages(
  channelId: string,
  options?: {
    limit?: number;
    cursor?: string; // Message ID to paginate from
    direction?: "older" | "newer";
  }
): Promise<{
  messages: MessageWithDetails[];
  hasMore: boolean;
  nextCursor?: string;
}> {
  const limit = options?.limit || 50;
  const direction = options?.direction || "older";

  const messages = await db.message.findMany({
    where: {
      channelId,
      parentId: null, // Only top-level messages
      isDeleted: false,
      ...(options?.cursor
        ? {
            createdAt:
              direction === "older"
                ? { lt: (await db.message.findUnique({ where: { id: options.cursor } }))?.createdAt }
                : { gt: (await db.message.findUnique({ where: { id: options.cursor } }))?.createdAt },
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          department: true,
          role: true,
        },
      },
      reactions: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      attachments: true,
    },
    orderBy: { createdAt: direction === "older" ? "desc" : "asc" },
    take: limit + 1, // Fetch one extra to check if there's more
  });

  const hasMore = messages.length > limit;
  const resultMessages = hasMore ? messages.slice(0, limit) : messages;

  // Reverse if we fetched older messages (so newest is last)
  if (direction === "older") {
    resultMessages.reverse();
  }

  return {
    messages: resultMessages as MessageWithDetails[],
    hasMore,
    nextCursor: hasMore ? resultMessages[resultMessages.length - 1]?.id : undefined,
  };
}

/**
 * Get thread replies for a message
 */
export async function getThreadReplies(
  parentId: string,
  options?: {
    limit?: number;
    cursor?: string;
  }
): Promise<{
  messages: MessageWithDetails[];
  hasMore: boolean;
}> {
  const limit = options?.limit || 50;

  const messages = await db.message.findMany({
    where: {
      parentId,
      isDeleted: false,
      ...(options?.cursor
        ? {
            createdAt: {
              gt: (await db.message.findUnique({ where: { id: options.cursor } }))?.createdAt,
            },
          }
        : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          department: true,
          role: true,
        },
      },
      reactions: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      attachments: true,
    },
    orderBy: { createdAt: "asc" },
    take: limit + 1,
  });

  const hasMore = messages.length > limit;

  return {
    messages: (hasMore ? messages.slice(0, limit) : messages) as MessageWithDetails[],
    hasMore,
  };
}

/**
 * Edit a message
 */
export async function editMessage(
  messageId: string,
  userId: string,
  newContent: string
) {
  // Verify ownership
  const message = await db.message.findUnique({
    where: { id: messageId },
  });

  if (!message || message.userId !== userId) {
    throw new Error("Cannot edit this message");
  }

  // Extract new mentions
  const mentions = extractMentions(newContent);

  const updated = await db.message.update({
    where: { id: messageId },
    data: {
      content: newContent,
      isEdited: true,
      editedAt: new Date(),
      mentionedUserIds: mentions.userIds,
      mentionedChannelIds: mentions.channelIds,
      hasMentionAll: mentions.hasMentionAll,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          department: true,
          role: true,
        },
      },
      reactions: {
        include: {
          user: { select: { id: true, name: true } },
        },
      },
      attachments: true,
    },
  });

  // Send real-time update
  await pusherServer.trigger(
    `channel-${message.channelId}`,
    PUSHER_EVENTS.MESSAGE_EDITED,
    {
      message: updated,
      channelId: message.channelId,
    }
  );

  return updated;
}

/**
 * Delete a message (soft delete)
 */
export async function deleteMessage(
  messageId: string,
  userId: string,
  isAdmin = false
) {
  const message = await db.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new Error("Message not found");
  }

  // Check permission
  if (!isAdmin && message.userId !== userId) {
    throw new Error("Cannot delete this message");
  }

  const deleted = await db.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      deletedById: userId,
      content: "[Message deleted]",
    },
  });

  // Update parent's reply count if this was a reply
  if (message.parentId) {
    await db.message.update({
      where: { id: message.parentId },
      data: { replyCount: { decrement: 1 } },
    });
  }

  // Send real-time update
  await pusherServer.trigger(
    `channel-${message.channelId}`,
    PUSHER_EVENTS.MESSAGE_DELETED,
    {
      messageId,
      channelId: message.channelId,
    }
  );

  return deleted;
}

// ============================================
// REACTIONS
// ============================================

/**
 * Add a reaction to a message
 */
export async function addReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const reaction = await db.messageReaction.create({
    data: {
      messageId,
      userId,
      emoji,
    },
    include: {
      user: { select: { id: true, name: true } },
      message: { select: { channelId: true } },
    },
  });

  // Send real-time update
  await pusherServer.trigger(
    `channel-${reaction.message.channelId}`,
    PUSHER_EVENTS.REACTION_ADDED,
    {
      messageId,
      reaction: {
        id: reaction.id,
        emoji: reaction.emoji,
        userId: reaction.userId,
        user: reaction.user,
      },
    }
  );

  return reaction;
}

/**
 * Remove a reaction from a message
 */
export async function removeReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const reaction = await db.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: { messageId, userId, emoji },
    },
    include: {
      message: { select: { channelId: true } },
    },
  });

  if (!reaction) return;

  await db.messageReaction.delete({
    where: {
      messageId_userId_emoji: { messageId, userId, emoji },
    },
  });

  // Send real-time update
  await pusherServer.trigger(
    `channel-${reaction.message.channelId}`,
    PUSHER_EVENTS.REACTION_REMOVED,
    {
      messageId,
      emoji,
      userId,
    }
  );
}

/**
 * Toggle a reaction (add if not exists, remove if exists)
 */
export async function toggleReaction(
  messageId: string,
  userId: string,
  emoji: string
) {
  const existing = await db.messageReaction.findUnique({
    where: {
      messageId_userId_emoji: { messageId, userId, emoji },
    },
  });

  if (existing) {
    await removeReaction(messageId, userId, emoji);
    return { action: "removed" };
  } else {
    await addReaction(messageId, userId, emoji);
    return { action: "added" };
  }
}

// ============================================
// ATTACHMENTS
// ============================================

/**
 * Add an attachment to a message
 */
export async function addMessageAttachment(
  messageId: string,
  uploadedById: string,
  attachment: {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileUrl: string;
    width?: number;
    height?: number;
    thumbnailUrl?: string;
  }
) {
  return db.messageAttachment.create({
    data: {
      messageId,
      uploadedById,
      ...attachment,
    },
  });
}

// ============================================
// PINNED MESSAGES
// ============================================

/**
 * Pin a message
 */
export async function pinMessage(
  channelId: string,
  messageId: string,
  pinnedById: string
) {
  const pinned = await db.pinnedMessage.create({
    data: {
      channelId,
      messageId,
      pinnedById,
    },
    include: {
      message: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
    },
  });

  // Send real-time update
  await pusherServer.trigger(
    `channel-${channelId}`,
    PUSHER_EVENTS.MESSAGE_PINNED,
    {
      pinnedMessage: pinned,
    }
  );

  return pinned;
}

/**
 * Unpin a message
 */
export async function unpinMessage(channelId: string, messageId: string) {
  await db.pinnedMessage.delete({
    where: {
      channelId_messageId: { channelId, messageId },
    },
  });

  // Send real-time update
  await pusherServer.trigger(
    `channel-${channelId}`,
    PUSHER_EVENTS.MESSAGE_UNPINNED,
    {
      messageId,
    }
  );
}

/**
 * Get pinned messages for a channel
 */
export async function getPinnedMessages(channelId: string) {
  return db.pinnedMessage.findMany({
    where: { channelId },
    include: {
      message: {
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
      },
      pinnedBy: {
        select: { id: true, name: true },
      },
    },
    orderBy: { pinnedAt: "desc" },
  });
}

// ============================================
// SEARCH
// ============================================

/**
 * Search messages in a channel or organization
 */
export async function searchMessages(
  organizationId: string,
  query: string,
  options?: {
    channelId?: string;
    userId?: string;
    limit?: number;
  }
) {
  return db.message.findMany({
    where: {
      organizationId,
      channelId: options?.channelId,
      userId: options?.userId,
      isDeleted: false,
      content: {
        contains: query,
        mode: "insensitive",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      channel: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit || 20,
  });
}

// ============================================
// TYPING INDICATORS
// ============================================

/**
 * Send typing indicator
 */
export async function sendTypingIndicator(
  channelId: string,
  user: { id: string; name: string }
) {
  await pusherServer.trigger(
    `channel-${channelId}`,
    PUSHER_EVENTS.USER_TYPING,
    {
      user,
      channelId,
    }
  );
}

/**
 * Send stop typing indicator
 */
export async function sendStopTypingIndicator(
  channelId: string,
  userId: string
) {
  await pusherServer.trigger(
    `channel-${channelId}`,
    PUSHER_EVENTS.USER_STOP_TYPING,
    {
      userId,
      channelId,
    }
  );
}

// ============================================
// UNREAD COUNT
// ============================================

/**
 * Get unread message count for a user in a channel
 */
export async function getUnreadCount(
  channelId: string,
  userId: string
): Promise<number> {
  const membership = await db.channelMember.findUnique({
    where: {
      channelId_userId: { channelId, userId },
    },
  });

  if (!membership?.lastReadAt) {
    // Never read - count all messages
    return db.message.count({
      where: { channelId, isDeleted: false },
    });
  }

  return db.message.count({
    where: {
      channelId,
      isDeleted: false,
      createdAt: { gt: membership.lastReadAt },
    },
  });
}

/**
 * Get unread counts for all channels a user is in
 */
export async function getAllUnreadCounts(
  organizationId: string,
  userId: string
): Promise<Record<string, number>> {
  const memberships = await db.channelMember.findMany({
    where: {
      userId,
      channel: { organizationId },
    },
    select: {
      channelId: true,
      lastReadAt: true,
    },
  });

  const counts: Record<string, number> = {};

  for (const membership of memberships) {
    if (!membership.lastReadAt) {
      counts[membership.channelId] = await db.message.count({
        where: { channelId: membership.channelId, isDeleted: false },
      });
    } else {
      counts[membership.channelId] = await db.message.count({
        where: {
          channelId: membership.channelId,
          isDeleted: false,
          createdAt: { gt: membership.lastReadAt },
        },
      });
    }
  }

  return counts;
}
