export type Status = "draft" | "in-review" | "approved" | "active" | "blocked" | "completed" | "archived"

export interface Client {
  id: string
  name: string
  region: string
  activeCampaigns: number
  spendMTD: number
  health: "good" | "warning" | "critical"
  owner: string
  status: Status
  createdAt: string
}

export interface Campaign {
  id: string
  clientId: string
  clientName: string
  name: string
  channel: string
  status: Status
  budget: number
  spend: number
  cpa?: number
  roas?: number
  updatedAt: string
  owner: string
}

export interface CreativeAsset {
  id: string
  clientId: string
  clientName: string
  campaignId: string
  campaignName: string
  assetName: string
  format: string
  status: Status
  lastReviewed?: string
  thumbnail?: string
}

export interface PerformanceMetric {
  id: string
  label: string
  value: string
  change: number
  trend: "up" | "down" | "neutral"
}

export interface Approval {
  id: string
  type: "creative" | "campaign" | "budget"
  itemName: string
  clientName: string
  requestedBy: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
}
