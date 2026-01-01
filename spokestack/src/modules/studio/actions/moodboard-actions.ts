"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type {
  CreateMoodboardInput,
  MoodboardWithRelations,
  MoodboardFilters,
  AddMoodboardItemInput,
} from "../types";
// Generate a random token for sharing
function generateShareToken(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Create a new moodboard
 */
export async function createMoodboard(
  input: CreateMoodboardInput
): Promise<MoodboardWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const moodboard = await db.moodboard.create({
    data: {
      organizationId: session.user.organizationId,
      title: input.title,
      description: input.description,
      type: input.type,
      clientId: input.clientId,
      projectId: input.projectId,
      briefId: input.briefId,
      createdById: session.user.id,
      shareToken: generateShareToken(12), // Generate unique share token
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      items: true,
      _count: {
        select: {
          items: true,
          conversations: true,
          outputs: true,
        },
      },
    },
  });

  return moodboard as MoodboardWithRelations;
}

/**
 * Get a moodboard by ID
 */
export async function getMoodboard(
  moodboardId: string
): Promise<MoodboardWithRelations | null> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const moodboard = await db.moodboard.findFirst({
    where: {
      id: moodboardId,
      organizationId: session.user.organizationId,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      items: { orderBy: { createdAt: "asc" } },
      _count: {
        select: {
          items: true,
          conversations: true,
          outputs: true,
        },
      },
    },
  });

  return moodboard as MoodboardWithRelations | null;
}

/**
 * Get moodboard by share token (public access)
 */
export async function getMoodboardByShareToken(
  shareToken: string
): Promise<MoodboardWithRelations | null> {
  const moodboard = await db.moodboard.findFirst({
    where: {
      shareToken,
      isPublic: true,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      items: { orderBy: { createdAt: "asc" } },
      _count: {
        select: {
          items: true,
          conversations: true,
          outputs: true,
        },
      },
    },
  });

  return moodboard as MoodboardWithRelations | null;
}

/**
 * List moodboards with filters
 */
export async function listMoodboards(
  filters: MoodboardFilters = {}
): Promise<MoodboardWithRelations[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const moodboards = await db.moodboard.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters.clientId && { clientId: filters.clientId }),
      ...(filters.projectId && { projectId: filters.projectId }),
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        title: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      items: { take: 4, orderBy: { createdAt: "desc" } }, // Preview items
      _count: {
        select: {
          items: true,
          conversations: true,
          outputs: true,
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return moodboards as MoodboardWithRelations[];
}

/**
 * Add item to moodboard
 */
export async function addMoodboardItem(
  input: AddMoodboardItemInput
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify access
  const moodboard = await db.moodboard.findFirst({
    where: {
      id: input.moodboardId,
      organizationId: session.user.organizationId,
    },
  });

  if (!moodboard) throw new Error("Moodboard not found");

  await db.moodboardItem.create({
    data: {
      moodboardId: input.moodboardId,
      type: input.type,
      fileUrl: input.fileUrl,
      sourceUrl: input.sourceUrl,
      title: input.title,
      description: input.description,
      color: input.color,
      text: input.text,
      positionX: input.positionX,
      positionY: input.positionY,
      width: input.width,
      height: input.height,
      processingStatus: "PENDING",
    },
  });

  // Mark moodboard as needing re-indexing
  await db.moodboard.update({
    where: { id: input.moodboardId },
    data: { indexStatus: "PENDING" },
  });

  // TODO: Trigger async processing job for:
  // - Image: color extraction, OCR, AI description
  // - PDF: text extraction
  // - Video: keyframe extraction
  // - Link: page fetch, screenshot
}

/**
 * Update moodboard item position (drag and drop)
 */
export async function updateItemPosition(
  itemId: string,
  position: {
    positionX: number;
    positionY: number;
    width?: number;
    height?: number;
    rotation?: number;
    zIndex?: number;
  }
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify access through moodboard
  const item = await db.moodboardItem.findUnique({
    where: { id: itemId },
    include: { moodboard: true },
  });

  if (!item || item.moodboard.organizationId !== session.user.organizationId) {
    throw new Error("Item not found");
  }

  await db.moodboardItem.update({
    where: { id: itemId },
    data: position,
  });
}

/**
 * Delete moodboard item
 */
export async function deleteMoodboardItem(itemId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const item = await db.moodboardItem.findUnique({
    where: { id: itemId },
    include: { moodboard: true },
  });

  if (!item || item.moodboard.organizationId !== session.user.organizationId) {
    throw new Error("Item not found");
  }

  await db.moodboardItem.delete({ where: { id: itemId } });

  // Mark moodboard as needing re-indexing
  await db.moodboard.update({
    where: { id: item.moodboardId },
    data: { indexStatus: "PENDING" },
  });
}

/**
 * Toggle moodboard public sharing
 */
export async function toggleMoodboardSharing(
  moodboardId: string,
  isPublic: boolean
): Promise<{ shareUrl: string | null }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const moodboard = await db.moodboard.update({
    where: {
      id: moodboardId,
      organizationId: session.user.organizationId,
    },
    data: { isPublic },
  });

  return {
    shareUrl: isPublic ? `/share/moodboard/${moodboard.shareToken}` : null,
  };
}

/**
 * Index moodboard for AI context (placeholder)
 */
export async function indexMoodboard(moodboardId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // TODO: Implement moodboard indexing
  // 1. Get all items
  // 2. For each item, ensure processing is complete
  // 3. Combine all extracted text, descriptions, colors
  // 4. Generate context summary using AI
  // 5. Generate embeddings for semantic search
  // 6. Update moodboard with contextSummary and contextEmbedding

  await db.moodboard.update({
    where: { id: moodboardId },
    data: {
      indexStatus: "INDEXED",
      lastIndexedAt: new Date(),
    },
  });
}

/**
 * Generate content from moodboard (placeholder)
 */
export async function generateFromMoodboard(
  moodboardId: string,
  options: {
    skillId: string;
    prompt: string;
    outputType: string;
  }
): Promise<{ outputId: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // TODO: Implement AI generation with moodboard context
  // 1. Get moodboard context summary
  // 2. Get client context if linked
  // 3. Call AI skill with context + prompt
  // 4. Save output

  const output = await db.moodboardOutput.create({
    data: {
      moodboardId,
      type: options.outputType as "CUSTOM",
      title: "Generated Content",
      content: {},
      prompt: options.prompt,
      createdById: session.user.id,
    },
  });

  return { outputId: output.id };
}
