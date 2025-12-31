"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { getValidAccessToken } from "@/modules/integrations/google/actions/google-auth";
import type {
  CreateDocumentInput,
  UpdateDocumentInput,
  DocumentWithRelations,
  StudioDocumentFilters,
} from "../types";

const DOCS_API_BASE = "https://docs.googleapis.com/v1";
const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

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
 * Sync document to Google Docs
 */
export async function syncToGoogle(
  documentId: string
): Promise<{ googleDocId: string; googleUrl: string }> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const document = await db.studioDocument.findFirst({
    where: {
      id: documentId,
      organizationId: session.user.organizationId,
    },
  });

  if (!document) throw new Error("Document not found");

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) throw new Error("Google not connected");

  let googleDocId = document.googleDocId;
  let googleUrl = document.googleDocUrl || "";

  // Create Google Doc if doesn't exist
  if (!googleDocId) {
    const createResponse = await fetch(`${DRIVE_API_BASE}/files`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: document.title,
        mimeType: "application/vnd.google-apps.document",
      }),
    });

    if (!createResponse.ok) {
      throw new Error("Failed to create Google Doc");
    }

    const file = await createResponse.json();
    googleDocId = file.id;

    // Get web view link
    const detailsResponse = await fetch(
      `${DRIVE_API_BASE}/files/${file.id}?fields=webViewLink`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    const details = await detailsResponse.json();
    googleUrl = details.webViewLink;
  }

  // Push content to Google Doc
  if (document.content || document.contentHtml) {
    const content = document.content || stripHtml(document.contentHtml || "");
    await pushContentToGoogleDoc(googleDocId, content, accessToken);
  }

  // Update document with Google info
  await db.studioDocument.update({
    where: { id: documentId },
    data: {
      googleDocId,
      googleDocUrl: googleUrl,
      syncStatus: "SYNCED",
      lastSyncedAt: new Date(),
    },
  });

  revalidatePath("/studio/docs");
  revalidatePath(`/studio/docs/${documentId}`);

  return { googleDocId, googleUrl };
}

/**
 * Pull changes from Google Docs
 */
