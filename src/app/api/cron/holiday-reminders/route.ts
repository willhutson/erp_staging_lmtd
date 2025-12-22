/**
 * Holiday Reminders Cron API Route
 *
 * Trigger this endpoint daily (e.g., 9 AM UAE time) to send holiday reminders.
 *
 * Recommended cron schedule: 0 9 * * * (every day at 9 AM)
 *
 * Security: Requires CRON_SECRET header for authentication.
 *
 * @module api/cron/holiday-reminders
 */

import { NextRequest, NextResponse } from "next/server";
import { processAllOrganizationReminders } from "@/modules/chat/services/holiday-reminders";

export async function GET(request: NextRequest) {
  // Verify cron secret for security
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const results = await processAllOrganizationReminders();

    const summary = {
      processedAt: new Date().toISOString(),
      organizations: Array.from(results.entries()).map(([orgId, result]) => ({
        organizationId: orgId,
        remindersSent: result.sent,
        reminders: result.reminders,
      })),
      totalReminders: Array.from(results.values()).reduce(
        (sum, r) => sum + r.sent,
        0
      ),
    };

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Holiday reminders cron failed:", error);
    return NextResponse.json(
      { error: "Failed to process holiday reminders" },
      { status: 500 }
    );
  }
}

// Also support POST for manual triggers
export async function POST(request: NextRequest) {
  return GET(request);
}
