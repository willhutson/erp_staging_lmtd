import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, SkillCategory } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/skills/[id] - Get single skill
export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { id } = await context.params;

    const skill = await db.agentSkill.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
      include: {
        document: {
          select: { id: true, title: true, documentType: true },
        },
        _count: {
          select: { invocations: true },
        },
      },
    });

    if (!skill) {
      return apiError("Skill not found", 404);
    }

    return apiSuccess(skill);
  });
}

// PATCH /api/admin/skills/[id] - Update skill
const updateSkillSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  slug: z.string().min(2).max(50).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with dashes").optional(),
  description: z.string().min(1).optional(),
  category: z.nativeEnum(SkillCategory).optional(),
  isEnabled: z.boolean().optional(),
  version: z.string().optional(),
  triggers: z.array(z.unknown()).optional(),
  inputs: z.array(z.unknown()).optional(),
  outputs: z.array(z.unknown()).optional(),
  config: z.unknown().nullable().optional(),
  dependsOn: z.array(z.string()).optional(),
  requiredPermissions: z.array(z.string()).optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    // Verify skill exists and belongs to org
    const existingSkill = await db.agentSkill.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!existingSkill) {
      return apiError("Skill not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateSkillSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check slug uniqueness if changing
    if (data.slug && data.slug !== existingSkill.slug) {
      const slugTaken = await db.agentSkill.findFirst({
        where: {
          organizationId: ctx.organizationId,
          slug: data.slug,
          NOT: { id },
        },
      });
      if (slugTaken) {
        return apiError("A skill with this slug already exists", 409);
      }
    }

    const updateData: Prisma.AgentSkillUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.slug) updateData.slug = data.slug;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.isEnabled !== undefined) updateData.isEnabled = data.isEnabled;
    if (data.version) updateData.version = data.version;
    if (data.triggers) updateData.triggers = data.triggers as Prisma.InputJsonValue;
    if (data.inputs) updateData.inputs = data.inputs as Prisma.InputJsonValue;
    if (data.outputs) updateData.outputs = data.outputs as Prisma.InputJsonValue;
    if (data.config !== undefined) {
      updateData.config = (data.config === null ? Prisma.DbNull : data.config) as Prisma.InputJsonValue;
    }
    if (data.dependsOn) updateData.dependsOn = data.dependsOn;
    if (data.requiredPermissions) updateData.requiredPermissions = data.requiredPermissions;

    const skill = await db.agentSkill.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        category: true,
        isEnabled: true,
        version: true,
        triggers: true,
        inputs: true,
        outputs: true,
        config: true,
        dependsOn: true,
        requiredPermissions: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return apiSuccess(skill);
  });
}

// DELETE /api/admin/skills/[id] - Delete skill
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const skill = await db.agentSkill.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!skill) {
      return apiError("Skill not found", 404);
    }

    // Check if skill has invocations
    const invocationCount = await db.agentInvocation.count({
      where: { skillId: id },
    });

    if (invocationCount > 0) {
      // Disable instead of delete if it has history
      await db.agentSkill.update({
        where: { id },
        data: { isEnabled: false },
      });
      return apiSuccess({ id, disabled: true, message: "Skill disabled (has invocation history)" });
    }

    // Hard delete if no invocations
    await db.agentSkill.delete({
      where: { id },
    });

    return apiSuccess({ id, deleted: true });
  });
}
