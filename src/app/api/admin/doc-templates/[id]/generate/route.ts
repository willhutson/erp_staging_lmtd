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

// POST /api/admin/doc-templates/[id]/generate - Generate a document
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest, context: RouteContext) {
  return withSessionAuth(request, { minLevel: "TEAM_LEAD" }, async (ctx) => {
    const { id } = await context.params;

    // Get template
    const template = await db.docTemplate.findFirst({
      where: {
        id,
        organizationId: ctx.organizationId,
        isActive: true,
      },
    });

    if (!template) {
      return apiError("Template not found or inactive", 404);
    }

    // Parse optional context from request body
    let context_data: Record<string, unknown> = {};
    try {
      const body = await request.json();
      context_data = body.context || {};
    } catch {
      // No body or invalid JSON - that's okay
    }

    // TODO: Call doc-engine microservice
    // The doc-engine is deployed separately and exposes a /generate endpoint
    // For now, return a placeholder response

    const docEngineUrl = process.env.DOC_ENGINE_URL;

    if (!docEngineUrl) {
      // Doc engine not configured - return stub response
      return apiSuccess({
        success: false,
        message: "Doc engine not configured. Set DOC_ENGINE_URL environment variable.",
        template_id: template.id,
        template_name: template.name,
        doc_url: null,
      });
    }

    try {
      // Call the doc-engine microservice
      const response = await fetch(`${docEngineUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          template_id: template.id,
          figma_file_key: template.figmaFileKey,
          google_doc_id: template.googleDocId,
          mappings: template.mappings,
          output_folder: template.outputFolder,
          naming_pattern: template.namingPattern,
          context: context_data,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return apiError(`Doc engine error: ${error}`, response.status);
      }

      const result = await response.json();

      // Update template stats
      await db.docTemplate.update({
        where: { id },
        data: {
          generationCount: { increment: 1 },
          lastGeneratedAt: new Date(),
        },
      });

      return apiSuccess({
        success: true,
        doc_url: result.doc_url,
        template_id: template.id,
        template_name: template.name,
        generated_at: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Doc engine error:", error);
      return apiError("Failed to connect to doc engine", 503);
    }
  });
}
