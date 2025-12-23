"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can, isAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import {
  emitDeliverableCreated,
  emitDeliverableStatusChanged,
  emitDeliverableSubmitted,
  emitDeliverableApproved,
  emitDeliverableRevisionRequested,
  emitDeliverableCompleted,
} from "@/modules/content-engine/services/workflow-events";

// Inferred types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DeliverableRecord = Awaited<ReturnType<typeof db.deliverable.findMany>>[number];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type DeliverableWithRelations = Awaited<ReturnType<typeof db.deliverable.findFirst<{
  include: {
    brief: { include: { client: true; assignee: true } };
    createdBy: true;
    reviewedBy: true;
  }
}>>>;

// ============================================
// TYPES
// ============================================

export type DeliverableStatus =
  | "DRAFT"
  | "IN_PROGRESS"
  | "INTERNAL_REVIEW"
  | "REVISION_NEEDED"
  | "READY_FOR_CLIENT"
  | "CLIENT_REVIEW"
  | "CLIENT_REVISION"
  | "APPROVED"
  | "DELIVERED"
  | "ARCHIVED";

export type DeliverableType =
  | "VIDEO"
  | "IMAGE"
  | "DOCUMENT"
  | "PRESENTATION"
  | "DESIGN_FILE"
  | "COPY"
  | "REPORT"
  | "CODE"
  | "AUDIO"
  | "OTHER";

export interface CreateDeliverableInput {
  briefId: string;
  title: string;
  type: DeliverableType;
  description?: string;
  content?: Record<string, unknown>;
}

export interface UpdateDeliverableInput {
  title?: string;
  description?: string;
  type?: DeliverableType;
  content?: Record<string, unknown>;
  textContent?: string;
}

