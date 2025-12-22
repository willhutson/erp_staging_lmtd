/**
 * Content API - Single Post Endpoints
 *
 * Base URL: /api/content/[postId]
 *
 * Endpoints:
 * - GET /api/content/[postId] - Get post details
 * - PATCH /api/content/[postId] - Update post
 * - DELETE /api/content/[postId] - Delete post
 *
 * @module api/content/[postId]
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import {
  emitContentWebhook,
  emitStatusChanged,
} from "@/modules/content/webhooks/content-webhooks";
import { validateApiKey } from "@/lib/api/keys";

// ============================================
// VALIDATION SCHEMAS
// ============================================

const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  platforms: z
    .array(
      z.enum([
        "INSTAGRAM_FEED",
        "INSTAGRAM_STORY",
        "INSTAGRAM_REEL",
        "FACEBOOK_PAGE",
        "FACEBOOK_STORY",
        "THREADS",
        "TIKTOK",
        "YOUTUBE_VIDEO",
        "YOUTUBE_SHORT",
        "LINKEDIN_PAGE",
        "LINKEDIN_PERSONAL",
        "LINKEDIN_ARTICLE",
        "X_TWEET",
        "X_THREAD",
        "WORDPRESS",
        "CUSTOM_CMS",
        "PINTEREST",
        "SNAPCHAT",
      ])
    )
    .optional(),
  contentType: z
    .enum([
      "SINGLE_IMAGE",
      "CAROUSEL",
      "VIDEO",
      "SHORT_VIDEO",
      "STORY",
      "TEXT_ONLY",
      "ARTICLE",
      "LIVE",
    ])
    .optional(),
  caption: z.string().optional(),
  captionAr: z.string().optional().nullable(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  linkUrl: z.string().url().optional().nullable(),
  linkText: z.string().optional().nullable(),
  locationName: z.string().optional().nullable(),
  scheduledFor: z.string().datetime().optional().nullable(),
  status: z
    .enum([
      "DRAFT",
      "INTERNAL_REVIEW",
      "CLIENT_REVIEW",
      "REVISION_REQUESTED",
      "APPROVED",
      "SCHEDULED",
      "ARCHIVED",
    ])
    .optional(),
  assignedToId: z.string().optional().nullable(),
});

// ============================================
// AUTH HELPER
// ============================================

async function authenticateRequest(
  req: NextRequest
): Promise<{ organizationId: string; userId: string } | null> {
  const apiKey = req.headers.get("X-API-Key");
  if (apiKey) {
    const result = await validateApiKey(apiKey);
    if (result) {
      return {
        organizationId: result.organizationId,
        userId: result.apiKey.createdById
      };
    }
  }

  const session = await auth();
  if (session?.user) {
    return {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };
  }

  return null;
}

function errorResponse(
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json({ success: false, error: { message, ...details } }, { status });
}

// ============================================
// GET /api/content/[postId]
// ============================================

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return errorResponse("Unauthorized", 401);

    const { postId } = await params;

    const post = await db.contentPost.findFirst({
      where: {
        id: postId,
        organizationId: auth.organizationId,
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        socialAccount: {
          select: {
            id: true,
            platform: true,
            accountName: true,
            avatarUrl: true,
          },
        },
        brief: { select: { id: true, title: true, briefNumber: true } },
        deliverable: { select: { id: true, title: true } },
        assets: {
          orderBy: { sortOrder: "asc" },
        },
        versions: {
          orderBy: { versionNumber: "desc" },
          take: 10,
          include: {
            createdBy: { select: { id: true, name: true } },
          },
        },
        approvals: {
          orderBy: { createdAt: "desc" },
          include: {
            requestedBy: { select: { id: true, name: true } },
            assignedTo: { select: { id: true, name: true } },
            clientContact: { select: { id: true, name: true } },
          },
        },
        contentComments: {
          orderBy: { createdAt: "desc" },
          include: {
            user: { select: { id: true, name: true } },
            clientContact: { select: { id: true, name: true } },
            replies: {
              include: {
                user: { select: { id: true, name: true } },
                clientContact: { select: { id: true, name: true } },
              },
            },
          },
          where: { parentId: null }, // Only top-level comments
        },
      },
    });

    if (!post) return errorResponse("Post not found", 404);

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("GET /api/content/[postId] error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ============================================
// PATCH /api/content/[postId]
// ============================================

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return errorResponse("Unauthorized", 401);

    const { postId } = await params;
    const body = await req.json();
    const parsed = updatePostSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request body", 400, {
        validation: parsed.error.flatten().fieldErrors,
      });
    }

    // Get current post
    const current = await db.contentPost.findFirst({
      where: {
        id: postId,
        organizationId: auth.organizationId,
      },
    });

    if (!current) return errorResponse("Post not found", 404);

    const data = parsed.data;
    const previousStatus = current.status;

    // Check if content changed (needs new version)
    const contentChanged =
      (data.caption !== undefined && data.caption !== current.caption) ||
      (data.captionAr !== undefined && data.captionAr !== current.captionAr) ||
      (data.hashtags !== undefined &&
        JSON.stringify(data.hashtags) !== JSON.stringify(current.hashtags)) ||
      (data.platforms !== undefined &&
        JSON.stringify(data.platforms) !== JSON.stringify(current.platforms));

    const newVersion = contentChanged ? current.currentVersion + 1 : undefined;

    // Update post
    const post = await db.contentPost.update({
      where: { id: postId },
      data: {
        ...data,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : data.scheduledFor,
        currentVersion: newVersion,
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Create version if content changed
    if (contentChanged && newVersion) {
      await db.contentVersion.create({
        data: {
          postId,
          versionNumber: newVersion,
          caption: data.caption ?? current.caption,
          captionAr: data.captionAr ?? current.captionAr,
          hashtags: data.hashtags ?? current.hashtags,
          platforms: data.platforms ?? current.platforms,
          createdById: auth.userId,
          changeNotes: `Version ${newVersion} via API`,
        },
      });
    }

    // Emit webhooks
    await emitContentWebhook("content.post.updated", {
      postId: post.id,
      organizationId: post.organizationId,
      clientId: post.clientId,
      updatedFields: Object.keys(data),
      updatedById: auth.userId,
    });

    if (data.status && data.status !== previousStatus) {
      await emitStatusChanged(
        postId,
        auth.organizationId,
        previousStatus,
        data.status,
        auth.userId
      );
    }

    return NextResponse.json({ success: true, data: post });
  } catch (error) {
    console.error("PATCH /api/content/[postId] error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ============================================
// DELETE /api/content/[postId]
// ============================================

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) return errorResponse("Unauthorized", 401);

    const { postId } = await params;

    const post = await db.contentPost.findFirst({
      where: {
        id: postId,
        organizationId: auth.organizationId,
      },
    });

    if (!post) return errorResponse("Post not found", 404);

    // Don't allow deleting published posts
    if (post.status === "PUBLISHED") {
      return errorResponse("Cannot delete published posts", 400);
    }

    await db.contentPost.delete({ where: { id: postId } });

    await emitContentWebhook("content.post.deleted", {
      postId,
      organizationId: auth.organizationId,
      clientId: post.clientId,
      deletedById: auth.userId,
    });

    return NextResponse.json({ success: true, message: "Post deleted" });
  } catch (error) {
    console.error("DELETE /api/content/[postId] error:", error);
    return errorResponse("Internal server error", 500);
  }
}
