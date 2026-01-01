import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * User Sync Webhook for Analytics Engine
 *
 * This endpoint is called when users are created/updated to sync them
 * to the Neo4j-based analytics engine for graph analytics.
 */

const ANALYTICS_ENGINE_URL = process.env.ANALYTICS_ENGINE_URL;
const INTERNAL_API_KEY = process.env.INTERNAL_API_KEY || "dev-internal-key";

interface SyncUserPayload {
  userId: string;
  action: "create" | "update" | "delete";
}

// POST /api/internal/analytics/sync-user - Sync a user to analytics engine
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Verify internal API key
  const apiKey = request.headers.get("x-api-key");
  if (apiKey !== INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SyncUserPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.userId || !body.action) {
    return NextResponse.json(
      { error: "userId and action are required" },
      { status: 400 }
    );
  }

  // Get user from database
  const user = await db.user.findUnique({
    where: { id: body.userId },
    select: {
      id: true,
      email: true,
      name: true,
      organizationId: true,
    },
  });

  if (!user && body.action !== "delete") {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Forward to analytics-engine if configured
  let syncedToEngine = false;
  if (ANALYTICS_ENGINE_URL) {
    try {
      const response = await fetch(`${ANALYTICS_ENGINE_URL}/hooks/supabase-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${INTERNAL_API_KEY}`,
        },
        body: JSON.stringify({
          id: body.userId,
          email: user?.email,
          name: user?.name,
          created_at: new Date().toISOString(),
        }),
      });

      if (response.ok) {
        syncedToEngine = true;
      } else {
        console.error("Analytics engine returned error:", response.status);
      }
    } catch (error) {
      console.error("Failed to sync user to analytics engine:", error);
    }
  }

  return NextResponse.json({
    status: "synced",
    userId: body.userId,
    action: body.action,
    syncedToEngine,
  });
}
