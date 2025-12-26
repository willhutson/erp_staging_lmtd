import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth";
import { getTenantConfig } from "@/lib/config";
import {
  generateUploadUrl,
  isSupabaseStorageConfigured,
} from "@/lib/storage/supabase-storage";

/**
 * Get file size limit for a permission level (in bytes)
 */
function getFileSizeLimitForRole(permissionLevel: string): number {
  const config = getTenantConfig();
  const roleLimits = config.storage?.roleLimits || {};

  const limitMB =
    roleLimits[permissionLevel as keyof typeof roleLimits] ||
    config.storage?.maxFileSizeMB ||
    100;

  return limitMB * 1024 * 1024;
}

/**
 * Format bytes to human readable string
 */
function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Generate a signed upload URL
 * POST /api/storage/upload-url
 *
 * Body:
 * - filename: string (required) - Original filename
 * - category: string (optional) - File category (default: "files")
 * - mimeType: string (optional) - MIME type of the file
 * - fileSize: number (optional) - File size in bytes for validation
 *
 * Returns:
 * - bucket: string - Storage bucket name
 * - path: string - Storage path for the file
 * - signedUrl: string - Signed URL for direct upload
 * - expiresAt: string - ISO timestamp when URL expires
 * - maxFileSize: number - Maximum allowed file size in bytes
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const ctx = await getOrgContext();
    const config = getTenantConfig();

    // Check if Supabase is configured
    if (!isSupabaseStorageConfigured()) {
      return NextResponse.json(
        {
          error: "Storage not configured",
          message:
            "Supabase storage is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
        },
        { status: 503 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { filename, category = "files", mimeType, fileSize } = body;

    if (!filename || typeof filename !== "string") {
      return NextResponse.json(
        { error: "Missing required field: filename" },
        { status: 400 }
      );
    }

    // Validate filename
    if (filename.length > 255) {
      return NextResponse.json(
        { error: "Filename too long (max 255 characters)" },
        { status: 400 }
      );
    }

    // Get role-based file size limit
    const maxFileSize = getFileSizeLimitForRole(ctx.permissionLevel);

    // Validate file size if provided
    if (fileSize && typeof fileSize === "number") {
      if (fileSize > maxFileSize) {
        const supportMessage =
          config.storage?.supportMessage ||
          "Contact your administrator to request a limit increase.";

        return NextResponse.json(
          {
            error: "File too large",
            message: `Your file (${formatBytes(fileSize)}) exceeds your upload limit of ${formatBytes(maxFileSize)}. ${supportMessage}`,
            code: "FILE_TOO_LARGE",
            details: {
              fileSize,
              maxFileSize,
              maxFileSizeFormatted: formatBytes(maxFileSize),
              permissionLevel: ctx.permissionLevel,
              supportEmail: config.storage?.supportEmail,
            },
          },
          { status: 413 }
        );
      }
    }

    // Check MIME type restrictions if configured
    const allowedMimeTypes = config.storage?.allowedMimeTypes || [];
    if (allowedMimeTypes.length > 0 && mimeType) {
      const isAllowed = allowedMimeTypes.some(
        (allowed: string) =>
          mimeType === allowed || mimeType.startsWith(allowed.replace("*", ""))
      );
      if (!isAllowed) {
        return NextResponse.json(
          {
            error: "File type not allowed",
            message: `The file type "${mimeType}" is not allowed. Allowed types: ${allowedMimeTypes.join(", ")}`,
            code: "INVALID_FILE_TYPE",
          },
          { status: 415 }
        );
      }
    }

    // Generate signed upload URL
    const result = await generateUploadUrl(
      ctx.organizationId,
      category,
      filename,
      mimeType
    );

    return NextResponse.json({
      bucket: result.bucket,
      path: result.path,
      signedUrl: result.signedUrl,
      expiresAt: result.expiresAt.toISOString(),
      maxFileSize,
      maxFileSizeFormatted: formatBytes(maxFileSize),
    });
  } catch (error) {
    console.error("Upload URL generation error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to generate upload URL" },
      { status: 500 }
    );
  }
}
