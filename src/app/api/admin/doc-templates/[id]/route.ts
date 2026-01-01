import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiError,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, DocTemplateCategory } from "@prisma/client";

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/admin/doc-templates/[id] - Get single template
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { id } = await context.params;

    const template = await db.docTemplate.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
      },
    });

    if (!template) {
      return apiError("Template not found", 404);
    }

    // Add computed googleDocUrl
    const templateWithUrl = {
      ...template,
      googleDocUrl: `https://docs.google.com/document/d/${template.googleDocId}/edit`,
    };

    return apiSuccess(templateWithUrl);
  });
}

// PATCH /api/admin/doc-templates/[id] - Update template
const updateTemplateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().nullable().optional(),
  category: z.nativeEnum(DocTemplateCategory).optional(),
  isActive: z.boolean().optional(),
  figmaFileKey: z.string().min(1).optional(),
  figmaFileUrl: z.string().url().nullable().optional(),
  googleDocId: z.string().min(1).optional(),
  outputFolder: z.string().nullable().optional(),
  namingPattern: z.string().nullable().optional(),
  mappings: z.array(z.object({
    figma_node: z.string(),
    doc_var: z.string(),
  })).optional(),
});

export async function PATCH(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    const { id } = await context.params;

    // Verify template exists and belongs to org
    const existing = await db.docTemplate.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!existing) {
      return apiError("Template not found", 404);
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = updateTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check name uniqueness if changing
    if (data.name && data.name !== existing.name) {
      const nameTaken = await db.docTemplate.findFirst({
        where: {
          organizationId: ctx.organizationId,
          name: data.name,
          NOT: { id },
        },
      });
      if (nameTaken) {
        return apiError("A template with this name already exists", 409);
      }
    }

    const updateData: Prisma.DocTemplateUpdateInput = {};
    if (data.name) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.category) updateData.category = data.category;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;
    if (data.figmaFileKey) updateData.figmaFileKey = data.figmaFileKey;
    if (data.figmaFileUrl !== undefined) updateData.figmaFileUrl = data.figmaFileUrl;
    if (data.googleDocId) updateData.googleDocId = data.googleDocId;
    if (data.outputFolder !== undefined) updateData.outputFolder = data.outputFolder;
    if (data.namingPattern !== undefined) updateData.namingPattern = data.namingPattern;
    if (data.mappings) updateData.mappings = data.mappings as Prisma.InputJsonValue;

    const template = await db.docTemplate.update({
      where: { id },
      data: updateData,
    });

    return apiSuccess({
      ...template,
      googleDocUrl: `https://docs.google.com/document/d/${template.googleDocId}/edit`,
    });
  });
}

// DELETE /api/admin/doc-templates/[id] - Delete template
export async function DELETE(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "ADMIN" }, async (ctx) => {
    const { id } = await context.params;

    const template = await db.docTemplate.findFirst({
      where: { id, organizationId: ctx.organizationId },
    });

    if (!template) {
      return apiError("Template not found", 404);
    }

    await db.docTemplate.delete({
      where: { id },
    });

    return apiSuccess({ id, deleted: true });
  });
}
