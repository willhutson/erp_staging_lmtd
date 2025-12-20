import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AnalyticsDashboard } from "./components/AnalyticsDashboard";

export const metadata: Metadata = {
  title: "Analytics | TeamLMTD",
  description: "Analytics and insights dashboard",
};

export default async function AnalyticsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Only leadership and above can access analytics
  const allowedLevels = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"];
  if (!allowedLevels.includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Insights and performance metrics across the organization
        </p>
      </div>

      <AnalyticsDashboard
        organizationId={session.user.organizationId}
        userLevel={session.user.permissionLevel}
      />
    </div>
  );
}
