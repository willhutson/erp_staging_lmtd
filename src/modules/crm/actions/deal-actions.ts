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
    PITCH: 30,
    NEGOTIATION: 60,
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
