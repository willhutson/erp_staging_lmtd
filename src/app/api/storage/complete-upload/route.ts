import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  isSupabaseStorageConfigured,
  verifyPathOwnership,
  getFileMetadata,
  DAM_BUCKET,
} from "@/lib/storage/supabase-storage";
import type { FileCategory } from "@prisma/client";

/**
 * Complete file upload after direct upload to Supabase Storage
 * POST /api/storage/complete-upload
 *
 * Body:
 * - path: string (required) - Storage path from upload-url response
 * - name: string (required) - Display name for the file
 * - originalName: string (required) - Original filename
 * - mimeType: string (required) - MIME type
 * - size: number (required) - File size in bytes
 * - category: FileCategory (optional) - File category
 * - folderId: string (optional) - Folder ID
 * - tags: string[] (optional) - Tags
 *
 * Returns:
 * - file: { id, name, path, mimeType, size, ... }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const ctx = await getOrgContext();

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
    const {
      path,
      name,
      originalName,
      mimeType,
      size,
      category = "OTHER",
      folderId,
      tags = [],
    } = body;

    // Validate required fields
    if (!path || !name || !originalName || !mimeType || size === undefined) {
      return NextResponse.json(
        {
          error:
            "Missing required fields: path, name, originalName, mimeType, size",
        },
        { status: 400 }
      );
    }

    // Verify the path belongs to this organization (tenant isolation)
    if (!verifyPathOwnership(path, ctx.organizationId)) {
      return NextResponse.json(
        { error: "Access denied to this file path" },
        { status: 403 }
      );
    }

    // Optionally verify file exists in storage
    // This adds latency but ensures data integrity
    const metadata = await getFileMetadata(path);
    if (!metadata) {
      return NextResponse.json(
        {
          error: "File not found in storage",
          message:
            "The file was not found at the specified path. Ensure upload completed.",
        },
        { status: 404 }
      );
    }

    // Extract extension from original name
    const parts = originalName.split(".");
    const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : null;

    // Create file record in database
    const file = await db.file.create({
      data: {
        organizationId: ctx.organizationId,
        name,
        originalName,
        extension,
        mimeType,
        size,
        storageKey: path,
        storageProvider: "supabase",
        category: category as FileCategory,
        tags: Array.isArray(tags) ? tags : [],
        folderId: folderId || null,
        uploadedById: ctx.userId,
        // No cdnUrl - we use signed URLs
      },
    });

    return NextResponse.json({
      file: {
        id: file.id,
        name: file.name,
        originalName: file.originalName,
        mimeType: file.mimeType,
        size: file.size,
        path: file.storageKey,
        bucket: DAM_BUCKET,
        category: file.category,
        createdAt: file.createdAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("Complete upload error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to complete upload" },
      { status: 500 }
    );
  }
}
