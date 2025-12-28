/**
 * GET /api/v1/briefs/:id/comments - Get brief comments
 * POST /api/v1/briefs/:id/comments - Add comment to brief
 */

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  created,
  handleRoute,
  validateBody,
  ApiError,
} from "@/lib/api";

const CreateCommentSchema = z.object({
  content: z.string().min(1).max(5000),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: briefId } = await params;
    const context = await getAuthContext();

    // Verify brief belongs to org
    const brief = await prisma.brief.findFirst({
      where: {
        id: briefId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!brief) {
      throw ApiError.notFound("Brief");
    }

    const comments = await prisma.comment.findMany({
      where: { briefId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            role: true,
          },
        },
      },
    });

    return success(comments);
  });
}

export async function POST(request: Request, { params }: RouteParams) {
  return handleRoute(async () => {
    const { id: briefId } = await params;
    const context = await getAuthContext();
    const { content } = await validateBody(request, CreateCommentSchema);

    // Verify brief belongs to org
    const brief = await prisma.brief.findFirst({
      where: {
        id: briefId,
        organizationId: context.organizationId,
      },
      select: { id: true },
    });

    if (!brief) {
      throw ApiError.notFound("Brief");
    }

    const comment = await prisma.comment.create({
      data: {
        briefId,
        userId: context.user.id,
        content,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return created(comment);
  });
}
