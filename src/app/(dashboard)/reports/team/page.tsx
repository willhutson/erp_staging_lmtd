/**
 * Team Productivity Reports Page
 *
 * Team member productivity and utilization metrics.
 *
 * @module app/(dashboard)/reports/team
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getTeamProductivity } from "@/modules/reporting/actions/analytics-actions";
import { TeamReportsClient } from "./TeamReportsClient";

export const metadata = {
  title: "Team Productivity | SpokeStack",
  description: "Team utilization and productivity metrics",
};

export default async function TeamReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const productivity = await getTeamProductivity(session.user.organizationId, {
    from: startOfMonth,
    to: endOfMonth,
  });

  return (
    <TeamReportsClient
      productivity={productivity}
      currentMonth={now.toLocaleString("default", { month: "long", year: "numeric" })}
    />
  );
}
