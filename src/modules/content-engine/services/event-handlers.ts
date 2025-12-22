"use server";

import { db } from "@/lib/db";
import type { EntityEvent, EntityType, EventAction } from "./event-bus";

// ============================================
// BUILT-IN HANDLERS
// ============================================

/**
 * Handler registry - maps handler names to functions
 */
const handlers: Record<
  string,
  (event: EntityEvent) => Promise<void>
> = {
  // Brief handlers
  "brief.onStatusChange": handleBriefStatusChange,
  "brief.onAssigned": handleBriefAssigned,
  "brief.onCreated": handleBriefCreated,

  // Deliverable handlers
  "deliverable.onStatusChange": handleDeliverableStatusChange,
  "deliverable.onApproved": handleDeliverableApproved,
  "deliverable.onRevisionNeeded": handleDeliverableRevisionNeeded,

  // Client handlers
  "client.onCreated": handleClientCreated,

  // RFP handlers
  "rfp.onStatusChange": handleRfpStatusChange,
  "rfp.onWon": handleRfpWon,

  // Knowledge handlers
  "knowledge.onPublished": handleKnowledgePublished,
};

/**
 * Get handler function by name
 */
export async function getHandler(
  name: string
): Promise<((event: EntityEvent) => Promise<void>) | undefined> {
  return handlers[name];
}

/**
 * List all available handlers
 */
export async function listHandlers(): Promise<Array<{
  name: string;
  entityType: EntityType;
  description: string;
}>> {
  return [
    {
      name: "brief.onStatusChange",
      entityType: "BRIEF",
      description: "Triggered when a brief status changes",
    },
    {
      name: "brief.onAssigned",
      entityType: "BRIEF",
      description: "Triggered when a brief is assigned to a user",
    },
    {
      name: "brief.onCreated",
      entityType: "BRIEF",
      description: "Triggered when a new brief is created",
    },
    {
      name: "deliverable.onStatusChange",
      entityType: "DELIVERABLE",
      description: "Triggered when a deliverable status changes",
    },
    {
      name: "deliverable.onApproved",
      entityType: "DELIVERABLE",
      description: "Triggered when a deliverable is approved",
    },
    {
      name: "deliverable.onRevisionNeeded",
      entityType: "DELIVERABLE",
      description: "Triggered when a deliverable needs revision",
    },
    {
      name: "client.onCreated",
      entityType: "CLIENT",
      description: "Triggered when a new client is added",
    },
    {
      name: "rfp.onStatusChange",
      entityType: "RFP",
      description: "Triggered when RFP status changes",
    },
    {
      name: "rfp.onWon",
      entityType: "RFP",
      description: "Triggered when an RFP is won",
    },
    {
      name: "knowledge.onPublished",
      entityType: "KNOWLEDGE_DOC",
      description: "Triggered when a knowledge document is published",
    },
  ];
}

// ============================================
// BRIEF HANDLERS
// ============================================

async function handleBriefStatusChange(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const newStatus = metadata.newState?.status as string;
  const previousStatus = metadata.previousState?.status as string;

  console.log(
    `Brief ${entityId} status changed: ${previousStatus} → ${newStatus}`
  );

  // Auto-notify assignee when brief moves to IN_PROGRESS
  if (newStatus === "IN_PROGRESS" && previousStatus === "PENDING") {
    // In a real implementation, this would send a notification
    console.log("Would notify assignee that brief is ready to start");
  }

  // Auto-track when brief is completed
  if (newStatus === "COMPLETED") {
    // Could trigger analytics or reporting
    console.log("Brief completed - could trigger completion analytics");
  }
}

async function handleBriefAssigned(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const assigneeId = metadata.newState?.assigneeId as string;

  console.log(`Brief ${entityId} assigned to user ${assigneeId}`);

  // In a real implementation:
  // - Send notification to assignee
  // - Update resource allocation
  // - Log assignment in activity feed
}

async function handleBriefCreated(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const briefType = metadata.newState?.type as string;

  console.log(`New brief created: ${entityId} (type: ${briefType})`);

  // Could trigger:
  // - Auto-assignment based on brief type
  // - SLA timer start
  // - Resource availability check
}

// ============================================
// DELIVERABLE HANDLERS
// ============================================

