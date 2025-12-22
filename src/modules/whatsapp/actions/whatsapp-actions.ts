"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export type ConversationStatus = "ACTIVE" | "ARCHIVED" | "BLOCKED";
export type MessageDirection = "INBOUND" | "OUTBOUND";
export type MessageType = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO" | "VOICE_NOTE" | "DOCUMENT" | "STICKER" | "LOCATION" | "CONTACT";

export interface CreateConversationInput {
  waPhoneNumber: string;
  waDisplayName?: string;
  clientId?: string;
  briefId?: string;
  contactId?: string;
  provider?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  messageType?: MessageType;
  mediaUrl?: string;
  replyToId?: string;
}

export interface InboundMessageInput {
  organizationId: string;
  waPhoneNumber: string;
  waDisplayName?: string;
  waMessageId: string;
  waTimestamp: Date;
  messageType: MessageType;
  content?: string;
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  voiceDuration?: number;
  replyToWaId?: string;
}

// ============================================
// CONVERSATION OPERATIONS
// ============================================

/**
 * Get all conversations for the organization
 */
export async function getConversations(options?: {
  status?: ConversationStatus;
  clientId?: string;
  assignedToId?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.status) where.status = options.status;
  if (options?.clientId) where.clientId = options.clientId;
  if (options?.assignedToId) where.assignedToId = options.assignedToId;

  return db.whatsAppConversation.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, code: true } },
      contact: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true, briefNumber: true } },
    },
    orderBy: { lastMessageAt: "desc" },
    take: options?.limit ?? 50,
  });
}

/**
 * Get a single conversation with messages
 */
export async function getConversation(id: string, messageLimit: number = 50) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const conversation = await db.whatsAppConversation.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, code: true } },
      contact: { select: { id: true, name: true, email: true, phone: true } },
      assignedTo: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true, briefNumber: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: messageLimit,
        include: {
          sender: { select: { id: true, name: true } },
          transcription: true,
          replyTo: {
            select: { id: true, content: true, messageType: true },
          },
        },
      },
    },
  });

  if (!conversation || conversation.organizationId !== session.user.organizationId) {
    return null;
  }

  // Mark as read
  if (conversation.unreadCount > 0) {
    await db.whatsAppConversation.update({
      where: { id },
      data: { unreadCount: 0 },
    });
  }

  return conversation;
}

/**
 * Get or create a conversation by phone number
 */
export async function getOrCreateConversation(input: CreateConversationInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Try to find existing conversation
  let conversation = await db.whatsAppConversation.findUnique({
    where: {
      organizationId_waPhoneNumber: {
        organizationId: session.user.organizationId,
        waPhoneNumber: input.waPhoneNumber,
      },
    },
  });

  if (!conversation) {
    conversation = await db.whatsAppConversation.create({
      data: {
        organizationId: session.user.organizationId,
        waPhoneNumber: input.waPhoneNumber,
        waDisplayName: input.waDisplayName,
        clientId: input.clientId,
        briefId: input.briefId,
        contactId: input.contactId,
        provider: input.provider ?? "whatsapp_business",
      },
    });
  }

  return conversation;
}

/**
 * Update conversation assignment or linking
 */
