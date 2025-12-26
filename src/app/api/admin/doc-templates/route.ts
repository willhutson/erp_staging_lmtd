import { NextRequest } from "next/server";
import {
  withSessionAuth,
  apiSuccess,
  apiPaginated,
  apiError,
  parseRefineParams,
  buildOrderBy,
} from "@/lib/api/session-middleware";
import { db } from "@/lib/db";
import { z } from "zod";
import { Prisma, DocTemplateCategory } from "@prisma/client";

// GET /api/admin/doc-templates - List templates
export async function GET(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { searchParams } = request.nextUrl;
    const { pagination, sort, filters } = parseRefineParams(searchParams);

    // Build where clause
    const where: Prisma.DocTemplateWhereInput = {
      organizationId: ctx.organizationId,
      ...(filters.category && { category: filters.category as DocTemplateCategory }),
      ...(filters.isActive !== undefined && {
        isActive: filters.isActive === "true",
      }),
      ...(filters.q && {
        OR: [
          { name: { contains: filters.q, mode: "insensitive" } },
          { description: { contains: filters.q, mode: "insensitive" } },
        ],
      }),
    };

    const [templates, total] = await Promise.all([
      db.docTemplate.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          category: true,
          isActive: true,
          figmaFileKey: true,
          figmaFileUrl: true,
          googleDocId: true,
          generationCount: true,
          lastGeneratedAt: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: sort.length > 0 ? buildOrderBy(sort) : { name: "asc" },
        take: pagination.limit,
        skip: pagination.offset,
      }),
      db.docTemplate.count({ where }),
    ]);

    // Add computed googleDocUrl
    const templatesWithUrls = templates.map((t) => ({
      ...t,
      googleDocUrl: `https://docs.google.com/document/d/${t.googleDocId}/edit`,
    }));

    return apiPaginated(templatesWithUrls, total, pagination);
  });
}

// POST /api/admin/doc-templates - Create template
const createTemplateSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().optional(),
  category: z.nativeEnum(DocTemplateCategory).optional().default("OTHER"),
  isActive: z.boolean().optional().default(true),
  figmaFileKey: z.string().min(1),
  figmaFileUrl: z.string().url().optional(),
  googleDocId: z.string().min(1),
  outputFolder: z.string().optional(),
  namingPattern: z.string().optional(),
  mappings: z.array(z.object({
    figma_node: z.string(),
    doc_var: z.string(),
  })).optional().default([]),
});

export async function POST(request: NextRequest) {
  return withSessionAuth(request, { minLevel: "LEADERSHIP" }, async (ctx) => {
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return apiError("Invalid JSON body", 400);
    }

    const parsed = createTemplateSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(
        `Validation error: ${parsed.error.issues.map((e) => e.message).join(", ")}`,
        400
      );
    }

    const data = parsed.data;

    // Check name uniqueness within organization
    const existing = await db.docTemplate.findFirst({
      where: {
        organizationId: ctx.organizationId,
        name: data.name,
      },
    });

    if (existing) {
      return apiError("A template with this name already exists", 409);
    }

    const template = await db.docTemplate.create({
      data: {
        organizationId: ctx.organizationId,
        name: data.name,
        description: data.description,
        category: data.category,
        isActive: data.isActive,
        figmaFileKey: data.figmaFileKey,
        figmaFileUrl: data.figmaFileUrl,
        googleDocId: data.googleDocId,
        outputFolder: data.outputFolder,
        namingPattern: data.namingPattern,
        mappings: data.mappings,
      },
      select: {
        id: true,
        name: true,
        category: true,
        isActive: true,
        createdAt: true,
      },
    });

    return apiSuccess(template, 201);
  });
}
