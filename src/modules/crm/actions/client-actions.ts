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
  companySize?: CompanySize;
  website?: string;
  linkedIn?: string;
  accountManagerId?: string;
  relationshipStatus?: RelationshipStatus;
  leadSource?: LeadSource;
  notes?: string;
  // Primary contact (will create ClientContact)
  primaryContactName?: string;
  primaryContactEmail?: string;
  primaryContactPhone?: string;
  primaryContactTitle?: string;
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
      companySize: data.companySize,
      website: data.website,
      linkedIn: data.linkedIn,
      accountManagerId: data.accountManagerId || null,
      relationshipStatus: data.relationshipStatus || "ACTIVE",
      leadSource: data.leadSource,
      notes: data.notes,
    },
  });

  // Create primary contact if provided
  if (data.primaryContactName || data.primaryContactEmail) {
    await db.clientContact.create({
      data: {
        clientId: client.id,
        name: data.primaryContactName || "Primary Contact",
        email: data.primaryContactEmail,
        phone: data.primaryContactPhone,
        jobTitle: data.primaryContactTitle,
        isPrimary: true,
        isDecisionMaker: true,
      },
    });
  }

  revalidatePath("/clients");
  return client;
}

/**
 * Generate a unique client code from company name
 */
function generateClientCode(companyName: string): string {
  // Take first letters of each word, uppercase, max 5 chars
  const words = companyName.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, 4).toUpperCase();
  }
  return words
    .map((w) => w[0])
    .join("")
    .substring(0, 5)
    .toUpperCase();
}

/**
 * Convert a WON Deal to a Client
 * Creates Client, ClientContact (from deal contact), and initial Project
 */
export async function convertDealToClient(dealId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const deal = await db.deal.findUnique({
    where: {
      id: dealId,
      organizationId: session.user.organizationId,
    },
    include: {
      convertedToClient: true,
    },
  });

  if (!deal) {
    throw new Error("Deal not found");
  }

  if (deal.stage !== "WON") {
    throw new Error("Only WON deals can be converted to clients");
  }

  if (deal.convertedToClient) {
    throw new Error("This deal has already been converted to a client");
  }

  const companyName = deal.companyName || deal.name;
  let code = generateClientCode(companyName);

  // Ensure code is unique
  let counter = 1;
  while (
    await db.client.findFirst({
      where: {
        organizationId: session.user.organizationId,
        code,
      },
    })
  ) {
    code = `${generateClientCode(companyName)}${counter}`;
    counter++;
  }

  // Create client with conversion tracking
  const client = await db.client.create({
    data: {
      organizationId: session.user.organizationId,
      name: companyName,
      code,
      relationshipStatus: "ACTIVE",
      leadSource: deal.source,
      convertedFromDealId: deal.id,
      convertedAt: new Date(),
      accountManagerId: deal.ownerId,
      lifetimeValue: deal.value,
    },
  });

  // Create ClientContact from deal contact info
  if (deal.contactName || deal.contactEmail) {
    await db.clientContact.create({
      data: {
        clientId: client.id,
        name: deal.contactName || "Primary Contact",
        email: deal.contactEmail,
        isPrimary: true,
        isDecisionMaker: true,
      },
    });
  }

  // Create initial Project
  await db.project.create({
    data: {
      organizationId: session.user.organizationId,
      clientId: client.id,
      name: `${client.name} - Initial Project`,
      type: "PROJECT",
      status: "ACTIVE",
      budgetAmount: deal.value,
    },
  });

  // Update deal with close date
  await db.deal.update({
    where: { id: dealId },
    data: {
      actualCloseDate: new Date(),
    },
  });

  revalidatePath("/pipeline");
  revalidatePath("/clients");
  return client;
}

/**
 * Convert a WON RFP to a Client
 * Creates Client and initial Project
 */
export async function convertRfpToClient(rfpId: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const rfp = await db.rFP.findUnique({
    where: {
      id: rfpId,
      organizationId: session.user.organizationId,
    },
    include: {
      convertedToClient: true,
    },
  });

  if (!rfp) {
    throw new Error("RFP not found");
  }

  if (rfp.status !== "WON") {
    throw new Error("Only WON RFPs can be converted to clients");
  }

  if (rfp.convertedToClient) {
    throw new Error("This RFP has already been converted to a client");
  }

  let code = generateClientCode(rfp.clientName);

  // Ensure code is unique
  let counter = 1;
  while (
    await db.client.findFirst({
      where: {
        organizationId: session.user.organizationId,
        code,
      },
    })
  ) {
    code = `${generateClientCode(rfp.clientName)}${counter}`;
    counter++;
  }

  // Create client with conversion tracking
  const client = await db.client.create({
    data: {
      organizationId: session.user.organizationId,
      name: rfp.clientName,
      code,
      industry: "Government", // RFPs are typically government
      relationshipStatus: "ACTIVE",
      leadSource: "RFP_PORTAL",
      convertedFromRfpId: rfp.id,
      convertedAt: new Date(),
      lifetimeValue: rfp.estimatedValue,
    },
  });

  // Create initial Project from RFP scope
  await db.project.create({
    data: {
      organizationId: session.user.organizationId,
      clientId: client.id,
      name: rfp.name.replace("RFP – ", "").replace("RFP - ", ""),
      type: "PROJECT",
      status: "ACTIVE",
      budgetAmount: rfp.estimatedValue,
      description: rfp.scopeOfWork,
    },
  });

  // Update RFP outcome
  await db.rFP.update({
    where: { id: rfpId },
    data: {
      outcome: "WON",
    },
  });

  revalidatePath("/rfp");
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
