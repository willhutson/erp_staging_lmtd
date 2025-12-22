/**
 * Content API - Main Endpoints
 *
 * Base URL: /api/content
 *
 * Endpoints:
 * - GET /api/content - List posts with filters
 * - POST /api/content - Create a new post
 *
 * Authentication: API Key (X-API-Key header) or Session
 *
 * @module api/content
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { emitPostCreated } from "@/modules/content/webhooks/content-webhooks";

// ============================================
// REQUEST VALIDATION SCHEMAS
// ============================================

const listPostsSchema = z.object({
  clientId: z.string().optional(),
  status: z
    .enum([
      "DRAFT",
      "INTERNAL_REVIEW",
      "CLIENT_REVIEW",
      "REVISION_REQUESTED",
      "APPROVED",
      "SCHEDULED",
      "PUBLISHING",
      "PUBLISHED",
      "FAILED",
      "ARCHIVED",
    ])
    .optional(),
  platforms: z.string().optional(), // Comma-separated
  scheduledFrom: z.string().datetime().optional(),
  scheduledTo: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  sortBy: z.enum(["createdAt", "scheduledFor", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

const createPostSchema = z.object({
  clientId: z.string().min(1, "Client is required"),
  title: z.string().min(1, "Title is required").max(200),
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
    .min(1, "At least one platform is required"),
  contentType: z.enum([
    "SINGLE_IMAGE",
    "CAROUSEL",
    "VIDEO",
    "SHORT_VIDEO",
    "STORY",
    "TEXT_ONLY",
    "ARTICLE",
    "LIVE",
  ]),
  caption: z.string().min(1, "Caption is required"),
  captionAr: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  mentions: z.array(z.string()).optional(),
  linkUrl: z.string().url().optional().nullable(),
  linkText: z.string().optional(),
  locationName: z.string().optional(),
  scheduledFor: z.string().datetime().optional().nullable(),
  briefId: z.string().optional().nullable(),
  deliverableId: z.string().optional().nullable(),
  socialAccountId: z.string().optional().nullable(),
});

// ============================================
// AUTHENTICATION HELPER
// ============================================

async function authenticateRequest(
  req: NextRequest
): Promise<{ organizationId: string; userId: string } | null> {
  // Try API key first
  const apiKey = req.headers.get("X-API-Key");
  if (apiKey) {
    const key = await db.apiKey.findFirst({
      where: {
        key: apiKey,
        isActive: true,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
      },
      include: {
        organization: { select: { id: true } },
        createdBy: { select: { id: true } },
      },
    });

    if (key) {
      // Update last used
      await db.apiKey.update({
        where: { id: key.id },
        data: { lastUsedAt: new Date() },
      });

      return {
        organizationId: key.organizationId,
        userId: key.createdById,
      };
    }
  }

  // Fall back to session auth
  const session = await getServerSession(authOptions);
  if (session?.user) {
    return {
      organizationId: session.user.organizationId,
      userId: session.user.id,
    };
  }

  return null;
}

// ============================================
// ERROR RESPONSE HELPER
// ============================================

function errorResponse(
  message: string,
  status: number,
  details?: Record<string, unknown>
) {
  return NextResponse.json(
    {
      success: false,
      error: {
        message,
        ...details,
      },
    },
    { status }
  );
}

// ============================================
// GET /api/content - List posts
// ============================================

export async function GET(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return errorResponse("Unauthorized", 401);
    }

    // Parse query params
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());

    const parsed = listPostsSchema.safeParse(params);
    if (!parsed.success) {
      return errorResponse("Invalid parameters", 400, {
        validation: parsed.error.flatten().fieldErrors,
      });
    }

    const {
      clientId,
      status,
      platforms,
      scheduledFrom,
      scheduledTo,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    } = parsed.data;

    // Build where clause
    const where: Parameters<typeof db.contentPost.findMany>[0]["where"] = {
      organizationId: auth.organizationId,
    };

    if (clientId) where.clientId = clientId;
    if (status) where.status = status;
    if (platforms) {
      const platformList = platforms.split(",") as Array<
        (typeof parsed.data.platforms extends string ? never : never)
      >;
      where.platforms = { hasSome: platformList };
    }
    if (scheduledFrom || scheduledTo) {
      where.scheduledFor = {};
      if (scheduledFrom) where.scheduledFor.gte = new Date(scheduledFrom);
      if (scheduledTo) where.scheduledFor.lte = new Date(scheduledTo);
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { caption: { contains: search, mode: "insensitive" } },
      ];
    }

    // Get total count for pagination
    const total = await db.contentPost.count({ where });

    // Get posts
    const posts = await db.contentPost.findMany({
      where,
      include: {
        client: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        assets: {
          orderBy: { sortOrder: "asc" },
          take: 1,
          select: {
            id: true,
            type: true,
            fileUrl: true,
            thumbnailUrl: true,
          },
        },
        _count: {
          select: {
            contentComments: true,
            approvals: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    });

    return NextResponse.json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error) {
    console.error("GET /api/content error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// ============================================
// POST /api/content - Create post
// ============================================

export async function POST(req: NextRequest) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth) {
      return errorResponse("Unauthorized", 401);
    }

    const body = await req.json();
    const parsed = createPostSchema.safeParse(body);

    if (!parsed.success) {
      return errorResponse("Invalid request body", 400, {
        validation: parsed.error.flatten().fieldErrors,
      });
    }

    const data = parsed.data;

    // Verify client belongs to organization
    const client = await db.client.findFirst({
      where: {
        id: data.clientId,
        organizationId: auth.organizationId,
      },
    });

    if (!client) {
      return errorResponse("Client not found", 404);
    }

    // Create post
    const post = await db.contentPost.create({
      data: {
        organizationId: auth.organizationId,
        clientId: data.clientId,
        title: data.title,
        platforms: data.platforms,
        contentType: data.contentType,
        caption: data.caption,
        captionAr: data.captionAr,
        hashtags: data.hashtags || [],
        mentions: data.mentions || [],
        linkUrl: data.linkUrl,
        linkText: data.linkText,
        locationName: data.locationName,
        scheduledFor: data.scheduledFor ? new Date(data.scheduledFor) : null,
        briefId: data.briefId,
        deliverableId: data.deliverableId,
        socialAccountId: data.socialAccountId,
        createdById: auth.userId,
        status: "DRAFT",
      },
      include: {
        client: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Create initial version
    await db.contentVersion.create({
      data: {
        postId: post.id,
        versionNumber: 1,
        caption: data.caption,
        captionAr: data.captionAr,
        hashtags: data.hashtags || [],
        platforms: data.platforms,
        createdById: auth.userId,
        changeNotes: "Initial version",
      },
    });

    // Emit webhook
    await emitPostCreated({
      id: post.id,
      organizationId: post.organizationId,
      clientId: post.clientId,
      title: post.title,
      platforms: post.platforms,
      status: post.status,
      createdById: post.createdById,
    });

    return NextResponse.json(
      {
        success: true,
        data: post,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/content error:", error);
    return errorResponse("Internal server error", 500);
  }
}
