"use client"

import { PageShell } from "@/components/ltd/patterns/page-shell"
import { DataTable } from "@/components/ltd/patterns/data-table"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"
import type { ColumnDef } from "@tanstack/react-table"
import type { Approval } from "@/types/agency"

const mockApprovals: Approval[] = [
  {
    id: "1",
    type: "creative",
    itemName: "Hero Banner - Holiday Sale",
    clientName: "RetailMax",
    requestedBy: "Michael Chen",
    requestedAt: "2024-12-21",
    status: "pending",
  },
  {
    id: "2",
    type: "budget",
    itemName: "Q1 Budget Increase +$25k",
    clientName: "TechCorp International",
    requestedBy: "Sarah Johnson",
    requestedAt: "2024-12-20",
    status: "pending",
  },
  {
    id: "3",
    type: "campaign",
    itemName: "New Campaign: Spring Launch",
    clientName: "HealthPlus",
    requestedBy: "Emma Davis",
    requestedAt: "2024-12-19",
    status: "approved",
  },
]

const columns: ColumnDef<Approval>[] = [
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => <span className="capitalize">{row.original.type}</span>,
  },
  {
    accessorKey: "itemName",
    header: "Item",
    cell: ({ row }) => <span className="font-medium">{row.original.itemName}</span>,
  },
  {
    accessorKey: "clientName",
    header: "Client",
  },
  {
    accessorKey: "requestedBy",
    header: "Requested By",
  },
  {
    accessorKey: "requestedAt",
    header: "Date",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status
      return (
        <LtdBadge status={status === "pending" ? "warning" : status === "approved" ? "success" : "error"}>
          {status}
        </LtdBadge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) =>
      row.original.status === "pending" ? (
        <div className="flex gap-2">
          <LtdButton size="sm">Approve</LtdButton>
          <LtdButton size="sm" variant="outline">
            Reject
          </LtdButton>
        </div>
      ) : null,
  },
]

export default function ApprovalsPage() {
  return (
    <PageShell breadcrumbs={[{ label: "Approvals" }]} title="Approvals Queue">
      <DataTable columns={columns} data={mockApprovals} searchPlaceholder="Search approvals..." />
    </PageShell>
  )
}
