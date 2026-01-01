import { notFound } from "next/navigation"
import { ObjectHeader } from "@/components/ltd/patterns/object-header"
import { FeedbackThread } from "@/components/ltd/agency/feedback-thread"
import { LtdButton } from "@/components/ltd/primitives/ltd-button"
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"
import { CheckCircle2, XCircle, MessageSquare } from "lucide-react"

const mockApprovals = [
  {
    id: "1",
    title: "Q1 Campaign Creative - Social Media Assets",
    client: "TechCorp",
    campaign: "Spring Launch 2024",
    status: "in-review" as const,
    priority: "high" as const,
    submittedBy: "Sarah Chen",
    submittedAt: "2024-01-15T10:30:00Z",
    dueDate: "2024-01-18T17:00:00Z",
    assets: [
      { name: "Instagram Carousel - Tech.png", size: "2.4 MB" },
      { name: "Facebook Ad - Mobile.png", size: "1.8 MB" },
      { name: "LinkedIn Banner.png", size: "3.1 MB" },
    ],
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function ApprovalDetailPage({ params }: { params: { id: string } }) {
  const approval = mockApprovals.find((a) => a.id === params.id)

  if (!approval) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-ltd-surface-1">
      <ObjectHeader
        title={approval.title}
        status={approval.status}
        meta={[
          { label: "Client", value: approval.client },
          { label: "Campaign", value: approval.campaign },
          { label: "Submitted by", value: approval.submittedBy },
          { label: "Due", value: new Date(approval.dueDate).toLocaleDateString() },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <LtdButton variant="outline" size="sm">
              <MessageSquare className="h-4 w-4" />
              Add Comment
            </LtdButton>
            <LtdButton variant="destructive" size="sm">
              <XCircle className="h-4 w-4" />
              Request Changes
            </LtdButton>
            <LtdButton variant="default" size="sm">
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </LtdButton>
          </div>
        }
      />

      <main className="px-[var(--ltd-density-page-padding)] py-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Assets for Review</h3>
                <div className="space-y-3">
                  {approval.assets.map((asset, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-4 rounded-md bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div>
                        <div className="font-medium">{asset.name}</div>
                        <div className="text-sm text-muted-foreground">{asset.size}</div>
                      </div>
                      <LtdButton variant="outline" size="sm">
                        Preview
                      </LtdButton>
                    </div>
                  ))}
                </div>
              </div>

              <FeedbackThread
                messages={[
                  {
                    id: "1",
                    author: "Sarah Chen",
                    message: "Ready for final review. Updated the color palette per client feedback.",
                    timestamp: "2024-01-15T10:30:00Z",
                    resolved: false,
                  },
                  {
                    id: "2",
                    author: "Michael Torres",
                    message: "Looks great! Forwarding to client for approval.",
                    timestamp: "2024-01-15T14:20:00Z",
                    actionRequired: true,
                  },
                ]}
              />
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Details</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-muted-foreground">Priority</dt>
                    <dd className="mt-1">
                      <LtdBadge status={approval.priority === "high" ? "error" : "neutral"}>
                        {approval.priority}
                      </LtdBadge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Submitted</dt>
                    <dd className="mt-1">{new Date(approval.submittedAt).toLocaleString()}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Due Date</dt>
                    <dd className="mt-1">{new Date(approval.dueDate).toLocaleString()}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Approval History</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-primary/10 p-1.5">
                      <MessageSquare className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Submitted</div>
                      <div className="text-muted-foreground">{new Date(approval.submittedAt).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
