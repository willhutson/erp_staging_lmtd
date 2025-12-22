"use client"

import { use } from "react"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { ObjectHeader } from "@/components/ltd/patterns/object-header"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ActivityFeed, type ActivityItem } from "@/components/ltd/patterns/activity-feed"
import { MomentumIndicator, type MomentumLevel } from "@/components/ltd/agency/momentum-indicator"
import { mockClients } from "@/lib/data/mock-clients"
import { mockCampaigns } from "@/lib/data/mock-campaigns"
import type { Status } from "@/components/ltd/patterns/status-badge"

// Map client status to ObjectHeader Status
function mapClientStatus(status: string): Status {
  const statusMap: Record<string, Status> = {
    active: "active",
    "in-review": "in-review",
    paused: "blocked",
  }
  return statusMap[status] || "draft"
}

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    timestamp: "2 hours ago",
    actor: "Sarah Johnson",
    action: "updated campaign budget",
    metadata: { Campaign: "Q4 Product Launch", "New Budget": "$50,000" },
  },
  {
    id: "2",
    timestamp: "1 day ago",
    actor: "Michael Chen",
    action: "approved creative asset",
    metadata: { Asset: "Hero Banner v3" },
  },
  {
    id: "3",
    timestamp: "2 days ago",
    actor: "Sarah Johnson",
    action: "created new campaign",
    metadata: { Campaign: "Brand Awareness EMEA" },
  },
]

function calculateMomentum(clientId: string): { level: MomentumLevel; daysInStatus: number } {
  // Simple mock logic - in production this would be based on actual activity data
  const mockMomentum: Record<string, { level: MomentumLevel; daysInStatus: number }> = {
    "1": { level: "accelerating", daysInStatus: 2 },
    "2": { level: "steady", daysInStatus: 5 },
    "3": { level: "slow", daysInStatus: 12 },
    "4": { level: "stalled", daysInStatus: 21 },
  }
  return mockMomentum[clientId] || { level: "steady", daysInStatus: 7 }
}

export default function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const client = mockClients.find((c) => c.id === id)

  if (!client) {
    return <div>Client not found</div>
  }

  const clientCampaigns = mockCampaigns.filter((c) => c.clientId === id)
  const momentum = calculateMomentum(id)

  return (
    <PageShell breadcrumbs={[{ label: "Clients", href: "/clients" }, { label: client.name }]}>
      <div className="space-y-6">
        <ObjectHeader
          title={client.name}
          subtitle={`${client.region} • ${client.activeCampaigns} active campaigns`}
          status={mapClientStatus(client.status)}
          meta={[
            { label: "Spend MTD", value: `$${client.spendMTD.toLocaleString()}` },
            { label: "Health", value: client.health },
          ]}
          owner={client.owner}
          actions={
            <>
              <LtdButton variant="outline">Edit</LtdButton>
              <LtdButton>New Campaign</LtdButton>
            </>
          }
        />

        <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
          <MomentumIndicator level={momentum.level} daysInStatus={momentum.daysInStatus} />
        </Card>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
                <div className="text-sm text-ltd-text-2 mb-1">Total Spend</div>
                <div className="text-2xl font-bold text-ltd-text-1 tabular-nums">
                  ${client.spendMTD.toLocaleString()}
                </div>
              </Card>
              <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
                <div className="text-sm text-ltd-text-2 mb-1">Active Campaigns</div>
                <div className="text-2xl font-bold text-ltd-text-1 tabular-nums">{client.activeCampaigns}</div>
              </Card>
              <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
                <div className="text-sm text-ltd-text-2 mb-1">Account Health</div>
                <div className="text-2xl font-bold text-ltd-text-1 capitalize">{client.health}</div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="campaigns">
            <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <div className="space-y-3">
                {clientCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between py-2">
                    <div>
                      <div className="font-medium text-ltd-text-1">{campaign.name}</div>
                      <div className="text-sm text-ltd-text-2">{campaign.channel}</div>
                    </div>
                    <div className="text-end">
                      <div className="text-sm font-medium text-ltd-text-1 tabular-nums">
                        ${campaign.spend.toLocaleString()} / ${campaign.budget.toLocaleString()}
                      </div>
                      <div className="text-xs text-ltd-text-2">{campaign.status}</div>
                    </div>
                  </div>
                ))}
              </div>
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
