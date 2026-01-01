import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { readFile, stat } from "fs/promises";
import { join } from "path";

const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || "/tmp/uploads";

/**
 * Serve files from local storage
 * GET /api/files/serve/[...path]
 */
// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { path } = await params;
    const storageKey = path.join("/");

    // Verify organization owns this file
    const file = await db.file.findFirst({
      where: {
        storageKey,
        organizationId: session.user.organizationId,
        isArchived: false,
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Read file from local storage
    const filePath = join(LOCAL_STORAGE_PATH, storageKey);

    try {
      await stat(filePath);
    } catch {
      return NextResponse.json(
        { error: "File not found on disk" },
        { status: 404 }
      );
    }

    const fileBuffer = await readFile(filePath);

    // Set appropriate headers
    const headers = new Headers();
    headers.set("Content-Type", file.mimeType);
    headers.set("Content-Length", file.size.toString());
    headers.set(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.originalName)}"`
    );
    headers.set("Cache-Control", "private, max-age=31536000");

    return new NextResponse(fileBuffer, { headers });
  } catch (error) {
    console.error("File serve error:", error);
    return NextResponse.json(
      { error: "Failed to serve file" },
      { status: 500 }
    );
  }
}
