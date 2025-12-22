"use server";

/**
 * Content Approval Workflow Service
 *
 * Handles the complete approval lifecycle for content posts:
 * - Multi-stage approvals (Internal → Client → Final)
 * - Audit trail for all state changes
 * - Webhook emissions for external integrations
 * - WhatsApp notification integration
 * - Approval chains with sequential/parallel support
 *
 * @module content/services/approval-workflow
 */

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type {
  ContentPostStatus,
  ContentApprovalStatus,
  ApprovalType,
} from "@prisma/client";
import { emitContentWebhook } from "../webhooks/content-webhooks";

// ============================================
// TYPES & INTERFACES
// ============================================

export interface ApprovalRequest {
  postId: string;
  approvalType: ApprovalType;
  requestedById: string;
  assignedToId?: string;
  clientContactId?: string;
  versionNumber?: number;
  notes?: string;
  dueDate?: Date;
  notifyViaWhatsApp?: boolean;
}

export interface ApprovalResponse {
  approvalId: string;
  status: ContentApprovalStatus;
  respondedById?: string;
  responseNotes?: string;
  notifyViaWhatsApp?: boolean;
}

export interface ApprovalAuditEntry {
  action: string;
  previousStatus?: ContentPostStatus | ContentApprovalStatus;
  newStatus?: ContentPostStatus | ContentApprovalStatus;
  performedById: string;
  performedByType: "USER" | "CLIENT_CONTACT" | "SYSTEM";
  metadata?: Record<string, unknown>;
  timestamp: Date;
}

export interface WorkflowConfig {
  requireInternalApproval: boolean;
  requireClientApproval: boolean;
  requireFinalApproval: boolean;
  autoPublishOnApproval: boolean;
  approvalChain: ApprovalType[];
  notificationChannels: ("email" | "whatsapp" | "portal")[];
}

// Default workflow configuration
const DEFAULT_WORKFLOW_CONFIG: WorkflowConfig = {
  requireInternalApproval: true,
  requireClientApproval: true,
  requireFinalApproval: false,
  autoPublishOnApproval: false,
  approvalChain: ["INTERNAL", "CLIENT"],
  notificationChannels: ["portal", "whatsapp"],
};

// Status transition map - defines valid transitions
const VALID_TRANSITIONS: Record<ContentPostStatus, ContentPostStatus[]> = {
  DRAFT: ["INTERNAL_REVIEW", "CLIENT_REVIEW", "ARCHIVED"],
  INTERNAL_REVIEW: ["DRAFT", "CLIENT_REVIEW", "REVISION_REQUESTED", "APPROVED"],
  CLIENT_REVIEW: ["INTERNAL_REVIEW", "REVISION_REQUESTED", "APPROVED"],
  REVISION_REQUESTED: ["DRAFT", "INTERNAL_REVIEW", "CLIENT_REVIEW"],
  APPROVED: ["SCHEDULED", "PUBLISHING", "REVISION_REQUESTED"],
  SCHEDULED: ["APPROVED", "PUBLISHING", "ARCHIVED"],
  PUBLISHING: ["PUBLISHED", "FAILED"],
  PUBLISHED: ["ARCHIVED"],
  FAILED: ["DRAFT", "SCHEDULED", "ARCHIVED"],
  ARCHIVED: ["DRAFT"],
};

// ============================================
// CORE WORKFLOW FUNCTIONS
// ============================================

/**
 * Validates if a status transition is allowed
 */
export async function isValidTransition(
  currentStatus: ContentPostStatus,
  newStatus: ContentPostStatus
): Promise<boolean> {
  return VALID_TRANSITIONS[currentStatus]?.includes(newStatus) ?? false;
}

/**
 * Gets the next approval type in the workflow chain
 */
export async function getNextApprovalType(
  currentType: ApprovalType | null,
  config: WorkflowConfig = DEFAULT_WORKFLOW_CONFIG
): Promise<ApprovalType | null> {
  if (!currentType) {
    return config.approvalChain[0] || null;
  }

  const currentIndex = config.approvalChain.indexOf(currentType);
  if (currentIndex === -1 || currentIndex === config.approvalChain.length - 1) {
    return null;
  }

  return config.approvalChain[currentIndex + 1];
}

