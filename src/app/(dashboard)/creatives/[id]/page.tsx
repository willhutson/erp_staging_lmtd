"use client"

import { use, useState } from "react"
import { PageShell } from "@/components/ltd/patterns/page-shell"
import { ObjectHeader } from "@/components/ltd/patterns/object-header"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { ActivityFeed, type ActivityItem } from "@/components/ltd/patterns/activity-feed"
import { FeedbackThread, type FeedbackMessage } from "@/components/ltd/agency/feedback-thread"
import { mockCreatives } from "@/lib/data/mock-creatives"

const mockActivity: ActivityItem[] = [
  {
    id: "1",
    timestamp: "30 minutes ago",
    actor: "Sarah Johnson",
    action: "requested changes",
    metadata: { Feedback: "Update headline copy to match brand guidelines" },
  },
  {
    id: "2",
    timestamp: "2 hours ago",
    actor: "Michael Chen",
    action: "uploaded new version",
    metadata: { Version: "v3" },
  },
]

const mockVersions = [
  { id: "v3", uploadedBy: "Michael Chen", uploadedAt: "2024-12-20 14:30", status: "in-review" },
  { id: "v2", uploadedBy: "Michael Chen", uploadedAt: "2024-12-19 16:45", status: "rejected" },
  { id: "v1", uploadedBy: "Sarah Johnson", uploadedAt: "2024-12-18 10:15", status: "draft" },
]

const initialFeedback: FeedbackMessage[] = [
  {
    id: "1",
    author: "Sarah Johnson",
    message: "Headline font doesn't match brand guidelines. Please use DM Sans Bold instead of current font.",
    timestamp: "2024-12-20T09:30:00",
    actionRequired: true,
  },
  {
    id: "2",
    author: "Michael Chen",
    message: "Updated to DM Sans Bold. Please review v3.",
    timestamp: "2024-12-20T14:30:00",
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function CreativeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const creative = mockCreatives.find((c) => c.id === id)
  const [feedback, setFeedback] = useState<FeedbackMessage[]>(initialFeedback)

  if (!creative) {
    return <div>Creative not found</div>
  }

  const handleReply = (message: string) => {
    const newMessage: FeedbackMessage = {
      id: Date.now().toString(),
      author: "Current User",
      message,
      timestamp: new Date().toISOString(),
    }
    setFeedback([...feedback, newMessage])
  }

  const handleResolve = (messageId: string) => {
    setFeedback(feedback.map((m) => (m.id === messageId ? { ...m, resolved: true, actionRequired: false } : m)))
  }

  return (
    <PageShell breadcrumbs={[{ label: "Creatives", href: "/creatives" }, { label: creative.assetName }]}>
      <div className="space-y-6">
        <ObjectHeader
          title={creative.assetName}
          subtitle={`${creative.clientName} • ${creative.campaignName}`}
          status={creative.status}
          meta={[
            { label: "Format", value: creative.format },
            { label: "Last Reviewed", value: creative.lastReviewed || "Not yet reviewed" },
          ]}
          actions={
            <>
              <LtdButton variant="outline">Request Changes</LtdButton>
              <LtdButton>Approve</LtdButton>
            </>
          }
        />

        <Tabs defaultValue="preview" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="preview">
            <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <div className="aspect-video bg-ltd-surface-2 rounded-[var(--ltd-radius-md)] flex items-center justify-center mb-4">
                <div className="text-center">
                  <svg
                    className="h-16 w-16 text-ltd-text-3 mx-auto mb-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <p className="text-sm text-ltd-text-2">Asset Preview</p>
                  <p className="text-xs text-ltd-text-3 mt-1">{creative.format}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <LtdButton variant="outline" size="sm">
                  Download
                </LtdButton>
                <LtdButton variant="outline" size="sm">
                  View Full Size
                </LtdButton>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="versions">
            <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <div className="space-y-3">
                {mockVersions.map((version) => (
                  <div
                    key={version.id}
                    className="flex items-center justify-between py-3 border-b border-ltd-border-1 last:border-0"
                  >
                    <div>
                      <div className="font-medium text-ltd-text-1">{version.id}</div>
                      <div className="text-sm text-ltd-text-2">
                        Uploaded by {version.uploadedBy} • {version.uploadedAt}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-ltd-text-3 capitalize">{version.status}</span>
                      <LtdButton variant="outline" size="sm">
                        View
                      </LtdButton>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="feedback">
            <FeedbackThread messages={feedback} onReply={handleReply} onResolve={handleResolve} />
          </TabsContent>

          <TabsContent value="activity">
            <Card className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <ActivityFeed activities={mockActivity} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  )
}