export async function pullFromGoogle(
  documentId: string
): Promise<DocumentWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const document = await db.studioDocument.findFirst({
    where: {
      id: documentId,
      organizationId: session.user.organizationId,
    },
  });

  if (!document) throw new Error("Document not found");
  if (!document.googleDocId) throw new Error("Document not synced with Google");

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) throw new Error("Google not connected");

  // Fetch content from Google Docs
  const response = await fetch(`${DOCS_API_BASE}/documents/${document.googleDocId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Google Doc");
  }

  const googleDoc = await response.json();

  // Extract text content
  let content = "";
  if (googleDoc.body?.content) {
    for (const element of googleDoc.body.content) {
      if (element.paragraph?.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun?.content) {
            content += elem.textRun.content;
          }
        }
      }
    }
  }

  // Create version before updating
  if (document.content) {
    const lastVersion = await db.studioDocVersion.findFirst({
      where: { documentId },
      orderBy: { version: "desc" },
    });

    await db.studioDocVersion.create({
      data: {
        documentId,
        version: (lastVersion?.version ?? 0) + 1,
        content: document.content,
        contentHtml: document.contentHtml,
        wordCount: document.wordCount,
        createdById: session.user.id,
      },
    });
  }

  // Update document
  const wordCount = content.split(/\s+/).filter(Boolean).length;

  const updated = await db.studioDocument.update({
    where: { id: documentId },
    data: {
      content,
      wordCount,
      syncStatus: "SYNCED",
      lastSyncedAt: new Date(),
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

  revalidatePath("/studio/docs");
  revalidatePath(`/studio/docs/${documentId}`);

  return updated as DocumentWithRelations;
}

/**
 * Get document versions for history
 */
export async function getDocumentVersions(documentId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const document = await db.studioDocument.findFirst({
    where: {
      id: documentId,
      organizationId: session.user.organizationId,
    },
  });

  if (!document) throw new Error("Document not found");

  const versions = await db.studioDocVersion.findMany({
    where: { documentId },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
    },
    orderBy: { version: "desc" },
  });

  return versions;
}

/**
 * Restore a previous version
 */
export async function restoreVersion(documentId: string, version: number): Promise<DocumentWithRelations> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const versionData = await db.studioDocVersion.findFirst({
    where: { documentId, version },
    include: { document: true },
  });

  if (!versionData || versionData.document.organizationId !== session.user.organizationId) {
    throw new Error("Version not found");
  }

  // Save current as new version
  const lastVersion = await db.studioDocVersion.findFirst({
    where: { documentId },
    orderBy: { version: "desc" },
  });

  await db.studioDocVersion.create({
    data: {
      documentId,
      version: (lastVersion?.version ?? 0) + 1,
      content: versionData.document.content || "",
      contentHtml: versionData.document.contentHtml,
      wordCount: versionData.document.wordCount,
      createdById: session.user.id,
    },
  });

  // Restore
  const updated = await db.studioDocument.update({
    where: { id: documentId },
    data: {
      content: versionData.content,
      contentHtml: versionData.contentHtml,
      wordCount: versionData.wordCount,
      syncStatus: versionData.document.googleDocId ? "PENDING_SYNC" : "LOCAL_ONLY",
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

  revalidatePath("/studio/docs");
  revalidatePath(`/studio/docs/${documentId}`);

  return updated as DocumentWithRelations;
}

/**
 * Check sync status and detect conflicts
 */
export async function checkSyncStatus(documentId: string): Promise<{
  status: "SYNCED" | "LOCAL_CHANGES" | "REMOTE_CHANGES" | "CONFLICT";
  lastLocalEdit?: Date;
  lastRemoteEdit?: Date;
}> {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const document = await db.studioDocument.findFirst({
    where: {
      id: documentId,
      organizationId: session.user.organizationId,
    },
  });

  if (!document) throw new Error("Document not found");
  if (!document.googleDocId) {
    return { status: "LOCAL_CHANGES", lastLocalEdit: document.updatedAt };
  }

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) throw new Error("Google not connected");

  // Get Google Doc metadata
  const response = await fetch(
    `${DRIVE_API_BASE}/files/${document.googleDocId}?fields=modifiedTime`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!response.ok) {
    return { status: "LOCAL_CHANGES", lastLocalEdit: document.updatedAt };
  }

  const metadata = await response.json();
  const remoteModified = new Date(metadata.modifiedTime);
  const lastSync = document.lastSyncedAt || new Date(0);

  const localChangedAfterSync = document.updatedAt > lastSync;
  const remoteChangedAfterSync = remoteModified > lastSync;

  if (localChangedAfterSync && remoteChangedAfterSync) {
    return {
      status: "CONFLICT",
      lastLocalEdit: document.updatedAt,
      lastRemoteEdit: remoteModified,
    };
  }

  if (localChangedAfterSync) {
    return { status: "LOCAL_CHANGES", lastLocalEdit: document.updatedAt };
  }

  if (remoteChangedAfterSync) {
    return { status: "REMOTE_CHANGES", lastRemoteEdit: remoteModified };
  }

  return { status: "SYNCED" };
}

// Helper functions

async function pushContentToGoogleDoc(
  documentId: string,
  content: string,
  accessToken: string
): Promise<void> {
  // Get current document to find end index
  const docResponse = await fetch(`${DOCS_API_BASE}/documents/${documentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!docResponse.ok) {
    throw new Error("Failed to fetch Google Doc");
  }

  const docData = await docResponse.json();
  const endIndex = docData.body?.content?.slice(-1)?.[0]?.endIndex || 1;

  const requests: unknown[] = [];

  // Delete existing content
  if (endIndex > 1) {
    requests.push({
      deleteContentRange: {
        range: { startIndex: 1, endIndex: endIndex - 1 },
      },
    });
  }

  // Insert new content
  if (content) {
    requests.push({
      insertText: {
        location: { index: 1 },
        text: content,
      },
    });
  }

  if (requests.length > 0) {
    await fetch(`${DOCS_API_BASE}/documents/${documentId}:batchUpdate`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ requests }),
    });
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}
