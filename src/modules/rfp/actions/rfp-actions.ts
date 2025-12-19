"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import type { RFPStatus, RFPOutcome } from "@prisma/client";

interface CreateRFPInput {
  name: string;
  clientName: string;
  portal?: string;
  deadline: Date;
  estimatedValue?: number;
  scopeOfWork?: string;
  requirements?: string;
  bidBondRequired?: boolean;
  notes?: string;
}

export async function createRFP(input: CreateRFPInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!can(session.user as Parameters<typeof can>[0], "rfp:create")) {
    throw new Error("You don't have permission to create RFPs");
  }

  const rfp = await db.rFP.create({
    data: {
      organizationId: session.user.organizationId,
      name: `RFP – ${input.clientName}`,
      clientName: input.clientName,
      portal: input.portal,
      status: "VETTING",
      deadline: input.deadline,
      estimatedValue: input.estimatedValue,
      scopeOfWork: input.scopeOfWork,
      requirements: input.requirements,
      bidBondRequired: input.bidBondRequired ?? false,
      notes: input.notes,
      createdById: session.user.id,
      dateReceived: new Date(),
    },
  });

  // Auto-create standard subitems
  const standardSubitems = [
    "Review RFP requirements",
    "Assign team members",
    "Prepare proposal outline",
    "Create budget estimate",
    "Design presentation",
    "Internal review",
    "Final submission",
  ];

  await db.rFPSubitem.createMany({
    data: standardSubitems.map((name, index) => ({
      rfpId: rfp.id,
      name,
      status: "PENDING",
      sortOrder: index,
    })),
  });

  revalidatePath("/rfp");
  return rfp;
}

export async function updateRFPStatus(rfpId: string, status: RFPStatus) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const rfp = await db.rFP.findUnique({
    where: { id: rfpId },
  });

  if (!rfp || rfp.organizationId !== session.user.organizationId) {
    throw new Error("RFP not found");
  }

  const updated = await db.rFP.update({
    where: { id: rfpId },
    data: {
      status,
      submittedAt: status === "SUBMITTED" ? new Date() : rfp.submittedAt,
    },
  });

  revalidatePath("/rfp");
  return updated;
}

export async function recordRFPOutcome(
  rfpId: string,
  outcome: RFPOutcome,
  notes?: string
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const rfp = await db.rFP.findUnique({
    where: { id: rfpId },
  });

  if (!rfp || rfp.organizationId !== session.user.organizationId) {
    throw new Error("RFP not found");
  }

  const finalStatus = outcome === "WON" ? "WON" : "LOST";

  const updated = await db.rFP.update({
    where: { id: rfpId },
    data: {
      status: finalStatus,
      outcome,
      outcomeNotes: notes,
    },
  });

  revalidatePath("/rfp");
  return updated;
}

export async function updateSubitemStatus(
  subitemId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED"
) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const updated = await db.rFPSubitem.update({
    where: { id: subitemId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath("/rfp");
  return updated;
}
