import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { generateStorageKey } from "@/lib/storage/storage-service";
import type { FileCategory } from "@prisma/client";

const LOCAL_STORAGE_PATH = process.env.LOCAL_STORAGE_PATH || "/tmp/uploads";

/**
 * Handle file upload
 * POST /api/files/upload
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file size (100MB max)
    const MAX_SIZE = 100 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "File too large. Maximum size is 100MB." },
        { status: 400 }
      );
    }

    // Get additional fields
    const category = (formData.get("category") as FileCategory) || "OTHER";
    const folderId = formData.get("folderId") as string | null;
    const tags = formData.get("tags") as string | null;

    // Generate storage key
    const storageKey = generateStorageKey(
      session.user.organizationId,
      category,
      file.name
    );

    // For local storage, save to filesystem
    // In production, this would upload to R2/S3
    const storageProvider = process.env.STORAGE_PROVIDER || "local";

    let cdnUrl: string | undefined;

    if (storageProvider === "local") {
      // Create directory structure
      const filePath = join(LOCAL_STORAGE_PATH, storageKey);
      const dirPath = filePath.substring(0, filePath.lastIndexOf("/"));
      await mkdir(dirPath, { recursive: true });

      // Write file
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      // Local URL
      cdnUrl = `/api/files/serve/${storageKey}`;
    } else if (storageProvider === "r2") {
      // R2 upload would go here
      // For now, return error if R2 is configured but not implemented
      return NextResponse.json(
        { error: "R2 storage not yet implemented" },
        { status: 501 }
      );
    }

    // Get extension
    const parts = file.name.split(".");
    const extension = parts.length > 1 ? parts.pop()!.toLowerCase() : null;

    // Create database record
    const fileRecord = await db.file.create({
      data: {
        organizationId: session.user.organizationId,
        name: file.name,
        originalName: file.name,
        extension,
        mimeType: file.type,
        size: file.size,
        storageKey,
        category,
        tags: tags ? tags.split(",").map((t) => t.trim()) : [],
        folderId: folderId || undefined,
        uploadedById: session.user.id,
        cdnUrl,
      },
    });

    return NextResponse.json({
      success: true,
      file: {
        id: fileRecord.id,
        name: fileRecord.name,
        originalName: fileRecord.originalName,
        mimeType: fileRecord.mimeType,
        size: fileRecord.size,
        cdnUrl: fileRecord.cdnUrl,
        category: fileRecord.category,
        createdAt: fileRecord.createdAt,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
