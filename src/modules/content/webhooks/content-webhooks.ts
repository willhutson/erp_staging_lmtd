"use server";

/**
 * Content Webhook System
 *
 * Emits webhooks for content lifecycle events:
 * - Post CRUD operations
 * - Approval workflow events
 * - Publishing events
 * - Engagement updates
 *
 * Integrates with the main webhook subscription system.
 *
 * @module content/webhooks/content-webhooks
 */

import { db } from "@/lib/db";
import crypto from "crypto";

// ============================================
// WEBHOOK EVENT TYPES
// ============================================

export type ContentWebhookEvent =
  // Post lifecycle
  | "content.post.created"
  | "content.post.updated"
  | "content.post.deleted"
  | "content.post.status_changed"
  // Approval workflow
  | "content.approval.requested"
  | "content.approval.responded"
  | "content.approval.expired"
  | "content.approval.reminder"
  // Publishing
  | "content.post.scheduled"
  | "content.post.publishing"
  | "content.post.published"
  | "content.post.publish_failed"
  // Engagement
  | "content.metrics.updated"
  // Comments
  | "content.comment.added"
  | "content.comment.resolved"
  // Notifications
  | "content.notification.email"
  | "content.notification.whatsapp";

export interface WebhookPayload {
  event: ContentWebhookEvent;
  timestamp: string;
  data: Record<string, unknown>;
  signature: string;
  webhookId: string;
}

export interface WebhookDeliveryResult {
  webhookId: string;
  subscriptionId: string;
  success: boolean;
  statusCode?: number;
  error?: string;
  duration: number;
}

// ============================================
// WEBHOOK SIGNATURE
// ============================================

/**
 * Generates HMAC-SHA256 signature for webhook payload
 */
function generateSignature(payload: string, secret: string): string {
  return crypto.createHmac("sha256", secret).update(payload).digest("hex");
}

/**
 * Verifies webhook signature
 */
export async function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const expectedSignature = generateSignature(payload, secret);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

// ============================================
// WEBHOOK EMISSION
// ============================================

/**
 * Emits a content webhook event to all subscribed endpoints
 */
export async function emitContentWebhook(
  event: ContentWebhookEvent,
  data: Record<string, unknown>
): Promise<WebhookDeliveryResult[]> {
  const results: WebhookDeliveryResult[] = [];

  try {
    // Get organization ID from data
    const organizationId = data.organizationId as string;
    if (!organizationId) {
      console.warn("No organizationId in webhook data, skipping emission");
      return results;
    }

    // Find active webhook subscriptions for this event
    const subscriptions = await db.webhookSubscription.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { events: { has: event } },
          { events: { has: "content.*" } }, // Wildcard subscription
          { events: { has: "*" } }, // All events
        ],
      },
    });

    if (subscriptions.length === 0) {
      return results;
    }

    // Generate webhook ID
    const webhookId = crypto.randomUUID();

    // Prepare payload
    const payloadData = {
      event,
      timestamp: new Date().toISOString(),
      data,
      webhookId,
    };

    // Deliver to each subscription
    for (const subscription of subscriptions) {
      const startTime = Date.now();
      const payloadString = JSON.stringify(payloadData);
      const signature = generateSignature(
        payloadString,
        subscription.secret || ""
      );

      const payload: WebhookPayload = {
        ...payloadData,
        signature,
      };

      try {
        const response = await fetch(subscription.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Id": webhookId,
            "X-Webhook-Event": event,
            "X-Webhook-Signature": signature,
            "X-Webhook-Timestamp": payloadData.timestamp,
            "User-Agent": "SpokeStack-Webhooks/1.0",
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(30000), // 30s timeout
        });

        const duration = Date.now() - startTime;

        // Log delivery
        await logWebhookDelivery({
          subscriptionId: subscription.id,
          webhookId,
          event,
          success: response.ok,
          statusCode: response.status,
          duration,
          payload: payloadData,
        });

        results.push({
          webhookId,
          subscriptionId: subscription.id,
          success: response.ok,
          statusCode: response.status,
          duration,
        });

        // Update subscription stats
        await db.webhookSubscription.update({
          where: { id: subscription.id },
          data: {
            lastTriggeredAt: new Date(),
            ...(response.ok
              ? { consecutiveFailures: 0 }
              : { consecutiveFailures: { increment: 1 } }),
          },
        });

        // Disable subscription after too many failures
        if (!response.ok) {
          const updated = await db.webhookSubscription.findUnique({
            where: { id: subscription.id },
            select: { consecutiveFailures: true },
          });

          if (updated && updated.consecutiveFailures >= 10) {
            await db.webhookSubscription.update({
              where: { id: subscription.id },
              data: {
                isActive: false,
                metadata: {
                  disabledAt: new Date().toISOString(),
                  disabledReason: "Too many consecutive failures",
                },
              },
            });
          }
        }
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";

        await logWebhookDelivery({
          subscriptionId: subscription.id,
          webhookId,
          event,
          success: false,
          error: errorMessage,
          duration,
          payload: payloadData,
        });

        results.push({
          webhookId,
          subscriptionId: subscription.id,
          success: false,
          error: errorMessage,
          duration,
        });
      }
    }

    return results;
  } catch (error) {
    console.error("Failed to emit content webhook:", error);
    return results;
  }
}

