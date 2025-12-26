import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

/**
 * Event Bridge for Analytics Engine
 *
 * This endpoint receives events from the main app and:
 * 1. Stores them locally in the database
 * 2. Forwards them to the analytics-engine microservice (if configured)
 *
 * Events are identified by a service API key, not user session,
 * to allow internal services to track events.
 */

const ANALYTICS_ENGINE_URL = process.env.ANALYTICS_ENGINE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "dev-internal-key";

interface TrackEvent {
  type: string;
  userId?: string;
  organizationId: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

// POST /api/internal/analytics/track - Track an event
export async function POST(request: NextRequest) {
  // Verify internal API key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: TrackEvent;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.type || !body.organizationId) {
    return NextResponse.json(
      { error: "type and organizationId are required" },
      { status: 400 }
    );
  }

  const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date();

  // Store in local database as AnalyticsSnapshot for persistence
  // We use a special entityType "event" to distinguish from periodic snapshots
  try {
    await db.analyticsSnapshot.create({
      data: {
        organizationId: body.organizationId,
        period: "DAILY", // Events are stored with DAILY granularity
        periodStart: new Date(timestamp.toISOString().split("T")[0]),
        periodEnd: new Date(timestamp.toISOString().split("T")[0]),
        entityType: "event",
        entityId: eventId,
        metrics: {
          type: body.type,
          userId: body.userId,
          entityType: body.entityType,
          entityId: body.entityId,
          metadata: body.metadata || {},
          timestamp: timestamp.toISOString(),
        } as Prisma.InputJsonValue,
      },
    });
  } catch (error) {
    console.error("Failed to store event locally:", error);
    // Continue to try forwarding even if local storage fails
  }

  // Forward to analytics-engine if configured
  let forwardedToEngine = false;
  if (ANALYTICS_ENGINE_URL) {
    try {
      const response = await fetch(`${ANALYTICS_ENGINE_URL}/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({
          id: eventId,
          type: body.type,
          metadata: {
            userId: body.userId,
            organizationId: body.organizationId,
            entityType: body.entityType,
            entityId: body.entityId,
            ...body.metadata,
          },
          created_at: timestamp.toISOString(),
        }),
      });

      if (response.ok) {
        forwardedToEngine = true;
      } else {
        console.error("Analytics engine returned error:", response.status);
      }
    } catch (error) {
      console.error("Failed to forward event to analytics engine:", error);
    }
  }

  return NextResponse.json({
    status: "tracked",
    eventId,
    timestamp: timestamp.toISOString(),
    forwardedToEngine,
  });
}

// GET /api/internal/analytics/track - Health check
export async function GET() {
  return NextResponse.json({
    status: "ok",
    analyticsEngineConfigured: !!ANALYTICS_ENGINE_URL,
  });
}
