import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiPaginated,
  apiError,
  parseRefineParams,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  Prisma,
  PermissionLevel,
  AccessAction,
  AccessCondition,
  AccessEffect,
  PolicyStatus,
} from "@prisma/client";
import { createAuditLogger } from "@/lib/audit";

// GET /api/admin/access-policies - List access policies
export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, filters } = parseRefineParams(searchParams);

    const where: Prisma.AccessPolicyWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.isActive !== undefined && {
        isActive: filters.isActive === "true",
      }),
      ...(filters.status && {
        status: filters.status as PolicyStatus,
      }),
      ...(filters.defaultLevel && {
        defaultLevel: filters.defaultLevel as PermissionLevel,
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [policies, total] = await Promise.all([
      db.accessPolicy.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          defaultLevel: true,
          status: true,
          isActive: true,
          priority: true,
          version: true,
          submittedAt: true,
          approvedAt: true,
          rejectedAt: true,
          rejectionReason: true,
          createdAt: true,
          updatedAt: true,
          createdBy: { select: { id: true, name: true } },
          approvedBy: { select: { id: true, name: true } },
          _count: {
            select: { rules: true, assignments: true },
          },
        },
        orderBy: { priority: "desc" },
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.accessPolicy.count({ where }),
    ]);

    return apiPaginated(policies, total, pagination);
  });
}

// POST /api/admin/access-policies - Create access policy
// LEADERSHIP creates as DRAFT, ADMIN can create as APPROVED
const createPolicySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  defaultLevel: z.nativeEnum(PermissionLevel).nullable().optional(),
  isActive: z.boolean().optional().default(true),
  priority: z.number().int().min(0).max(1000).optional().default(50),
  rules: z
    .array(
      z.object({
        resource: z.string().min(1),
        action: z.nativeEnum(AccessAction),
        effect: z.nativeEnum(AccessEffect).optional().default("ALLOW"),
        conditionType: z.nativeEnum(AccessCondition).optional().default("ALL"),
        conditionParams: z.record(z.unknown()).optional().default({}),
        allowedFields: z.array(z.string()).optional().default([]),
        deniedFields: z.array(z.string()).optional().default([]),
      })
    )
    .optional()
    .default([]),
});

export async function POST(request: NextRequest) {
  // Allow LEADERSHIP to create drafts
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createPolicySchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check name uniqueness
    const existing = await db.accessPolicy.findFirst({
      where: {
        organizationId: ctx.organizationId,
        name: data.name,
      },
    });

    if (existing) {
      return apiError("A policy with this name already exists", 409);
    }

    // Determine initial status based on permission level
    // ADMIN can create approved policies directly
    // LEADERSHIP creates drafts
    const isAdmin = ctx.permissionLevel === "ADMIN";
    const initialStatus: PolicyStatus = isAdmin ? "APPROVED" : "DRAFT";

    const policy = await db.accessPolicy.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        description: data.description,
        defaultLevel: data.defaultLevel,
        status: initialStatus,
        isActive: isAdmin ? data.isActive : false, // Drafts are not active
        priority: data.priority,
        createdById: ctx.userId,
        ...(isAdmin && {
          approvedById: ctx.userId,
          approvedAt: new Date(),
        }),
        rules: {
          create: data.rules.map((rule) => ({
            resource: rule.resource,
            action: rule.action,
            effect: rule.effect,
            conditionType: rule.conditionType,
            conditionParams: rule.conditionParams as Prisma.InputJsonValue,
            allowedFields: rule.allowedFields,
            deniedFields: rule.deniedFields,
          })),
        },
      },
      select: {
        id: true,
        name: true,
        description: true,
        defaultLevel: true,
        status: true,
        isActive: true,
        priority: true,
        version: true,
        createdAt: true,
        rules: {
          select: {
            id: true,
            resource: true,
            action: true,
            effect: true,
            conditionType: true,
          },
        },
      },
    });

    // Audit log
    const audit = createAuditLogger({
      organizationId: ctx.organizationId,
      userId: ctx.userId,
      email: ctx.email,
      name: ctx.name,
      role: ctx.role,
    });
    await audit.setRequestContext();
    await audit.logPolicyChange(
      "POLICY_CREATED",
      policy.id,
      policy.name,
      undefined,
      policy as unknown as Record<string, unknown>,
      `Policy created as ${initialStatus}: ${policy.name}`
    );

    // Create initial version
    await db.policyVersion.create({
      data: {
        policyId: policy.id,
        version: 1,
        name: policy.name,
        description: data.description,
        defaultLevel: data.defaultLevel,
        priority: data.priority ?? 50,
        rulesSnapshot: policy.rules,
        changeType: "CREATED",
        changeSummary: `Policy created by ${ctx.name}`,
        changedById: ctx.userId,
      },
    });

    return apiSuccess(policy, 201);
  });
}
