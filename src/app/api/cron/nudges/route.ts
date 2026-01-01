import { NextResponse } from "next/server";
import { processDueNudges } from "@/modules/workflows/services/nudge-dispatcher";

// Verify the cron secret to prevent unauthorized access
function verifyCronSecret(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  // In development, allow without secret
  if (process.env.NODE_ENV === "development") {
    return true;
  }

  // In production, require the secret
  if (!cronSecret) {
    console.warn("[Cron] CRON_SECRET not configured");
    return false;
  }

  return authHeader === `Bearer ${cronSecret}`;
}

/**
 * Workflow nudge processing cron job
 * Runs every 15 minutes
 *
 * Tasks:
 * 1. Process scheduled nudges that are due
 * 2. Send reminders via configured channels
 */
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();

  try {
    const sentCount = await processDueNudges();

    const results = {
      timestamp: new Date().toISOString(),
      nudgesSent: sentCount,
      duration: `${Date.now() - startTime}ms`,
      success: true,
    };

    console.log("[Cron] Nudge processing completed:", results);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Cron] Nudge job failed:", error);

    return NextResponse.json(
      {
        error: "Cron job failed",
        message: error instanceof Error ? error.message : "Unknown error",
        duration: `${Date.now() - startTime}ms`,
      },
      { status: 500 }
    );
  }
}
