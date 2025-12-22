/**
 * Reports Dashboard - Executive KPIs
 *
 * Main reporting hub with high-level performance metrics.
 *
 * @module app/(dashboard)/reports
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getExecutiveKPIs } from "@/modules/reporting/actions/analytics-actions";
import { ReportsDashboardClient } from "./ReportsDashboardClient";

export const metadata = {
  title: "Reports | SpokeStack",
  description: "Executive dashboard and analytics",
};

export default async function ReportsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  // Check permission
  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  // Get current month KPIs
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const kpis = await getExecutiveKPIs(session.user.organizationId, {
    from: startOfMonth,
    to: endOfMonth,
  });

  // Get previous month for comparison
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const previousKpis = await getExecutiveKPIs(session.user.organizationId, {
    from: startOfLastMonth,
    to: endOfLastMonth,
  });

  return (
    <ReportsDashboardClient
      kpis={kpis}
      previousKpis={previousKpis}
      currentMonth={now.toLocaleString("default", { month: "long", year: "numeric" })}
    />
  );
}
