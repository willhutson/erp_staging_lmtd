"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { BriefStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function updateBriefStatus(briefId: string, newStatus: BriefStatus) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const brief = await db.brief.findUnique({
    where: { id: briefId },
  });

  if (!brief || brief.organizationId !== session.user.organizationId) {
    throw new Error("Brief not found");
  }

  const oldStatus = brief.status;

  // Update the brief status
  await db.brief.update({
    where: { id: briefId },
    data: {
      status: newStatus,
      completedAt: newStatus === "COMPLETED" ? new Date() : brief.completedAt,
    },
  });

  // Log status history
  await db.briefStatusHistory.create({
    data: {
      briefId,
      fromStatus: oldStatus,
      toStatus: newStatus,
      changedById: session.user.id,
    },
  });

  revalidatePath("/resources");
  revalidatePath("/briefs");

  return { success: true };
}
