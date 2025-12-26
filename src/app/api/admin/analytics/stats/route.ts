import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";

/**
 * Analytics Stats API
 *
 * Returns high-level analytics stats. If the analytics-engine is configured,
 * it fetches graph-based stats from Neo4j. Otherwise, it computes stats
 * from the local PostgreSQL database.
 */

const ANALYTICS_ENGINE_URL = process.env.ANALYTICS_ENGINE_URL;

// GET /api/admin/analytics/stats - Get analytics overview
export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    // Try to fetch from analytics engine if configured
    if (ANALYTICS_ENGINE_URL) {
      try {
        const response = await fetch(`${ANALYTICS_ENGINE_URL}/analytics/stats`, {
          headers: {
            Authorization: `Bearer ${ctx.token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return apiSuccess({
            source: "analytics-engine",
            ...data,
          });
        }
      } catch (error) {
        console.error("Failed to fetch from analytics engine:", error);
        // Fall through to local computation
      }
    }

    // Compute stats locally from PostgreSQL
    const [
      totalUsers,
      activeUsers,
      totalBriefs,
      completedBriefs,
      totalProjects,
      activeProjects,
      totalTimeEntries,
      recentEvents,
    ] = await Promise.all([
      db.user.count({
        where: { organizationId: ctx.organizationId },
      }),
      db.user.count({
        where: {
          organizationId: ctx.organizationId,
          lastLoginAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
          },
        },
      }),
      db.brief.count({
        where: { organizationId: ctx.organizationId },
      }),
      db.brief.count({
        where: {
          organizationId: ctx.organizationId,
          status: { in: ["COMPLETED", "APPROVED"] },
        },
      }),
      db.project.count({
        where: { organizationId: ctx.organizationId },
      }),
      db.project.count({
        where: {
          organizationId: ctx.organizationId,
          status: { in: ["ACTIVE", "IN_PROGRESS"] },
        },
      }),
      db.timeEntry.count({
        where: { organizationId: ctx.organizationId },
      }),
      db.analyticsSnapshot.count({
        where: {
          organizationId: ctx.organizationId,
          entityType: "event",
          computedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
          },
        },
      }),
    ]);

    // Calculate completion rate
    const briefCompletionRate = totalBriefs > 0
      ? Math.round((completedBriefs / totalBriefs) * 100)
      : 0;

    // Calculate user activity rate
    const userActivityRate = totalUsers > 0
      ? Math.round((activeUsers / totalUsers) * 100)
      : 0;

    return apiSuccess({
      source: "postgresql",
      stats: {
        users: {
          total: totalUsers,
          active: activeUsers,
          activityRate: userActivityRate,
        },
        briefs: {
          total: totalBriefs,
          completed: completedBriefs,
          completionRate: briefCompletionRate,
        },
        projects: {
          total: totalProjects,
          active: activeProjects,
        },
        timeTracking: {
          totalEntries: totalTimeEntries,
        },
        events: {
          recentCount: recentEvents,
        },
      },
      generatedAt: new Date().toISOString(),
    });
  });
}
