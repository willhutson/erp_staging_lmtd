/**
 * Analytics Event Tracking Utility
 *
 * Server-side utility for tracking events to the analytics engine.
 * Use this in Server Actions and API routes to record user activities.
 */

const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "dev-internal-key";

export interface TrackEventParams {
  type: string;
  userId?: string;
  organizationId: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Track an event to the analytics engine.
 *
 * @example
 * await trackEvent({
 *   type: "brief.created",
 *   userId: session.user.id,
 *   organizationId: session.user.organizationId,
 *   entityType: "Brief",
 *   entityId: brief.id,
 *   metadata: { briefType: brief.type, clientId: brief.clientId },
 * });
 */
export async function trackEvent(params: TrackEventParams): Promise<void> {
  try {
    // In development, use a relative URL; in production, use the full URL
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.NEXTAUTH_URL || "http://localhost:3000";

    const response = await fetch(`${baseUrl}/api/internal/analytics/track`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": INTERNAL_API_KEY,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      console.error("Failed to track event:", response.status);
    }
  } catch (error) {
    // Don't throw - analytics tracking should never break the main flow
    console.error("Error tracking event:", error);
  }
}

/**
 * Pre-defined event types for common actions.
 * Use these constants for consistency across the codebase.
 */
export const EventTypes = {
  // User events
  USER_LOGIN: "user.login",
  USER_LOGOUT: "user.logout",
  USER_SIGNUP: "user.signup",

  // Brief events
  BRIEF_CREATED: "brief.created",
  BRIEF_UPDATED: "brief.updated",
  BRIEF_STATUS_CHANGED: "brief.status_changed",
  BRIEF_ASSIGNED: "brief.assigned",
  BRIEF_COMPLETED: "brief.completed",

  // Project events
  PROJECT_CREATED: "project.created",
  PROJECT_UPDATED: "project.updated",
  PROJECT_COMPLETED: "project.completed",

  // Time tracking events
  TIME_ENTRY_STARTED: "time.started",
  TIME_ENTRY_STOPPED: "time.stopped",
  TIME_ENTRY_CREATED: "time.created",

  // Client events
  CLIENT_CREATED: "client.created",
  CLIENT_UPDATED: "client.updated",

  // Document events
  DOCUMENT_CREATED: "document.created",
  DOCUMENT_GENERATED: "document.generated",

  // RFP events
  RFP_CREATED: "rfp.created",
  RFP_STATUS_CHANGED: "rfp.status_changed",
  RFP_WON: "rfp.won",
  RFP_LOST: "rfp.lost",

  // Analytics events
  DASHBOARD_VIEWED: "analytics.dashboard_viewed",
  REPORT_GENERATED: "analytics.report_generated",
} as const;

export type EventType = (typeof EventTypes)[keyof typeof EventTypes];