// ============================================
// WEBHOOK LOGGING
// ============================================

interface WebhookLogEntry {
  subscriptionId: string;
  webhookId: string;
  event: ContentWebhookEvent;
  success: boolean;
  statusCode?: number;
  error?: string;
  duration: number;
  payload: Record<string, unknown>;
}

async function logWebhookDelivery(entry: WebhookLogEntry): Promise<void> {
  try {
    // Store in database for audit trail
    // Note: You might want a dedicated WebhookLog model for this
    console.log("Webhook delivery:", {
      ...entry,
      payload: "[redacted]", // Don't log full payload
    });
  } catch (error) {
    console.error("Failed to log webhook delivery:", error);
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Emit webhook for post creation
 */
export async function emitPostCreated(
  post: {
    id: string;
    organizationId: string;
    clientId: string;
    title: string;
    platforms: string[];
    status: string;
    createdById: string;
  }
): Promise<void> {
  await emitContentWebhook("content.post.created", {
    postId: post.id,
    organizationId: post.organizationId,
    clientId: post.clientId,
    title: post.title,
    platforms: post.platforms,
    status: post.status,
    createdById: post.createdById,
  });
}

/**
 * Emit webhook for status change
 */
export async function emitStatusChanged(
  postId: string,
  organizationId: string,
  previousStatus: string,
  newStatus: string,
  changedById: string
): Promise<void> {
  await emitContentWebhook("content.post.status_changed", {
    postId,
    organizationId,
    previousStatus,
    newStatus,
    changedById,
  });
}

/**
 * Emit webhook for successful publish
 */
export async function emitPostPublished(
  post: {
    id: string;
    organizationId: string;
    clientId: string;
    platforms: string[];
    platformPostId?: string;
    platformPostUrl?: string;
  }
): Promise<void> {
  await emitContentWebhook("content.post.published", {
    postId: post.id,
    organizationId: post.organizationId,
    clientId: post.clientId,
    platforms: post.platforms,
    platformPostId: post.platformPostId,
    platformPostUrl: post.platformPostUrl,
    publishedAt: new Date().toISOString(),
  });
}

/**
 * Emit webhook for publish failure
 */
export async function emitPublishFailed(
  postId: string,
  organizationId: string,
  error: string,
  platform?: string
): Promise<void> {
  await emitContentWebhook("content.post.publish_failed", {
    postId,
    organizationId,
    error,
    platform,
    failedAt: new Date().toISOString(),
  });
}

/**
 * Emit webhook for metrics update
 */
export async function emitMetricsUpdated(
  postId: string,
  organizationId: string,
  metrics: {
    likes?: number;
    comments?: number;
    shares?: number;
    saves?: number;
    reach?: number;
    impressions?: number;
    engagementRate?: number;
  }
): Promise<void> {
  await emitContentWebhook("content.metrics.updated", {
    postId,
    organizationId,
    metrics,
    updatedAt: new Date().toISOString(),
  });
}

// ============================================
// WEBHOOK TESTING
// ============================================

/**
 * Sends a test webhook to verify endpoint configuration
 */
export async function sendTestWebhook(
  subscriptionId: string
): Promise<{ success: boolean; statusCode?: number; error?: string }> {
  const subscription = await db.webhookSubscription.findUnique({
    where: { id: subscriptionId },
  });

  if (!subscription) {
    return { success: false, error: "Subscription not found" };
  }

  const testPayload = {
    event: "content.test" as const,
    timestamp: new Date().toISOString(),
    data: {
      message: "This is a test webhook from SpokeStack",
      subscriptionId,
    },
    webhookId: crypto.randomUUID(),
  };

  const payloadString = JSON.stringify(testPayload);
  const signature = generateSignature(payloadString, subscription.secret || "");

  try {
    const response = await fetch(subscription.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Webhook-Event": "content.test",
        "X-Webhook-Signature": signature,
        "User-Agent": "SpokeStack-Webhooks/1.0",
      },
      body: JSON.stringify({ ...testPayload, signature }),
      signal: AbortSignal.timeout(10000),
    });

    return {
      success: response.ok,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
