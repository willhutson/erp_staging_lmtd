"use client"

import { PageShell } from "@/components/ltd/patterns/page-shell"
import { Card } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Target, Zap, BarChart3 } from "lucide-react"

const kpis = [
  { label: "Total Spend", value: "$324,450", change: 12.5, icon: DollarSign, color: "ltd-brand-accent-secondary" },
  { label: "Total Revenue", value: "$1.2M", change: 18.2, icon: TrendingUp, color: "ltd-state-success" },
  { label: "Average ROAS", value: "3.7x", change: 8.1, icon: Target, color: "ltd-primary" },
  { label: "Active Campaigns", value: "28", change: 0, icon: Zap, color: "ltd-brand-accent" },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function PerformancePage() {
  return (
    <PageShell breadcrumbs={[{ label: "Performance" }]} title="Performance Dashboard">
      <div className="space-y-6">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon
            return (
              <Card
                key={kpi.label}
                className="p-5 bg-gradient-to-br from-card to-ltd-surface-2 border-2 border-ltd-border-1 rounded-[var(--ltd-radius-lg)] shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`rounded-lg bg-${kpi.color}/10 p-2`}>
                    <Icon className={`h-5 w-5 text-${kpi.color}`} style={{ color: `var(--${kpi.color})` }} />
                  </div>
                  {kpi.change !== 0 && (
                    <div
                      className={`flex items-center gap-1 text-xs font-semibold ${
                        kpi.change > 0 ? "text-ltd-state-success" : "text-ltd-state-error"
                      }`}
                    >
                      {kpi.change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {Math.abs(kpi.change)}%
                    </div>
                  )}
                </div>
                <div className="text-sm text-ltd-text-2 mb-1">{kpi.label}</div>
                <div className="text-2xl font-bold text-ltd-text-1 tabular-nums">{kpi.value}</div>
              </Card>
            )
          })}
        </div>

        <Card className="p-6 sm:p-8 bg-gradient-to-br from-card to-ltd-surface-2 border-2 border-ltd-border-1 rounded-[var(--ltd-radius-xl)] shadow-md">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-ltd-text-1">Performance Trends</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4" />
              Last 30 days
            </div>
          </div>
          <div className="h-64 sm:h-80 flex flex-col items-center justify-center text-ltd-text-2 border-2 border-dashed border-ltd-border-1 rounded-xl bg-ltd-surface-1">
            <BarChart3 className="h-16 w-16 text-ltd-text-3 mb-4 opacity-50" />
            <p className="text-lg font-medium">Chart visualization</p>
            <p className="text-sm text-muted-foreground mt-1">Interactive charts coming soon</p>
          </div>
        </Card>
      </div>
    </PageShell>
  )
}
