import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth";
import {
  generateUploadUrl,
  isSupabaseStorageConfigured,
} from "@/lib/storage/supabase-storage";

/**
 * Generate a signed upload URL
 * POST /api/storage/upload-url
 *
 * Body:
 * - filename: string (required) - Original filename
 * - category: string (optional) - File category (default: "files")
 * - mimeType: string (optional) - MIME type of the file
 *
 * Returns:
 * - bucket: string - Storage bucket name
 * - path: string - Storage path for the file
 * - signedUrl: string - Signed URL for direct upload
 * - expiresAt: string - ISO timestamp when URL expires
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
    const { filename, category = "files", mimeType } = body;

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
