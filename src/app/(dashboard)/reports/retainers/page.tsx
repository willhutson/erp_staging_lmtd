/**
 * Retainer Health Reports Page
 *
 * Retainer usage and burn rate analytics.
 *
 * @module app/(dashboard)/reports/retainers
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getRetainerHealth } from "@/modules/reporting/actions/analytics-actions";
import { RetainerReportsClient } from "./RetainerReportsClient";

export const metadata = {
  title: "Retainer Health | SpokeStack",
  description: "Retainer usage and burn rate analytics",
};

export default async function RetainerReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  const health = await getRetainerHealth(session.user.organizationId);

  const now = new Date();

  return (
    <RetainerReportsClient
      health={health}
      currentMonth={now.toLocaleString("default", { month: "long", year: "numeric" })}
    />
  );
}
