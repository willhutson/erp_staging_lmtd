// Local type definitions (matches Prisma schema)
// These are defined locally to avoid build issues when Prisma client isn't generated

export type DashboardVisibility = "PRIVATE" | "ORGANIZATION" | "CLIENT" | "PUBLIC";
export type BuilderWidgetType = "CHART" | "TABLE" | "KPI" | "TEXT" | "IMAGE" | "EMBED";
export type ChartType = "LINE" | "BAR" | "PIE" | "DONUT" | "AREA" | "SCATTER" | "FUNNEL" | "GAUGE";

interface BuilderDashboard {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  slug: string;
  visibility: DashboardVisibility;
  isPublished: boolean;
  isDefault: boolean;
  thumbnail: string | null;
  layout: unknown;
  settings: unknown;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BuilderDashboardTemplate {
  id: string;
  organizationId: string | null;
  name: string;
  description: string | null;
  category: string;
  layout: unknown;
  widgetConfigs: unknown;
  thumbnail: string | null;
  previewImage: string | null;
  isOfficial: boolean;
  isActive: boolean;
  usageCount: number;
  createdById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface BuilderWidget {
  id: string;
  dashboardId: string;
  name: string;
  type: BuilderWidgetType;
  chartType: ChartType | null;
  size: string;
  position: unknown;
  dataSource: string | null;
  metric: string | null;
  dimensions: string[];
  filters: unknown;
  settings: unknown;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

// Dashboard with relations
export interface BuilderDashboardWithRelations extends BuilderDashboard {
  createdBy: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
  widgets?: BuilderWidgetWithRelations[];
  _count?: {
    widgets: number;
  };
}

// Template with relations
export interface BuilderDashboardTemplateWithRelations extends BuilderDashboardTemplate {
  createdBy?: {
    id: string;
    name: string;
  } | null;
  organization?: {
    id: string;
    name: string;
  } | null;
}

// Widget with relations
export interface BuilderWidgetWithRelations extends BuilderWidget {
  dashboard?: {
    id: string;
    name: string;
  };
}

// Input types for creating/updating
export interface CreateDashboardInput {
  name: string;
  description?: string;
  visibility?: DashboardVisibility;
  templateId?: string;
}

export interface UpdateDashboardInput {
  name?: string;
  description?: string;
  visibility?: DashboardVisibility;
  isPublished?: boolean;
  isDefault?: boolean;
  thumbnail?: string;
  layout?: unknown;
  settings?: unknown;
}

export interface CreateWidgetInput {
  dashboardId: string;
  name: string;
  type: BuilderWidgetType;
  chartType?: ChartType;
  size?: string;
  position?: { x: number; y: number; w: number; h: number };
  dataSource?: string;
  metric?: string;
  dimensions?: string[];
  filters?: unknown;
  settings?: unknown;
}

export interface UpdateWidgetInput {
  name?: string;
  type?: BuilderWidgetType;
  chartType?: ChartType;
  size?: string;
  position?: { x: number; y: number; w: number; h: number };
  dataSource?: string;
  metric?: string;
  dimensions?: string[];
  filters?: unknown;
  settings?: unknown;
}

export interface CreateTemplateInput {
  name: string;
  description?: string;
  category: string;
  layout?: unknown;
  widgetConfigs?: unknown;
  thumbnail?: string;
}

// Types are exported at the top of the file
