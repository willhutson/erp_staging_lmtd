import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/audit-logs/[id] - Get single audit log
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    const log = await db.auditLog.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    });

    if (!log) {
      return apiError("Audit log not found", 404);
    }

    // Transform to include user relation-like structure
    const transformed = {
      ...log,
      user: log.userId
        ? { id: log.userId, name: log.userName, email: log.userEmail }
        : null,
      oldState: log.previousState,
      newState: log.newState,
    };

    return apiSuccess(transformed);
  });
}

// No POST, PATCH, DELETE - audit logs are immutable
