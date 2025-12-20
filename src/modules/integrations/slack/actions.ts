"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { slackClient } from "@/lib/slack/client";
import { revalidatePath } from "next/cache";

/**
 * Get Slack workspace and channels for the current organization
 */
export async function getSlackWorkspace() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return null;
  }

  const workspace = await db.slackWorkspace.findUnique({
    where: { organizationId: session.user.organizationId },
  });

  return workspace;
}

/**
 * Get channels available for the workspace
 */
export async function getSlackChannels() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  const workspace = await db.slackWorkspace.findUnique({
    where: { organizationId: session.user.organizationId },
  });

  if (!workspace || !workspace.isActive) {
    return [];
  }

  try {
    const channels = await slackClient.listChannels(workspace.accessToken);
    return channels.map((c) => ({
      id: c.id,
      name: c.name,
      isPrivate: c.is_private,
    }));
  } catch (error) {
    console.error("Failed to fetch Slack channels:", error);
    return [];
  }
}

/**
 * Disconnect Slack
 */
export async function disconnectSlack() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Delete workspace record
    await db.slackWorkspace.delete({
      where: { organizationId: session.user.organizationId },
    });

    // Update integration record
    await db.integration.update({
      where: {
        organizationId_provider: {
          organizationId: session.user.organizationId,
          provider: "slack",
        },
      },
      data: { isEnabled: false },
    });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Failed to disconnect Slack:", error);
    return { success: false, error: "Failed to disconnect" };
  }
}

/**
 * Set the default notification channel
 */
export async function setDefaultChannel(channelId: string, channelName: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Update workspace with default channel
    await db.slackWorkspace.update({
      where: { organizationId: session.user.organizationId },
      data: {
        defaultChannelId: channelId,
        defaultChannelName: channelName,
      },
    });

    // Ensure bot is in the channel
    const workspace = await db.slackWorkspace.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (workspace) {
      await slackClient.joinChannel(workspace.accessToken, channelId);
    }

    // Create/update default channel mapping
    await db.slackChannelMapping.upsert({
      where: {
        workspaceId_channelId: {
          workspaceId: workspace!.id,
          channelId,
        },
      },
      create: {
        workspaceId: workspace!.id,
        channelId,
        channelName,
        mappingType: "DEFAULT",
      },
      update: {
        channelName,
        mappingType: "DEFAULT",
      },
    });

    revalidatePath("/settings/integrations");
    return { success: true };
  } catch (error) {
    console.error("Failed to set default channel:", error);
    return { success: false, error: "Failed to save channel" };
  }
}

/**
 * Map a client to a Slack channel
 */
export async function mapClientToChannel(
  clientId: string,
  channelId: string,
  channelName: string
) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const workspace = await db.slackWorkspace.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!workspace) {
      return { success: false, error: "Slack not connected" };
    }

    // Ensure bot is in the channel
    await slackClient.joinChannel(workspace.accessToken, channelId);

    // Create channel mapping
    await db.slackChannelMapping.upsert({
      where: {
        workspaceId_channelId: {
          workspaceId: workspace.id,
          channelId,
        },
      },
      create: {
        workspaceId: workspace.id,
        channelId,
        channelName,
        mappingType: "CLIENT",
        entityId: clientId,
      },
      update: {
        channelName,
        mappingType: "CLIENT",
        entityId: clientId,
      },
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (error) {
    console.error("Failed to map client channel:", error);
    return { success: false, error: "Failed to save mapping" };
  }
}

/**
 * Send a test notification to Slack
 */
export async function sendTestNotification() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const workspace = await db.slackWorkspace.findUnique({
      where: { organizationId: session.user.organizationId },
    });

    if (!workspace || !workspace.defaultChannelId) {
      return { success: false, error: "No default channel set" };
    }

    const result = await slackClient.sendMessage(
      workspace.accessToken,
      workspace.defaultChannelId,
      "🎉 Test notification from SpokeStack!",
      [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: "*Test Notification*\nYour Slack integration is working correctly!",
          },
        },
      ]
    );

    return { success: result.ok, error: result.error };
  } catch (error) {
    console.error("Failed to send test notification:", error);
    return { success: false, error: "Failed to send message" };
  }
}
