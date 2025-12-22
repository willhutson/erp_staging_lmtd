"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type {
  SocialPlatform,
  ContentType,
  ContentPostStatus,
} from "@prisma/client";

// ============================================
// TYPES
// ============================================

// Inferred types from Prisma
type ContentPostWithRelations = Awaited<
  ReturnType<typeof db.contentPost.findFirst>
> & {
  client: { id: string; name: string; code: string };
  createdBy: { id: string; name: string };
  assignedTo?: { id: string; name: string } | null;
  assets: Array<{
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    thumbnailUrl: string | null;
    sortOrder: number;
  }>;
};

export interface CreateContentPostInput {
  organizationId: string;
  clientId: string;
  title: string;
  platforms: SocialPlatform[];
  contentType: ContentType;
  caption: string;
  captionAr?: string;
  hashtags?: string[];
  mentions?: string[];
  linkUrl?: string;
  linkText?: string;
  locationName?: string;
  scheduledFor?: Date;
  briefId?: string;
  deliverableId?: string;
  socialAccountId?: string;
  createdById: string;
  assignedToId?: string;
}

export interface UpdateContentPostInput {
  title?: string;
  platforms?: SocialPlatform[];
  contentType?: ContentType;
  caption?: string;
  captionAr?: string;
  hashtags?: string[];
  mentions?: string[];
  linkUrl?: string;
  linkText?: string;
  locationName?: string;
  scheduledFor?: Date | null;
  status?: ContentPostStatus;
  assignedToId?: string | null;
  socialAccountId?: string | null;
}

export interface ContentPostFilters {
  organizationId: string;
  clientId?: string;
  status?: ContentPostStatus | ContentPostStatus[];
  platforms?: SocialPlatform[];
  createdById?: string;
  assignedToId?: string;
  scheduledFrom?: Date;
  scheduledTo?: Date;
  search?: string;
}

// ============================================
// CONTENT POST CRUD
// ============================================

export async function createContentPost(input: CreateContentPostInput) {
  const post = await db.contentPost.create({
    data: {
      organizationId: input.organizationId,
      clientId: input.clientId,
      title: input.title,
      platforms: input.platforms,
      contentType: input.contentType,
      caption: input.caption,
      captionAr: input.captionAr,
      hashtags: input.hashtags || [],
      mentions: input.mentions || [],
      linkUrl: input.linkUrl,
      linkText: input.linkText,
      locationName: input.locationName,
      scheduledFor: input.scheduledFor,
      briefId: input.briefId,
      deliverableId: input.deliverableId,
      socialAccountId: input.socialAccountId,
      createdById: input.createdById,
      assignedToId: input.assignedToId,
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
      caption: input.caption,
      captionAr: input.captionAr,
      hashtags: input.hashtags || [],
      platforms: input.platforms,
      createdById: input.createdById,
      changeNotes: "Initial version",
    },
  });

  revalidatePath("/content-engine");
  return post;
}

export async function getContentPost(postId: string) {
  return db.contentPost.findUnique({
    where: { id: postId },
    include: {
      client: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
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
        take: 5,
        include: {
          createdBy: { select: { id: true, name: true } },
        },
      },
      approvals: {
        orderBy: { createdAt: "desc" },
        include: {
          requestedBy: { select: { id: true, name: true } },
          clientContact: { select: { id: true, name: true } },
        },
      },
      contentComments: {
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { id: true, name: true } },
          clientContact: { select: { id: true, name: true } },
        },
      },
    },
  });
}

export async function getContentPosts(filters: ContentPostFilters) {
  const where: Parameters<typeof db.contentPost.findMany>[0]["where"] = {
    organizationId: filters.organizationId,
  };

  if (filters.clientId) {
    where.clientId = filters.clientId;
  }

  if (filters.status) {
    where.status = Array.isArray(filters.status)
      ? { in: filters.status }
      : filters.status;
  }

  if (filters.platforms && filters.platforms.length > 0) {
    where.platforms = { hasSome: filters.platforms };
  }

  if (filters.createdById) {
    where.createdById = filters.createdById;
  }

  if (filters.assignedToId) {
    where.assignedToId = filters.assignedToId;
  }

  if (filters.scheduledFrom || filters.scheduledTo) {
    where.scheduledFor = {};
    if (filters.scheduledFrom) {
      where.scheduledFor.gte = filters.scheduledFrom;
    }
    if (filters.scheduledTo) {
      where.scheduledFor.lte = filters.scheduledTo;
    }
  }

  if (filters.search) {
    where.OR = [
      { title: { contains: filters.search, mode: "insensitive" } },
      { caption: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return db.contentPost.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, name: true } },
      assignedTo: { select: { id: true, name: true } },
      assets: {
        orderBy: { sortOrder: "asc" },
        take: 1,
      },
      _count: {
        select: {
          contentComments: true,
          approvals: true,
        },
      },
    },
    orderBy: [{ scheduledFor: "asc" }, { createdAt: "desc" }],
  });
}

