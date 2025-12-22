/**
 * Content Metrics Reports Page
 *
 * Content performance and publishing analytics.
 *
 * @module app/(dashboard)/reports/content
 */

import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getContentMetrics } from "@/modules/reporting/actions/analytics-actions";
import { ContentReportsClient } from "./ContentReportsClient";

export const metadata = {
  title: "Content Metrics | SpokeStack",
  description: "Content performance and publishing analytics",
};

export default async function ContentReportsPage() {
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

  const metrics = await getContentMetrics(session.user.organizationId, {
    from: startOfMonth,
    to: endOfMonth,
  });

  return (
    <ContentReportsClient
      metrics={metrics}
      currentMonth={now.toLocaleString("default", { month: "long", year: "numeric" })}
    />
  );
}
