"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function submitClientFeedback(
  briefId: string,
  action: "approve" | "revisions",
  feedback?: string
) {
  const brief = await db.brief.findUnique({
    where: { id: briefId },
    include: { client: true },
  });

  if (!brief) {
    throw new Error("Brief not found");
  }

  if (brief.status !== "CLIENT_REVIEW") {
    throw new Error("Brief is not in client review status");
  }

  const newStatus = action === "approve" ? "COMPLETED" : "REVISIONS";

  // Update brief status
  await db.brief.update({
    where: { id: briefId },
    data: {
      status: newStatus,
      completedAt: action === "approve" ? new Date() : null,
    },
  });

  // Add status history
  await db.briefStatusHistory.create({
    data: {
      briefId,
      fromStatus: "CLIENT_REVIEW",
      toStatus: newStatus,
      changedById: brief.createdById, // Use the brief creator as fallback
      notes:
        action === "approve"
          ? `Client approved${feedback ? `: ${feedback}` : ""}`
          : `Client requested revisions: ${feedback}`,
    },
  });

  // Add comment if there's feedback
  if (feedback?.trim()) {
    await db.comment.create({
      data: {
        briefId,
        userId: brief.createdById, // Use the brief creator as fallback
        content: `[Client Feedback] ${feedback}`,
      },
    });
  }

  revalidatePath(`/portal/${brief.client.code.toLowerCase()}`);
  revalidatePath(`/portal/${brief.client.code.toLowerCase()}/${briefId}`);
  revalidatePath(`/briefs/${briefId}`);
}
