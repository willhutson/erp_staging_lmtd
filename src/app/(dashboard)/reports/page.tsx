/**
 * Reports Dashboard - Coming Soon
 *
 * Placeholder for the reporting module while under development.
 *
 * @module app/(dashboard)/reports
 */

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { BarChart3, TrendingUp, Users, Clock } from "lucide-react";
import { PageShell } from "@/components/ltd/patterns/page-shell";

export const metadata = {
  title: "Reports | SpokeStack",
  description: "Executive dashboard and analytics",
};

export default async function ReportsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check permission
  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    redirect("/dashboard");
  }

  const features = [
    {
      icon: BarChart3,
      title: "Executive KPIs",
      description: "High-level performance metrics and trends across all operations",
    },
    {
      icon: Users,
      title: "Client Reports",
      description: "Per-client analytics including hours, briefs, and retainer health",
    },
    {
      icon: TrendingUp,
      title: "Team Productivity",
      description: "Individual and team performance, utilization, and capacity",
    },
    {
      icon: Clock,
      title: "Content Metrics",
      description: "Publishing analytics, approval times, and platform performance",
    },
  ];

  return (
    <PageShell
      title="Reports"
      description="Executive dashboard and analytics"
    >
      <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-12">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-full bg-ltd-primary/10 flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-8 h-8 text-ltd-primary" />
          </div>

          <h2 className="text-2xl font-bold text-ltd-text-1 mb-3">
            Reports Coming Soon
          </h2>

          <p className="text-ltd-text-2 mb-8">
            We&apos;re building comprehensive reporting and analytics tools to give you
            deep insights into your agency&apos;s performance.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="p-4 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-2 opacity-60"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-ltd-surface-3 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-ltd-text-2" />
                    </div>
                    <div>
                      <p className="font-medium text-ltd-text-1">{feature.title}</p>
                      <p className="text-sm text-ltd-text-3 mt-0.5">{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