export interface ReviewInput {
  decision: "APPROVE" | "REQUEST_REVISION";
  feedback?: string;
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all deliverables for the organization
 */
export async function getDeliverables(options?: {
  briefId?: string;
  status?: DeliverableStatus;
  type?: DeliverableType;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.briefId) where.briefId = options.briefId;
  if (options?.status) where.status = options.status;
  if (options?.type) where.type = options.type;

  return db.deliverable.findMany({
    where,
    include: {
      brief: {
        include: {
          client: { select: { id: true, name: true, code: true } },
          assignee: { select: { id: true, name: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: options?.limit ?? 50,
  });
}

/**
 * Get a single deliverable by ID
 */
export async function getDeliverable(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deliverable = await db.deliverable.findUnique({
    where: { id },
    include: {
      brief: {
        include: {
          client: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  if (!deliverable || deliverable.organizationId !== session.user.organizationId) {
    return null;
  }

  return deliverable;
}

/**
 * Create a new deliverable
 */
export async function createDeliverable(input: CreateDeliverableInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify brief exists and belongs to org
  const brief = await db.brief.findUnique({
    where: { id: input.briefId },
  });

  if (!brief || brief.organizationId !== session.user.organizationId) {
    throw new Error("Brief not found");
  }

  const deliverable = await db.deliverable.create({
    data: {
      organizationId: session.user.organizationId,
      briefId: input.briefId,
      title: input.title,
      type: input.type,
      description: input.description,
      content: (input.content ?? {}) as Prisma.InputJsonValue,
      status: "DRAFT",
      version: 1,
      createdById: session.user.id,
    },
  });

  // Emit creation event
  await emitDeliverableCreated({
    id: deliverable.id,
    title: deliverable.title,
    type: deliverable.type,
    status: deliverable.status,
    briefId: deliverable.briefId,
  });

  revalidatePath("/content-engine/deliverables");
  revalidatePath(`/briefs/${input.briefId}`);

  return deliverable;
}

/**
 * Update a deliverable
 */
export async function updateDeliverable(id: string, input: UpdateDeliverableInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.deliverable.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== session.user.organizationId) {
    throw new Error("Deliverable not found");
  }

  // Only allow updates in certain statuses
  const editableStatuses: DeliverableStatus[] = [
    "DRAFT",
    "IN_PROGRESS",
    "REVISION_NEEDED",
    "CLIENT_REVISION",
  ];

  if (!editableStatuses.includes(existing.status as DeliverableStatus)) {
    throw new Error(`Cannot edit deliverable in ${existing.status} status`);
  }

  const deliverable = await db.deliverable.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      type: input.type,
      content: input.content ? (input.content as Prisma.InputJsonValue) : undefined,
      textContent: input.textContent,
    },
  });

  revalidatePath("/content-engine/deliverables");
  revalidatePath(`/content-engine/deliverables/${id}`);

  return deliverable;
}

/**
 * Delete a deliverable (soft delete by archiving)
 */
export async function deleteDeliverable(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!isAdmin(session.user)) {
    throw new Error("Only admins can delete deliverables");
  }

  const existing = await db.deliverable.findUnique({ where: { id } });
  if (!existing || existing.organizationId !== session.user.organizationId) {
    throw new Error("Deliverable not found");
  }

  await db.deliverable.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/content-engine/deliverables");
}

// ============================================
// WORKFLOW ACTIONS
// ============================================

/**
 * Submit deliverable for internal review
 */
export async function submitForInternalReview(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deliverable = await db.deliverable.findUnique({ where: { id } });
  if (!deliverable || deliverable.organizationId !== session.user.organizationId) {
    throw new Error("Deliverable not found");
  }

  const validStatuses: DeliverableStatus[] = ["DRAFT", "IN_PROGRESS", "REVISION_NEEDED"];
  if (!validStatuses.includes(deliverable.status as DeliverableStatus)) {
    throw new Error(`Cannot submit for review from ${deliverable.status} status`);
  }

  const previousStatus = deliverable.status;

  await db.deliverable.update({
    where: { id },
    data: {
      status: "INTERNAL_REVIEW",
      submittedAt: new Date(),
    },
  });

  // Emit events
  await emitDeliverableStatusChanged(id, previousStatus, "INTERNAL_REVIEW");
  await emitDeliverableSubmitted(id, "INTERNAL");

  revalidatePath("/content-engine/deliverables");
  revalidatePath(`/content-engine/deliverables/${id}`);
}

/**
 * Complete internal review
 */
export async function completeInternalReview(id: string, input: ReviewInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Must be team lead or above to review
  const canReview = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(
    session.user.permissionLevel
  );
  if (!canReview) {
    throw new Error("Not authorized to review deliverables");
  }

  const deliverable = await db.deliverable.findUnique({ where: { id } });
  if (!deliverable || deliverable.organizationId !== session.user.organizationId) {
    throw new Error("Deliverable not found");
  }

  if (deliverable.status !== "INTERNAL_REVIEW") {
    throw new Error("Deliverable is not in internal review");
  }

  const previousStatus = deliverable.status;
  const newStatus: DeliverableStatus =
    input.decision === "APPROVE" ? "READY_FOR_CLIENT" : "REVISION_NEEDED";

  await db.deliverable.update({
    where: { id },
    data: {
      status: newStatus,
      internalFeedback: input.feedback,
      internalReviewerId: session.user.id,
      internalReviewedAt: new Date(),
    },
  });

  // Emit events
  await emitDeliverableStatusChanged(id, previousStatus, newStatus);
  if (input.decision === "APPROVE") {
    await emitDeliverableApproved(id, "INTERNAL", input.feedback);
  } else {
    await emitDeliverableRevisionRequested(id, "INTERNAL", input.feedback);
  }

  revalidatePath("/content-engine/deliverables");
  revalidatePath(`/content-engine/deliverables/${id}`);
}

/**
 * Submit deliverable to client for review
 */
export async function submitToClient(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deliverable = await db.deliverable.findUnique({ where: { id } });
  if (!deliverable || deliverable.organizationId !== session.user.organizationId) {
    throw new Error("Deliverable not found");
  }

  if (deliverable.status !== "READY_FOR_CLIENT") {
    throw new Error("Deliverable must be approved internally first");
  }

  const previousStatus = deliverable.status;

  await db.deliverable.update({
    where: { id },
    data: {
      status: "CLIENT_REVIEW",
    },
  });

  // Emit events
  await emitDeliverableStatusChanged(id, previousStatus, "CLIENT_REVIEW");
  await emitDeliverableSubmitted(id, "CLIENT");

  revalidatePath("/content-engine/deliverables");
  revalidatePath(`/content-engine/deliverables/${id}`);
}

/**
 * Record client feedback
 */
export async function recordClientFeedback(
  id: string,
  input: {
    decision: "APPROVE" | "REQUEST_REVISION";
    feedback?: string;
  }
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deliverable = await db.deliverable.findUnique({ where: { id } });
  if (!deliverable || deliverable.organizationId !== session.user.organizationId) {
    throw new Error("Deliverable not found");
  }

  if (deliverable.status !== "CLIENT_REVIEW") {
    throw new Error("Deliverable is not in client review");
  }

  const previousStatus = deliverable.status;
  const newStatus: DeliverableStatus =
    input.decision === "APPROVE" ? "APPROVED" : "CLIENT_REVISION";

  await db.deliverable.update({
    where: { id },
    data: {
      status: newStatus,
      clientFeedback: input.feedback,
      approvedAt: input.decision === "APPROVE" ? new Date() : null,
    },
  });

  // If revision needed, increment version
  if (input.decision === "REQUEST_REVISION") {
    await db.deliverable.update({
      where: { id },
      data: { version: { increment: 1 } },
    });
  }

  // Emit events
  await emitDeliverableStatusChanged(id, previousStatus, newStatus);
  if (input.decision === "APPROVE") {
    await emitDeliverableApproved(id, "CLIENT", input.feedback);
  } else {
    await emitDeliverableRevisionRequested(id, "CLIENT", input.feedback);
  }

  revalidatePath("/content-engine/deliverables");
  revalidatePath(`/content-engine/deliverables/${id}`);
}

/**
 * Mark deliverable as delivered
 */
export async function markAsDelivered(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deliverable = await db.deliverable.findUnique({ where: { id } });
  if (!deliverable || deliverable.organizationId !== session.user.organizationId) {
    throw new Error("Deliverable not found");
  }

  if (deliverable.status !== "APPROVED") {
    throw new Error("Deliverable must be approved before marking as delivered");
  }

  const previousStatus = deliverable.status;

  await db.deliverable.update({
    where: { id },
    data: {
      status: "DELIVERED",
      deliveredAt: new Date(),
    },
  });

  // Emit events
  await emitDeliverableStatusChanged(id, previousStatus, "DELIVERED");
  await emitDeliverableCompleted(id);

  revalidatePath("/content-engine/deliverables");
  revalidatePath(`/content-engine/deliverables/${id}`);
}

// ============================================
// QUERIES
// ============================================

/**
 * Get deliverables pending review (for dashboard)
 */
export async function getPendingReviews() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.deliverable.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: { in: ["INTERNAL_REVIEW", "CLIENT_REVIEW"] },
    },
    include: {
      brief: {
        include: {
          client: { select: { id: true, name: true, code: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { submittedAt: "asc" },
  });
}

/**
 * Get deliverable stats for dashboard
 */
export async function getDeliverableStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const organizationId = session.user.organizationId;

  const [total, byStatus, byType, recentDelivered] = await Promise.all([
    db.deliverable.count({ where: { organizationId } }),

    db.deliverable.groupBy({
      by: ["status"],
      where: { organizationId },
      _count: true,
    }),

    db.deliverable.groupBy({
      by: ["type"],
      where: { organizationId },
      _count: true,
    }),

    db.deliverable.findMany({
      where: {
        organizationId,
        status: "DELIVERED",
      },
      orderBy: { deliveredAt: "desc" },
      take: 5,
      include: {
        brief: {
          include: {
            client: { select: { name: true, code: true } },
          },
        },
      },
    }),
  ]);

  return {
    total,
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    byType: Object.fromEntries(byType.map((t) => [t.type, t._count])),
    recentDelivered,
  };
}
