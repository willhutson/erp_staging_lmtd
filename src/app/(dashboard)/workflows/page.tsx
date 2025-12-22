"use client"

import { useState } from "react"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdSelect } from "@/components/ltd/primitives/ltd-select"
import { Card } from "@/components/ui/card"
import { MomentumIndicator, type MomentumLevel } from "@/components/ltd/agency/momentum-indicator"
import { mockWorkflows, type WorkflowItem, type WorkflowStage } from "@/lib/data/mock-workflows"
import { formatDate } from "@/lib/format/date"
import { useRouter } from "next/navigation"

export default function WorkflowsPage() {
  const router = useRouter()
  const [filterStage, setFilterStage] = useState<string>("all")
  const [filterVelocity, setFilterVelocity] = useState<string>("all")

  const filteredWorkflows = mockWorkflows.filter((wf) => {
    if (filterStage !== "all" && wf.stage !== filterStage) return false
    if (filterVelocity !== "all" && wf.velocity !== filterVelocity) return false
    return true
  })

  return (
    <PageShell
      breadcrumbs={[{ label: "Workflows" }]}
      title="Active Workflows"
      actions={<LtdButton>New Workflow</LtdButton>}
    >
      <div className="space-y-6">
        {/* Filters */}
        <div className="flex gap-4">
          <LtdSelect
            value={filterStage}
            onValueChange={setFilterStage}
            placeholder="Filter by stage"
            options={[
              { value: "all", label: "All Stages" },
              { value: "intake", label: "Intake" },
              { value: "planning", label: "Planning" },
              { value: "execution", label: "Execution" },
              { value: "review", label: "Review" },
              { value: "delivery", label: "Delivery" },
            ]}
            className="w-48"
          />
          <LtdSelect
            value={filterVelocity}
            onValueChange={setFilterVelocity}
            placeholder="Filter by velocity"
            options={[
              { value: "all", label: "All Velocities" },
              { value: "stalled", label: "Stalled" },
              { value: "slow", label: "Slow" },
              { value: "steady", label: "Steady" },
              { value: "accelerating", label: "Accelerating" },
            ]}
            className="w-48"
          />
        </div>

        {/* Workflow Cards */}
        <div className="grid gap-6">
          {filteredWorkflows.map((workflow) => (
            <WorkflowCard
              key={workflow.id}
              workflow={workflow}
              onClick={() => router.push(`/workflows/${workflow.id}`)}
            />
          ))}
        </div>

        {filteredWorkflows.length === 0 && (
          <div className="text-center py-12">
            <p className="text-ltd-text-2">No workflows match your filters</p>
          </div>
        )}
      </div>
    </PageShell>
  )
}

function WorkflowCard({ workflow, onClick }: { workflow: WorkflowItem; onClick: () => void }) {
  const stageColors: Record<WorkflowStage, string> = {
    intake: "bg-ltd-info/10 text-ltd-info",
    planning: "bg-ltd-warning/10 text-ltd-warning",
    execution: "bg-ltd-success/10 text-ltd-success",
    review: "bg-ltd-warning/10 text-ltd-warning",
    delivery: "bg-ltd-primary/10 text-ltd-primary",
    closed: "bg-ltd-text-3/10 text-ltd-text-3",
  }

  const confidenceColors = {
    high: "bg-ltd-success/10 text-ltd-success",
    medium: "bg-ltd-warning/10 text-ltd-warning",
    low: "bg-ltd-error/10 text-ltd-error",
  }

  return (
    <Card
      className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)] hover:border-ltd-border-2 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-ltd-text-1">{workflow.title}</h3>
            <span className={`text-xs px-2.5 py-1 rounded-full capitalize ${stageColors[workflow.stage]}`}>
              {workflow.stage}
            </span>
          </div>
          <p className="text-sm text-ltd-text-2">{workflow.clientName}</p>
        </div>
        <MomentumIndicator level={workflow.velocity as MomentumLevel} daysInStatus={workflow.daysInCurrentStage} />
      </div>

      {/* Blockers */}
      {workflow.blockers.length > 0 && (
        <div className="mb-4 p-3 bg-ltd-error-bg border border-ltd-error rounded-[var(--ltd-radius-md)]">
          <p className="text-sm font-medium text-ltd-text-1 mb-1">Blockers:</p>
          <ul className="text-sm text-ltd-text-1 space-y-1">
            {workflow.blockers.map((blocker, i) => (
              <li key={i}>• {blocker}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Next Milestone */}
      <div className="mb-4 p-3 bg-ltd-surface-1 rounded-[var(--ltd-radius-md)]">
        <p className="text-xs text-ltd-text-3 mb-1">Next Milestone</p>
        <p className="text-sm font-medium text-ltd-text-1">{workflow.nextMilestone}</p>
        <p className="text-xs text-ltd-text-2 mt-1">{formatDate(workflow.nextMilestoneDate, "long")}</p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          <span className="text-ltd-text-2">
            Owner: <span className="text-ltd-text-1 font-medium">{workflow.owner}</span>
          </span>
          <span className="text-ltd-text-3">Team: {workflow.team.length}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${confidenceColors[workflow.confidenceLevel]}`}>
            {workflow.confidenceLevel} confidence
          </span>
          <span className="text-ltd-text-3">Due {formatDate(workflow.estimatedCompletion, "short")}</span>
        </div>
      </div>
    </Card>
  )
}
