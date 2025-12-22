"use client"

import { useState } from "react"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { StreamCard } from "@/components/ltd/agency/stream-card"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdSelect } from "@/components/ltd/primitives/ltd-select"
import { useRouter } from "next/navigation"
import type { Status } from "@/components/ltd/patterns/status-badge"

interface WorkItem {
  id: string
  title: string
  type: string
  status: Status
  owner: string
  updatedAt: string
  priority?: "high" | "medium" | "low"
  blockedReason?: string
}

const mockWorkItems: WorkItem[] = [
  {
    id: "1",
    title: "Q1 Budget Approval - TechCorp",
    type: "Budget Decision",
    status: "in-review",
    owner: "Sarah Johnson",
    updatedAt: "2024-12-21T10:30:00",
    priority: "high",
  },
  {
    id: "2",
    title: "Holiday Campaign Creative Review",
    type: "Creative Approval",
    status: "blocked",
    owner: "Michael Chen",
    updatedAt: "2024-12-19T14:00:00",
    priority: "high",
    blockedReason: "Waiting for client brand guidelines update",
  },
  {
    id: "3",
    title: "Spring Campaign Strategy",
    type: "Campaign Planning",
    status: "in-review",
    owner: "Emma Davis",
    updatedAt: "2024-12-21T09:15:00",
    priority: "medium",
  },
  {
    id: "4",
    title: "New Client Onboarding - HealthPlus",
    type: "Client Setup",
    status: "active",
    owner: "Sarah Johnson",
    updatedAt: "2024-12-21T11:45:00",
  },
  {
    id: "5",
    title: "Performance Report - FinanceFirst",
    type: "Reporting",
    status: "draft",
    owner: "Emma Davis",
    updatedAt: "2024-12-20T16:30:00",
  },
]

export default function StreamsPage() {
  const router = useRouter()
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [filterOwner, setFilterOwner] = useState<string>("all")

  const filteredItems = mockWorkItems.filter((item) => {
    if (filterStatus !== "all" && item.status !== filterStatus) return false
    if (filterOwner !== "all" && item.owner !== filterOwner) return false
    return true
  })

  const owners = Array.from(new Set(mockWorkItems.map((i) => i.owner)))

  return (
    <PageShell
      breadcrumbs={[{ label: "Work Streams" }]}
      title="Work Streams"
      actions={<LtdButton>Create New Item</LtdButton>}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <LtdSelect
            value={filterStatus}
            onValueChange={setFilterStatus}
            placeholder="Filter by status"
            options={[
              { value: "all", label: "All Statuses" },
              { value: "draft", label: "Draft" },
              { value: "in-review", label: "In Review" },
              { value: "blocked", label: "Blocked" },
              { value: "active", label: "Active" },
            ]}
            className="w-48"
          />
          <LtdSelect
            value={filterOwner}
            onValueChange={setFilterOwner}
            placeholder="Filter by owner"
            options={[{ value: "all", label: "All Owners" }, ...owners.map((o) => ({ value: o, label: o }))]}
            className="w-48"
          />
        </div>

        {/* Stream Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          {filteredItems.map((item) => (
            <StreamCard
              key={item.id}
              item={item}
              onSelect={() => {
                // Navigate based on type
                if (item.type.includes("Campaign")) {
                  router.push("/campaigns")
                } else if (item.type.includes("Creative")) {
                  router.push("/creatives")
                } else {
                  router.push("/clients")
                }
              }}
              actions={
                item.status === "in-review" ? (
                  <>
                    <LtdButton size="sm" onClick={(e) => e.stopPropagation()}>
                      Review Now
                    </LtdButton>
                  </>
                ) : null
              }
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ltd-text-2">No items match your filters</p>
          </div>
        )}
      </div>
    </PageShell>
  )
}
