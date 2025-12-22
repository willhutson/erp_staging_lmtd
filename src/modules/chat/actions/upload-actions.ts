"use server";

/**
 * Chat Module - File Upload Actions
 *
 * Handles file uploads for chat messages.
 * Uses a configurable storage provider (local dev, S3/Cloudflare R2 for production).
 *
 * @module chat/actions/upload-actions
 */

import { db } from "@/lib/db";
import crypto from "crypto";
import path from "path";
import fs from "fs/promises";

// ============================================
// TYPES
// ============================================

export interface UploadResult {
  success: boolean;
  fileUrl?: string;
  thumbnailUrl?: string;
  error?: string;
}

export interface CreateAttachmentInput {
  messageId: string;
  uploadedById: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  fileUrl: string;
  thumbnailUrl?: string;
  width?: number;
  height?: number;
}

// ============================================
// CONFIGURATION
// ============================================

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads/chat";
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  // Images
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  // Videos
  "video/mp4",
  "video/webm",
  "video/quicktime",
  // Documents
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  // Text
  "text/plain",
  "text/csv",
];

// ============================================
// HELPERS
// ============================================

function generateUniqueFileName(originalName: string): string {
  const ext = path.extname(originalName);
  const baseName = path.basename(originalName, ext);
  const hash = crypto.randomBytes(8).toString("hex");
  const timestamp = Date.now();
  return `${baseName}-${timestamp}-${hash}${ext}`.replace(/[^a-zA-Z0-9.-]/g, "_");
}

async function ensureUploadDir(): Promise<void> {
  try {
    await fs.access(UPLOAD_DIR);
  } catch {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
  }
}

function getPublicUrl(fileName: string): string {
  // In production, this would return CDN/S3 URL
  // For local dev, return relative path
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "";
  return `${baseUrl}/api/uploads/chat/${fileName}`;
}

// ============================================
// UPLOAD FUNCTIONS
// ============================================

/**
 * Upload a file for chat attachment
 *
 * Note: In production, this should use a proper file storage service
 * like AWS S3, Cloudflare R2, or similar. This local implementation
 * is for development only.
 */
export async function uploadChatFile(
  formData: FormData
): Promise<UploadResult> {
  try {
    const file = formData.get("file") as File;

    if (!file) {
      return { success: false, error: "No file provided" };
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return {
        success: false,
        error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return {
        success: false,
        error: "File type not allowed",
      };
    }

    // Generate unique filename
    const fileName = generateUniqueFileName(file.name);

    // For local development, save to filesystem
    // TODO: Replace with S3/R2 for production
    if (process.env.NODE_ENV === "development" || !process.env.S3_BUCKET) {
      await ensureUploadDir();

      const buffer = Buffer.from(await file.arrayBuffer());
      const filePath = path.join(UPLOAD_DIR, fileName);
      await fs.writeFile(filePath, buffer);

      return {
        success: true,
        fileUrl: getPublicUrl(fileName),
      };
    }

    // Production: Upload to S3/R2
    // TODO: Implement cloud storage upload
    return {
      success: false,
      error: "Cloud storage not configured",
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: "Failed to upload file",
    };
  }
}

/**
 * Generate a pre-signed upload URL for direct browser uploads
 * (More efficient for large files)
 */
export async function getUploadUrl(
  fileName: string,
  fileType: string,
  fileSize: number
): Promise<{
  success: boolean;
  uploadUrl?: string;
  fileUrl?: string;
  error?: string;
}> {
  // Validate
  if (fileSize > MAX_FILE_SIZE) {
    return {
      success: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    };
  }

  if (!ALLOWED_TYPES.includes(fileType)) {
    return {
      success: false,
      error: "File type not allowed",
    };
  }

  const uniqueFileName = generateUniqueFileName(fileName);

  // TODO: Generate S3 pre-signed URL for production
  // For now, return the regular upload endpoint
  return {
    success: true,
    uploadUrl: `/api/chat/upload`,
    fileUrl: getPublicUrl(uniqueFileName),
  };
}

/**
 * Create attachment record in database
 */
export async function createAttachment(
  input: CreateAttachmentInput
): Promise<{ success: boolean; attachment?: { id: string }; error?: string }> {
  try {
    const attachment = await db.messageAttachment.create({
      data: {
        messageId: input.messageId,
        uploadedById: input.uploadedById,
        fileName: input.fileName,
        fileType: input.fileType,
        fileSize: input.fileSize,
        fileUrl: input.fileUrl,
        thumbnailUrl: input.thumbnailUrl,
        width: input.width,
        height: input.height,
      },
    });

    return { success: true, attachment: { id: attachment.id } };
  } catch (error) {
    console.error("Create attachment error:", error);
    return { success: false, error: "Failed to save attachment" };
  }
}

/**
 * Delete an attachment
 */
export async function deleteAttachment(
  attachmentId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Verify ownership
    const attachment = await db.messageAttachment.findUnique({
      where: { id: attachmentId },
      include: { message: { select: { userId: true } } },
    });

    if (!attachment) {
      return { success: false, error: "Attachment not found" };
    }

    if (attachment.uploadedById !== userId && attachment.message.userId !== userId) {
      return { success: false, error: "Not authorized to delete this attachment" };
    }

    // Delete from database
    await db.messageAttachment.delete({
      where: { id: attachmentId },
    });

    // TODO: Delete from file storage (S3/local)

    return { success: true };
  } catch (error) {
    console.error("Delete attachment error:", error);
    return { success: false, error: "Failed to delete attachment" };
  }
}

/**
 * Get attachment info
 */
export async function getAttachment(attachmentId: string) {
  return db.messageAttachment.findUnique({
    where: { id: attachmentId },
    include: {
      message: {
        select: {
          channelId: true,
          userId: true,
        },
      },
      uploadedBy: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

// ============================================
// UPLOAD API ROUTE HANDLER
// ============================================

/**
 * Handle file upload in API route
 * Use with: /api/chat/upload/route.ts
 */
export async function handleUploadRequest(
  request: Request
): Promise<Response> {
  try {
    const formData = await request.formData();
    const result = await uploadChatFile(formData);

    if (!result.success) {
      return Response.json({ error: result.error }, { status: 400 });
    }

    return Response.json({
      fileUrl: result.fileUrl,
      thumbnailUrl: result.thumbnailUrl,
    });
  } catch (error) {
    console.error("Upload request error:", error);
    return Response.json({ error: "Upload failed" }, { status: 500 });
  }
}
