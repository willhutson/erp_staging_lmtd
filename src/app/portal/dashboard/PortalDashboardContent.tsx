import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import { PortalDashboardClient } from "./PortalDashboardClient";

// Inferred types
type BriefWithAssignee = Awaited<ReturnType<typeof db.brief.findMany<{
  include: { assignee: { select: { name: true } } }
}>>>[number];

type DeliverableWithBrief = Awaited<ReturnType<typeof db.deliverable.findMany<{
  include: { brief: { select: { title: true } } }
}>>>[number];

export async function PortalDashboardContent() {
  const user = await getPortalUser();

  if (!user) {
    return null;
  }

  // Get briefs for this client
  const briefs = await db.brief.findMany({
    where: {
      clientId: user.clientId,
      status: { not: "CANCELLED" },
    },
    orderBy: { updatedAt: "desc" },
    take: 10,
    include: {
      assignee: { select: { name: true } },
    },
  });

  // Get pending approvals count
  const pendingApprovalsCount = await db.submissionApproval.count({
    where: {
      organizationId: user.organizationId,
      status: "PENDING",
    },
  });

  // Get deliverables for this client (visible statuses only)
  const deliverables = await db.deliverable.findMany({
    where: {
      brief: { clientId: user.clientId },
      status: { in: ["CLIENT_REVIEW", "CLIENT_REVISION", "APPROVED", "DELIVERED"] },
    },
    orderBy: { updatedAt: "desc" },
    take: 5,
    include: {
      brief: { select: { title: true } },
    },
  });

  // Deliverables awaiting client review
  const deliverablesAwaitingReview = deliverables.filter(
    (d: DeliverableWithBrief) => d.status === "CLIENT_REVIEW"
  );

  // Stats
  const inProgressCount = briefs.filter((b: BriefWithAssignee) =>
    ["IN_PROGRESS", "INTERNAL_REVIEW"].includes(b.status)
  ).length;
  const awaitingReviewCount = briefs.filter(
    (b: BriefWithAssignee) => b.status === "CLIENT_REVIEW"
  ).length;
  const completedCount = briefs.filter((b: BriefWithAssignee) => b.status === "COMPLETED").length;

  return (
    <PortalDashboardClient
      userName={user.name.split(" ")[0]}
      briefs={briefs.map((b: BriefWithAssignee) => ({
        id: b.id,
        title: b.title,
        type: b.type,
        status: b.status,
        updatedAt: b.updatedAt,
        assignee: b.assignee,
      }))}
      pendingApprovalsCount={pendingApprovalsCount}
      inProgressCount={inProgressCount}
      awaitingReviewCount={awaitingReviewCount}
      completedCount={completedCount}
      deliverablesAwaitingReview={deliverablesAwaitingReview.map((d: DeliverableWithBrief) => ({
        id: d.id,
        title: d.title,
        type: d.type,
        briefTitle: d.brief.title,
        updatedAt: d.updatedAt,
      }))}
    />
  );
}
