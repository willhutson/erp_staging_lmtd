"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getValidAccessToken } from "./google-auth";
import type { GoogleDocType, BriefType } from "@prisma/client";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";
const DOCS_API_BASE = "https://docs.googleapis.com/v1";
const SHEETS_API_BASE = "https://sheets.googleapis.com/v4";

interface CreateDocumentInput {
  title: string;
  documentType: GoogleDocType;
  folderId?: string;
  briefId?: string;
  projectId?: string;
}

// MIME types for Google Workspace documents
const MIME_TYPES = {
  DOCUMENT: "application/vnd.google-apps.document",
  SPREADSHEET: "application/vnd.google-apps.spreadsheet",
  PRESENTATION: "application/vnd.google-apps.presentation",
};

/**
 * Create a Google document (Docs, Sheets, or Slides)
 */
export async function createGoogleDocument(input: CreateDocumentInput): Promise<{
  id: string;
  url: string;
}> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) {
    throw new Error("Google not connected");
  }

  const metadata: Record<string, unknown> = {
    name: input.title,
    mimeType: MIME_TYPES[input.documentType],
  };

  if (input.folderId) {
    metadata.parents = [input.folderId];
  }

  const response = await fetch(`${DRIVE_API_BASE}/files`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create document: ${error}`);
  }

  const doc = await response.json();

  // Get the webViewLink
  const docDetails = await fetch(
    `${DRIVE_API_BASE}/files/${doc.id}?fields=webViewLink`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const details = await docDetails.json();

  // Save to our database
  await db.googleDocument.create({
    data: {
      organizationId: session.user.organizationId,
      briefId: input.briefId,
      projectId: input.projectId,
      documentId: doc.id,
      documentType: input.documentType,
      title: input.title,
      documentUrl: details.webViewLink,
      folderId: input.folderId,
    },
  });

  return {
    id: doc.id,
    url: details.webViewLink,
  };
}

/**
 * Create a brief document from a brief
 */
export async function createBriefDocument(briefId: string): Promise<{
  id: string;
  url: string;
}> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const brief = await db.brief.findUnique({
    where: { id: briefId },
    include: {
      client: true,
      assignee: true,
      createdBy: true,
    },
  });

  if (!brief || brief.organizationId !== session.user.organizationId) {
    throw new Error("Brief not found");
  }

  // Find the briefs folder for this client
  const briefsFolder = await db.googleDriveFolder.findFirst({
    where: {
      clientId: brief.clientId,
      folderType: "BRIEFS",
    },
  });

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) {
    throw new Error("Google not connected");
  }

  // Create the document
  const result = await createGoogleDocument({
    title: `${brief.briefNumber} - ${brief.title}`,
    documentType: "DOCUMENT",
    folderId: briefsFolder?.folderId,
    briefId: brief.id,
  });

  // Populate the document with brief content
  await populateBriefDocument(result.id, brief, accessToken);

  return result;
}

/**
 * Populate a Google Doc with brief content
 */
async function populateBriefDocument(
  documentId: string,
  brief: {
    briefNumber: string;
    title: string;
    type: BriefType;
    formData: unknown;
    client: { name: string };
    assignee: { name: string } | null;
    createdBy: { name: string };
    deadline: Date | null;
    startDate: Date | null;
    endDate: Date | null;
  },
  accessToken: string
): Promise<void> {
  const formData = brief.formData as Record<string, unknown>;

  // Build content sections
  const sections: string[] = [
    `Brief: ${brief.title}`,
    "",
    `Brief Number: ${brief.briefNumber}`,
    `Type: ${brief.type.replace(/_/g, " ")}`,
    `Client: ${brief.client.name}`,
    `Created By: ${brief.createdBy.name}`,
    brief.assignee ? `Assigned To: ${brief.assignee.name}` : "",
    brief.deadline ? `Deadline: ${brief.deadline.toLocaleDateString()}` : "",
    "",
    "---",
    "",
  ];

  // Add form data fields
  const fieldLabels: Record<string, string> = {
    location: "Location",
    dates: "Dates",
    timing: "Timing",
    objective: "Objective",
    talentVO: "Talent V/O",
    deliverables: "Deliverables",
    referenceLink: "Reference Link",
    additionalNotes: "Additional Notes",
    shootingMethod: "Shooting Method",
    transportNeeded: "Transport Needed",
  };

  for (const [key, label] of Object.entries(fieldLabels)) {
    const value = formData[key];
    if (value) {
      if (Array.isArray(value)) {
        sections.push(`${label}:`);
        value.forEach((item) => sections.push(`  - ${item}`));
      } else {
        sections.push(`${label}: ${value}`);
      }
      sections.push("");
    }
  }

  const content = sections.join("\n");

  // Insert text into the document
  const requests = [
    {
      insertText: {
        location: { index: 1 },
        text: content,
      },
    },
  ];

  await fetch(`${DOCS_API_BASE}/documents/${documentId}:batchUpdate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });
}

/**
 * Create a project tracking spreadsheet
 */
export async function createProjectTrackingSheet(projectId: string): Promise<{
  id: string;
  url: string;
}> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (!project || project.organizationId !== session.user.organizationId) {
    throw new Error("Project not found");
  }

  // Find the project folder
  const projectFolder = await db.googleDriveFolder.findFirst({
    where: {
      projectId: project.id,
      folderType: "PROJECT",
    },
  });

  const result = await createGoogleDocument({
    title: `${project.name} - Tracking`,
    documentType: "SPREADSHEET",
    folderId: projectFolder?.folderId,
    projectId: project.id,
  });

  // Initialize the spreadsheet with headers
  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (accessToken) {
    await initializeTrackingSheet(result.id, accessToken);
  }

  return result;
}

/**
 * Initialize a tracking spreadsheet with headers
 */
async function initializeTrackingSheet(
  spreadsheetId: string,
  accessToken: string
): Promise<void> {
  const headers = [
    ["Task", "Assignee", "Status", "Start Date", "Due Date", "Hours Est.", "Hours Actual", "Notes"],
  ];

  await fetch(
    `${SHEETS_API_BASE}/spreadsheets/${spreadsheetId}/values/A1:H1?valueInputOption=RAW`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ values: headers }),
    }
  );
}

/**
 * Create a presentation for a pitch/proposal
 */
export async function createPitchPresentation(projectId: string): Promise<{
  id: string;
  url: string;
}> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: { client: true },
  });

  if (!project || project.organizationId !== session.user.organizationId) {
    throw new Error("Project not found");
  }

  // Find the project folder
  const projectFolder = await db.googleDriveFolder.findFirst({
    where: {
      projectId: project.id,
      folderType: "PROJECT",
    },
  });

  return createGoogleDocument({
    title: `${project.client.name} - ${project.name} Proposal`,
    documentType: "PRESENTATION",
    folderId: projectFolder?.folderId,
    projectId: project.id,
  });
}

/**
 * Get all documents for a brief
 */
export async function getBriefDocuments(briefId: string): Promise<
  Array<{
    id: string;
    title: string;
    documentType: GoogleDocType;
    documentUrl: string;
  }>
> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const documents = await db.googleDocument.findMany({
    where: {
      briefId,
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      title: true,
      documentType: true,
      documentUrl: true,
    },
  });

  return documents;
}

/**
 * Get all documents for a project
 */
export async function getProjectDocuments(projectId: string): Promise<
  Array<{
    id: string;
    title: string;
    documentType: GoogleDocType;
    documentUrl: string;
  }>
> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const documents = await db.googleDocument.findMany({
    where: {
      projectId,
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      title: true,
      documentType: true,
      documentUrl: true,
    },
  });

  return documents;
}
