"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { CompanySize, LeadSource, RelationshipStatus } from "@prisma/client";

interface CreateClientData {
  name: string;
  code: string;
  industry?: string;
  isRetainer?: boolean;
  retainerHours?: number;
  contactName?: string;
  contactEmail?: string;
  companySize?: CompanySize;
  website?: string;
  linkedIn?: string;
  accountManagerId?: string;
  relationshipStatus?: RelationshipStatus;
  leadSource?: LeadSource;
  notes?: string;
}

export async function createClient(data: CreateClientData) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check for duplicate code
  const existing = await db.client.findFirst({
    where: {
      organizationId: session.user.organizationId,
      code: data.code.toUpperCase(),
    },
  });

  if (existing) {
    throw new Error("A client with this code already exists");
  }

  const client = await db.client.create({
    data: {
      organizationId: session.user.organizationId,
      name: data.name,
      code: data.code.toUpperCase(),
      industry: data.industry,
      isRetainer: data.isRetainer || false,
      retainerHours: data.retainerHours,
      contactName: data.contactName,
      contactEmail: data.contactEmail,
      companySize: data.companySize,
      website: data.website,
      linkedIn: data.linkedIn,
      accountManagerId: data.accountManagerId || null,
      relationshipStatus: data.relationshipStatus || "ACTIVE",
      leadSource: data.leadSource,
      notes: data.notes,
    },
  });

  revalidatePath("/clients");
  return client;
}

export async function updateClient(clientId: string, data: Partial<CreateClientData>) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const client = await db.client.update({
    where: {
      id: clientId,
      organizationId: session.user.organizationId,
    },
    data: {
      ...data,
      code: data.code?.toUpperCase(),
    },
  });

  revalidatePath("/clients");
  revalidatePath(`/clients/${clientId}`);
  return client;
}

export async function deleteClient(clientId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Check if client has any briefs
  const briefCount = await db.brief.count({
    where: { clientId },
  });

  if (briefCount > 0) {
    throw new Error("Cannot delete client with existing briefs");
  }

  await db.client.delete({
    where: {
      id: clientId,
      organizationId: session.user.organizationId,
    },
  });

  revalidatePath("/clients");
}

export async function getAccountManagers() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  return db.user.findMany({
    where: {
      organizationId: session.user.organizationId,
      department: "Client Servicing",
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });
}
