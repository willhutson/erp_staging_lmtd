"use client"

import { PageShell } from "@/components/ltd/patterns/page-shell"
import { DataTable } from "@/components/ltd/patterns/data-table"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { StatusBadge, type Status } from "@/components/ltd/patterns/status-badge"
import { mockCampaigns } from "@/lib/data/mock-campaigns"

// Map campaign status to StatusBadge Status
function mapCampaignStatus(status: string): Status {
  const statusMap: Record<string, Status> = {
    active: "active",
    draft: "draft",
    completed: "completed",
    paused: "blocked",
  }
  return statusMap[status] || "draft"
}
import type { ColumnDef } from "@tanstack/react-table"
import type { Campaign } from "@/types/agency"
import Link from "next/link"
import { Plus, TrendingUp, Target, Zap, DollarSign } from "lucide-react"

const columns: ColumnDef<Campaign>[] = [
  {
    accessorKey: "clientName",
    header: "Client",
    cell: ({ row }) => <span className="font-medium text-ltd-text-1">{row.original.clientName}</span>,
  },
  {
    accessorKey: "name",
    header: "Campaign",
    cell: ({ row }) => (
      <Link
        href={`/campaigns/${row.original.id}`}
        className="font-semibold hover:text-ltd-primary transition-colors inline-flex items-center gap-2 group"
      >
        {row.original.name}
        <TrendingUp className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    ),
  },
  {
    accessorKey: "channel",
    header: "Channel",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.channel}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={mapCampaignStatus(row.original.status)} />,
  },
  {
    accessorKey: "budget",
    header: "Budget",
    cell: ({ row }) => (
      <span className="tabular-nums font-semibold text-ltd-text-1">${row.original.budget.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "spend",
    header: "Spend",
    cell: ({ row }) => {
      const percentSpent = (row.original.spend / row.original.budget) * 100
      return (
        <div className="flex items-center gap-2">
          <span className="tabular-nums font-semibold">${row.original.spend.toLocaleString()}</span>
          <span className="text-xs text-muted-foreground">({percentSpent.toFixed(0)}%)</span>
        </div>
      )
    },
  },
  {
    accessorKey: "roas",
    header: "ROAS",
    cell: ({ row }) => {
      const roas = row.original.roas
      return roas ? (
        <span className="tabular-nums font-semibold text-ltd-state-success">{roas}x</span>
      ) : (
        <span className="text-ltd-text-3">—</span>
      )
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.updatedAt}</span>,
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function CampaignsPage() {
  const totalBudget = mockCampaigns.reduce((acc, c) => acc + c.budget, 0)
  const totalSpend = mockCampaigns.reduce((acc, c) => acc + c.spend, 0)
  const activeCampaigns = mockCampaigns.filter((c) => c.status === "active").length
  const avgRoas =
    mockCampaigns.filter((c) => c.roas).reduce((acc, c) => acc + (c.roas || 0), 0) /
    mockCampaigns.filter((c) => c.roas).length

  return (
    <PageShell
      breadcrumbs={[{ label: "Campaigns" }]}
      title="Campaigns"
      actions={
        <LtdButton className="shadow-md">
          <Plus className="h-4 w-4 mr-2" />
          New Campaign
        </LtdButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border-2 border-ltd-border-1 bg-gradient-to-br from-card to-ltd-surface-2 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-lg bg-ltd-primary/10 p-2">
              <Target className="h-5 w-5 text-ltd-primary" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">Total Campaigns</div>
          <div className="text-2xl font-bold text-ltd-text-1">{mockCampaigns.length}</div>
        </div>

        <div className="rounded-xl border-2 border-ltd-border-1 bg-gradient-to-br from-card to-ltd-surface-2 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-lg bg-accent/10 p-2">
              <Zap className="h-5 w-5 text-accent" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">Active Now</div>
          <div className="text-2xl font-bold text-ltd-text-1">{activeCampaigns}</div>
        </div>

        <div className="rounded-xl border-2 border-ltd-border-1 bg-gradient-to-br from-card to-ltd-surface-2 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-lg bg-ltd-brand-accent-secondary/10 p-2">
              <DollarSign className="h-5 w-5 text-ltd-brand-accent-secondary" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">Total Spend</div>
          <div className="text-2xl font-bold text-ltd-text-1">${totalSpend.toLocaleString()}</div>
          <div className="text-xs text-muted-foreground mt-1">
            {((totalSpend / totalBudget) * 100).toFixed(0)}% of budget
          </div>
        </div>

        <div className="rounded-xl border-2 border-ltd-border-1 bg-gradient-to-br from-card to-ltd-surface-2 p-5 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-start justify-between mb-3">
            <div className="rounded-lg bg-ltd-state-success/10 p-2">
              <TrendingUp className="h-5 w-5 text-ltd-state-success" />
            </div>
          </div>
          <div className="text-sm text-muted-foreground mb-1">Avg ROAS</div>
          <div className="text-2xl font-bold text-ltd-state-success">{avgRoas.toFixed(1)}x</div>
        </div>
      </div>

      <DataTable columns={columns} data={mockCampaigns} searchPlaceholder="Search campaigns..." />
    </PageShell>
  )
}
