import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getComplaints, getComplaintStats } from "@/modules/complaints/actions/complaint-actions";
import Link from "next/link";
import { ChevronLeft, Star, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IssuesDashboardClient } from "./IssuesDashboardClient";

export const dynamic = "force-dynamic";

export default async function IssuesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  const [complaints, stats] = await Promise.all([
    getComplaints({ limit: 50 }),
    getComplaintStats(),
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/feedback">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4 mr-1" />
            Client Health
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Issues</h1>
          <p className="text-gray-500 mt-1">
            Track and resolve client issues from all channels
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-gray-200 pb-4">
        <Link href="/feedback">
          <Button variant="outline">Overview</Button>
        </Link>
        <Link href="/feedback/nps">
          <Button variant="outline">
            <Star className="h-4 w-4 mr-2" />
            NPS Surveys
          </Button>
        </Link>
        <Link href="/feedback/issues">
          <Button variant="default" className="bg-[#52EDC7] text-gray-900 hover:bg-[#1BA098] hover:text-white">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Issues
          </Button>
        </Link>
      </div>

      <IssuesDashboardClient
        complaints={complaints}
        stats={stats}
      />
    </div>
  );
}
