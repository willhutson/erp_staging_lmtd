"use server";

import { db } from "@/lib/db";
import { requirePortalAuth } from "@/lib/portal/auth";
import { revalidatePath } from "next/cache";
import {
  emitDeliverableStatusChanged,
  emitDeliverableApproved,
  emitDeliverableRevisionRequested,
} from "@/modules/content-engine/services/workflow-events";

/**
 * Submit client feedback on a deliverable (approve or request revisions)
 */
export async function submitDeliverableFeedback(
  deliverableId: string,
  action: "approve" | "revisions",
  feedback?: string
) {
  const user = await requirePortalAuth();

  // Get the deliverable and verify it belongs to the client
  const deliverable = await db.deliverable.findUnique({
    where: { id: deliverableId },
    include: {
      brief: {
        include: { client: true },
      },
    },
  });

  if (!deliverable) {
    throw new Error("Deliverable not found");
  }

  if (deliverable.brief.clientId !== user.clientId) {
    throw new Error("Unauthorized: This deliverable does not belong to your organization");
  }

  if (deliverable.status !== "CLIENT_REVIEW") {
    throw new Error("This deliverable is not awaiting your review");
  }

  const previousStatus = deliverable.status;
  const newStatus = action === "approve" ? "APPROVED" : "CLIENT_REVISION";

  // Update the deliverable
  await db.deliverable.update({
    where: { id: deliverableId },
    data: {
      status: newStatus,
      clientFeedback: feedback || null,
      clientReviewedAt: new Date(),
      approvedAt: action === "approve" ? new Date() : null,
      // Increment version if requesting revisions
      ...(action === "revisions" && { version: { increment: 1 } }),
    },
  });

  // Create a comment with the feedback
  if (feedback?.trim()) {
    // Find a user in the organization to attribute the comment to
    // (using the brief creator as fallback since portal users aren't in the User table)
    await db.comment.create({
      data: {
        briefId: deliverable.briefId,
        userId: deliverable.brief.createdById,
        content: `[Client Portal - ${user.name}] ${action === "approve" ? "Approved" : "Requested revisions"}: ${feedback}`,
      },
    });
  }

  // Emit events
  await emitDeliverableStatusChanged(deliverableId, previousStatus, newStatus);
  if (action === "approve") {
    await emitDeliverableApproved(deliverableId, "CLIENT", feedback);
  } else {
    await emitDeliverableRevisionRequested(deliverableId, "CLIENT", feedback);
  }

  // Revalidate paths
  revalidatePath("/portal/dashboard/deliverables");
  revalidatePath(`/portal/dashboard/deliverables/${deliverableId}`);
  revalidatePath(`/content-engine/deliverables/${deliverableId}`);
  revalidatePath(`/briefs/${deliverable.briefId}`);
}
