export type StreamPriority = "urgent" | "high" | "normal" | "low"
export type StreamStatus = "queued" | "in-progress" | "blocked" | "completed"

export interface StreamTask {
  id: string
  clientId: string
  clientName: string
  campaignId?: string
  campaignName?: string
  title: string
  description: string
  priority: StreamPriority
  status: StreamStatus
  assignee: string
  dueDate: string
  estimatedHours: number
  actualHours?: number
  blockedBy?: string[]
  dependencies?: string[]
  tags: string[]
  createdAt: string
  updatedAt: string
}

export const mockStreamTasks: StreamTask[] = [
  {
    id: "st-001",
    clientId: "cl-001",
    clientName: "Emaar Properties",
    campaignId: "cp-001",
    campaignName: "Q1 Brand Campaign",
    title: "Review Q1 creative concepts",
    description: "Client requested 3 hero concepts for luxury positioning",
    priority: "urgent",
    status: "queued",
    assignee: "Sarah Chen",
    dueDate: "2025-01-15",
    estimatedHours: 4,
    tags: ["creative-review", "client-facing"],
    createdAt: "2025-01-10T09:00:00Z",
    updatedAt: "2025-01-12T14:30:00Z",
  },
  {
    id: "st-002",
    clientId: "cl-002",
    clientName: "Dubai Tourism",
    campaignId: "cp-002",
    campaignName: "Summer Campaign 2025",
    title: "Finalize media buy allocations",
    description: "Approve channel mix: Meta 45%, Google 30%, TikTok 25%",
    priority: "high",
    status: "in-progress",
    assignee: "Michael Torres",
    dueDate: "2025-01-18",
    estimatedHours: 6,
    actualHours: 3.5,
    tags: ["media-planning", "budget"],
    createdAt: "2025-01-08T11:00:00Z",
    updatedAt: "2025-01-13T16:45:00Z",
  },
  {
    id: "st-003",
    clientId: "cl-001",
    clientName: "Emaar Properties",
    title: "Monthly performance report",
    description: "Compile attribution data and insights for December",
    priority: "normal",
    status: "blocked",
    assignee: "Lisa Kumar",
    dueDate: "2025-01-20",
    estimatedHours: 8,
    actualHours: 2,
    blockedBy: ["Data export pending from Meta"],
    tags: ["reporting", "analytics"],
    createdAt: "2025-01-05T10:00:00Z",
    updatedAt: "2025-01-13T09:15:00Z",
  },
]
