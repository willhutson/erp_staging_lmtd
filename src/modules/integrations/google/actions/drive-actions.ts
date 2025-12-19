"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getValidAccessToken } from "./google-auth";
import type { DriveFolderType, GoogleDocType } from "@prisma/client";

const DRIVE_API_BASE = "https://www.googleapis.com/drive/v3";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  parents?: string[];
}

interface CreateFolderInput {
  name: string;
  parentFolderId?: string;
  folderType: DriveFolderType;
  clientId?: string;
  projectId?: string;
}

/**
 * Create a folder in Google Drive
 */
export async function createDriveFolder(input: CreateFolderInput): Promise<string> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const accessToken = await getValidAccessToken(session.user.organizationId);
  if (!accessToken) {
    throw new Error("Google Drive not connected");
  }

  const metadata: Record<string, unknown> = {
    name: input.name,
    mimeType: "application/vnd.google-apps.folder",
  };

  if (input.parentFolderId) {
    metadata.parents = [input.parentFolderId];
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
    throw new Error(`Failed to create folder: ${error}`);
  }

  const folder = (await response.json()) as DriveFile;

  // Get the webViewLink
  const folderDetails = await fetch(
    `${DRIVE_API_BASE}/files/${folder.id}?fields=webViewLink`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );
  const details = (await folderDetails.json()) as DriveFile;

  // Save to our database
  await db.googleDriveFolder.create({
    data: {
      organizationId: session.user.organizationId,
      clientId: input.clientId,
      projectId: input.projectId,
      folderId: folder.id,
      name: input.name,
      parentFolderId: input.parentFolderId,
      folderType: input.folderType,
      driveUrl: details.webViewLink,
    },
  });

  return folder.id;
}

/**
 * Create the folder structure for a new client
 */
export async function createClientFolderStructure(clientId: string): Promise<void> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const client = await db.client.findUnique({
    where: { id: clientId },
  });

  if (!client || client.organizationId !== session.user.organizationId) {
    throw new Error("Client not found");
  }

  // Get or create the organization root folder
  let rootFolder = await db.googleDriveFolder.findFirst({
    where: {
      organizationId: session.user.organizationId,
      folderType: "ROOT",
    },
  });

  if (!rootFolder) {
    const rootFolderId = await createDriveFolder({
      name: "SpokeStack - Clients",
      folderType: "ROOT",
    });
    rootFolder = await db.googleDriveFolder.findUnique({
      where: { folderId: rootFolderId },
    });
  }

  // Create client folder
  const clientFolderId = await createDriveFolder({
    name: `${client.code} - ${client.name}`,
    parentFolderId: rootFolder?.folderId,
    folderType: "CLIENT",
    clientId: client.id,
  });

  // Create standard subfolders
  const subfolders = [
    { name: "Briefs", type: "BRIEFS" as DriveFolderType },
    { name: "Assets", type: "ASSETS" as DriveFolderType },
    { name: "Deliverables", type: "DELIVERABLES" as DriveFolderType },
  ];

  for (const subfolder of subfolders) {
    await createDriveFolder({
      name: subfolder.name,
      parentFolderId: clientFolderId,
      folderType: subfolder.type,
      clientId: client.id,
    });
  }
}

/**
 * Create the folder structure for a new project
 */
export async function createProjectFolderStructure(projectId: string): Promise<void> {
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

  // Find the client folder
  const clientFolder = await db.googleDriveFolder.findFirst({
    where: {
      clientId: project.clientId,
      folderType: "CLIENT",
    },
  });

  if (!clientFolder) {
    throw new Error("Client folder not found. Please create client folder structure first.");
  }

  // Create project folder
  const projectFolderId = await createDriveFolder({
    name: project.code ? `${project.code} - ${project.name}` : project.name,
    parentFolderId: clientFolder.folderId,
    folderType: "PROJECT",
    clientId: project.clientId,
    projectId: project.id,
  });

  // Create standard subfolders
  const subfolders = [
    { name: "Briefs", type: "BRIEFS" as DriveFolderType },
    { name: "Assets", type: "ASSETS" as DriveFolderType },
    { name: "Deliverables", type: "DELIVERABLES" as DriveFolderType },
  ];

  for (const subfolder of subfolders) {
    await createDriveFolder({
      name: subfolder.name,
      parentFolderId: projectFolderId,
      folderType: subfolder.type,
      projectId: project.id,
    });
  }
}

/**
 * Get folder URL for a client
 */
export async function getClientFolderUrl(clientId: string): Promise<string | null> {
  const folder = await db.googleDriveFolder.findFirst({
    where: {
      clientId,
      folderType: "CLIENT",
    },
  });

  return folder?.driveUrl || null;
}

/**
 * Get folder URL for a project
 */
export async function getProjectFolderUrl(projectId: string): Promise<string | null> {
  const folder = await db.googleDriveFolder.findFirst({
    where: {
      projectId,
      folderType: "PROJECT",
    },
  });

  return folder?.driveUrl || null;
}

/**
 * Get all folders for a client
 */
export async function getClientFolders(clientId: string): Promise<
  Array<{
    id: string;
    name: string;
    folderType: DriveFolderType;
    driveUrl: string | null;
  }>
> {
  const session = await auth();
  if (!session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  const folders = await db.googleDriveFolder.findMany({
    where: {
      clientId,
      organizationId: session.user.organizationId,
    },
    select: {
      id: true,
      name: true,
      folderType: true,
      driveUrl: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return folders;
}
