"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { DealStage, LeadSource } from "@prisma/client";

interface CreateDealInput {
  name: string;
  clientId?: string;
  companyName?: string;
  contactName?: string;
  contactEmail?: string;
  value?: number;
  source?: LeadSource;
  expectedCloseDate?: Date;
  notes?: string;
}

export async function createDeal(input: CreateDealInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const deal = await db.deal.create({
    data: {
      organizationId: session.user.organizationId,
      name: input.name,
      clientId: input.clientId,
      companyName: input.companyName,
      contactName: input.contactName,
      contactEmail: input.contactEmail,
      value: input.value,
      source: input.source,
      expectedCloseDate: input.expectedCloseDate,
      notes: input.notes,
      ownerId: session.user.id,
      stage: "LEAD",
      probability: 10,
    },
  });

  revalidatePath("/pipeline");
  return deal;
}

export async function updateDealStage(dealId: string, stage: DealStage) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const deal = await db.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal || deal.organizationId !== session.user.organizationId) {
    throw new Error("Deal not found");
  }

  // Update probability based on stage
  const stageProbability: Record<DealStage, number> = {
    LEAD: 10,
    RFP_INVITE: 30,
    RFP_SUBMITTED: 50,
    WON: 100,
    LOST: 0,
  };

  const updated = await db.deal.update({
    where: { id: dealId },
    data: {
      stage,
      probability: stageProbability[stage],
      actualCloseDate: ["WON", "LOST"].includes(stage) ? new Date() : null,
    },
  });

  revalidatePath("/pipeline");
  return updated;
}

export async function updateDeal(
  dealId: string,
  data: {
    name?: string;
    value?: number;
    expectedCloseDate?: Date;
    notes?: string;
    lostReason?: string;
  }
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const deal = await db.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal || deal.organizationId !== session.user.organizationId) {
    throw new Error("Deal not found");
  }

  const updated = await db.deal.update({
    where: { id: dealId },
    data,
  });

  revalidatePath("/pipeline");
  return updated;
}

export async function convertDealToClient(dealId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const deal = await db.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal || deal.organizationId !== session.user.organizationId) {
    throw new Error("Deal not found");
  }

  if (deal.clientId) {
    throw new Error("Deal already has a client");
  }

  // Generate client code
  const companyName = deal.companyName || deal.name;
  const code = companyName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 4);

  // Check for duplicate code
  const existing = await db.client.findFirst({
    where: {
      organizationId: session.user.organizationId,
      code,
    },
  });

  const finalCode = existing ? `${code}${Date.now().toString().slice(-3)}` : code;

  // Create client
  const client = await db.client.create({
    data: {
      organizationId: session.user.organizationId,
      name: companyName,
      code: finalCode,
      contactName: deal.contactName,
      contactEmail: deal.contactEmail,
      leadSource: deal.source,
      relationshipStatus: "ACTIVE",
      accountManagerId: deal.ownerId,
    },
  });

  // Update deal with client reference
  await db.deal.update({
    where: { id: dealId },
    data: {
      clientId: client.id,
      stage: "WON",
      probability: 100,
      actualCloseDate: new Date(),
    },
  });

  // Create initial contact if we have contact info
  if (deal.contactName) {
    await db.clientContact.create({
      data: {
        clientId: client.id,
        name: deal.contactName,
        email: deal.contactEmail,
        isPrimary: true,
        isDecisionMaker: true,
      },
    });
  }

  revalidatePath("/pipeline");
  revalidatePath("/clients");
  return client;
}

export async function deleteDeal(dealId: string) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const deal = await db.deal.findUnique({
    where: { id: dealId },
  });

  if (!deal || deal.organizationId !== session.user.organizationId) {
    throw new Error("Deal not found");
  }

  await db.deal.delete({
    where: { id: dealId },
  });

  revalidatePath("/pipeline");
}
