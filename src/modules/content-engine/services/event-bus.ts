"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { Prisma } from "@prisma/client";

// ============================================
// TYPES
// ============================================

export type EntityType =
  | "BRIEF"
  | "DELIVERABLE"
  | "CLIENT"
  | "RFP"
  | "USER"
  | "TIME_ENTRY"
  | "KNOWLEDGE_DOC"
  | "SKILL";

export type EventAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED";

export interface EntityEvent {
  entityType: EntityType;
  action: EventAction;
  entityId: string;
  organizationId: string;
  userId: string;
  timestamp: Date;
  metadata: {
    previousState?: Record<string, unknown>;
    newState?: Record<string, unknown>;
    changedFields?: string[];
    [key: string]: unknown;
  };
}

export interface EventSubscription {
  id: string;
  entityType: EntityType | "*";
  action: EventAction | "*";
  handler: string; // Handler function name
  skillSlug?: string; // Optional skill to trigger
  priority: number;
  enabled: boolean;
}

// ============================================
// EVENT PUBLISHING
// ============================================

/**
 * Publish an entity event to the event bus
 *
 * This records the event and triggers any subscribed handlers
 */
export async function publishEvent(event: Omit<EntityEvent, "timestamp">): Promise<string> {
  const fullEvent: EntityEvent = {
    ...event,
    timestamp: new Date(),
  };

  // Store the event in the database for audit trail
  const stored = await db.entityEvent.create({
    data: {
      organizationId: event.organizationId,
      entityType: event.entityType,
      entityId: event.entityId,
      action: event.action,
      userId: event.userId,
      metadata: event.metadata as Prisma.InputJsonValue,
    },
  });

  // Process handlers asynchronously
  processEventHandlers(fullEvent).catch((err) => {
    console.error("Error processing event handlers:", err);
  });

  return stored.id;
}

/**
 * Create event from current session context
 */
export async function createEvent(
  entityType: EntityType,
  action: EventAction,
  entityId: string,
  metadata: EntityEvent["metadata"] = {}
): Promise<string | null> {
  const session = await auth();
  if (!session?.user) {
    console.warn("Cannot create event: no session");
    return null;
  }

  return publishEvent({
    entityType,
    action,
    entityId,
    organizationId: session.user.organizationId,
    userId: session.user.id,
    metadata,
  });
}

// ============================================
// EVENT PROCESSING
// ============================================

/**
 * Process all handlers for an event
 */
async function processEventHandlers(event: EntityEvent): Promise<void> {
  // Get all active subscriptions that match this event
  const subscriptions = await getMatchingSubscriptions(
    event.organizationId,
    event.entityType,
    event.action
  );

  // Sort by priority (lower = higher priority)
  subscriptions.sort((a, b) => a.priority - b.priority);

  // Execute handlers
  for (const sub of subscriptions) {
    try {
      await executeHandler(sub, event);
    } catch (error) {
      console.error(`Error executing handler ${sub.handler}:`, error);
      // Log the failure but continue with other handlers
      await logHandlerFailure(sub, event, error);
    }
  }
}

/**
 * Get subscriptions matching an event
 */
async function getMatchingSubscriptions(
  organizationId: string,
  entityType: EntityType,
  action: EventAction
): Promise<EventSubscription[]> {
  // Get from database
  const dbSubs = await db.eventSubscription.findMany({
    where: {
      organizationId,
      enabled: true,
      OR: [
        { entityType: entityType },
        { entityType: "*" },
      ],
    },
  });

  // Filter by action
  return dbSubs
    .filter((sub) => sub.action === action || sub.action === "*")
    .map((sub) => ({
      id: sub.id,
      entityType: sub.entityType as EntityType | "*",
      action: sub.action as EventAction | "*",
      handler: sub.handler,
      skillSlug: sub.skillSlug ?? undefined,
      priority: sub.priority,
      enabled: sub.enabled,
    }));
}

/**
 * Execute a handler for an event
 */
