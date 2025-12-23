"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function updateBriefAssignee(briefId: string, assigneeId: string | null) {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  if (!can(session.user as Parameters<typeof can>[0], "brief:assign")) {
    throw new Error("You don't have permission to assign briefs");
  }

  // Verify brief belongs to org
  const brief = await db.brief.findFirst({
    where: { id: briefId, organizationId: session.user.organizationId },
  });

  if (!brief) {
    throw new Error("Brief not found");
  }

  // Verify assignee belongs to org (if provided)
  if (assigneeId) {
    const assignee = await db.user.findFirst({
      where: { id: assigneeId, organizationId: session.user.organizationId },
    });
    if (!assignee) {
      throw new Error("Assignee not found");
    }
  }

  const updated = await db.brief.update({
    where: { id: briefId },
    data: {
      assigneeId,
      assignedById: session.user.id,
      assignedAt: new Date(),
    },
    include: {
      assignee: { select: { id: true, name: true } },
      assignedBy: { select: { id: true, name: true } },
    },
  });

  revalidatePath(`/briefs/${briefId}`);
  revalidatePath("/briefs");

  return updated;
}
