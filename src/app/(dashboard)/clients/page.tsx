"use client"

import { PageShell } from "@/components/ltd/patterns/page-shell"
import { DataTable } from "@/components/ltd/patterns/data-table"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"
import { mockClients } from "@/lib/data/mock-clients"
import type { ColumnDef } from "@tanstack/react-table"
import type { Client } from "@/types/agency"
import Link from "next/link"
import { Plus, TrendingUp, TrendingDown } from "lucide-react"

const columns: ColumnDef<Client>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <Link
        href={`/clients/${row.original.id}`}
        className="font-semibold hover:text-ltd-primary transition-colors inline-flex items-center gap-2 group"
      >
        {row.original.name}
        <TrendingUp className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
      </Link>
    ),
  },
  {
    accessorKey: "region",
    header: "Region",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.region}</span>,
  },
  {
    accessorKey: "activeCampaigns",
    header: "Active Campaigns",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <span className="tabular-nums font-semibold">{row.original.activeCampaigns}</span>
        <span className="text-xs text-muted-foreground">active</span>
      </div>
    ),
  },
  {
    accessorKey: "spendMTD",
    header: "Spend MTD",
    cell: ({ row }) => (
      <span className="tabular-nums font-semibold text-ltd-text-1">${row.original.spendMTD.toLocaleString()}</span>
    ),
  },
  {
    accessorKey: "health",
    header: "Health",
    cell: ({ row }) => {
      const health = row.original.health
      return (
        <LtdBadge status={health === "good" ? "success" : health === "warning" ? "warning" : "error"}>
          {health}
        </LtdBadge>
      )
    },
  },
  {
    accessorKey: "owner",
    header: "Owner",
    cell: ({ row }) => <span className="text-sm">{row.original.owner}</span>,
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function ClientsPage() {
  return (
    <PageShell
      title="Clients"
      description="Manage client accounts and campaigns"
      actions={
        <LtdButton>
          <Plus className="h-4 w-4 mr-2" />
          Add Client
        </LtdButton>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground mb-1">Total Clients</div>
          <div className="text-2xl font-bold text-ltd-text-1">{mockClients.length}</div>
          <div className="text-xs text-ltd-state-success flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            +12% from last month
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground mb-1">Active Campaigns</div>
          <div className="text-2xl font-bold text-ltd-text-1">
            {mockClients.reduce((acc, client) => acc + client.activeCampaigns, 0)}
          </div>
          <div className="text-xs text-ltd-state-success flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            +8% from last month
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground mb-1">Total Spend MTD</div>
          <div className="text-2xl font-bold text-ltd-text-1">
            ${mockClients.reduce((acc, client) => acc + client.spendMTD, 0).toLocaleString()}
          </div>
          <div className="text-xs text-ltd-state-error flex items-center gap-1 mt-1">
            <TrendingDown className="h-3 w-3" />
            -5% from last month
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-sm text-muted-foreground mb-1">Healthy Clients</div>
          <div className="text-2xl font-bold text-ltd-text-1">
            {mockClients.filter((c) => c.health === "good").length}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {Math.round((mockClients.filter((c) => c.health === "good").length / mockClients.length) * 100)}% health
            rate
          </div>
        </div>
      </div>

      <DataTable columns={columns} data={mockClients} searchPlaceholder="Search clients..." />
    </PageShell>
  )
}
