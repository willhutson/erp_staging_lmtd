import { notFound } from "next/navigation"
import { ObjectHeader } from "@/components/ltd/patterns/object-header"
import { LtdBadge } from "@/components/ltd/primitives/ltd-badge"
import { Calendar, User, Tag } from "lucide-react"

const mockDecisions = [
  {
    id: "1",
    title: "Switch from Carousel to Single Image Format",
    context:
      "Instagram engagement metrics show single images perform 34% better than carousels for this client demographic",
    decision: "Move forward with single image format for Q1 campaign creative",
    rationale:
      "Data-driven decision based on 6-month performance analysis. Single images show higher completion rates and lower cost per engagement.",
    madeBy: "Sarah Chen",
    madeAt: "2024-01-15T14:30:00Z",
    impact: "high" as const,
    category: "creative" as const,
    tags: ["Instagram", "Creative Strategy", "Data-Driven"],
    alternatives: [
      {
        option: "Continue with carousel format",
        pros: "More storytelling capability, familiar format",
        cons: "Lower engagement rates, higher cost per result",
      },
      {
        option: "Test video format",
        pros: "Highest engagement potential",
        cons: "Production timeline conflicts with launch date",
      },
    ],
  },
]

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function DecisionDetailPage({ params }: { params: { id: string } }) {
  const decision = mockDecisions.find((d) => d.id === params.id)

  if (!decision) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-ltd-surface-1">
      <ObjectHeader
        title={decision.title}
        meta={[
          { label: "Made by", value: decision.madeBy },
          { label: "Date", value: new Date(decision.madeAt).toLocaleDateString() },
          { label: "Category", value: decision.category },
        ]}
        actions={
          <LtdBadge status={decision.impact === "high" ? "error" : "neutral"}>
            {decision.impact} impact
          </LtdBadge>
        }
      />

      <main className="px-[var(--ltd-density-page-padding)] py-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-3">Context</h3>
                <p className="text-muted-foreground">{decision.context}</p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-3">Decision</h3>
                <p className="font-medium">{decision.decision}</p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-3">Rationale</h3>
                <p className="text-muted-foreground">{decision.rationale}</p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Alternatives Considered</h3>
                <div className="space-y-4">
                  {decision.alternatives.map((alt, i) => (
                    <div key={i} className="rounded-md bg-muted/50 p-4">
                      <div className="font-medium mb-2">{alt.option}</div>
                      <div className="grid gap-2 text-sm">
                        <div>
                          <span className="text-green-600 dark:text-green-400 font-medium">Pros:</span> {alt.pros}
                        </div>
                        <div>
                          <span className="text-red-600 dark:text-red-400 font-medium">Cons:</span> {alt.cons}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="font-semibold mb-4">Metadata</h3>
                <dl className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-muted-foreground">Made by</dt>
                      <dd className="mt-1 font-medium">{decision.madeBy}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-muted-foreground">Date</dt>
                      <dd className="mt-1">{new Date(decision.madeAt).toLocaleString()}</dd>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div>
                      <dt className="text-muted-foreground">Tags</dt>
                      <dd className="mt-1 flex flex-wrap gap-2">
                        {decision.tags.map((tag) => (
                          <LtdBadge key={tag} variant="outline">
                            {tag}
                          </LtdBadge>
                        ))}
                      </dd>
                    </div>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