export async function updateContentPost(
  postId: string,
  input: UpdateContentPostInput,
  userId: string
) {
  const current = await db.contentPost.findUnique({
    where: { id: postId },
    select: {
      caption: true,
      captionAr: true,
      hashtags: true,
      platforms: true,
      currentVersion: true,
    },
  });

  if (!current) {
    throw new Error("Post not found");
  }

  // Check if content changed (needs new version)
  const contentChanged =
    (input.caption !== undefined && input.caption !== current.caption) ||
    (input.captionAr !== undefined && input.captionAr !== current.captionAr) ||
    (input.hashtags !== undefined &&
      JSON.stringify(input.hashtags) !== JSON.stringify(current.hashtags)) ||
    (input.platforms !== undefined &&
      JSON.stringify(input.platforms) !== JSON.stringify(current.platforms));

  const newVersion = contentChanged ? current.currentVersion + 1 : undefined;

  const post = await db.contentPost.update({
    where: { id: postId },
    data: {
      ...input,
      currentVersion: newVersion,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, name: true } },
    },
  });

  // Create new version if content changed
  if (contentChanged && newVersion) {
    await db.contentVersion.create({
      data: {
        postId,
        versionNumber: newVersion,
        caption: input.caption ?? current.caption,
        captionAr: input.captionAr ?? current.captionAr,
        hashtags: input.hashtags ?? current.hashtags,
        platforms: input.platforms ?? current.platforms,
        createdById: userId,
        changeNotes: `Version ${newVersion}`,
      },
    });
  }

  revalidatePath("/content-engine");
  revalidatePath(`/content-engine/posts/${postId}`);
  return post;
}

export async function deleteContentPost(postId: string) {
  await db.contentPost.delete({
    where: { id: postId },
  });

  revalidatePath("/content-engine");
}

// ============================================
// STATUS TRANSITIONS
// ============================================

export async function submitForInternalReview(postId: string, userId: string) {
  const post = await db.contentPost.update({
    where: { id: postId },
    data: { status: "INTERNAL_REVIEW" },
  });

  // Create approval record
  await db.contentApproval.create({
    data: {
      postId,
      approvalType: "INTERNAL",
      requestedById: userId,
      status: "PENDING",
    },
  });

  revalidatePath("/content-engine");
  return post;
}

export async function submitForClientReview(
  postId: string,
  userId: string,
  clientContactId?: string
) {
  const post = await db.contentPost.update({
    where: { id: postId },
    data: { status: "CLIENT_REVIEW" },
  });

  // Create approval record
  await db.contentApproval.create({
    data: {
      postId,
      approvalType: "CLIENT",
      requestedById: userId,
      clientContactId,
      status: "PENDING",
    },
  });

  revalidatePath("/content-engine");
  return post;
}

export async function approvePost(postId: string) {
  const post = await db.contentPost.update({
    where: { id: postId },
    data: { status: "APPROVED" },
  });

  // Update latest pending approval
  await db.contentApproval.updateMany({
    where: {
      postId,
      status: "PENDING",
    },
    data: {
      status: "APPROVED",
      respondedAt: new Date(),
    },
  });

  revalidatePath("/content-engine");
  return post;
}

export async function requestRevisions(
  postId: string,
  feedback: string,
  userId?: string,
  clientContactId?: string
) {
  const post = await db.contentPost.update({
    where: { id: postId },
    data: { status: "REVISION_REQUESTED" },
  });

  // Update latest pending approval
  await db.contentApproval.updateMany({
    where: {
      postId,
      status: "PENDING",
    },
    data: {
      status: "REVISION_REQUESTED",
      respondedAt: new Date(),
      responseNotes: feedback,
    },
  });

  // Add comment with feedback
  await db.contentComment.create({
    data: {
      postId,
      userId,
      clientContactId,
      content: feedback,
      source: clientContactId ? "PORTAL" : "INTERNAL",
    },
  });

  revalidatePath("/content-engine");
  return post;
}

export async function schedulePost(postId: string, scheduledFor: Date) {
  const post = await db.contentPost.update({
    where: { id: postId },
    data: {
      status: "SCHEDULED",
      scheduledFor,
    },
  });

  revalidatePath("/content-engine");
  return post;
}

export async function publishPost(postId: string) {
  // This would integrate with social APIs in the future
  const post = await db.contentPost.update({
    where: { id: postId },
    data: {
      status: "PUBLISHED",
      publishedAt: new Date(),
    },
  });

  revalidatePath("/content-engine");
  return post;
}

export async function archivePost(postId: string) {
  const post = await db.contentPost.update({
    where: { id: postId },
    data: { status: "ARCHIVED" },
  });

  revalidatePath("/content-engine");
  return post;
}

