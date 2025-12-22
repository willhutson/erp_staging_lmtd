"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import type { BriefType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { emitBriefCreated } from "@/modules/content-engine/services/workflow-events";
import { onBriefCreated } from "@/modules/chat/services/module-integrations";

interface CreateBriefInput {
  type: BriefType;
  clientId: string;
  topic: string;
  assigneeId?: string;
  formData: Record<string, unknown>;
}

export async function createBrief(input: CreateBriefInput) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!can(session.user as Parameters<typeof can>[0], "brief:create")) {
    throw new Error("You don't have permission to create briefs");
  }

  const { type, clientId, topic, assigneeId, formData } = input;

  // Get client for title generation
  const client = await db.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new Error("Client not found");
  }

  // Generate brief number
  const briefNumber = await generateBriefNumber(session.user.organizationId);

  // Generate title based on naming convention
  const title = generateTitle(type, client.code, topic);

  // Create the brief
  const brief = await db.brief.create({
    data: {
      organizationId: session.user.organizationId,
      clientId,
      type,
      briefNumber,
      title,
      status: "SUBMITTED",
      priority: "MEDIUM",
      createdById: session.user.id,
      assigneeId: assigneeId || null,
      formData: formData as object,
      submittedAt: new Date(),
    },
  });

  // Log status history
  await db.briefStatusHistory.create({
    data: {
      briefId: brief.id,
      fromStatus: null,
      toStatus: "SUBMITTED",
      changedById: session.user.id,
      notes: "Brief created and submitted",
    },
  });

  // Emit creation event
  await emitBriefCreated({
    id: brief.id,
    title: brief.title,
    type: brief.type,
    status: brief.status,
    clientId: brief.clientId,
    assigneeId: brief.assigneeId,
  });

  // Post to SpokeChat
  await onBriefCreated({
    id: brief.id,
    organizationId: session.user.organizationId,
    title: brief.title,
    type: brief.type,
    clientId: brief.clientId,
    createdById: session.user.id,
    assigneeId: brief.assigneeId,
  });

  revalidatePath("/briefs");

  return brief;
}

async function generateBriefNumber(organizationId: string): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = "LMTD";

  // Get the count of briefs this year
  const count = await db.brief.count({
    where: {
      organizationId,
      briefNumber: {
        startsWith: `${prefix}-${year}`,
      },
    },
  });

  const number = (count + 1).toString().padStart(3, "0");
  return `${prefix}-${year}-${number}`;
}

function generateTitle(type: BriefType, clientCode: string, topic: string): string {
  const prefixMap: Record<BriefType, string> = {
    VIDEO_SHOOT: "Shoot",
    VIDEO_EDIT: "Edit",
    DESIGN: "Design",
    COPYWRITING_EN: "Copy",
    COPYWRITING_AR: "Copy",
    PAID_MEDIA: "Paid Media",
    REPORT: "Report",
  };

  const prefix = prefixMap[type];
  return `${prefix}: ${clientCode} – ${topic}`;
}