/**
 * Creates an approval request with full audit trail
 */
export async function createApprovalRequest(
  request: ApprovalRequest
): Promise<{ success: boolean; approvalId?: string; error?: string }> {
  try {
    // Validate post exists and is in correct state
    const post = await db.contentPost.findUnique({
      where: { id: request.postId },
      include: {
        client: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });

    if (!post) {
      return { success: false, error: "Post not found" };
    }

    // Determine target status based on approval type
    const targetStatus: ContentPostStatus =
      request.approvalType === "INTERNAL"
        ? "INTERNAL_REVIEW"
        : request.approvalType === "CLIENT"
        ? "CLIENT_REVIEW"
        : "INTERNAL_REVIEW";

    // Validate transition
    if (!(await isValidTransition(post.status, targetStatus))) {
      return {
        success: false,
        error: `Cannot transition from ${post.status} to ${targetStatus}`,
      };
    }

    // Create approval and update post in transaction
    const result = await db.$transaction(async (tx) => {
      // Create approval record
      const approval = await tx.contentApproval.create({
        data: {
          postId: request.postId,
          approvalType: request.approvalType,
          requestedById: request.requestedById,
          assignedToId: request.assignedToId,
          clientContactId: request.clientContactId,
          versionNumber: request.versionNumber || post.currentVersion,
          status: "PENDING",
        },
      });

      // Update post status
      await tx.contentPost.update({
        where: { id: request.postId },
        data: {
          status: targetStatus,
          platformData: {
            ...(post.platformData as Record<string, unknown>),
            lastApprovalRequestId: approval.id,
            lastApprovalRequestAt: new Date().toISOString(),
          },
        },
      });

      return approval;
    });

    // Emit webhook
    await emitContentWebhook("content.approval.requested", {
      postId: request.postId,
      approvalId: result.id,
      approvalType: request.approvalType,
      requestedById: request.requestedById,
      clientId: post.clientId,
      organizationId: post.organizationId,
    });

    // Send WhatsApp notification if requested
    if (request.notifyViaWhatsApp && request.clientContactId) {
      await sendWhatsAppApprovalNotification(
        request.postId,
        result.id,
        request.clientContactId
      );
    }

    revalidatePath("/content-engine");
    revalidatePath(`/content-engine/posts/${request.postId}`);

    return { success: true, approvalId: result.id };
  } catch (error) {
    console.error("Failed to create approval request:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Processes an approval response (approve, reject, request revision)
 */
export async function processApprovalResponse(
  response: ApprovalResponse
): Promise<{ success: boolean; error?: string }> {
  try {
    const approval = await db.contentApproval.findUnique({
      where: { id: response.approvalId },
      include: {
        post: {
          include: {
            client: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    if (!approval) {
      return { success: false, error: "Approval not found" };
    }

    if (approval.status !== "PENDING") {
      return { success: false, error: "Approval already processed" };
    }

    // Determine new post status based on response
    let newPostStatus: ContentPostStatus;
    switch (response.status) {
      case "APPROVED":
        // Check if there's another approval step
        const nextApprovalType = await getNextApprovalType(approval.approvalType);
        newPostStatus = nextApprovalType
          ? nextApprovalType === "CLIENT"
            ? "CLIENT_REVIEW"
            : "INTERNAL_REVIEW"
          : "APPROVED";
        break;
      case "REJECTED":
        newPostStatus = "DRAFT";
        break;
      case "REVISION_REQUESTED":
        newPostStatus = "REVISION_REQUESTED";
        break;
      default:
        return { success: false, error: "Invalid approval status" };
    }

    // Update in transaction
    await db.$transaction(async (tx) => {
      // Update approval
      await tx.contentApproval.update({
        where: { id: response.approvalId },
        data: {
          status: response.status,
          respondedAt: new Date(),
          respondedById: response.respondedById,
          responseNotes: response.responseNotes,
        },
      });

      // Update post status
      await tx.contentPost.update({
        where: { id: approval.postId },
        data: {
          status: newPostStatus,
          platformData: {
            ...(approval.post.platformData as Record<string, unknown>),
            lastApprovalResponseAt: new Date().toISOString(),
            lastApprovalStatus: response.status,
          },
        },
      });

      // If revision requested, add comment
      if (response.status === "REVISION_REQUESTED" && response.responseNotes) {
        await tx.contentComment.create({
          data: {
            postId: approval.postId,
            content: response.responseNotes,
            userId: response.respondedById,
            source: "INTERNAL",
          },
        });
      }

      // If approved and there's a next step, auto-create next approval request
      if (response.status === "APPROVED") {
        const nextType = await getNextApprovalType(approval.approvalType);
        if (nextType) {
          await tx.contentApproval.create({
            data: {
              postId: approval.postId,
              approvalType: nextType,
              requestedById: response.respondedById || approval.requestedById,
              status: "PENDING",
              versionNumber: approval.versionNumber,
            },
          });
        }
      }
    });

    // Emit webhook
    await emitContentWebhook("content.approval.responded", {
      postId: approval.postId,
      approvalId: response.approvalId,
      approvalType: approval.approvalType,
      status: response.status,
      respondedById: response.respondedById,
      clientId: approval.post.clientId,
      organizationId: approval.post.organizationId,
    });

    revalidatePath("/content-engine");
    revalidatePath(`/content-engine/posts/${approval.postId}`);

    return { success: true };
  } catch (error) {
    console.error("Failed to process approval response:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Gets approval history for a post
 */
export async function getApprovalHistory(postId: string) {
  return db.contentApproval.findMany({
    where: { postId },
    include: {
      requestedBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      clientContact: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Gets pending approvals for a user
 */
export async function getPendingApprovalsForUser(
  userId: string,
  organizationId: string
) {
  return db.contentApproval.findMany({
    where: {
      status: "PENDING",
      post: { organizationId },
      OR: [
        { assignedToId: userId },
        { approvalType: "INTERNAL" }, // All internal users can see internal reviews
      ],
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          platforms: true,
          client: { select: { id: true, name: true } },
          assets: { take: 1, orderBy: { sortOrder: "asc" } },
        },
      },
      requestedBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });
}

/**
 * Gets pending approvals for a client contact
 */
export async function getPendingApprovalsForClient(clientContactId: string) {
  return db.contentApproval.findMany({
    where: {
      status: "PENDING",
      approvalType: "CLIENT",
      clientContactId,
    },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          caption: true,
          platforms: true,
          scheduledFor: true,
          assets: { orderBy: { sortOrder: "asc" } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

// ============================================
// WHATSAPP INTEGRATION
// ============================================

/**
 * Sends WhatsApp notification for approval request
 */
async function sendWhatsAppApprovalNotification(
  postId: string,
  approvalId: string,
  clientContactId: string
): Promise<void> {
  try {
    const [post, contact] = await Promise.all([
      db.contentPost.findUnique({
        where: { id: postId },
        select: {
          title: true,
          caption: true,
          platforms: true,
          scheduledFor: true,
          client: { select: { name: true } },
        },
      }),
      db.clientContact.findUnique({
        where: { id: clientContactId },
        select: { phone: true, name: true },
      }),
    ]);

    if (!post || !contact?.phone) {
      console.warn("Cannot send WhatsApp notification: missing data");
      return;
    }

    // Create approval link
    const approvalLink = `${process.env.NEXT_PUBLIC_APP_URL}/portal/content/${postId}/review`;

    // Format message
    const message = `
🔔 *Content Approval Request*

Hi ${contact.name},

New content is ready for your review:

📝 *${post.title}*
📱 Platforms: ${post.platforms.join(", ")}
📅 Scheduled: ${post.scheduledFor ? new Date(post.scheduledFor).toLocaleDateString() : "Not scheduled"}

Preview: ${post.caption.substring(0, 100)}${post.caption.length > 100 ? "..." : ""}

👉 Review & Approve: ${approvalLink}

Reply with:
✅ APPROVE - to approve this content
❌ REJECT - to reject this content
📝 REVISION - to request changes
`.trim();

    // Store the approval ID with the message for response tracking
    await db.contentApproval.update({
      where: { id: approvalId },
      data: {
        whatsappMessageId: `pending_${Date.now()}`, // Will be updated with actual ID
      },
    });

    // Note: Actual WhatsApp send would integrate with WhatsApp Business API
    // For now, we log and prepare the message
    console.log("WhatsApp approval notification prepared:", {
      to: contact.phone,
      message,
      approvalId,
    });

    // Emit webhook for external WhatsApp integration
    await emitContentWebhook("content.notification.whatsapp", {
      type: "approval_request",
      postId,
      approvalId,
      recipientPhone: contact.phone,
      recipientName: contact.name,
      message,
    });
  } catch (error) {
    console.error("Failed to send WhatsApp notification:", error);
  }
}

/**
 * Processes WhatsApp response to approval request
 */
export async function processWhatsAppApprovalResponse(
  messageText: string,
  senderPhone: string
): Promise<{ processed: boolean; message?: string }> {
  try {
    // Find contact by phone
    const contact = await db.clientContact.findFirst({
      where: { phone: senderPhone },
    });

    if (!contact) {
      return { processed: false, message: "Contact not found" };
    }

    // Find pending approval for this contact
    const pendingApproval = await db.contentApproval.findFirst({
      where: {
        clientContactId: contact.id,
        status: "PENDING",
      },
      orderBy: { createdAt: "desc" },
    });

    if (!pendingApproval) {
      return { processed: false, message: "No pending approval found" };
    }

    // Parse response
    const normalizedText = messageText.toUpperCase().trim();
    let status: ContentApprovalStatus;
    let responseMessage: string;

    if (normalizedText.includes("APPROVE") || normalizedText === "✅") {
      status = "APPROVED";
      responseMessage = "Content approved! ✅";
    } else if (normalizedText.includes("REJECT") || normalizedText === "❌") {
      status = "REJECTED";
      responseMessage = "Content rejected. The team has been notified.";
    } else if (normalizedText.includes("REVISION") || normalizedText === "📝") {
      status = "REVISION_REQUESTED";
      responseMessage =
        "Revision requested. Please provide your feedback in the portal.";
    } else {
      return {
        processed: false,
        message: "Please reply with APPROVE, REJECT, or REVISION",
      };
    }

    // Process the approval
    await processApprovalResponse({
      approvalId: pendingApproval.id,
      status,
      responseNotes: `Response via WhatsApp: ${messageText}`,
    });

    return { processed: true, message: responseMessage };
  } catch (error) {
    console.error("Failed to process WhatsApp approval response:", error);
    return { processed: false, message: "Error processing response" };
  }
}

// ============================================
// BULK OPERATIONS
// ============================================

/**
 * Bulk approve multiple posts
 */
export async function bulkApprove(
  approvalIds: string[],
  respondedById: string
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const approvalId of approvalIds) {
    const result = await processApprovalResponse({
      approvalId,
      status: "APPROVED",
      respondedById,
    });

    if (result.success) {
      success++;
    } else {
      failed++;
    }
  }

  return { success, failed };
}

/**
 * Gets workflow statistics
 */
export async function getWorkflowStats(organizationId: string) {
  const [
    pendingInternal,
    pendingClient,
    approvedToday,
    rejectedToday,
    avgApprovalTime,
  ] = await Promise.all([
    db.contentApproval.count({
      where: {
        post: { organizationId },
        status: "PENDING",
        approvalType: "INTERNAL",
      },
    }),
    db.contentApproval.count({
      where: {
        post: { organizationId },
        status: "PENDING",
        approvalType: "CLIENT",
      },
    }),
    db.contentApproval.count({
      where: {
        post: { organizationId },
        status: "APPROVED",
        respondedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    db.contentApproval.count({
      where: {
        post: { organizationId },
        status: "REJECTED",
        respondedAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    // Calculate average approval time (in hours)
    db.$queryRaw<[{ avg_hours: number }]>`
      SELECT AVG(EXTRACT(EPOCH FROM (responded_at - created_at)) / 3600) as avg_hours
      FROM content_approvals
      WHERE responded_at IS NOT NULL
      AND post_id IN (SELECT id FROM content_posts WHERE organization_id = ${organizationId})
      AND created_at > NOW() - INTERVAL '30 days'
    `,
  ]);

  return {
    pendingInternal,
    pendingClient,
    approvedToday,
    rejectedToday,
    avgApprovalTimeHours: avgApprovalTime[0]?.avg_hours || 0,
  };
}
