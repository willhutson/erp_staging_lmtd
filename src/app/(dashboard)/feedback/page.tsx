import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getNPSStats } from "@/modules/nps/actions/nps-actions";
import { getComplaintStats } from "@/modules/complaints/actions/complaint-actions";
import { FeedbackDashboardClient } from "./FeedbackDashboardClient";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  const currentYear = new Date().getFullYear();

  // Gather unified feedback data
  const [npsStats, issueStats, recentIssues, recentNPSResponses] = await Promise.all([
    getNPSStats(session.user.organizationId, currentYear),
    getComplaintStats(),
    // Recent issues
    db.clientComplaint.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        client: { select: { id: true, name: true, code: true } },
        npsResponse: { select: { score: true, category: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    // Recent NPS responses (especially detractors)
    db.nPSResponse.findMany({
      where: {
        survey: {
          organizationId: session.user.organizationId,
          status: "COMPLETED",
        },
      },
      include: {
        survey: {
          include: {
            client: { select: { id: true, name: true, code: true } },
          },
        },
        contact: { select: { name: true } },
      },
      orderBy: { submittedAt: "desc" },
      take: 10,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Health</h1>
        <p className="text-gray-500 mt-1">
          Unified view of client sentiment and relationship health
        </p>
      </div>

      <FeedbackDashboardClient
        npsStats={npsStats}
        issueStats={issueStats}
        recentIssues={recentIssues}
        recentNPSResponses={recentNPSResponses}
      />
    </div>
  );
}
