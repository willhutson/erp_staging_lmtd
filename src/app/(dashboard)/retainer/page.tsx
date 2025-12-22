import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getRetainerDashboard, getRetainerTrends } from "@/modules/retainer/actions/retainer-period-actions";
import { RetainerDashboardClient } from "./RetainerDashboardClient";

export const dynamic = "force-dynamic";

export default async function RetainerDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [dashboardData, trends] = await Promise.all([
    getRetainerDashboard(currentYear, currentMonth),
    getRetainerTrends(6),
  ]);

  // Transform periods to match client component types
  const dashboard = {
    ...dashboardData,
    periods: dashboardData.periods.map((p) => ({
      ...p,
      budgetHours: p.budgetHours ? Number(p.budgetHours) : null,
      budgetValue: p.budgetValue ? Number(p.budgetValue) : null,
      contractValue: p.contractValue ? Number(p.contractValue) : null,
      actualHours: Number(p.actualHours),
      actualCost: Number(p.actualCost),
      burnRate: p.burnRate ? Number(p.burnRate) : null,
      marginPercent: p.marginPercent ? Number(p.marginPercent) : null,
      deliverableBreakdown: p.deliverableBreakdown as Record<string, number> | null,
    })),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Retainer Burn Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Track deliverable output and margin across client retainers
        </p>
      </div>

      <RetainerDashboardClient
        dashboard={dashboard}
        trends={trends}
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
    </div>
  );
}
