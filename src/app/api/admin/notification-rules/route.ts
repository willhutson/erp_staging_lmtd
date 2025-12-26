import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";

// GET /api/admin/notification-rules - List notification rules
export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { searchParams } = new URL(request.url);
    const eventType = searchParams.get("eventType");
    const isActive = searchParams.get("isActive");

    const where: Record<string, unknown> = {
      organizationId: ctx.organizationId,
    };

    if (eventType) {
      where.eventType = eventType;
    }

    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    const rules = await db.notificationRule.findMany({
      where,
      include: {
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    });

    return apiSuccess(rules);
  });
}

// POST /api/admin/notification-rules - Create notification rule
const createRuleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  eventType: z.string().min(1, "Event type is required"),
  recipientType: z.enum(["user", "role", "team", "custom"]),
  recipientValue: z.string().optional(),
  notifyLevels: z.array(z.string()).optional(),
  notifyCreator: z.boolean().optional(),
  notifyAssignee: z.boolean().optional(),
  notifyApprover: z.boolean().optional(),
  notifyTeamLead: z.boolean().optional(),
  conditions: z.record(z.unknown()).optional(),
  channels: z.array(z.enum(["in_app", "email", "slack"])).optional(),
  templateId: z.string().optional(),
  isActive: z.boolean().optional(),
  priority: z.number().optional(),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createRuleSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check for duplicate name
    const existing = await db.notificationRule.findFirst({
      where: {
        organizationId: ctx.organizationId,
        name: data.name,
      },
    });

    if (existing) {
      return apiError("A notification rule with this name already exists", 400);
    }

    const rule = await db.notificationRule.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        description: data.description,
        eventType: data.eventType,
        recipientType: data.recipientType,
        recipientValue: data.recipientValue,
        notifyLevels: data.notifyLevels || [],
        notifyCreator: data.notifyCreator || false,
        notifyAssignee: data.notifyAssignee || false,
        notifyApprover: data.notifyApprover || false,
        notifyTeamLead: data.notifyTeamLead || false,
        conditions: data.conditions,
        channels: data.channels || ["in_app"],
        templateId: data.templateId,
        isActive: data.isActive ?? true,
        priority: data.priority || 0,
        createdById: ctx.userId,
      },
      include: {
        createdBy: { select: { id: true, name: true } },
      },
    });

    return apiSuccess(rule, 201);
  });
}
