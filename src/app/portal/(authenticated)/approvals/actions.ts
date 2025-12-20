"use server";

import { db } from "@/lib/db";
import { getPortalUser } from "@/lib/portal/auth";
import { revalidatePath } from "next/cache";

export async function submitApproval(data: {
  approvalId?: string;
  briefId: string;
  userId: string;
  approved: boolean;
  feedback?: string;
  rating?: number;
}) {
  const user = await getPortalUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    // Update the brief status based on approval
    const newStatus = data.approved ? "COMPLETED" : "REVISIONS";

    await db.brief.update({
      where: { id: data.briefId },
      data: {
        status: newStatus,
        ...(data.approved && { completedAt: new Date() }),
      },
    });

    // Record the approval/rejection
    if (data.approvalId) {
      await db.submissionApproval.update({
        where: { id: data.approvalId },
        data: {
          status: data.approved ? "APPROVED" : "REVISION_REQUESTED",
          approvedById: user.id,
          feedback: data.feedback,
          rating: data.rating,
          respondedAt: new Date(),
          ...(data.feedback && !data.approved && { revisionNotes: data.feedback }),
        },
      });
    } else {
      // Create a new approval record
      await db.submissionApproval.create({
        data: {
          organizationId: user.organizationId,
          briefId: data.briefId,
          submissionType: "final",
          status: data.approved ? "APPROVED" : "REVISION_REQUESTED",
          approvedById: user.id,
          feedback: data.feedback,
          rating: data.rating,
          respondedAt: new Date(),
          ...(data.feedback && !data.approved && { revisionNotes: data.feedback }),
        },
      });
    }

    // Add a comment if feedback was provided
    if (data.feedback) {
      await db.clientPortalComment.create({
        data: {
          organizationId: user.organizationId,
          briefId: data.briefId,
          content: data.feedback,
          authorId: user.id,
        },
      });
    }

    revalidatePath("/portal/approvals");
    revalidatePath("/portal/briefs");
    revalidatePath("/portal");

    return { success: true };
  } catch (error) {
    console.error("Approval error:", error);
    return { success: false, error: "Failed to submit approval" };
  }
}
