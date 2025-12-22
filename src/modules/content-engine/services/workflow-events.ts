"use server";

import { auth } from "@/lib/auth";
import { publishEvent } from "./event-bus";
import type { EntityType, EventAction } from "./event-bus";

// ============================================
// BRIEF EVENTS
// ============================================

/**
 * Emit event when a brief is created
 */
export async function emitBriefCreated(brief: {
  id: string;
  title: string;
  type: string;
  status: string;
  clientId: string;
  assigneeId: string | null;
}): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "BRIEF",
    action: "CREATED",
    entityId: brief.id,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      newState: {
        title: brief.title,
        type: brief.type,
        status: brief.status,
        clientId: brief.clientId,
        assigneeId: brief.assigneeId,
      },
    },
  });
}

/**
 * Emit event when a brief status changes
 */
export async function emitBriefStatusChanged(
  briefId: string,
  previousStatus: string,
  newStatus: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "BRIEF",
    action: "STATUS_CHANGED",
    entityId: briefId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      previousState: { status: previousStatus },
      newState: { status: newStatus },
      changedFields: ["status"],
      ...metadata,
    },
  });
}

/**
 * Emit event when a brief is assigned
 */
export async function emitBriefAssigned(
  briefId: string,
  assigneeId: string,
  previousAssigneeId: string | null
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "BRIEF",
    action: "ASSIGNED",
    entityId: briefId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      previousState: { assigneeId: previousAssigneeId },
      newState: { assigneeId },
      changedFields: ["assigneeId"],
    },
  });
}

/**
 * Emit event when a brief is updated
 */
export async function emitBriefUpdated(
  briefId: string,
  changedFields: string[],
  previousState: Record<string, unknown>,
  newState: Record<string, unknown>
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "BRIEF",
    action: "UPDATED",
    entityId: briefId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      previousState,
      newState,
      changedFields,
    },
  });
}

// ============================================
// DELIVERABLE EVENTS
// ============================================

/**
 * Emit event when a deliverable is created
 */
export async function emitDeliverableCreated(deliverable: {
  id: string;
  title: string;
  type: string;
  status: string;
  briefId: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "DELIVERABLE",
    action: "CREATED",
    entityId: deliverable.id,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      newState: {
        title: deliverable.title,
        type: deliverable.type,
        status: deliverable.status,
        briefId: deliverable.briefId,
      },
    },
  });
}

/**
 * Emit event when a deliverable status changes
 */
export async function emitDeliverableStatusChanged(
  deliverableId: string,
  previousStatus: string,
  newStatus: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "DELIVERABLE",
    action: "STATUS_CHANGED",
    entityId: deliverableId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      previousState: { status: previousStatus },
      newState: { status: newStatus },
      changedFields: ["status"],
      ...metadata,
    },
  });
}

/**
 * Emit event when a deliverable is submitted for review
 */
export async function emitDeliverableSubmitted(
  deliverableId: string,
  reviewType: "INTERNAL" | "CLIENT"
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "DELIVERABLE",
    action: "SUBMITTED",
    entityId: deliverableId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      reviewType,
      submittedAt: new Date().toISOString(),
    },
  });
}

/**
 * Emit event when a deliverable is approved
 */
export async function emitDeliverableApproved(
  deliverableId: string,
  approvalType: "INTERNAL" | "CLIENT",
  feedback?: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "DELIVERABLE",
    action: "APPROVED",
    entityId: deliverableId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      approvalType,
      feedback,
      approvedAt: new Date().toISOString(),
    },
  });
}

/**
 * Emit event when revision is requested for a deliverable
 */
export async function emitDeliverableRevisionRequested(
  deliverableId: string,
  revisionType: "INTERNAL" | "CLIENT",
  feedback?: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "DELIVERABLE",
    action: "REJECTED",
    entityId: deliverableId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      revisionType,
      feedback,
      requestedAt: new Date().toISOString(),
    },
  });
}

/**
 * Emit event when a deliverable is marked as delivered
 */
export async function emitDeliverableCompleted(
  deliverableId: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "DELIVERABLE",
    action: "COMPLETED",
    entityId: deliverableId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      completedAt: new Date().toISOString(),
    },
  });
}

// ============================================
// CLIENT EVENTS
// ============================================

/**
 * Emit event when a client is created
 */
export async function emitClientCreated(client: {
  id: string;
  name: string;
  code: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "CLIENT",
    action: "CREATED",
    entityId: client.id,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      newState: {
        name: client.name,
        code: client.code,
      },
    },
  });
}

/**
 * Emit event when a client is updated
 */
export async function emitClientUpdated(
  clientId: string,
  changedFields: string[],
  previousState: Record<string, unknown>,
  newState: Record<string, unknown>
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "CLIENT",
    action: "UPDATED",
    entityId: clientId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      previousState,
      newState,
      changedFields,
    },
  });
}

// ============================================
// RFP EVENTS
// ============================================

/**
 * Emit event when an RFP status changes
 */
export async function emitRfpStatusChanged(
  rfpId: string,
  previousStatus: string,
  newStatus: string,
  metadata?: Record<string, unknown>
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "RFP",
    action: "STATUS_CHANGED",
    entityId: rfpId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      previousState: { status: previousStatus },
      newState: { status: newStatus },
      changedFields: ["status"],
      ...metadata,
    },
  });

  // Special event for RFP won
  if (newStatus === "WON") {
    await publishEvent({
      entityType: "RFP",
      action: "COMPLETED",
      entityId: rfpId,
      organizationId: session.user.organizationId,
      userId: session.user.id,
      metadata: {
        outcome: "WON",
        wonAt: new Date().toISOString(),
        ...metadata,
      },
    });
  }
}

// ============================================
// KNOWLEDGE EVENTS
// ============================================

/**
 * Emit event when a knowledge document is published
 */
export async function emitKnowledgePublished(document: {
  id: string;
  title: string;
  path: string;
  documentType: string;
}): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType: "KNOWLEDGE_DOC",
    action: "STATUS_CHANGED",
    entityId: document.id,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata: {
      previousState: { status: "DRAFT" },
      newState: { status: "PUBLISHED" },
      title: document.title,
      path: document.path,
      documentType: document.documentType,
    },
  });
}

// ============================================
// GENERIC EVENT HELPER
// ============================================

/**
 * Generic event emitter for any entity type
 */
export async function emitWorkflowEvent(
  entityType: EntityType,
  action: EventAction,
  entityId: string,
  metadata: Record<string, unknown> = {}
): Promise<void> {
  const session = await auth();
  if (!session?.user) return;

  await publishEvent({
    entityType,
    action,
    entityId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata,
  });
}
