export type WorkflowStage = "intake" | "planning" | "execution" | "review" | "delivery" | "closed"

export type VelocityStatus = "stalled" | "slow" | "steady" | "accelerating"

export interface WorkflowItem {
  id: string
  clientId: string
  clientName: string
  title: string
  stage: WorkflowStage
  velocity: VelocityStatus
  daysInCurrentStage: number
  blockers: string[]
  dependencies: Array<{ id: string; title: string; status: string }>
  nextMilestone: string
  nextMilestoneDate: string
  owner: string
  team: string[]
  estimatedCompletion: string
  confidenceLevel: "high" | "medium" | "low"
  createdAt: string
  updatedAt: string
}

export const mockWorkflows: WorkflowItem[] = [
  {
    id: "wf-001",
    clientId: "cl-001",
    clientName: "Emaar Properties",
    title: "Q1 2025 Brand Campaign",
    stage: "planning",
    velocity: "steady",
    daysInCurrentStage: 5,
    blockers: [],
    dependencies: [
      { id: "dep-001", title: "Brand guidelines approval", status: "completed" },
      { id: "dep-002", title: "Budget sign-off", status: "in-progress" },
    ],
    nextMilestone: "Creative concepts presentation",
    nextMilestoneDate: "2025-01-20",
    owner: "Sarah Chen",
    team: ["Michael Torres", "Lisa Kumar", "Ahmed Hassan"],
    estimatedCompletion: "2025-03-15",
    confidenceLevel: "high",
    createdAt: "2025-01-05T09:00:00Z",
    updatedAt: "2025-01-13T14:30:00Z",
  },
  {
    id: "wf-002",
    clientId: "cl-002",
    clientName: "Dubai Tourism",
    title: "Summer Campaign 2025",
    stage: "execution",
    velocity: "accelerating",
    daysInCurrentStage: 12,
    blockers: [],
    dependencies: [
      { id: "dep-003", title: "Media plan approval", status: "completed" },
      { id: "dep-004", title: "Creative assets final", status: "completed" },
    ],
    nextMilestone: "Campaign launch",
    nextMilestoneDate: "2025-01-25",
    owner: "Michael Torres",
    team: ["Sarah Chen", "Emma Davis"],
    estimatedCompletion: "2025-04-30",
    confidenceLevel: "high",
    createdAt: "2024-12-10T10:00:00Z",
    updatedAt: "2025-01-13T16:45:00Z",
  },
  {
    id: "wf-003",
    clientId: "cl-003",
    clientName: "Abu Dhabi Finance",
    title: "Rebrand Initiative",
    stage: "review",
    velocity: "stalled",
    daysInCurrentStage: 18,
    blockers: ["Waiting for executive feedback on positioning options", "Legal review pending for new tagline"],
    dependencies: [
      { id: "dep-005", title: "Market research", status: "completed" },
      { id: "dep-006", title: "Competitor analysis", status: "completed" },
      { id: "dep-007", title: "Stakeholder interviews", status: "blocked" },
    ],
    nextMilestone: "Positioning workshop",
    nextMilestoneDate: "2025-02-05",
    owner: "Lisa Kumar",
    team: ["Sarah Chen", "Ahmed Hassan"],
    estimatedCompletion: "2025-06-30",
    confidenceLevel: "low",
    createdAt: "2024-11-20T11:00:00Z",
    updatedAt: "2025-01-10T09:15:00Z",
  },
  {
    id: "wf-004",
    clientId: "cl-004",
    clientName: "HealthTech Startup",
    title: "Product Launch Campaign",
    stage: "intake",
    velocity: "slow",
    daysInCurrentStage: 3,
    blockers: ["Awaiting product specifications", "Budget allocation pending"],
    dependencies: [],
    nextMilestone: "Kickoff meeting",
    nextMilestoneDate: "2025-01-18",
    owner: "Emma Davis",
    team: [],
    estimatedCompletion: "2025-05-15",
    confidenceLevel: "medium",
    createdAt: "2025-01-10T14:00:00Z",
    updatedAt: "2025-01-13T10:30:00Z",
  },
]

export interface DecisionPoint {
  id: string
  workflowId: string
  timestamp: string
  decisionMaker: string
  decision: string
  options: Array<{ label: string; selected: boolean }>
  rationale: string
  impact: "high" | "medium" | "low"
  category: "budget" | "strategy" | "creative" | "timeline" | "resource"
}

export const mockDecisions: DecisionPoint[] = [
  {
    id: "dec-001",
    workflowId: "wf-001",
    timestamp: "2025-01-12T15:30:00Z",
    decisionMaker: "Sarah Chen",
    decision: "Approved increased Meta budget allocation",
    options: [
      { label: "Maintain 40% Meta / 40% Google split", selected: false },
      { label: "Shift to 50% Meta / 30% Google", selected: true },
      { label: "Test TikTok with 20% allocation", selected: false },
    ],
    rationale:
      "Q4 data shows Meta ROAS 35% higher than Google for this vertical. Client approved 10% budget increase to capitalize.",
    impact: "high",
    category: "budget",
  },
  {
    id: "dec-002",
    workflowId: "wf-002",
    timestamp: "2025-01-08T10:15:00Z",
    decisionMaker: "Michael Torres",
    decision: "Selected influencer partnership over display ads",
    options: [
      { label: "Traditional display + video", selected: false },
      { label: "Influencer partnerships", selected: true },
      { label: "Programmatic + retargeting", selected: false },
    ],
    rationale:
      "Target audience (18-34) shows 3x engagement with influencer content vs display. Budget efficiency and authenticity align with brand goals.",
    impact: "high",
    category: "strategy",
  },
  {
    id: "dec-003",
    workflowId: "wf-003",
    timestamp: "2024-12-20T14:00:00Z",
    decisionMaker: "Lisa Kumar",
    decision: "Extended research phase by 2 weeks",
    options: [
      { label: "Proceed with current insights", selected: false },
      { label: "Extend research by 2 weeks", selected: true },
      { label: "Commission third-party study", selected: false },
    ],
    rationale:
      "Stakeholder alignment requires deeper category insights. Risk of proceeding without consensus outweighs timeline extension.",
    impact: "medium",
    category: "timeline",
  },
]