async function executeHandler(
  subscription: EventSubscription,
  event: EntityEvent
): Promise<void> {
  // If a skill is specified, invoke it
  if (subscription.skillSlug) {
    const { invokeSkill } = await import("./skill-invocation");

    await invokeSkill({
      skillSlug: subscription.skillSlug,
      inputs: {
        entityType: event.entityType,
        entityId: event.entityId,
        action: event.action,
        metadata: event.metadata,
      },
      triggeredBy: "EVENT",
      entityType: event.entityType,
      entityId: event.entityId,
    });
  }

  // Log successful execution
  await db.eventHandlerLog.create({
    data: {
      organizationId: event.organizationId,
      eventId: event.entityId,
      subscriptionId: subscription.id,
      status: "SUCCESS",
      executedAt: new Date(),
    },
  });
}

/**
 * Log handler failure
 */
async function logHandlerFailure(
  subscription: EventSubscription,
  event: EntityEvent,
  error: unknown
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : String(error);

  await db.eventHandlerLog.create({
    data: {
      organizationId: event.organizationId,
      eventId: event.entityId,
      subscriptionId: subscription.id,
      status: "FAILED",
      error: errorMessage,
      executedAt: new Date(),
    },
  });
}

// ============================================
// EVENT QUERIES
// ============================================

/**
 * Get recent events for an entity
 */
export async function getEntityEvents(
  entityType: EntityType,
  entityId: string,
  options?: { limit?: number }
): Promise<EntityEvent[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const events = await db.entityEvent.findMany({
    where: {
      organizationId: session.user.organizationId,
      entityType,
      entityId,
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return events.map((e) => ({
    entityType: e.entityType as EntityType,
    action: e.action as EventAction,
    entityId: e.entityId,
    organizationId: e.organizationId,
    userId: e.userId,
    timestamp: e.createdAt,
    metadata: e.metadata as unknown as EntityEvent["metadata"],
  }));
}

/**
 * Get event activity feed for organization
 */
export async function getActivityFeed(options?: {
  entityTypes?: EntityType[];
  limit?: number;
}): Promise<EntityEvent[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.entityTypes && options.entityTypes.length > 0) {
    where.entityType = { in: options.entityTypes };
  }

  const events = await db.entityEvent.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 100,
    include: {
      user: { select: { id: true, name: true } },
    },
  });

  return events.map((e) => ({
    entityType: e.entityType as EntityType,
    action: e.action as EventAction,
    entityId: e.entityId,
    organizationId: e.organizationId,
    userId: e.userId,
    timestamp: e.createdAt,
    metadata: e.metadata as unknown as EntityEvent["metadata"],
  }));
}

// ============================================
// SUBSCRIPTION MANAGEMENT
// ============================================

/**
 * Create an event subscription
 */
export async function createSubscription(input: {
  entityType: EntityType | "*";
  action: EventAction | "*";
  handler: string;
  skillSlug?: string;
  priority?: number;
}): Promise<EventSubscription> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const sub = await db.eventSubscription.create({
    data: {
      organizationId: session.user.organizationId,
      entityType: input.entityType,
      action: input.action,
      handler: input.handler,
      skillSlug: input.skillSlug,
      priority: input.priority ?? 100,
      enabled: true,
    },
  });

  return {
    id: sub.id,
    entityType: sub.entityType as EntityType | "*",
    action: sub.action as EventAction | "*",
    handler: sub.handler,
    skillSlug: sub.skillSlug ?? undefined,
    priority: sub.priority,
    enabled: sub.enabled,
  };
}

/**
 * Update subscription status
 */
export async function updateSubscription(
  id: string,
  updates: { enabled?: boolean; priority?: number }
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.eventSubscription.update({
    where: { id },
    data: updates,
  });
}

/**
 * Delete a subscription
 */
export async function deleteSubscription(id: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.eventSubscription.delete({
    where: { id },
  });
}

/**
 * List all subscriptions for organization
 */
export async function listSubscriptions(): Promise<EventSubscription[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const subs = await db.eventSubscription.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: [{ entityType: "asc" }, { priority: "asc" }],
  });

  return subs.map((sub) => ({
    id: sub.id,
    entityType: sub.entityType as EntityType | "*",
    action: sub.action as EventAction | "*",
    handler: sub.handler,
    skillSlug: sub.skillSlug ?? undefined,
    priority: sub.priority,
    enabled: sub.enabled,
  }));
}
