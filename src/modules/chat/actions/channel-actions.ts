"use server";

/**
 * Chat Module - Channel Actions
 *
 * CRUD operations for chat channels.
 *
 * @module chat/actions/channel-actions
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { ChannelType, ChannelMemberRole } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export interface CreateChannelInput {
  organizationId: string;
  name: string;
  description?: string;
  type?: ChannelType;
  icon?: string;
  isDefault?: boolean;
  createdById: string;
  memberIds?: string[];
}

export interface UpdateChannelInput {
  name?: string;
  description?: string;
  icon?: string;
  isArchived?: boolean;
}

export interface ChannelWithDetails {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: ChannelType;
  icon: string | null;
  isArchived: boolean;
  isDefault: boolean;
  lastMessageAt: Date | null;
  messageCount: number;
  createdAt: Date;
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  _count: {
    members: number;
  };
  members?: {
    id: string;
    userId: string;
    role: ChannelMemberRole;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  }[];
}

// ============================================
// HELPERS
// ============================================

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50);
}

async function ensureUniqueSlug(
  organizationId: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;

  while (true) {
    const existing = await db.channel.findFirst({
      where: {
        organizationId,
        slug,
        id: excludeId ? { not: excludeId } : undefined,
      },
    });

    if (!existing) return slug;
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
}

// ============================================
// CHANNEL CRUD
// ============================================

/**
 * Create a new channel
 */
export async function createChannel(input: CreateChannelInput) {
  const slug = await ensureUniqueSlug(
    input.organizationId,
    generateSlug(input.name)
  );

  const channel = await db.channel.create({
    data: {
      organizationId: input.organizationId,
      name: input.name,
      slug,
      description: input.description,
      type: input.type || "PUBLIC",
      icon: input.icon,
      isDefault: input.isDefault || false,
      createdById: input.createdById,
      members: {
        create: [
          // Creator is always an owner
          {
            userId: input.createdById,
            role: "OWNER",
          },
          // Add additional members
          ...(input.memberIds || [])
            .filter((id) => id !== input.createdById)
            .map((userId) => ({
              userId,
              role: "MEMBER" as ChannelMemberRole,
            })),
        ],
      },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });

  revalidatePath("/chat");
  return channel;
}

/**
 * Get a single channel by ID
 */
export async function getChannel(
  channelId: string,
  includeMembers = false
): Promise<ChannelWithDetails | null> {
  const channel = await db.channel.findUnique({
    where: { id: channelId },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
      members: includeMembers
        ? {
            include: {
              user: {
                select: { id: true, name: true, avatarUrl: true },
              },
            },
          }
        : false,
    },
  });

  return channel as ChannelWithDetails | null;
}

/**
 * Get channel by slug
 */
