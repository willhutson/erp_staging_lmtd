import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import { PortalDashboardClient } from "./PortalDashboardClient";

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

  // Stats
  const inProgressCount = briefs.filter((b) =>
    ["IN_PROGRESS", "INTERNAL_REVIEW"].includes(b.status)
  ).length;
  const awaitingReviewCount = briefs.filter(
    (b) => b.status === "CLIENT_REVIEW"
  ).length;
  const completedCount = briefs.filter((b) => b.status === "COMPLETED").length;

  return (
    <PortalDashboardClient
      userName={user.name.split(" ")[0]}
      briefs={briefs.map((b) => ({
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
    />
  );
}
