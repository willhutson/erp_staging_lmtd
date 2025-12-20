import { getDashboardLayout } from "@/modules/dashboard/actions/dashboard-actions";
import { DashboardGrid } from "@/modules/dashboard/components/DashboardGrid";

export default async function DashboardPage() {
  const layout = await getDashboardLayout();

  return <DashboardGrid initialLayout={layout} />;
}
