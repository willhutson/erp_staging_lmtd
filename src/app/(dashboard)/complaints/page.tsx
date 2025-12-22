import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getComplaints, getComplaintStats } from "@/modules/complaints/actions/complaint-actions";
import { ComplaintsDashboardClient } from "./ComplaintsDashboardClient";

export const dynamic = "force-dynamic";

export default async function ComplaintsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check permission - Leadership and above
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  const [complaints, stats] = await Promise.all([
    getComplaints({ limit: 50 }),
    getComplaintStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-500 mt-1">
          Track and resolve client complaints from all channels
        </p>
      </div>

      <ComplaintsDashboardClient
        complaints={complaints}
        stats={stats}
      />
    </div>
  );
}
