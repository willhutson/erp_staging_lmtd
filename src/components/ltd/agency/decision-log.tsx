import { Card } from "@/components/ui/card"
import { formatDate } from "@/lib/format/date"

export interface Decision {
  id: string
  timestamp: string
  decisionMaker: string
  decision: string
  rationale?: string
  impact: "high" | "medium" | "low"
  relatedItems?: Array<{ type: string; name: string }>
}

interface DecisionLogProps {
  decisions: Decision[]
}

export function DecisionLog({ decisions }: DecisionLogProps) {
  return (
    <div className="space-y-4">
      {decisions.map((decision) => (
        <Card
          key={decision.id}
          className="p-[var(--ltd-density-card-padding)] bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-ltd-text-1">{decision.decisionMaker}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    decision.impact === "high"
                      ? "bg-ltd-error/10 text-ltd-error"
                      : decision.impact === "medium"
                        ? "bg-ltd-warning/10 text-ltd-warning"
                        : "bg-ltd-info/10 text-ltd-info"
                  }`}
                >
                  {decision.impact} impact
                </span>
              </div>
              <p className="text-sm text-ltd-text-3">{formatDate(decision.timestamp, "long")}</p>
            </div>
          </div>

          <div className="space-y-2">
            <div>
              <span className="text-sm font-medium text-ltd-text-1">Decision: </span>
              <span className="text-sm text-ltd-text-1">{decision.decision}</span>
            </div>
            {decision.rationale && (
              <div>
                <span className="text-sm font-medium text-ltd-text-2">Rationale: </span>
                <span className="text-sm text-ltd-text-2">{decision.rationale}</span>
              </div>
            )}
            {decision.relatedItems && decision.relatedItems.length > 0 && (
              <div className="pt-2 border-t border-ltd-border-1">
                <span className="text-xs text-ltd-text-3">Related: </span>
                {decision.relatedItems.map((item, i) => (
                  <span key={i} className="text-xs text-ltd-text-2">
                    {item.type}: {item.name}
                    {i < decision.relatedItems!.length - 1 ? ", " : ""}
                  </span>
                ))}
              </div>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
