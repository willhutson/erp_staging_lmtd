/**
 * Slack Notification Service
 * Sends notifications to Slack channels based on mappings
 */

import { db } from "@/lib/db";
import { slackClient, type SlackBlock } from "./client";

interface NotificationPayload {
  type: string;
  title: string;
  body?: string;
  actionUrl?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Build Slack blocks for different notification types
 */
function buildNotificationBlocks(
  notification: NotificationPayload,
  baseUrl: string
): SlackBlock[] {
  const blocks: SlackBlock[] = [];

  // Header
  blocks.push({
    type: "header",
    text: {
      type: "plain_text",
      text: notification.title,
      emoji: true,
    },
  });

  // Body text
  if (notification.body) {
    blocks.push({
      type: "section",
      text: {
        type: "mrkdwn",
        text: notification.body,
      },
    });
  }

  // Add context based on notification type
  const contextFields = buildContextFields(notification);
  if (contextFields.length > 0) {
    blocks.push({
      type: "section",
      fields: contextFields,
    });
  }

  // Action button
  if (notification.actionUrl) {
    blocks.push({
      type: "actions",
      elements: [
        {
          type: "button",
          text: {
            type: "plain_text",
            text: "View Details",
            emoji: true,
          },
          url: `${baseUrl}${notification.actionUrl}`,
        },
      ],
    });
  }

  // Divider
  blocks.push({ type: "divider" });

  return blocks;
}

function buildContextFields(
  notification: NotificationPayload
): Array<{ type: string; text: string }> {
  const fields: Array<{ type: string; text: string }> = [];
  const meta = notification.metadata || {};

  if (meta.clientName) {
    fields.push({
      type: "mrkdwn",
      text: `*Client:* ${meta.clientName}`,
    });
  }

  if (meta.briefType) {
    fields.push({
      type: "mrkdwn",
      text: `*Type:* ${String(meta.briefType).replace("_", " ")}`,
    });
  }

  if (meta.assigneeName) {
    fields.push({
      type: "mrkdwn",
      text: `*Assigned to:* ${meta.assigneeName}`,
    });
  }

  if (meta.deadline) {
    fields.push({
      type: "mrkdwn",
      text: `*Deadline:* ${meta.deadline}`,
    });
  }

  if (meta.priority && meta.priority !== "MEDIUM") {
    const priorityEmoji =
      meta.priority === "URGENT" ? "🔴" : meta.priority === "HIGH" ? "🟠" : "";
    fields.push({
      type: "mrkdwn",
      text: `*Priority:* ${priorityEmoji} ${meta.priority}`,
    });
  }

  return fields;
}

/**
 * Get the appropriate channel for a notification
 */
async function getChannelForNotification(
  workspaceId: string,
  notification: NotificationPayload
): Promise<string | null> {
  // First, try to find a specific channel mapping
  if (notification.metadata?.clientId) {
    const clientMapping = await db.slackChannelMapping.findFirst({
      where: {
        workspaceId,
        mappingType: "CLIENT",
        entityId: notification.metadata.clientId as string,
      },
    });

    if (clientMapping) {
      return clientMapping.channelId;
    }
  }

  // Fall back to default channel
  const workspace = await db.slackWorkspace.findUnique({
    where: { id: workspaceId },
  });

  return workspace?.defaultChannelId || null;
}

/**
 * Send a notification to Slack
 */
export async function sendSlackNotification(
  organizationId: string,
  notification: NotificationPayload
): Promise<{ success: boolean; messageTs?: string; error?: string }> {
  try {
    // Get workspace for this organization
    const workspace = await db.slackWorkspace.findUnique({
      where: { organizationId },
    });

    if (!workspace || !workspace.isActive) {
      return { success: false, error: "Slack not connected" };
    }

    // Get the appropriate channel
    const channelId = await getChannelForNotification(workspace.id, notification);

    if (!channelId) {
      return { success: false, error: "No channel configured" };
    }

    // Build message blocks
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const blocks = buildNotificationBlocks(notification, baseUrl);

    // Send message
    const result = await slackClient.sendMessage(
      workspace.accessToken,
      channelId,
      notification.title, // Fallback text
      blocks
    );

    if (!result.ok) {
      console.error("Slack message failed:", result.error);
      return { success: false, error: result.error };
    }

    // Record the message
    if (result.ts) {
      await db.slackMessage.create({
        data: {
          workspaceId: workspace.id,
          channelId,
          messageTs: result.ts,
          notificationType: notification.type,
          entityType: notification.entityType,
          entityId: notification.entityId,
        },
      });
    }

    return { success: true, messageTs: result.ts };
  } catch (error) {
    console.error("Slack notification error:", error);
    return { success: false, error: "Failed to send Slack notification" };
  }
}

/**
 * Send notification to a specific channel (for testing or direct messages)
 */
export async function sendToChannel(
  organizationId: string,
  channelId: string,
  text: string,
  blocks?: SlackBlock[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const workspace = await db.slackWorkspace.findUnique({
      where: { organizationId },
    });

    if (!workspace || !workspace.isActive) {
      return { success: false, error: "Slack not connected" };
    }

    const result = await slackClient.sendMessage(
      workspace.accessToken,
      channelId,
      text,
      blocks
    );

    return { success: result.ok, error: result.error };
  } catch (error) {
    console.error("Slack send error:", error);
    return { success: false, error: "Failed to send message" };
  }
}

/**
 * Notify about a brief event
 */
export async function notifyBriefEvent(
  organizationId: string,
  event: "created" | "assigned" | "completed" | "status_changed",
  brief: {
    id: string;
    title: string;
    type: string;
    status: string;
    client: { id: string; name: string };
    assignee?: { name: string } | null;
    deadline?: Date | null;
    priority: string;
  }
): Promise<void> {
  const eventTitles: Record<string, string> = {
    created: `📋 New Brief: ${brief.title}`,
    assigned: `👤 Brief Assigned: ${brief.title}`,
    completed: `✅ Brief Completed: ${brief.title}`,
    status_changed: `🔄 Status Update: ${brief.title}`,
  };

  const eventBodies: Record<string, string> = {
    created: `A new ${brief.type.replace("_", " ").toLowerCase()} brief has been created for ${brief.client.name}.`,
    assigned: `${brief.assignee?.name || "Someone"} has been assigned to this brief.`,
    completed: `This brief has been marked as complete.`,
    status_changed: `Status changed to ${brief.status.replace("_", " ")}.`,
  };

  await sendSlackNotification(organizationId, {
    type: `brief.${event}`,
    title: eventTitles[event],
    body: eventBodies[event],
    actionUrl: `/briefs/${brief.id}`,
    entityType: "brief",
    entityId: brief.id,
    metadata: {
      clientId: brief.client.id,
      clientName: brief.client.name,
      briefType: brief.type,
      assigneeName: brief.assignee?.name,
      deadline: brief.deadline?.toLocaleDateString(),
      priority: brief.priority,
    },
  });
}

/**
 * Notify about approval needed
 */
export async function notifyApprovalNeeded(
  organizationId: string,
  brief: {
    id: string;
    title: string;
    client: { id: string; name: string };
  }
): Promise<void> {
  await sendSlackNotification(organizationId, {
    type: "approval.needed",
    title: `🔔 Client Approval Needed: ${brief.title}`,
    body: `${brief.client.name} needs to review and approve this deliverable.`,
    actionUrl: `/briefs/${brief.id}`,
    entityType: "brief",
    entityId: brief.id,
    metadata: {
      clientId: brief.client.id,
      clientName: brief.client.name,
    },
  });
}

/**
 * Notify about deadline approaching
 */
export async function notifyDeadlineApproaching(
  organizationId: string,
  brief: {
    id: string;
    title: string;
    deadline: Date;
    assignee?: { name: string } | null;
    client: { id: string; name: string };
  },
  daysUntil: number
): Promise<void> {
  const urgency = daysUntil <= 1 ? "⚠️" : "📅";

  await sendSlackNotification(organizationId, {
    type: "deadline.approaching",
    title: `${urgency} Deadline ${daysUntil <= 1 ? "Tomorrow" : `in ${daysUntil} days`}: ${brief.title}`,
    body: `This brief is due on ${brief.deadline.toLocaleDateString()}.`,
    actionUrl: `/briefs/${brief.id}`,
    entityType: "brief",
    entityId: brief.id,
    metadata: {
      clientId: brief.client.id,
      clientName: brief.client.name,
      assigneeName: brief.assignee?.name,
      deadline: brief.deadline.toLocaleDateString(),
    },
  });
}
