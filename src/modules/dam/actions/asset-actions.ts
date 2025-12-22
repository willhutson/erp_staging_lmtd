"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export type LibraryType = "GENERAL" | "BRAND" | "STOCK" | "CLIENT" | "PROJECT" | "ARCHIVE";
export type LibraryVisibility = "INTERNAL" | "CLIENT" | "PUBLIC";
export type AssetType = "IMAGE" | "VIDEO" | "AUDIO" | "DOCUMENT" | "DESIGN" | "FONT" | "TEMPLATE" | "OTHER";
export type AssetStatus = "PENDING" | "APPROVED" | "REJECTED" | "ARCHIVED";

export interface CreateLibraryInput {
  name: string;
  slug?: string;
  description?: string;
  libraryType?: LibraryType;
  visibility?: LibraryVisibility;
  clientId?: string;
}

export interface CreateAssetInput {
  libraryId: string;
  folderId?: string;
  fileId: string;
  name: string;
  slug?: string;
  description?: string;
  assetType: AssetType;
  tags?: string[];
}

// ============================================
// LIBRARY OPERATIONS
// ============================================

export async function getAssetLibraries(options?: {
  clientId?: string;
  libraryType?: LibraryType;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.clientId) where.clientId = options.clientId;
  if (options?.libraryType) where.libraryType = options.libraryType;

  return db.assetLibrary.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, code: true } },
      _count: { select: { assets: true, folders: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAssetLibrary(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.assetLibrary.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
      folders: {
        where: { parentId: null },
        orderBy: { name: "asc" },
      },
      assets: {
        where: { folderId: null },
        include: {
          file: { select: { id: true, name: true, mimeType: true, size: true, thumbnailUrl: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      },
      _count: { select: { assets: true, folders: true } },
    },
  });
}

export async function createAssetLibrary(input: CreateLibraryInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const library = await db.assetLibrary.create({
    data: {
      organizationId: session.user.organizationId,
      name: input.name,
      slug,
      description: input.description,
      libraryType: input.libraryType || "GENERAL",
      visibility: input.visibility || "INTERNAL",
      clientId: input.clientId,
      createdById: session.user.id,
    },
  });

  revalidatePath("/assets");
  return library;
}

export async function deleteAssetLibrary(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.assetLibrary.delete({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  revalidatePath("/assets");
}

// ============================================
// FOLDER OPERATIONS
// ============================================

export async function createAssetFolder(input: {
  libraryId: string;
  name: string;
  parentId?: string;
  description?: string;
  color?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const slug = input.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  let path = "/" + slug;
  let depth = 0;

  if (input.parentId) {
    const parent = await db.assetFolder.findUnique({ where: { id: input.parentId } });
    if (parent) {
      path = parent.path + "/" + slug;
      depth = parent.depth + 1;
    }
  }

  const folder = await db.assetFolder.create({
    data: {
      libraryId: input.libraryId,
      name: input.name,
      slug,
      path,
      depth,
      description: input.description,
      color: input.color,
      parentId: input.parentId,
      createdById: session.user.id,
    },
  });

  revalidatePath("/assets");
  return folder;
}

export async function getAssetFolder(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.assetFolder.findFirst({
    where: { id },
    include: {
      library: true,
      children: { orderBy: { name: "asc" } },
      assets: {
        include: {
          file: { select: { id: true, name: true, mimeType: true, size: true, thumbnailUrl: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

// ============================================
// ASSET OPERATIONS
// ============================================

export async function getAssets(options?: {
  libraryId?: string;
  folderId?: string;
  assetType?: AssetType;
  status?: AssetStatus;
  search?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.libraryId) where.libraryId = options.libraryId;
  if (options?.folderId) where.folderId = options.folderId;
  if (options?.assetType) where.assetType = options.assetType;
  if (options?.status) where.status = options.status;
  if (options?.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
      { tags: { has: options.search } },
    ];
  }

  return db.asset.findMany({
    where,
    include: {
      library: { select: { id: true, name: true } },
      folder: { select: { id: true, name: true, path: true } },
      file: { select: { id: true, name: true, mimeType: true, size: true, thumbnailUrl: true, cdnUrl: true } },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
}

export async function getAsset(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.asset.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      library: true,
      folder: true,
      file: true,
      createdBy: { select: { id: true, name: true, email: true } },
      versions: { orderBy: { version: "desc" }, take: 10 },
      comments: {
        where: { parentId: null },
        include: {
          author: { select: { id: true, name: true } },
          replies: {
            include: { author: { select: { id: true, name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function createAsset(input: CreateAssetInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const slug = input.slug || input.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  // Get the library to verify it belongs to this org
  const library = await db.assetLibrary.findFirst({
    where: {
      id: input.libraryId,
      organizationId: session.user.organizationId,
    },
  });

  if (!library) throw new Error("Library not found");

  const asset = await db.asset.create({
    data: {
      organizationId: session.user.organizationId,
      libraryId: input.libraryId,
      folderId: input.folderId,
      fileId: input.fileId,
      name: input.name,
      slug,
      description: input.description,
      assetType: input.assetType,
      tags: input.tags || [],
      createdById: session.user.id,
    },
    include: {
      file: true,
      library: true,
    },
  });

  revalidatePath("/assets");
  revalidatePath(`/assets/${input.libraryId}`);
  return asset;
}

export async function updateAsset(id: string, input: Partial<CreateAssetInput> & { status?: AssetStatus }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const asset = await db.asset.update({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    data: {
      name: input.name,
      description: input.description,
      tags: input.tags,
      status: input.status,
      lastEditedById: session.user.id,
      ...(input.status === "APPROVED" ? { approvedById: session.user.id, approvedAt: new Date() } : {}),
    },
  });

  revalidatePath("/assets");
  return asset;
}

export async function deleteAsset(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.asset.delete({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  revalidatePath("/assets");
}

// ============================================
// ASSET COMMENTS
// ============================================

export async function addAssetComment(input: {
  assetId: string;
  content: string;
  parentId?: string;
  annotationType?: string;
  annotationData?: Record<string, unknown>;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.assetComment.create({
    data: {
      assetId: input.assetId,
      content: input.content,
      parentId: input.parentId,
      annotationType: input.annotationType,
      annotationData: input.annotationData,
      authorId: session.user.id,
    },
    include: {
      author: { select: { id: true, name: true } },
    },
  });
}

export async function resolveAssetComment(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.assetComment.update({
    where: { id },
    data: {
      isResolved: true,
      resolvedAt: new Date(),
    },
  });
}

// ============================================
// STATS
// ============================================

export async function getAssetStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [libraries, assets, pending] = await Promise.all([
    db.assetLibrary.count({ where: { organizationId: session.user.organizationId } }),
    db.asset.count({ where: { organizationId: session.user.organizationId } }),
    db.asset.count({ where: { organizationId: session.user.organizationId, status: "PENDING" } }),
  ]);

  return { libraries, assets, pending };
}