async function handleDeliverableStatusChange(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const newStatus = metadata.newState?.status as string;
  const previousStatus = metadata.previousState?.status as string;

  console.log(
    `Deliverable ${entityId} status changed: ${previousStatus} → ${newStatus}`
  );

  // Track status transitions for analytics
  await db.statusTransition.create({
    data: {
      organizationId: event.organizationId,
      entityType: "DELIVERABLE",
      entityId,
      fromStatus: previousStatus,
      toStatus: newStatus,
      userId: event.userId,
    },
  }).catch(() => {
    // Table may not exist yet - that's OK
    console.log("StatusTransition table not available");
  });
}

async function handleDeliverableApproved(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;

  console.log(`Deliverable ${entityId} approved`);

  // Could trigger:
  // - Update brief progress
  // - Notify creator
  // - Generate completion certificate
  // - Update team metrics
}

async function handleDeliverableRevisionNeeded(
  event: EntityEvent
): Promise<void> {
  const { entityId, metadata } = event;
  const feedback = metadata.newState?.feedback as string;

  console.log(`Deliverable ${entityId} needs revision`);
  if (feedback) {
    console.log(`Feedback: ${feedback}`);
  }

  // Could trigger:
  // - Notify creator with feedback
  // - Update SLA/timeline
  // - Log revision count
}

// ============================================
// CLIENT HANDLERS
// ============================================

async function handleClientCreated(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const clientName = metadata.newState?.name as string;

  console.log(`New client created: ${clientName} (${entityId})`);

  // Could trigger:
  // - Create default knowledge structure
  // - Send welcome package
  // - Create onboarding brief
}

// ============================================
// RFP HANDLERS
// ============================================

async function handleRfpStatusChange(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const newStatus = metadata.newState?.status as string;

  console.log(`RFP ${entityId} status changed to ${newStatus}`);

  // Track pipeline progression
}

async function handleRfpWon(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const rfpValue = metadata.newState?.estimatedValue as number;

  console.log(`RFP ${entityId} WON! Value: ${rfpValue}`);

  // Could trigger:
  // - Create new client record
  // - Generate onboarding briefs
  // - Update pipeline metrics
  // - Notify team
}

// ============================================
// KNOWLEDGE HANDLERS
// ============================================

async function handleKnowledgePublished(event: EntityEvent): Promise<void> {
  const { entityId, metadata } = event;
  const docTitle = metadata.newState?.title as string;

  console.log(`Knowledge document published: ${docTitle} (${entityId})`);

  // Could trigger:
  // - Index for semantic search
  // - Notify relevant team members
  // - Update skill contexts
}

// ============================================
// HANDLER EXECUTION
// ============================================

/**
 * Execute a handler by name
 */
export async function executeHandlerByName(
  name: string,
  event: EntityEvent
): Promise<{ success: boolean; error?: string }> {
  const handler = handlers[name];

  if (!handler) {
    return {
      success: false,
      error: `Handler not found: ${name}`,
    };
  }

  try {
    await handler(event);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: errorMessage,
    };
  }
}

// ============================================
// UTILITY: EMIT COMMON EVENTS
// ============================================

/**
 * Emit a status change event for any entity
 */
export async function emitStatusChange(
  entityType: EntityType,
  entityId: string,
  previousStatus: string,
  newStatus: string,
  organizationId: string,
  userId: string
): Promise<void> {
  const { publishEvent } = await import("./event-bus");

  await publishEvent({
    entityType,
    action: "STATUS_CHANGED",
    entityId,
    organizationId,
    userId,
    metadata: {
      previousState: { status: previousStatus },
      newState: { status: newStatus },
      changedFields: ["status"],
    },
  });
}

/**
 * Emit an entity created event
 */
export async function emitEntityCreated(
  entityType: EntityType,
  entityId: string,
  entityData: Record<string, unknown>,
  organizationId: string,
  userId: string
): Promise<void> {
  const { publishEvent } = await import("./event-bus");

  await publishEvent({
    entityType,
    action: "CREATED",
    entityId,
    organizationId,
    userId,
    metadata: {
      newState: entityData,
    },
  });
}

/**
 * Emit an entity updated event
 */
export async function emitEntityUpdated(
  entityType: EntityType,
  entityId: string,
  previousData: Record<string, unknown>,
  newData: Record<string, unknown>,
  changedFields: string[],
  organizationId: string,
  userId: string
): Promise<void> {
  const { publishEvent } = await import("./event-bus");

  await publishEvent({
    entityType,
    action: "UPDATED",
    entityId,
    organizationId,
    userId,
    metadata: {
      previousState: previousData,
      newState: newData,
      changedFields,
    },
  });
}
