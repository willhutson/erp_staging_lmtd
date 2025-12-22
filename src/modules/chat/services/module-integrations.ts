/**
 * Module Integrations
 *
 * Connects chat notifications with other modules in the platform.
 * Call these functions from module actions to trigger chat updates.
 *
 * @module chat/services/module-integrations
 */

import { db } from "@/lib/db";
import {
  notifyBriefCreated,
  notifyBriefAssigned,
  notifyBriefCompleted,
  notifyContentSubmitted,
  notifyContentApproved,
  notifyContentRevision,
  notifyContentPublished,
  notifyClientFeedback,
  sendCelebration,
} from "./chat-notifications";

// ============================================
// BRIEF INTEGRATIONS
// ============================================

/**
 * Called when a brief is created
 */
export async function onBriefCreated(brief: {
  id: string;
  organizationId: string;
  title: string;
  type: string;
  clientId: string;
  createdById: string;
  assigneeId?: string | null;
}) {
  try {
    // Get client and user details
    const [client, creator, assignee] = await Promise.all([
      db.client.findUnique({
        where: { id: brief.clientId },
        select: { name: true, code: true },
      }),
      db.user.findUnique({
        where: { id: brief.createdById },
        select: { id: true, name: true },
      }),
      brief.assigneeId
        ? db.user.findUnique({
            where: { id: brief.assigneeId },
            select: { id: true, name: true },
          })
        : null,
    ]);

    if (!creator) return;

    // Notify in default channel
    await notifyBriefCreated(
      { organizationId: brief.organizationId },
      {
        briefId: brief.id,
        briefTitle: brief.title,
        briefType: brief.type.replace(/_/g, " ").toLowerCase(),
        clientName: client?.name,
        createdBy: { id: creator.id, name: creator.name },
        assignedTo: assignee ? { id: assignee.id, name: assignee.name } : undefined,
      }
    );

    // If assigned, also DM the assignee
    if (assignee) {
      await notifyBriefAssigned(
        { organizationId: brief.organizationId },
        {
          briefId: brief.id,
          briefTitle: brief.title,
          briefType: brief.type.replace(/_/g, " ").toLowerCase(),
          clientName: client?.name,
          createdBy: { id: creator.id, name: creator.name },
          assignedTo: { id: assignee.id, name: assignee.name },
        }
      );
    }
  } catch (error) {
    console.error("Failed to send brief created notification:", error);
  }
}

/**
 * Called when a brief is completed
 */
export async function onBriefCompleted(brief: {
  id: string;
  organizationId: string;
  title: string;
  type: string;
  completedById: string;
}) {
  try {
    const completedBy = await db.user.findUnique({
      where: { id: brief.completedById },
      select: { id: true, name: true },
    });

    await notifyBriefCompleted(
      { organizationId: brief.organizationId },
      {
        briefId: brief.id,
        briefTitle: brief.title,
        briefType: brief.type.replace(/_/g, " ").toLowerCase(),
        createdBy: { id: "", name: "" },
        assignedTo: completedBy
          ? { id: completedBy.id, name: completedBy.name }
          : undefined,
      }
    );
  } catch (error) {
    console.error("Failed to send brief completed notification:", error);
  }
}

// ============================================
// CONTENT ENGINE INTEGRATIONS
// ============================================

/**
 * Called when content is submitted for approval
 */
export async function onContentSubmitted(content: {
  id: string;
  organizationId: string;
  title?: string;
  platform: string;
  clientId: string;
  submittedById: string;
}) {
  try {
    const [client, submitter] = await Promise.all([
      db.client.findUnique({
        where: { id: content.clientId },
        select: { name: true },
      }),
      db.user.findUnique({
        where: { id: content.submittedById },
        select: { id: true, name: true },
      }),
    ]);

    await notifyContentSubmitted(
      { organizationId: content.organizationId },
      {
        postId: content.id,
        postTitle: content.title,
        platform: content.platform,
        clientName: client?.name,
        submittedBy: submitter
          ? { id: submitter.id, name: submitter.name }
          : undefined,
      }
    );
  } catch (error) {
    console.error("Failed to send content submitted notification:", error);
  }
}

/**
 * Called when content is approved
 */
export async function onContentApproved(content: {
  id: string;
  organizationId: string;
  title?: string;
  platform: string;
  approvedById?: string;
  scheduledFor?: Date;
}) {
  try {
    const reviewer = content.approvedById
      ? await db.user.findUnique({
          where: { id: content.approvedById },
          select: { id: true, name: true },
        })
      : null;

    await notifyContentApproved(
      { organizationId: content.organizationId },
      {
        postId: content.id,
        postTitle: content.title,
        platform: content.platform,
        reviewedBy: reviewer
          ? { id: reviewer.id, name: reviewer.name }
          : { id: "", name: "Client" },
        scheduledFor: content.scheduledFor,
      }
    );
  } catch (error) {
    console.error("Failed to send content approved notification:", error);
  }
}

