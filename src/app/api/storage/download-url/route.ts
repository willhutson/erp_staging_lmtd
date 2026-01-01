import { NextRequest, NextResponse } from "next/server";
import { getOrgContext } from "@/lib/auth";
import {
  generateDownloadUrl,
  isSupabaseStorageConfigured,
  verifyPathOwnership,
} from "@/lib/storage/supabase-storage";

/**
 * Generate a signed download URL
 * GET /api/storage/download-url?path=...
 *
 * Query params:
 * - path: string (required) - Storage path of the file
 * - expiresIn: number (optional) - Expiry time in seconds (default: 3600)
 *
 * Returns:
 * - signedUrl: string - Signed URL for downloading
 * - expiresAt: string - ISO timestamp when URL expires
 */
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const path = searchParams.get("path");
    const expiresIn = searchParams.get("expiresIn");

    if (!path) {
      return NextResponse.json(
        { error: "Missing required query parameter: path" },
        { status: 400 }
      );
    }

    // Verify the path belongs to this organization (tenant isolation)
    if (!verifyPathOwnership(path, ctx.organizationId)) {
      return NextResponse.json(
        { error: "Access denied to this file" },
        { status: 403 }
      );
    }

    // Parse expiry time
    let expiresInSeconds = 3600; // Default 1 hour
    if (expiresIn) {
      const parsed = parseInt(expiresIn, 10);
      if (!isNaN(parsed) && parsed > 0 && parsed <= 604800) {
        // Max 7 days
        expiresInSeconds = parsed;
      }
    }

    // Generate signed download URL
    const result = await generateDownloadUrl(path, expiresInSeconds);

    return NextResponse.json({
      signedUrl: result.signedUrl,
      expiresAt: result.expiresAt.toISOString(),
    });
  } catch (error) {
    console.error("Download URL generation error:", error);

    if (error instanceof Error && error.message.includes("Unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
      { error: "Failed to generate download URL" },
      { status: 500 }
    );
  }
}