export async function updateConversation(
  id: string,
  data: {
    clientId?: string | null;
    briefId?: string | null;
    contactId?: string | null;
    assignedToId?: string | null;
    status?: ConversationStatus;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.whatsAppConversation.findUnique({
    where: { id },
  });

  if (!existing || existing.organizationId !== session.user.organizationId) {
    throw new Error("Conversation not found");
  }

  const conversation = await db.whatsAppConversation.update({
    where: { id },
    data,
  });

  revalidatePath("/whatsapp");
  return conversation;
}

// ============================================
// MESSAGE OPERATIONS
// ============================================

/**
 * Send an outbound message
 */
export async function sendMessage(input: SendMessageInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const conversation = await db.whatsAppConversation.findUnique({
    where: { id: input.conversationId },
  });

  if (!conversation || conversation.organizationId !== session.user.organizationId) {
    throw new Error("Conversation not found");
  }

  // Create the message record
  const message = await db.whatsAppMessage.create({
    data: {
      organizationId: session.user.organizationId,
      conversationId: input.conversationId,
      direction: "OUTBOUND",
      senderId: session.user.id,
      messageType: input.messageType ?? "TEXT",
      content: input.content,
      mediaUrl: input.mediaUrl,
      replyToId: input.replyToId,
    },
  });

  // Update conversation last message
  await db.whatsAppConversation.update({
    where: { id: input.conversationId },
    data: {
      lastMessageAt: new Date(),
      lastMessagePreview: input.content?.slice(0, 100),
    },
  });

  // TODO: Actually send via WhatsApp Business API / Gupshup
  // This would be an async job that updates waMessageId and waStatus

  revalidatePath("/whatsapp");
  revalidatePath(`/whatsapp/${input.conversationId}`);

  return message;
}

/**
 * Process an inbound message (called by webhook)
 */
export async function processInboundMessage(input: InboundMessageInput) {
  // Check if message already exists (deduplication)
  const existing = await db.whatsAppMessage.findUnique({
    where: { waMessageId: input.waMessageId },
  });

  if (existing) {
    return existing;
  }

  // Get or create conversation
  let conversation = await db.whatsAppConversation.findUnique({
    where: {
      organizationId_waPhoneNumber: {
        organizationId: input.organizationId,
        waPhoneNumber: input.waPhoneNumber,
      },
    },
  });

  if (!conversation) {
    conversation = await db.whatsAppConversation.create({
      data: {
        organizationId: input.organizationId,
        waPhoneNumber: input.waPhoneNumber,
        waDisplayName: input.waDisplayName,
        provider: "whatsapp_business",
      },
    });
  }

  // Find reply context if applicable
  let replyToId: string | undefined;
  if (input.replyToWaId) {
    const replyTo = await db.whatsAppMessage.findUnique({
      where: { waMessageId: input.replyToWaId },
    });
    replyToId = replyTo?.id;
  }

  // Create the message
  const message = await db.whatsAppMessage.create({
    data: {
      organizationId: input.organizationId,
      conversationId: conversation.id,
      direction: "INBOUND",
      messageType: input.messageType,
      content: input.content,
      mediaUrl: input.mediaUrl,
      mediaMimeType: input.mediaMimeType,
      mediaSize: input.mediaSize,
      voiceDuration: input.voiceDuration,
      waMessageId: input.waMessageId,
      waTimestamp: input.waTimestamp,
      waStatus: "delivered",
      replyToId,
    },
  });

  // Update conversation
  await db.whatsAppConversation.update({
    where: { id: conversation.id },
    data: {
      lastMessageAt: input.waTimestamp,
      lastMessagePreview: input.content?.slice(0, 100) ?? `[${input.messageType}]`,
      unreadCount: { increment: 1 },
      waDisplayName: input.waDisplayName ?? conversation.waDisplayName,
    },
  });

  return message;
}

/**
 * Get messages for a conversation with pagination
 */
export async function getMessages(
  conversationId: string,
  options?: {
    before?: string; // Message ID cursor
    limit?: number;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const conversation = await db.whatsAppConversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation || conversation.organizationId !== session.user.organizationId) {
    throw new Error("Conversation not found");
  }

  const where: Record<string, unknown> = { conversationId };

  if (options?.before) {
    const cursor = await db.whatsAppMessage.findUnique({
      where: { id: options.before },
    });
    if (cursor) {
      where.createdAt = { lt: cursor.createdAt };
    }
  }

  return db.whatsAppMessage.findMany({
    where,
    include: {
      sender: { select: { id: true, name: true } },
      transcription: true,
      replyTo: {
        select: { id: true, content: true, messageType: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
}

// ============================================
// SEARCH & ANALYTICS
// ============================================

/**
 * Search conversations by phone number or display name
 */
export async function searchConversations(query: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.whatsAppConversation.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [
        { waPhoneNumber: { contains: query } },
        { waDisplayName: { contains: query, mode: "insensitive" } },
        { client: { name: { contains: query, mode: "insensitive" } } },
        { contact: { name: { contains: query, mode: "insensitive" } } },
      ],
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
      contact: { select: { id: true, name: true } },
    },
    take: 20,
  });
}

/**
 * Get conversation statistics
 */
export async function getConversationStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [total, active, unread, voiceNotes] = await Promise.all([
    db.whatsAppConversation.count({
      where: { organizationId: session.user.organizationId },
    }),
    db.whatsAppConversation.count({
      where: {
        organizationId: session.user.organizationId,
        status: "ACTIVE",
      },
    }),
    db.whatsAppConversation.aggregate({
      where: { organizationId: session.user.organizationId },
      _sum: { unreadCount: true },
    }),
    db.whatsAppMessage.count({
      where: {
        organizationId: session.user.organizationId,
        messageType: "VOICE_NOTE",
      },
    }),
  ]);

  // Messages by day (last 7 days)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const messagesByDay = await db.whatsAppMessage.groupBy({
    by: ["direction"],
    where: {
      organizationId: session.user.organizationId,
      createdAt: { gte: sevenDaysAgo },
    },
    _count: true,
  });

  return {
    totalConversations: total,
    activeConversations: active,
    totalUnread: unread._sum.unreadCount ?? 0,
    voiceNotesReceived: voiceNotes,
    messagesByDirection: Object.fromEntries(
      messagesByDay.map((m: { direction: string; _count: number }) => [m.direction, m._count])
    ),
  };
}