// ============================================
// ASSETS
// ============================================

export async function addContentAsset(
  postId: string,
  asset: {
    type: "IMAGE" | "VIDEO" | "GIF" | "DOCUMENT";
    fileName: string;
    fileUrl: string;
    thumbnailUrl?: string;
    fileSize?: number;
    mimeType?: string;
    width?: number;
    height?: number;
    duration?: number;
    aspectRatio?: string;
    altText?: string;
    sortOrder?: number;
  }
) {
  // Get current max sort order
  const maxSort = await db.contentAsset.aggregate({
    where: { postId },
    _max: { sortOrder: true },
  });

  const result = await db.contentAsset.create({
    data: {
      postId,
      type: asset.type,
      fileName: asset.fileName,
      fileUrl: asset.fileUrl,
      thumbnailUrl: asset.thumbnailUrl,
      fileSize: asset.fileSize,
      mimeType: asset.mimeType,
      width: asset.width,
      height: asset.height,
      duration: asset.duration,
      aspectRatio: asset.aspectRatio,
      altText: asset.altText,
      sortOrder: asset.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1,
    },
  });

  revalidatePath(`/content-engine/posts/${postId}`);
  return result;
}

export async function removeContentAsset(assetId: string) {
  const asset = await db.contentAsset.delete({
    where: { id: assetId },
    select: { postId: true },
  });

  revalidatePath(`/content-engine/posts/${asset.postId}`);
}

export async function reorderAssets(
  postId: string,
  assetIds: string[]
) {
  // Update sort order based on array position
  await Promise.all(
    assetIds.map((id, index) =>
      db.contentAsset.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidatePath(`/content-engine/posts/${postId}`);
}

// ============================================
// COMMENTS
// ============================================

export async function addComment(
  postId: string,
  content: string,
  userId?: string,
  clientContactId?: string,
  parentId?: string
) {
  const comment = await db.contentComment.create({
    data: {
      postId,
      content,
      userId,
      clientContactId,
      parentId,
      source: clientContactId ? "PORTAL" : "INTERNAL",
    },
    include: {
      user: { select: { id: true, name: true } },
      clientContact: { select: { id: true, name: true } },
    },
  });

  revalidatePath(`/content-engine/posts/${postId}`);
  return comment;
}

export async function resolveComment(commentId: string, userId: string) {
  const comment = await db.contentComment.update({
    where: { id: commentId },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
      resolvedById: userId,
    },
  });

  return comment;
}

// ============================================
// CALENDAR VIEW HELPERS
// ============================================

export async function getCalendarPosts(
  organizationId: string,
  startDate: Date,
  endDate: Date,
  clientId?: string
) {
  const where: Parameters<typeof db.contentPost.findMany>[0]["where"] = {
    organizationId,
    scheduledFor: {
      gte: startDate,
      lte: endDate,
    },
    status: {
      in: ["SCHEDULED", "APPROVED", "PUBLISHED"],
    },
  };

  if (clientId) {
    where.clientId = clientId;
  }

  return db.contentPost.findMany({
    where,
    select: {
      id: true,
      title: true,
      platforms: true,
      contentType: true,
      status: true,
      scheduledFor: true,
      publishedAt: true,
      client: { select: { id: true, name: true, code: true } },
      assets: {
        orderBy: { sortOrder: "asc" },
        take: 1,
        select: {
          id: true,
          type: true,
          thumbnailUrl: true,
          fileUrl: true,
        },
      },
    },
    orderBy: { scheduledFor: "asc" },
  });
}

export async function getPostStats(organizationId: string, clientId?: string) {
  const where: { organizationId: string; clientId?: string } = {
    organizationId,
  };

  if (clientId) {
    where.clientId = clientId;
  }

  const [
    total,
    draft,
    inReview,
    approved,
    scheduled,
    published,
  ] = await Promise.all([
    db.contentPost.count({ where }),
    db.contentPost.count({ where: { ...where, status: "DRAFT" } }),
    db.contentPost.count({
      where: {
        ...where,
        status: { in: ["INTERNAL_REVIEW", "CLIENT_REVIEW"] },
      },
    }),
    db.contentPost.count({ where: { ...where, status: "APPROVED" } }),
    db.contentPost.count({ where: { ...where, status: "SCHEDULED" } }),
    db.contentPost.count({ where: { ...where, status: "PUBLISHED" } }),
  ]);

  return {
    total,
    draft,
    inReview,
    approved,
    scheduled,
    published,
  };
}

// ============================================
// PLATFORM SPECS (Reference data)
// ============================================

export async function getPlatformSpecs() {
  return db.platformSpec.findMany({
    orderBy: { displayName: "asc" },
  });
}

export async function getPlatformSpec(platform: SocialPlatform) {
  return db.platformSpec.findUnique({
    where: { platform },
  });
}
