import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/notification-rules/[id] - Get single rule
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    const rule = await db.notificationRule.findFirst({
      where: { id, organizationId: ctx.organizationId },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    if (!rule) {
      return apiError("Notification rule not found", 404);
    }

    return apiSuccess(rule);
  });
}

// PATCH /api/admin/notification-rules/[id] - Update rule
const updateRuleSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  eventType: z.string().min(1).optional(),
  recipientType: z.enum(["user", "role", "team", "custom"]).optional(),
  recipientValue: z.string().optional().nullable(),
  notifyLevels: z.array(z.string()).optional(),
  notifyCreator: z.boolean().optional(),
  notifyAssignee: z.boolean().optional(),
  notifyApprover: z.boolean().optional(),
  notifyTeamLead: z.boolean().optional(),
  conditions: z.record(z.unknown()).optional().nullable(),
  channels: z.array(z.enum(["in_app", "email", "slack"])).optional(),
  templateId: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const rule = await db.notificationRule.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!rule) {
      return apiError("Notification rule not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateRuleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check for duplicate name if updating name
    if (data.name && data.name !== rule.name) {
      const existing = await db.notificationRule.findFirst({
        where: {
          organizationId: ctx.organizationId,
          name: data.name,
          NOT: { id },
        },
      });

      if (existing) {
        return apiError("A notification rule with this name already exists", 400);
      }
    }

    const updated = await db.notificationRule.update({
      where: { id },
      data,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(updated);
  });
}

// DELETE /api/admin/notification-rules/[id] - Delete rule
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const rule = await db.notificationRule.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!rule) {
      return apiError("Notification rule not found", 404);
    }

    await db.notificationRule.delete({ where: { id } });

    return apiSuccess({ success: true });
  });
}
