import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  activatePendingDelegations,
  getDelegationsNeedingHandoff,
  startHandoff,
  processReturnReminders,
} from "@/modules/delegation";

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
 * Daily delegation cron job
 * Runs at 6 AM UAE time (2 AM UTC)
 *
 * Tasks:
 * 1. Activate pending delegations
 * 2. Start handoff for ending delegations
 * 3. Send return reminders
 */
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (!verifyCronSecret(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const results: Record<string, unknown> = {
    timestamp: new Date().toISOString(),
    tasks: {},
  };

  try {
    // Get all organizations for processing
    const organizations = await db.organization.findMany({
      select: { id: true, name: true },
    });

    // 1. Activate pending delegations
    const activated = await activatePendingDelegations();
    results.tasks = {
      ...results.tasks as object,
      activatedDelegations: activated,
    };

    // 2. Process handoffs for each organization
    let handoffsStarted = 0;
    for (const org of organizations) {
      const needingHandoff = await getDelegationsNeedingHandoff(org.id);

      for (const delegation of needingHandoff) {
        if (!delegation.handoffScheduled) {
          try {
            await startHandoff(delegation.id);
            handoffsStarted++;
          } catch (error) {
            console.error(
              `[Cron] Failed to start handoff for ${delegation.id}:`,
              error
            );
          }
        }
      }
    }
    results.tasks = {
      ...results.tasks as object,
      handoffsStarted,
    };

    // 3. Send return reminders for each organization
    let remindersSent = 0;
    for (const org of organizations) {
      const sent = await processReturnReminders(org.id);
      remindersSent += sent;
    }
    results.tasks = {
      ...results.tasks as object,
      returnRemindersSent: remindersSent,
    };

    results.duration = `${Date.now() - startTime}ms`;
    results.success = true;

    console.log("[Cron] Delegation tasks completed:", results);

    return NextResponse.json(results);
  } catch (error) {
    console.error("[Cron] Delegation job failed:", error);

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
