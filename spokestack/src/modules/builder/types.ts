import type {
  BuilderDashboard,
  BuilderDashboardTemplate,
  BuilderWidget,
  DashboardVisibility,
  BuilderWidgetType,
  ChartType,
  User,
  Organization,
} from "@prisma/client";

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

// Re-export enum types for convenience
export type { DashboardVisibility, BuilderWidgetType, ChartType };
