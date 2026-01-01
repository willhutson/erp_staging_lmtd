"use client"

import { PageShell } from "@/components/ltd/patterns/page-shell"
import { DecisionLog, type Decision } from "@/components/ltd/agency/decision-log"
import { LtdSelect } from "@/components/ltd/primitives/ltd-select"
import { useState } from "react"

const mockDecisions: Decision[] = [
  {
    id: "1",
    timestamp: "2024-12-21T15:30:00",
    decisionMaker: "Sarah Johnson",
    decision: "Approved Q1 budget increase of $25,000 for TechCorp International",
    rationale: "Strong Q4 performance (ROAS 3.2x) and confirmed client commitment for expansion",
    impact: "high",
    relatedItems: [
      { type: "Client", name: "TechCorp International" },
      { type: "Campaign", name: "Q4 Product Launch" },
    ],
  },
  {
    id: "2",
    timestamp: "2024-12-21T10:15:00",
    decisionMaker: "Michael Chen",
    decision: "Rejected Holiday Sale creative v2, requested revisions",
    rationale: "Brand guidelines not followed - headline font and color scheme incorrect",
    impact: "medium",
    relatedItems: [{ type: "Creative", name: "Holiday Sale Banner v2" }],
  },
  {
    id: "3",
    timestamp: "2024-12-20T14:00:00",
    decisionMaker: "Emma Davis",
    decision: "Paused FinanceFirst LinkedIn campaign for strategy review",
    rationale: "CPA 45% over target; need to reassess audience targeting before continuing spend",
    impact: "high",
    relatedItems: [
      { type: "Client", name: "FinanceFirst Bank" },
      { type: "Campaign", name: "Account Opening Drive" },
    ],
  },
  {
    id: "4",
    timestamp: "2024-12-20T11:30:00",
    decisionMaker: "Sarah Johnson",
    decision: "Approved Spring Collection campaign strategy for RetailMax",
    rationale: "Well-researched approach with clear KPIs and realistic budget allocation",
    impact: "medium",
    relatedItems: [
      { type: "Client", name: "RetailMax" },
      { type: "Campaign", name: "Spring Collection Teaser" },
    ],
  },
  {
    id: "5",
    timestamp: "2024-12-19T16:45:00",
    decisionMaker: "Michael Chen",
    decision: "Extended TikTok test budget by $10,000 for RetailMax",
    rationale: "Early indicators show 6.2x ROAS, significantly outperforming Meta and Google channels",
    impact: "medium",
    relatedItems: [{ type: "Campaign", name: "Holiday Sale 2024" }],
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function DecisionsPage() {
  const [filterImpact, setFilterImpact] = useState<string>("all")
  const [filterPerson, setFilterPerson] = useState<string>("all")

  const filteredDecisions = mockDecisions.filter((decision) => {
    if (filterImpact !== "all" && decision.impact !== filterImpact) return false
    if (filterPerson !== "all" && decision.decisionMaker !== filterPerson) return false
    return true
  })

  const people = Array.from(new Set(mockDecisions.map((d) => d.decisionMaker)))

  return (
    <PageShell breadcrumbs={[{ label: "Decisions" }]} title="Decision Log">
      <div className="space-y-6">
        <div className="flex gap-4">
          <LtdSelect
            value={filterImpact}
            onValueChange={setFilterImpact}
            placeholder="Filter by impact"
            options={[
              { value: "all", label: "All Impact Levels" },
              { value: "high", label: "High Impact" },
              { value: "medium", label: "Medium Impact" },
              { value: "low", label: "Low Impact" },
            ]}
            className="w-48"
          />
          <LtdSelect
            value={filterPerson}
            onValueChange={setFilterPerson}
            placeholder="Filter by person"
            options={[{ value: "all", label: "All People" }, ...people.map((p) => ({ value: p, label: p }))]}
            className="w-48"
          />
        </div>

        <DecisionLog decisions={filteredDecisions} />
      </div>
    </PageShell>
  )
}
