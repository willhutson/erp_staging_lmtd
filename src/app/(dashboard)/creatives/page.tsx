"use client"

import { PageShell } from "@/components/ltd/patterns/page-shell"
import { DataTable } from "@/components/ltd/patterns/data-table"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { StatusBadge } from "@/components/ltd/patterns/status-badge"
import { mockCreatives } from "@/lib/data/mock-creatives"
import type { ColumnDef } from "@tanstack/react-table"
import type { CreativeAsset } from "@/types/agency"
import Link from "next/link"

const columns: ColumnDef<CreativeAsset>[] = [
  {
    accessorKey: "clientName",
    header: "Client",
  },
  {
    accessorKey: "campaignName",
    header: "Campaign",
  },
  {
    accessorKey: "assetName",
    header: "Asset Name",
    cell: ({ row }) => (
      <Link href={`/creatives/${row.original.id}`} className="font-medium hover:text-ltd-primary">
        {row.original.assetName}
      </Link>
    ),
  },
  {
    accessorKey: "format",
    header: "Format",
    cell: ({ row }) => <span className="text-sm text-ltd-text-2 font-mono">{row.original.format}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: "lastReviewed",
    header: "Last Reviewed",
    cell: ({ row }) => row.original.lastReviewed || "—",
  },
]

export default function CreativesPage() {
  return (
    <PageShell
      breadcrumbs={[{ label: "Creatives" }]}
      title="Creative Assets"
      actions={<LtdButton>Upload Asset</LtdButton>}
    >
      <DataTable columns={columns} data={mockCreatives} searchPlaceholder="Search assets..." />
    </PageShell>
  )
}
