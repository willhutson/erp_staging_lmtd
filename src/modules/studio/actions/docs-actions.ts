"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentWithRelations,
  StudioDocumentFilters,
} from "../types";

/**
 * Create a new studio document
 */
export async function createStudioDocument(
  input: CreateDocumentInput
): Promise<DocumentWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const document = await db.studioDocument.create({
    data: {
      organizationId: session.user.organizationId,
      title: input.title,
      type: input.type,
      clientId: input.clientId,
      briefId: input.briefId,
      projectId: input.projectId,
      createdById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true } },
    },
  });

  // TODO: If createInGoogle is true, create doc in Google and store googleDocId

  return document as DocumentWithRelations;
}

/**
 * Get a studio document by ID
 */
export async function getStudioDocument(
  documentId: string
): Promise<DocumentWithRelations | null> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const document = await db.studioDocument.findFirst({
    where: {
      id: documentId,
      organizationId: session.user.organizationId,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true } },
      versions: {
        orderBy: { version: "desc" },
        take: 10,
      },
    },
  });

  return document as DocumentWithRelations | null;
}

/**
 * List studio documents with filters
 */
export async function listStudioDocuments(
  filters: StudioDocumentFilters = {}
): Promise<DocumentWithRelations[]> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const documents = await db.studioDocument.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters.clientId && { clientId: filters.clientId }),
      ...(filters.projectId && { projectId: filters.projectId }),
      ...(filters.briefId && { briefId: filters.briefId }),
      ...(filters.type && { type: filters.type }),
      ...(filters.status && { status: filters.status }),
      ...(filters.search && {
        title: { contains: filters.search, mode: "insensitive" as const },
      }),
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return documents as DocumentWithRelations[];
}

/**
 * Update a studio document
 */
export async function updateStudioDocument(
  documentId: string,
  input: UpdateDocumentInput
): Promise<DocumentWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Get current document for version tracking
  const current = await db.studioDocument.findFirst({
    where: {
      id: documentId,
      organizationId: session.user.organizationId,
    },
  });

  if (!current) throw new Error("Document not found");

  // Create version if content changed
  if (input.content && current.content) {
    const lastVersion = await db.studioDocVersion.findFirst({
      where: { documentId },
      orderBy: { version: "desc" },
    });

    await db.studioDocVersion.create({
      data: {
        documentId,
        version: (lastVersion?.version ?? 0) + 1,
        content: current.content,
        contentHtml: current.contentHtml,
        wordCount: current.wordCount,
        createdById: session.user.id,
      },
    });
  }

  // Update word count if content provided
  let wordCount = current.wordCount;
  if (input.contentHtml) {
    // Simple word count from HTML - strip tags and count words
    const text = input.contentHtml.replace(/<[^>]*>/g, " ");
    wordCount = text.split(/\s+/).filter(Boolean).length;
  }

  const document = await db.studioDocument.update({
    where: { id: documentId },
    data: {
      ...input,
      wordCount,
      lastEditedById: session.user.id,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true } },
    },
  });

  return document as DocumentWithRelations;
}

/**
 * Delete a studio document
 */
export async function deleteStudioDocument(documentId: string): Promise<void> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.studioDocument.delete({
    where: {
      id: documentId,
      organizationId: session.user.organizationId,
    },
  });
}

/**
 * Sync document to Google Docs (placeholder)
 */
export async function syncToGoogle(
  documentId: string
): Promise<{ googleDocId: string; googleUrl: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // TODO: Implement Google Docs API integration
  // 1. Get document content
  // 2. Create or update Google Doc
  // 3. Store googleDocId

  throw new Error("Google Docs sync not yet implemented");
}

/**
 * Pull changes from Google Docs (placeholder)
 */
export async function pullFromGoogle(
  documentId: string
): Promise<DocumentWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // TODO: Implement Google Docs API integration
  // 1. Get googleDocId from document
  // 2. Fetch content from Google Docs API
  // 3. Convert to portable format
  // 4. Update document

  throw new Error("Google Docs sync not yet implemented");
}
