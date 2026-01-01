"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type {
  CreateVideoProjectInput,
  VideoProjectWithRelations,
  VideoProjectFilters,
} from "../types";
import type { ScriptStatus } from "@prisma/client";

/**
 * Create a new video project
 */
export async function createVideoProject(
  input: CreateVideoProjectInput
): Promise<VideoProjectWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const project = await db.videoProject.create({
    data: {
      organizationId: session.user.organizationId,
      title: input.title,
      description: input.description,
      type: input.type,
      clientId: input.clientId,
      projectId: input.projectId,
      briefId: input.briefId,
      directorId: input.directorId,
      duration: input.duration,
      aspectRatio: input.aspectRatio,
      platform: input.platform,
      shootDate: input.shootDate,
      dueDate: input.dueDate,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      director: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      script: true,
      storyboard: { include: { frames: true } },
      shotList: true,
    },
  });

  return project as VideoProjectWithRelations;
}

/**
 * Get a video project by ID
 */
export async function getVideoProject(
  projectId: string
): Promise<VideoProjectWithRelations | null> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const project = await db.videoProject.findFirst({
    where: {
      id: projectId,
      organizationId: session.user.organizationId,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      director: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      script: true,
      storyboard: {
        include: {
          frames: { orderBy: { orderIndex: "asc" } },
        },
      },
      shotList: { orderBy: { orderIndex: "asc" } },
    },
  });

  return project as VideoProjectWithRelations | null;
}

/**
 * List video projects with filters
 */
export async function listVideoProjects(
  filters: VideoProjectFilters = {}
): Promise<VideoProjectWithRelations[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const projects = await db.videoProject.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters.clientId && { clientId: filters.clientId }),
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        title: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      director: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      script: true,
      storyboard: { include: { frames: true } },
      shotList: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return projects as VideoProjectWithRelations[];
}

/**
 * Create or update video script
 */
export async function saveVideoScript(
  videoProjectId: string,
  content: unknown,
  contentText?: string
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify access to project
  const project = await db.videoProject.findFirst({
    where: {
      id: videoProjectId,
      organizationId: session.user.organizationId,
    },
  });

  if (!project) throw new Error("Video project not found");

  // Calculate word count
  const wordCount = contentText
    ? contentText.split(/\s+/).filter(Boolean).length
    : 0;

  // Estimate duration (roughly 150 words per minute)
  const estimatedDuration = Math.ceil((wordCount / 150) * 60);

  await db.videoScript.upsert({
    where: { videoProjectId },
    create: {
      videoProjectId,
      content: content as object,
      contentText,
      wordCount,
      estimatedDuration,
    },
    update: {
      content: content as object,
      contentText,
      wordCount,
      estimatedDuration,
      version: { increment: 1 },
    },
  });
}

/**
 * Update script status
 */
export async function updateScriptStatus(
  videoProjectId: string,
  status: ScriptStatus
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.videoScript.update({
    where: { videoProjectId },
    data: { status },
  });
}

/**
 * Add storyboard frame
 */
export async function addStoryboardFrame(
  videoProjectId: string,
  frame: {
    description?: string;
    dialogue?: string;
    action?: string;
    duration?: number;
    shotType?: string;
    cameraMovement?: string;
    notes?: string;
  }
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Ensure storyboard exists
  let storyboard = await db.storyboard.findUnique({
    where: { videoProjectId },
  });

  if (!storyboard) {
    storyboard = await db.storyboard.create({
      data: { videoProjectId },
    });
  }

  // Get next order index
  const lastFrame = await db.storyboardFrame.findFirst({
    where: { storyboardId: storyboard.id },
    orderBy: { orderIndex: "desc" },
  });

  await db.storyboardFrame.create({
    data: {
      storyboardId: storyboard.id,
      orderIndex: (lastFrame?.orderIndex ?? -1) + 1,
      ...frame,
    },
  });
}

/**
 * Add shot list item
 */
export async function addShotListItem(
  videoProjectId: string,
  shot: {
    shotNumber: string;
    description: string;
    shotType?: string;
    location?: string;
    talent?: string;
    equipment?: string;
    duration?: number;
    notes?: string;
  }
): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Get next order index
  const lastShot = await db.shotListItem.findFirst({
    where: { videoProjectId },
    orderBy: { orderIndex: "desc" },
  });

  await db.shotListItem.create({
    data: {
      videoProjectId,
      orderIndex: (lastShot?.orderIndex ?? -1) + 1,
      ...shot,
    },
  });
}
