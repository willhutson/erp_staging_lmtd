/**
 * Pusher Configuration
 *
 * Server-side and client-side Pusher configuration for real-time messaging.
 *
 * Environment variables required:
 * - PUSHER_APP_ID
 * - PUSHER_KEY (also NEXT_PUBLIC_PUSHER_KEY for client)
 * - PUSHER_SECRET
 * - PUSHER_CLUSTER (also NEXT_PUBLIC_PUSHER_CLUSTER for client)
 *
 * @module lib/pusher
 */

import PusherServer from "pusher";
import PusherClient from "pusher-js";

// ============================================
// SERVER-SIDE PUSHER
// ============================================

/**
 * Pusher server instance for sending events
 * Used in server actions and API routes
 */
export const pusherServer = new PusherServer({
  appId: process.env.PUSHER_APP_ID || "",
  key: process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY || "",
  secret: process.env.PUSHER_SECRET || "",
  cluster: process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
  useTLS: true,
});

// ============================================
// CLIENT-SIDE PUSHER
// ============================================

/**
 * Get or create Pusher client instance
 * Uses singleton pattern to avoid multiple connections
 */
let pusherClientInstance: PusherClient | null = null;

export function getPusherClient(): PusherClient {
  if (!pusherClientInstance) {
    pusherClientInstance = new PusherClient(
      process.env.NEXT_PUBLIC_PUSHER_KEY || "",
      {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap2",
        // Enable encrypted connections
        forceTLS: true,
        // Auth endpoint for private channels (optional)
        authEndpoint: "/api/pusher/auth",
      }
    );
  }
  return pusherClientInstance;
}

// ============================================
// EVENT NAMES
// ============================================

/**
 * Centralized event name constants
 * Used for both sending and subscribing to events
 */
export const PUSHER_EVENTS = {
  // Message events
  MESSAGE_SENT: "message:sent",
  MESSAGE_EDITED: "message:edited",
  MESSAGE_DELETED: "message:deleted",
  MESSAGE_PINNED: "message:pinned",
  MESSAGE_UNPINNED: "message:unpinned",

  // Reaction events
  REACTION_ADDED: "reaction:added",
  REACTION_REMOVED: "reaction:removed",

  // Typing events
  USER_TYPING: "user:typing",
  USER_STOP_TYPING: "user:stop-typing",

  // Presence events
  USER_ONLINE: "user:online",
  USER_OFFLINE: "user:offline",
  USER_AWAY: "user:away",
  PRESENCE_CHANGED: "presence:changed",

  // Channel events
  CHANNEL_CREATED: "channel:created",
  CHANNEL_UPDATED: "channel:updated",
  CHANNEL_DELETED: "channel:deleted",
  MEMBER_JOINED: "member:joined",
  MEMBER_LEFT: "member:left",

  // Notification events
  MENTION_RECEIVED: "mention:received",
  DM_RECEIVED: "dm:received",
} as const;

// ============================================
// CHANNEL NAME HELPERS
// ============================================

/**
 * Generate channel name for a chat channel
 */
export function getChatChannelName(channelId: string): string {
  return `channel-${channelId}`;
}

/**
 * Generate channel name for a user's personal notifications
 */
export function getUserChannelName(userId: string): string {
  return `user-${userId}`;
}

/**
 * Generate channel name for organization-wide events
 */
export function getOrgChannelName(organizationId: string): string {
  return `org-${organizationId}`;
}

/**
 * Generate presence channel name for a chat channel
 * Presence channels track who is online in that channel
 */
export function getPresenceChannelName(channelId: string): string {
  return `presence-channel-${channelId}`;
}

// ============================================
// TYPE DEFINITIONS
// ============================================

export type PusherEventName = (typeof PUSHER_EVENTS)[keyof typeof PUSHER_EVENTS];

export interface MessageSentEvent {
  message: {
    id: string;
    channelId: string;
    content: string;
    contentFormat: string;
    createdAt: string;
    user: {
      id: string;
      name: string;
      avatarUrl: string | null;
    };
  };
  channelId: string;
}

export interface MessageEditedEvent {
  message: {
    id: string;
    content: string;
    editedAt: string;
  };
  channelId: string;
}

export interface MessageDeletedEvent {
  messageId: string;
  channelId: string;
}

export interface ReactionAddedEvent {
  messageId: string;
  reaction: {
    id: string;
    emoji: string;
    userId: string;
    user: {
      id: string;
      name: string;
    };
  };
}

export interface ReactionRemovedEvent {
  messageId: string;
  emoji: string;
  userId: string;
}

export interface UserTypingEvent {
  user: {
    id: string;
    name: string;
  };
  channelId: string;
}

export interface MentionReceivedEvent {
  message: {
    id: string;
    content: string;
    channelId: string;
  };
  channelId: string;
  mentionedBy: {
    id: string;
    name: string;
  };
}

export interface PresenceChangedEvent {
  userId: string;
  status: "ONLINE" | "AWAY" | "DND" | "OFFLINE";
  statusText?: string | null;
  statusEmoji?: string | null;
  lastSeenAt: string;
}
