"use client"
import { useParams } from "next/navigation"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdTabs } from "@/components/ltd/primitives/ltd-tabs"
import { Card } from "@/components/ui/card"
import { MomentumIndicator, type MomentumLevel } from "@/components/ltd/agency/momentum-indicator"
import { DecisionLog } from "@/components/ltd/agency/decision-log"
import { ActivityFeed } from "@/components/ltd/patterns/activity-feed"
import { mockWorkflows, mockDecisions } from "@/lib/data/mock-workflows"
import { formatDate } from "@/lib/format/date"

export default function WorkflowDetailPage() {
  const params = useParams()
  const workflow = mockWorkflows.find((w) => w.id === params.id)
  const decisions = mockDecisions.filter((d) => d.workflowId === params.id)

  if (!workflow) {
    return (
      <PageShell breadcrumbs={[{ label: "Workflows", href: "/workflows" }, { label: "Not Found" }]} title="Not Found">
        <p className="text-ltd-text-2">Workflow not found</p>
      </PageShell>
    )
  }

  return (
    <PageShell
      breadcrumbs={[{ label: "Workflows", href: "/workflows" }, { label: workflow.title }]}
      title={`${workflow.title} - ${workflow.clientName}`}
      actions={
        <div className="flex gap-2">
          <LtdButton variant="outline">Edit Workflow</LtdButton>
          <LtdButton>Log Decision</LtdButton>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Stage</p>
            <p className="text-lg font-semibold text-ltd-text-1 capitalize">{workflow.stage}</p>
          </Card>
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Velocity</p>
            <MomentumIndicator level={workflow.velocity as MomentumLevel} daysInStatus={workflow.daysInCurrentStage} />
          </Card>
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Confidence</p>
            <p className="text-lg font-semibold text-ltd-text-1 capitalize">{workflow.confidenceLevel}</p>
          </Card>
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Est. Completion</p>
            <p className="text-sm font-semibold text-ltd-text-1">{formatDate(workflow.estimatedCompletion, "short")}</p>
          </Card>
        </div>

        {/* Blockers Alert */}
        {workflow.blockers.length > 0 && (
          <Card className="p-4 bg-ltd-error-bg border-2 border-ltd-error rounded-[var(--ltd-radius-lg)]">
            <h3 className="text-sm font-semibold text-ltd-text-1 mb-2">Active Blockers</h3>
            <ul className="space-y-1">
              {workflow.blockers.map((blocker, i) => (
                <li key={i} className="text-sm text-ltd-text-1">
                  • {blocker}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Tabs */}
        <LtdTabs
          defaultValue="overview"
          tabs={[
            { value: "overview", label: "Overview" },
            { value: "decisions", label: `Decisions (${decisions.length})` },
            { value: "dependencies", label: "Dependencies" },
            { value: "activity", label: "Activity" },
          ]}
        >
          {/* Overview Tab */}
          <div data-tab="overview" className="space-y-6">
            <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">Next Milestone</h3>
              <div className="space-y-2">
                <p className="text-ltd-text-1 font-medium">{workflow.nextMilestone}</p>
                <p className="text-sm text-ltd-text-2">Due: {formatDate(workflow.nextMilestoneDate, "long")}</p>
              </div>
            </Card>

            <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">Team</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-sm text-ltd-text-3">Owner: </span>
                  <span className="text-sm font-medium text-ltd-text-1">{workflow.owner}</span>
                </div>
                {workflow.team.length > 0 && (
                  <div>
                    <span className="text-sm text-ltd-text-3">Team Members: </span>
                    <span className="text-sm text-ltd-text-1">{workflow.team.join(", ")}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Decisions Tab */}
          <div data-tab="decisions">
            <DecisionLog
              decisions={decisions.map((d) => ({
                id: d.id,
                timestamp: d.timestamp,
                decisionMaker: d.decisionMaker,
                decision: d.decision,
                rationale: d.rationale,
                impact: d.impact,
                relatedItems: [{ type: "Workflow", name: workflow.title }],
              }))}
            />
          </div>

          {/* Dependencies Tab */}
          <div data-tab="dependencies" className="space-y-4">
            {workflow.dependencies.map((dep) => (
              <Card
                key={dep.id}
                className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-ltd-text-1">{dep.title}</p>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                      dep.status === "completed"
                        ? "bg-ltd-success/10 text-ltd-success"
                        : dep.status === "blocked"
                          ? "bg-ltd-error/10 text-ltd-error"
                          : "bg-ltd-warning/10 text-ltd-warning"
                    }`}
                  >
                    {dep.status}
                  </span>
                </div>
              </Card>
            ))}
          </div>

          {/* Activity Tab */}
          <div data-tab="activity">
            <ActivityFeed
              activities={[
                {
                  id: "1",
                  actor: workflow.owner,
                  action: "updated workflow stage",
                  timestamp: workflow.updatedAt,
                  metadata: { stage: workflow.stage },
                },
                {
                  id: "2",
                  actor: "System",
                  action: "calculated velocity",
                  timestamp: workflow.updatedAt,
                  metadata: { velocity: workflow.velocity },
                },
              ]}
            />
          </div>
        </LtdTabs>
      </div>
    </PageShell>
  )
}
