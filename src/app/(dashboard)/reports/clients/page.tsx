/**
 * Client Reports Page
 *
 * Detailed performance reports for each client.
 *
 * @module app/(dashboard)/reports/clients
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getAllClientReports } from "@/modules/reporting/actions/analytics-actions";
import { ClientReportsClient } from "./ClientReportsClient";

export const metadata = {
  title: "Client Reports | SpokeStack",
  description: "Client performance and metrics",
};

export default async function ClientReportsPage() {
  const session = await auth();

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

  const reports = await getAllClientReports(session.user.organizationId, {
    from: startOfMonth,
    to: endOfMonth,
  });

  return (
    <ClientReportsClient
      reports={reports}
      currentMonth={now.toLocaleString("default", { month: "long", year: "numeric" })}
    />
  );
}
