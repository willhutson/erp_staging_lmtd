/**
 * Chat Notification Service
 *
 * Sends automated messages to channels when events occur in other modules.
 * Used for system notifications, celebrations, and cross-module updates.
 *
 * @module chat/services/chat-notifications
 */

import { db } from "@/lib/db";
import { sendMessage } from "../actions/message-actions";
import { findOrCreateDM } from "../actions/channel-actions";

// ============================================
// TYPES
// ============================================

export type NotificationType =
  | "brief_created"
  | "brief_assigned"
  | "brief_completed"
  | "content_submitted"
  | "content_approved"
  | "content_revision"
  | "content_published"
  | "client_feedback"
  | "deadline_reminder"
  | "mention"
  | "celebration";

interface NotificationOptions {
  organizationId: string;
  channelId?: string; // If not provided, uses default channel
  userId?: string; // For DMs
  recipientIds?: string[]; // For group DMs
}

interface BriefNotification {
  briefId: string;
  briefTitle: string;
  briefType: string;
  clientName?: string;
  createdBy: { id: string; name: string };
  assignedTo?: { id: string; name: string };
  dueDate?: Date;
}

interface ContentNotification {
  postId: string;
  postTitle?: string;
  platform: string;
  clientName?: string;
  submittedBy?: { id: string; name: string };
  reviewedBy?: { id: string; name: string };
  scheduledFor?: Date;
}

interface FeedbackNotification {
  clientName: string;
  feedbackType: "positive" | "revision" | "rejection";
  comment?: string;
  postTitle?: string;
}

// ============================================
// SYSTEM USER
// ============================================

// System user ID for automated messages (to be used when sending system notifications)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SYSTEM_USER_ID = "system";

// ============================================
// HELPER: Get or create default channel
// ============================================

async function getDefaultChannel(organizationId: string): Promise<string | null> {
  const channel = await db.channel.findFirst({
    where: {
      organizationId,
      isDefault: true,
      isArchived: false,
    },
    select: { id: true },
  });

  return channel?.id || null;
}

// ============================================
// HELPER: Get client channel
// ============================================

async function getClientChannel(
  organizationId: string,
  clientName: string
): Promise<string | null> {
  // Try to find a channel named after the client
  const channel = await db.channel.findFirst({
    where: {
      organizationId,
      name: { contains: clientName, mode: "insensitive" },
      isArchived: false,
    },
    select: { id: true },
  });

  return channel?.id || null;
}

// ============================================
// HELPER: Format system message
// ============================================

function formatSystemMessage(content: string, emoji = "🔔"): string {
  return `<p><strong>${emoji}</strong> ${content}</p>`;
}

// ============================================
// BRIEF NOTIFICATIONS
// ============================================

/**
 * Notify when a new brief is created
 */
