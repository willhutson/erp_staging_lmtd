import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/notification-rules/[id] - Get single rule
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

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

    // Build update data with proper JSON handling
    const updateData: Prisma.NotificationRuleUpdateInput = {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.eventType && { eventType: data.eventType }),
      ...(data.recipientType && { recipientType: data.recipientType }),
      ...(data.recipientValue !== undefined && { recipientValue: data.recipientValue }),
      ...(data.notifyLevels && { notifyLevels: data.notifyLevels }),
      ...(data.notifyCreator !== undefined && { notifyCreator: data.notifyCreator }),
      ...(data.notifyAssignee !== undefined && { notifyAssignee: data.notifyAssignee }),
      ...(data.notifyApprover !== undefined && { notifyApprover: data.notifyApprover }),
      ...(data.notifyTeamLead !== undefined && { notifyTeamLead: data.notifyTeamLead }),
      ...(data.conditions !== undefined && {
        conditions: data.conditions === null
          ? Prisma.JsonNull
          : (data.conditions as Prisma.InputJsonValue),
      }),
      ...(data.channels && { channels: data.channels }),
      ...(data.templateId !== undefined && { templateId: data.templateId }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      ...(data.priority !== undefined && { priority: data.priority }),
    };

    const updated = await db.notificationRule.update({
      where: { id },
      data: updateData,
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
