"use client"

import { use } from "react"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { ObjectHeader } from "@/components/ltd/patterns/object-header"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ActivityFeed, type ActivityItem } from "@/components/ltd/patterns/activity-feed"
import { mockCampaigns } from "@/lib/data/mock-campaigns"
import type { Status } from "@/components/ltd/patterns/status-badge"

// Map campaign status to ObjectHeader Status
function mapCampaignStatus(status: string): Status {
  const statusMap: Record<string, Status> = {
    active: "active",
    draft: "draft",
    completed: "completed",
    paused: "blocked",
  }
  return statusMap[status] || "draft"
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    timestamp: "1 hour ago",
    actor: "Sarah Johnson",
    action: "increased daily budget to $2,500",
  },
  {
    id: "2",
    timestamp: "4 hours ago",
    actor: "System",
    action: "campaign performance alert triggered",
    metadata: { Alert: "CPA exceeds target by 15%" },
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const campaign = mockCampaigns.find((c) => c.id === id)

  if (!campaign) {
    return <div>Campaign not found</div>
  }

  return (
    <PageShell breadcrumbs={[{ label: "Campaigns", href: "/campaigns" }, { label: campaign.name }]}>
      <div className="space-y-6">
        <ObjectHeader
          title={campaign.name}
          subtitle={`${campaign.clientName} • ${campaign.channel}`}
          status={mapCampaignStatus(campaign.status)}
          meta={[
            { label: "Budget", value: `$${campaign.budget.toLocaleString()}` },
            { label: "Spend", value: `$${campaign.spend.toLocaleString()}` },
            {
              label: "ROAS",
              value: campaign.roas ? `${campaign.roas}x` : "—",
            },
          ]}
          owner={campaign.owner}
          actions={
            <>
              <LtdButton variant="outline">Edit</LtdButton>
              <LtdButton>Pause Campaign</LtdButton>
            </>
          }
        />

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
                <div className="text-sm text-ltd-text-2 mb-1">Spend</div>
                <div className="text-2xl font-bold text-ltd-text-1 tabular-nums">
                  ${campaign.spend.toLocaleString()}
                </div>
              </Card>
              <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
                <div className="text-sm text-ltd-text-2 mb-1">Budget</div>
                <div className="text-2xl font-bold text-ltd-text-1 tabular-nums">
                  ${campaign.budget.toLocaleString()}
                </div>
              </Card>
              <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
                <div className="text-sm text-ltd-text-2 mb-1">CPA</div>
                <div className="text-2xl font-bold text-ltd-text-1 tabular-nums">
                  {campaign.cpa ? `$${campaign.cpa}` : "—"}
                </div>
              </Card>
              <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
                <div className="text-sm text-ltd-text-2 mb-1">ROAS</div>
                <div className="text-2xl font-bold text-ltd-text-1 tabular-nums">
                  {campaign.roas ? `${campaign.roas}x` : "—"}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <p className="text-ltd-text-2">Performance charts coming in Phase 3</p>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <ActivityFeed activities={mockActivity} />
            </Card>
          </TabsContent>

          <TabsContent value="settings">
            <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <p className="text-ltd-text-2">Settings panel coming soon</p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  )
}
