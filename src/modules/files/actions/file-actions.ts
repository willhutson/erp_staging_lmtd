"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { fileService, generateStorageKey } from "@/lib/storage/storage-service";
import { revalidatePath } from "next/cache";
import type { FileCategory } from "@prisma/client";

/**
 * Get presigned upload URL
 */
export async function getUploadUrl(data: {
  filename: string;
  mimeType: string;
  size: number;
  category?: FileCategory;
  folderId?: string;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate file size (100MB max)
  const MAX_SIZE = 100 * 1024 * 1024;
  if (data.size > MAX_SIZE) {
    return { success: false, error: "File too large. Maximum size is 100MB." };
  }

  // Validate mime type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "video/mp4",
    "video/quicktime",
    "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain",
    "text/csv",
    "application/json",
    "application/zip",
  ];

  if (!allowedTypes.includes(data.mimeType)) {
    return { success: false, error: "File type not allowed." };
  }

  const storageKey = generateStorageKey(
    session.user.organizationId,
    data.category || "OTHER",
    data.filename
  );

  // For now, return direct upload endpoint
  // In production, this would return a presigned URL for R2/S3
  return {
    success: true,
    uploadUrl: "/api/files/upload",
    storageKey,
    fields: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      filename: data.filename,
      mimeType: data.mimeType,
      size: data.size,
      category: data.category || "OTHER",
      folderId: data.folderId,
      storageKey,
    },
  };
}

/**
 * Create file record after upload
 */
export async function createFileRecord(data: {
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  storageKey: string;
  category?: FileCategory;
  tags?: string[];
  folderId?: string;
  cdnUrl?: string;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const file = await fileService.createFile({
      organizationId: session.user.organizationId,
      name: data.name,
      originalName: data.originalName,
      mimeType: data.mimeType,
      size: data.size,
      storageKey: data.storageKey,
      category: data.category,
      tags: data.tags,
      folderId: data.folderId,
      uploadedById: session.user.id,
      cdnUrl: data.cdnUrl,
    });

    revalidatePath("/files");
    return { success: true, file };
  } catch (error) {
    console.error("Failed to create file record:", error);
    return { success: false, error: "Failed to save file" };
  }
}

/**
 * Get files with filtering
 */
export async function getFiles(options?: {
  category?: FileCategory;
  folderId?: string | null;
  search?: string;
  tags?: string[];
  limit?: number;
  offset?: number;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { files: [], total: 0 };
  }

  return fileService.listFiles({
    organizationId: session.user.organizationId,
    ...options,
  });
}

/**
 * Get single file
 */
export async function getFile(fileId: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return null;
  }

  return fileService.getFile(fileId, session.user.organizationId);
}

/**
 * Update file metadata
 */
export async function updateFile(
  fileId: string,
  data: {
    name?: string;
    category?: FileCategory;
    tags?: string[];
    folderId?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const file = await fileService.updateFile(
      fileId,
      session.user.organizationId,
      data
    );

    if (!file) {
      return { success: false, error: "File not found" };
    }

    revalidatePath("/files");
    return { success: true, file };
  } catch (error) {
    console.error("Failed to update file:", error);
    return { success: false, error: "Failed to update file" };
  }
}

/**
 * Archive (soft delete) file
 */
export async function archiveFile(fileId: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const success = await fileService.archiveFile(
      fileId,
      session.user.organizationId,
      session.user.id
    );

    if (!success) {
      return { success: false, error: "File not found" };
    }

    revalidatePath("/files");
    return { success: true };
  } catch (error) {
    console.error("Failed to archive file:", error);
    return { success: false, error: "Failed to delete file" };
  }
}

/**
 * Create folder
 */
export async function createFolder(data: {
  name: string;
  parentId?: string;
  isPublic?: boolean;
}) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const folder = await fileService.createFolder({
      organizationId: session.user.organizationId,
      name: data.name,
      parentId: data.parentId,
      createdById: session.user.id,
      isPublic: data.isPublic,
    });

    revalidatePath("/files");
    return { success: true, folder };
  } catch (error) {
    console.error("Failed to create folder:", error);
    return { success: false, error: "Failed to create folder" };
  }
}

/**
 * Get folders
 */
export async function getFolders(parentId?: string | null) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  return fileService.listFolders({
    organizationId: session.user.organizationId,
    parentId,
  });
}

/**
 * Get folder with contents
 */
export async function getFolder(folderId: string) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return null;
  }

  return fileService.getFolder(folderId, session.user.organizationId);
}

/**
 * Attach file to brief
 */
export async function attachFileToBrief(data: {
  briefId: string;
  fileId: string;
  role?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await fileService.attachToBrief({
      briefId: data.briefId,
      fileId: data.fileId,
      role: data.role,
      addedById: session.user.id,
    });

    revalidatePath(`/briefs/${data.briefId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to attach file:", error);
    return { success: false, error: "Failed to attach file" };
  }
}

/**
 * Detach file from brief
 */
export async function detachFileFromBrief(briefId: string, fileId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await fileService.detachFromBrief(briefId, fileId);
    revalidatePath(`/briefs/${briefId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to detach file:", error);
    return { success: false, error: "Failed to remove file" };
  }
}

/**
 * Get files attached to a brief
 */
export async function getBriefFiles(briefId: string) {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  return fileService.getBriefFiles(briefId);
}

/**
 * Attach file to client
 */
export async function attachFileToClient(data: {
  clientId: string;
  fileId: string;
  role?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await fileService.attachToClient({
      clientId: data.clientId,
      fileId: data.fileId,
      role: data.role,
      addedById: session.user.id,
    });

    revalidatePath(`/clients/${data.clientId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to attach file:", error);
    return { success: false, error: "Failed to attach file" };
  }
}

/**
 * Get files attached to a client
 */
export async function getClientFiles(clientId: string) {
  const session = await auth();
  if (!session?.user) {
    return [];
  }

  return fileService.getClientFiles(clientId);
}