export async function notifyBriefCreated(
  options: NotificationOptions,
  brief: BriefNotification
): Promise<void> {
  const channelId = options.channelId || (await getDefaultChannel(options.organizationId));
  if (!channelId) return;

  const clientInfo = brief.clientName ? ` for <strong>${brief.clientName}</strong>` : "";
  const dueInfo = brief.dueDate
    ? ` • Due ${brief.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
    : "";

  const content = formatSystemMessage(
    `New ${brief.briefType} brief created${clientInfo}: <strong>${brief.briefTitle}</strong>${dueInfo}`,
    "📋"
  );

  await sendSystemMessage(options.organizationId, channelId, content);
}

/**
 * Notify when a brief is assigned
 */
export async function notifyBriefAssigned(
  options: NotificationOptions,
  brief: BriefNotification
): Promise<void> {
  if (!brief.assignedTo) return;

  // Send DM to the assignee
  const dm = await findOrCreateDM(options.organizationId, [
    brief.createdBy.id,
    brief.assignedTo.id,
  ]);

  const content = formatSystemMessage(
    `${brief.createdBy.name} assigned you a ${brief.briefType} brief: <strong>${brief.briefTitle}</strong>`,
    "📌"
  );

  await sendSystemMessage(options.organizationId, dm.id, content);
}

/**
 * Notify when a brief is completed
 */
export async function notifyBriefCompleted(
  options: NotificationOptions,
  brief: BriefNotification
): Promise<void> {
  const channelId = options.channelId || (await getDefaultChannel(options.organizationId));
  if (!channelId) return;

  const completedBy = brief.assignedTo?.name || "Team";

  const content = formatSystemMessage(
    `${completedBy} completed: <strong>${brief.briefTitle}</strong>`,
    "✅"
  );

  await sendSystemMessage(options.organizationId, channelId, content);
}

// ============================================
// CONTENT NOTIFICATIONS
// ============================================

/**
 * Notify when content is submitted for approval
 */
export async function notifyContentSubmitted(
  options: NotificationOptions,
  content: ContentNotification
): Promise<void> {
  // If there's a client channel, post there
  const channelId =
    options.channelId ||
    (content.clientName
      ? await getClientChannel(options.organizationId, content.clientName)
      : await getDefaultChannel(options.organizationId));

  if (!channelId) return;

  const submitter = content.submittedBy?.name || "Team";
  const postInfo = content.postTitle || `${content.platform} post`;

  const message = formatSystemMessage(
    `${submitter} submitted <strong>${postInfo}</strong> for approval`,
    "📤"
  );

  await sendSystemMessage(options.organizationId, channelId, message);
}

/**
 * Notify when content is approved
 */
export async function notifyContentApproved(
  options: NotificationOptions,
  content: ContentNotification
): Promise<void> {
  const channelId = options.channelId || (await getDefaultChannel(options.organizationId));
  if (!channelId) return;

  const reviewer = content.reviewedBy?.name || "Client";
  const postInfo = content.postTitle || `${content.platform} post`;
  const scheduleInfo = content.scheduledFor
    ? ` • Scheduled for ${content.scheduledFor.toLocaleDateString()}`
    : "";

  const message = formatSystemMessage(
    `${reviewer} approved <strong>${postInfo}</strong>${scheduleInfo}`,
    "👍"
  );

  await sendSystemMessage(options.organizationId, channelId, message);
}

/**
 * Notify when content needs revision
 */
export async function notifyContentRevision(
  options: NotificationOptions,
  content: ContentNotification,
  feedback?: string
): Promise<void> {
  // DM the person who submitted
  if (!content.submittedBy) return;

  const defaultChannel = await getDefaultChannel(options.organizationId);
  if (!defaultChannel) return;

  const reviewer = content.reviewedBy?.name || "Client";
  const postInfo = content.postTitle || `${content.platform} post`;
  const feedbackInfo = feedback ? `<br/><em>"${feedback}"</em>` : "";

  const message = formatSystemMessage(
    `${reviewer} requested changes on <strong>${postInfo}</strong>${feedbackInfo}`,
    "✏️"
  );

  await sendSystemMessage(options.organizationId, defaultChannel, message);
}

/**
 * Notify when content is published - celebration! 🎉
 */
export async function notifyContentPublished(
  options: NotificationOptions,
  content: ContentNotification
): Promise<void> {
  const channelId = options.channelId || (await getDefaultChannel(options.organizationId));
  if (!channelId) return;

  const clientInfo = content.clientName ? ` for ${content.clientName}` : "";
  const postInfo = content.postTitle || "content";

  const message = formatSystemMessage(
    `Just published${clientInfo}! <strong>${postInfo}</strong> is now live on ${content.platform}`,
    "🎉"
  );

  await sendSystemMessage(options.organizationId, channelId, message);
}

// ============================================
// CLIENT FEEDBACK NOTIFICATIONS
// ============================================

/**
 * Notify when client gives feedback
 */
export async function notifyClientFeedback(
  options: NotificationOptions,
  feedback: FeedbackNotification
): Promise<void> {
  const channelId = options.channelId || (await getClientChannel(options.organizationId, feedback.clientName));
  if (!channelId) return;

  let emoji = "💬";
  let action = "commented on";

  if (feedback.feedbackType === "positive") {
    emoji = "💚";
    action = "loved";
  } else if (feedback.feedbackType === "rejection") {
    emoji = "🔴";
    action = "rejected";
  }

  const postInfo = feedback.postTitle ? ` <strong>${feedback.postTitle}</strong>` : " content";
  const commentInfo = feedback.comment ? `<br/><em>"${feedback.comment}"</em>` : "";

  const message = formatSystemMessage(
    `${feedback.clientName} ${action}${postInfo}${commentInfo}`,
    emoji
  );

  await sendSystemMessage(options.organizationId, channelId, message);
}

// ============================================
// DEADLINE REMINDERS
// ============================================

/**
 * Send deadline reminder
 */
export async function notifyDeadlineReminder(
  options: NotificationOptions,
  reminder: {
    title: string;
    dueDate: Date;
    assigneeIds: string[];
    entityType: "brief" | "content" | "task";
    entityId: string;
  }
): Promise<void> {
  const isOverdue = reminder.dueDate < new Date();
  const emoji = isOverdue ? "⚠️" : "⏰";
  const status = isOverdue
    ? `was due ${reminder.dueDate.toLocaleDateString()}`
    : `is due ${reminder.dueDate.toLocaleDateString()}`;

  const content = formatSystemMessage(
    `Reminder: <strong>${reminder.title}</strong> ${status}`,
    emoji
  );

  // DM each assignee
  for (const assigneeId of reminder.assigneeIds) {
    try {
      const dm = await findOrCreateDM(options.organizationId, [assigneeId]);
      await sendSystemMessage(options.organizationId, dm.id, content);
    } catch (error) {
      console.error(`Failed to send reminder to ${assigneeId}:`, error);
    }
  }
}

// ============================================
// CELEBRATION MESSAGES
// ============================================

/**
 * Send a celebration message
 */
export async function sendCelebration(
  options: NotificationOptions,
  celebration: {
    title: string;
    description?: string;
    celebrationType: "milestone" | "achievement" | "birthday" | "anniversary" | "custom";
    mentionUserIds?: string[];
  }
): Promise<void> {
  const channelId = options.channelId || (await getDefaultChannel(options.organizationId));
  if (!channelId) return;

  const emojiMap = {
    milestone: "🏆",
    achievement: "⭐",
    birthday: "🎂",
    anniversary: "🎊",
    custom: "🎉",
  };

  const emoji = emojiMap[celebration.celebrationType];
  const description = celebration.description
    ? `<br/>${celebration.description}`
    : "";

  const mentions = celebration.mentionUserIds?.length
    ? celebration.mentionUserIds.map((id) => `<span data-mention-id="${id}">@</span>`).join(" ")
    : "";

  const content = `<p><strong>${emoji} ${celebration.title}</strong>${description}</p>${mentions ? `<p>${mentions}</p>` : ""}`;

  await sendSystemMessage(options.organizationId, channelId, content);
}

// ============================================
// HELPER: Send system message
// ============================================

async function sendSystemMessage(
  organizationId: string,
  channelId: string,
  content: string
): Promise<void> {
  try {
    // Find or create a system user for this organization
    let systemUser = await db.user.findFirst({
      where: {
        organizationId,
        email: "system@spokestack.app",
      },
    });

    if (!systemUser) {
      // Use the first admin as fallback
      systemUser = await db.user.findFirst({
        where: {
          organizationId,
          permissionLevel: "ADMIN",
        },
      });
    }

    if (!systemUser) {
      console.error("No system user found for chat notifications");
      return;
    }

    await sendMessage({
      organizationId,
      channelId,
      userId: systemUser.id,
      content,
      contentFormat: "TIPTAP",
    });
  } catch (error) {
    console.error("Failed to send system message:", error);
  }
}

// ============================================
// BATCH NOTIFY
// ============================================

/**
 * Send the same notification to multiple channels
 */
export async function batchNotify(
  organizationId: string,
  channelIds: string[],
  content: string
): Promise<void> {
  await Promise.all(
    channelIds.map((channelId) =>
      sendSystemMessage(organizationId, channelId, content)
    )
  );
}