export async function getChannelBySlug(
  organizationId: string,
  slug: string
): Promise<ChannelWithDetails | null> {
  const channel = await db.channel.findUnique({
    where: {
      organizationId_slug: { organizationId, slug },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });

  return channel as ChannelWithDetails | null;
}

/**
 * Get all channels for an organization
 */
export async function getChannels(
  organizationId: string,
  userId: string,
  options?: {
    type?: ChannelType;
    includeArchived?: boolean;
  }
): Promise<ChannelWithDetails[]> {
  const channels = await db.channel.findMany({
    where: {
      organizationId,
      isArchived: options?.includeArchived ? undefined : false,
      type: options?.type,
      OR: [
        // Public channels
        { type: "PUBLIC" },
        // Channels user is a member of
        { members: { some: { userId } } },
      ],
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
      members: {
        where: { userId },
        select: {
          id: true,
          role: true,
          lastReadAt: true,
          lastReadMessageId: true,
        },
      },
    },
    orderBy: [
      { isDefault: "desc" },
      { lastMessageAt: "desc" },
      { name: "asc" },
    ],
  });

  return channels as unknown as ChannelWithDetails[];
}

/**
 * Get channels user is a member of
 */
export async function getMyChannels(
  organizationId: string,
  userId: string
): Promise<ChannelWithDetails[]> {
  const channels = await db.channel.findMany({
    where: {
      organizationId,
      isArchived: false,
      members: { some: { userId } },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
    orderBy: [
      { lastMessageAt: "desc" },
      { name: "asc" },
    ],
  });

  return channels as ChannelWithDetails[];
}

/**
 * Update a channel
 */
export async function updateChannel(
  channelId: string,
  input: UpdateChannelInput
) {
  const channel = await db.channel.update({
    where: { id: channelId },
    data: {
      name: input.name,
      description: input.description,
      icon: input.icon,
      isArchived: input.isArchived,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });

  revalidatePath("/chat");
  revalidatePath(`/chat/${channel.slug}`);
  return channel;
}

/**
 * Archive a channel
 */
export async function archiveChannel(channelId: string) {
  const channel = await db.channel.update({
    where: { id: channelId },
    data: { isArchived: true },
  });

  revalidatePath("/chat");
  return channel;
}

/**
 * Delete a channel (only if empty or by admin)
 */
export async function deleteChannel(channelId: string) {
  await db.channel.delete({
    where: { id: channelId },
  });

  revalidatePath("/chat");
}

// ============================================
// CHANNEL MEMBERS
// ============================================

/**
 * Add a member to a channel
 */
export async function addChannelMember(
  channelId: string,
  userId: string,
  role: ChannelMemberRole = "MEMBER"
) {
  const member = await db.channelMember.create({
    data: {
      channelId,
      userId,
      role,
    },
    include: {
      user: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  revalidatePath("/chat");
  return member;
}

/**
 * Add multiple members to a channel
 */
export async function addChannelMembers(
  channelId: string,
  userIds: string[],
  role: ChannelMemberRole = "MEMBER"
) {
  await db.channelMember.createMany({
    data: userIds.map((userId) => ({
      channelId,
      userId,
      role,
    })),
    skipDuplicates: true,
  });

  revalidatePath("/chat");
}

/**
 * Remove a member from a channel
 */
export async function removeChannelMember(channelId: string, userId: string) {
  await db.channelMember.delete({
    where: {
      channelId_userId: { channelId, userId },
    },
  });

  revalidatePath("/chat");
}

/**
 * Update a member's role
 */
export async function updateMemberRole(
  channelId: string,
  userId: string,
  role: ChannelMemberRole
) {
  const member = await db.channelMember.update({
    where: {
      channelId_userId: { channelId, userId },
    },
    data: { role },
  });

  revalidatePath("/chat");
  return member;
}

/**
 * Get channel members
 */
export async function getChannelMembers(channelId: string) {
  const members = await db.channelMember.findMany({
    where: { channelId },
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
    },
    orderBy: [
      { role: "asc" }, // OWNER first, then ADMIN, then MEMBER
      { joinedAt: "asc" },
    ],
  });

  return members;
}

/**
 * Check if user is a member of a channel
 */
export async function isChannelMember(
  channelId: string,
  userId: string
): Promise<boolean> {
  const member = await db.channelMember.findUnique({
    where: {
      channelId_userId: { channelId, userId },
    },
  });

  return !!member;
}

/**
 * Get user's membership in a channel
 */
export async function getChannelMembership(channelId: string, userId: string) {
  return db.channelMember.findUnique({
    where: {
      channelId_userId: { channelId, userId },
    },
  });
}

/**
 * Join a public channel
 */
export async function joinChannel(channelId: string, userId: string) {
  const channel = await db.channel.findUnique({
    where: { id: channelId },
  });

  if (!channel || channel.type !== "PUBLIC") {
    throw new Error("Cannot join this channel");
  }

  return addChannelMember(channelId, userId);
}

/**
 * Leave a channel
 */
export async function leaveChannel(channelId: string, userId: string) {
  const membership = await getChannelMembership(channelId, userId);

  if (membership?.role === "OWNER") {
    // Transfer ownership or prevent leaving
    const otherMembers = await db.channelMember.findMany({
      where: {
        channelId,
        userId: { not: userId },
      },
      orderBy: { joinedAt: "asc" },
      take: 1,
    });

    if (otherMembers.length > 0) {
      // Transfer ownership to next member
      await updateMemberRole(channelId, otherMembers[0].userId, "OWNER");
    }
  }

  return removeChannelMember(channelId, userId);
}

// ============================================
// DIRECT MESSAGES
// ============================================

/**
 * Find or create a DM channel between users
 */
export async function findOrCreateDM(
  organizationId: string,
  userIds: string[]
): Promise<ChannelWithDetails> {
  // Sort IDs for consistent lookup
  const sortedIds = [...userIds].sort();

  // Check for existing DM
  const existingDM = await db.channel.findFirst({
    where: {
      organizationId,
      type: "DM",
      dmParticipantIds: { equals: sortedIds },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });

  if (existingDM) {
    return existingDM as ChannelWithDetails;
  }

  // Get user names for DM name
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });

  const dmName = users.map((u) => u.name).join(", ");
  const slug = `dm-${sortedIds.join("-")}`;

  // Create new DM
  const dm = await db.channel.create({
    data: {
      organizationId,
      name: dmName,
      slug,
      type: "DM",
      dmParticipantIds: sortedIds,
      createdById: userIds[0],
      members: {
        create: userIds.map((userId) => ({
          userId,
          role: "MEMBER",
        })),
      },
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
    },
  });

  return dm as ChannelWithDetails;
}

/**
 * Get all DMs for a user
 */
export async function getDirectMessages(
  organizationId: string,
  userId: string
): Promise<ChannelWithDetails[]> {
  const dms = await db.channel.findMany({
    where: {
      organizationId,
      type: "DM",
      members: { some: { userId } },
      isArchived: false,
    },
    include: {
      createdBy: {
        select: { id: true, name: true, avatarUrl: true },
      },
      _count: { select: { members: true } },
      members: {
        where: { userId: { not: userId } },
        include: {
          user: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        take: 3,
      },
    },
    orderBy: { lastMessageAt: "desc" },
  });

  return dms as unknown as ChannelWithDetails[];
}

// ============================================
// NOTIFICATION PREFERENCES
// ============================================

/**
 * Update notification preferences for a channel
 */
export async function updateChannelNotifications(
  channelId: string,
  userId: string,
  preferences: {
    notifyAll?: boolean;
    notifyMentions?: boolean;
    notifyNone?: boolean;
  }
) {
  return db.channelMember.update({
    where: {
      channelId_userId: { channelId, userId },
    },
    data: {
      notifyAll: preferences.notifyAll,
      notifyMentions: preferences.notifyMentions,
      notifyNone: preferences.notifyNone,
    },
  });
}

/**
 * Mark channel as read
 */
export async function markChannelAsRead(
  channelId: string,
  userId: string,
  messageId?: string
) {
  return db.channelMember.update({
    where: {
      channelId_userId: { channelId, userId },
    },
    data: {
      lastReadAt: new Date(),
      lastReadMessageId: messageId,
    },
  });
}

// ============================================
// DEFAULT CHANNELS
// ============================================

/**
 * Create default channels for a new organization
 */
export async function createDefaultChannels(
  organizationId: string,
  createdById: string
) {
  const defaultChannels = [
    { name: "General", icon: "💬", isDefault: true },
    { name: "Announcements", icon: "📢" },
    { name: "Random", icon: "🎲" },
  ];

  for (const ch of defaultChannels) {
    await createChannel({
      organizationId,
      name: ch.name,
      icon: ch.icon,
      isDefault: ch.isDefault || false,
      createdById,
      type: "PUBLIC",
    });
  }
}

/**
 * Auto-join user to default channels
 */
export async function joinDefaultChannels(
  organizationId: string,
  userId: string
) {
  const defaultChannels = await db.channel.findMany({
    where: {
      organizationId,
      isDefault: true,
      isArchived: false,
    },
  });

  for (const channel of defaultChannels) {
    const existing = await db.channelMember.findUnique({
      where: {
        channelId_userId: { channelId: channel.id, userId },
      },
    });

    if (!existing) {
      await addChannelMember(channel.id, userId);
    }
  }
}
