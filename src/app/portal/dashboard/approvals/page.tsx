import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import { ApprovalsClient } from "./ApprovalsClient";
import { CheckCircle } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function PortalApprovalsPage() {
  const user = await getPortalUser();

  if (!user) {
    return null;
  }

  // Get briefs awaiting client review
  const briefsForReview = await db.brief.findMany({
    where: {
      clientId: user.clientId,
      status: "CLIENT_REVIEW",
    },
    orderBy: { updatedAt: "desc" },
    include: {
      assignee: { select: { id: true, name: true } },
      briefFiles: {
        where: { role: "deliverable" },
        include: {
          file: true,
        },
      },
    },
  });

  // Get pending submission approvals
  const pendingApprovals = await db.submissionApproval.findMany({
    where: {
      organizationId: user.organizationId,
      status: "PENDING",
    },
    orderBy: { requestedAt: "desc" },
  });

  // Get brief IDs for pending approvals
  const briefIds = pendingApprovals.map((a) => a.briefId);
  const briefsWithApprovals = await db.brief.findMany({
    where: { id: { in: briefIds } },
    include: {
      assignee: { select: { id: true, name: true } },
    },
  });

  // Combine into approval items
  const approvalItems = pendingApprovals.map((approval) => ({
    ...approval,
    brief: briefsWithApprovals.find((b) => b.id === approval.briefId),
  }));

  const hasItems = briefsForReview.length > 0 || approvalItems.length > 0;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 mt-1">
          Review and approve deliverables from your team
        </p>
      </div>

      {!hasItems ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500">
            You don&apos;t have any pending approvals right now
          </p>
        </div>
      ) : (
        <ApprovalsClient
          briefsForReview={briefsForReview}
          approvalItems={approvalItems}
          userId={user.id}
        />
      )}
    </div>
  );
}