/**
 * Called when content needs revision
 */
export async function onContentRevisionRequested(content: {
  id: string;
  organizationId: string;
  title?: string;
  platform: string;
  submittedById?: string;
  feedback?: string;
  requestedById?: string;
}) {
  try {
    const reviewer = content.requestedById
      ? await db.user.findUnique({
          where: { id: content.requestedById },
          select: { id: true, name: true },
        })
      : null;

    const submitter = content.submittedById
      ? await db.user.findUnique({
          where: { id: content.submittedById },
          select: { id: true, name: true },
        })
      : null;

    await notifyContentRevision(
      { organizationId: content.organizationId },
      {
        postId: content.id,
        postTitle: content.title,
        platform: content.platform,
        submittedBy: submitter
          ? { id: submitter.id, name: submitter.name }
          : undefined,
        reviewedBy: reviewer
          ? { id: reviewer.id, name: reviewer.name }
          : { id: "", name: "Client" },
      },
      content.feedback
    );
  } catch (error) {
    console.error("Failed to send content revision notification:", error);
  }
}

/**
 * Called when content is published
 */
export async function onContentPublished(content: {
  id: string;
  organizationId: string;
  title?: string;
  platform: string;
  clientId?: string;
}) {
  try {
    const client = content.clientId
      ? await db.client.findUnique({
          where: { id: content.clientId },
          select: { name: true },
        })
      : null;

    await notifyContentPublished(
      { organizationId: content.organizationId },
      {
        postId: content.id,
        postTitle: content.title,
        platform: content.platform,
        clientName: client?.name,
      }
    );
  } catch (error) {
    console.error("Failed to send content published notification:", error);
  }
}

// ============================================
// CLIENT PORTAL INTEGRATIONS
// ============================================

/**
 * Called when client provides feedback
 */
export async function onClientFeedback(feedback: {
  organizationId: string;
  clientId: string;
  clientName: string;
  feedbackType: "positive" | "revision" | "rejection";
  postTitle?: string;
  comment?: string;
}) {
  try {
    await notifyClientFeedback(
      { organizationId: feedback.organizationId },
      {
        clientName: feedback.clientName,
        feedbackType: feedback.feedbackType,
        postTitle: feedback.postTitle,
        comment: feedback.comment,
      }
    );
  } catch (error) {
    console.error("Failed to send client feedback notification:", error);
  }
}

// ============================================
// CELEBRATION INTEGRATIONS
// ============================================

/**
 * Celebrate a milestone (e.g., 100th post for a client)
 */
export async function celebrateMilestone(milestone: {
  organizationId: string;
  title: string;
  description?: string;
  userIds?: string[];
}) {
  try {
    await sendCelebration(
      { organizationId: milestone.organizationId },
      {
        title: milestone.title,
        description: milestone.description,
        celebrationType: "milestone",
        mentionUserIds: milestone.userIds,
      }
    );
  } catch (error) {
    console.error("Failed to send milestone celebration:", error);
  }
}

/**
 * Celebrate a team achievement
 */
export async function celebrateAchievement(achievement: {
  organizationId: string;
  title: string;
  description?: string;
  userIds?: string[];
}) {
  try {
    await sendCelebration(
      { organizationId: achievement.organizationId },
      {
        title: achievement.title,
        description: achievement.description,
        celebrationType: "achievement",
        mentionUserIds: achievement.userIds,
      }
    );
  } catch (error) {
    console.error("Failed to send achievement celebration:", error);
  }
}

/**
 * Birthday celebration
 */
export async function celebrateBirthday(birthday: {
  organizationId: string;
  userName: string;
  userId: string;
}) {
  try {
    await sendCelebration(
      { organizationId: birthday.organizationId },
      {
        title: `Happy Birthday, ${birthday.userName}!`,
        description: "Wishing you an amazing day!",
        celebrationType: "birthday",
        mentionUserIds: [birthday.userId],
      }
    );
  } catch (error) {
    console.error("Failed to send birthday celebration:", error);
  }
}

/**
 * Work anniversary
 */
export async function celebrateAnniversary(anniversary: {
  organizationId: string;
  userName: string;
  userId: string;
  years: number;
}) {
  try {
    const yearText = anniversary.years === 1 ? "1 year" : `${anniversary.years} years`;

    await sendCelebration(
      { organizationId: anniversary.organizationId },
      {
        title: `${anniversary.userName} celebrates ${yearText} at LMTD!`,
        description: "Thank you for being part of the team!",
        celebrationType: "anniversary",
        mentionUserIds: [anniversary.userId],
      }
    );
  } catch (error) {
    console.error("Failed to send anniversary celebration:", error);
  }
}
