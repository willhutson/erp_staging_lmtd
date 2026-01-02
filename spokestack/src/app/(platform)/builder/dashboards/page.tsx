import { getDashboards, getDashboardStats } from "@/modules/builder/actions";
import { DashboardsClient } from "./dashboards-client";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function DashboardsPage() {
  const [dashboards, stats] = await Promise.all([
    getDashboards(),
    getDashboardStats(),
  ]);

  return <DashboardsClient initialDashboards={dashboards} stats={stats} />;
}
