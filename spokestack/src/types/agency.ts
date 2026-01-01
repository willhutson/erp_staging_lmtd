export interface Approval {
  id: string
  type: "creative" | "budget" | "campaign" | "content"
  itemName: string
  clientName: string
  requestedBy: string
  requestedAt: string
  status: "pending" | "approved" | "rejected"
}

export interface Stream {
  id: string
  name: string
  client: string
  platform: string
  status: "active" | "paused" | "completed"
  postsThisWeek: number
  engagement: number
  health: "healthy" | "attention" | "critical"
}

export interface Campaign {
  id: string
  clientId: string
  clientName: string
  name: string
  channel: string
  status: "active" | "draft" | "completed" | "paused"
  budget: number
  spend: number
  cpa?: number
  roas?: number
  updatedAt: string
  owner: string
}

export interface Creative {
  id: string
  name: string
  type: "image" | "video" | "carousel" | "story"
  campaign: string
  status: "draft" | "in-review" | "approved" | "live"
  createdAt: string
  thumbnail?: string
}

export interface Decision {
  id: string
  title: string
  description: string
  status: "pending" | "approved" | "rejected"
  priority: "low" | "medium" | "high" | "urgent"
  requestedBy: string
  requestedAt: string
  dueDate?: string
  client?: string
}

export interface Client {
  id: string
  name: string
  region: string
  activeCampaigns: number
  spendMTD: number
  health: "good" | "warning" | "critical"
  owner: string
  status: "active" | "in-review" | "paused"
  createdAt: string
}

export interface CreativeAsset {
  id: string
  clientId: string
  clientName: string
  campaignId: string
  campaignName: string
  assetName: string
  format: string
  status: "draft" | "in-review" | "approved" | "blocked"
  lastReviewed?: string
}
