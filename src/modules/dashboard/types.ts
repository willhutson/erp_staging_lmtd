// Widget Types and Registry for Dashboard Layout Builder

export type WidgetSize = "1x1" | "2x1" | "1x2" | "2x2" | "3x1" | "3x2";

export interface WidgetPosition {
  x: number; // Column (0-11 for 12-column grid)
  y: number; // Row
  w: number; // Width in columns
  h: number; // Height in rows
}

export interface WidgetConfig {
  id: string; // Unique instance ID
  type: WidgetType;
  position: WidgetPosition;
  settings?: Record<string, unknown>;
}

export interface LayoutConfig {
  widgets: WidgetConfig[];
  columns: number; // Usually 12
}

// Available widget types
export type WidgetType =
  | "my-tasks"
  | "my-briefed-tasks"
  | "team-capacity"
  | "upcoming-deadlines"
  | "recent-briefs"
  | "client-activity"
  | "time-logged"
  | "pipeline-summary"
  | "nps-score"
  | "quick-actions";

// Widget definitions for the widget library
export interface WidgetDefinition {
  type: WidgetType;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  defaultSize: WidgetSize;
  minWidth: number;
  minHeight: number;
  maxWidth: number;
  maxHeight: number;
  permissions?: string[]; // Required permissions to use this widget
}

// Widget registry - defines all available widgets
export const widgetRegistry: Record<WidgetType, WidgetDefinition> = {
  "my-tasks": {
    type: "my-tasks",
    name: "My Tasks",
    description: "Your assigned briefs and tasks",
    icon: "CheckSquare",
    defaultSize: "2x1",
    minWidth: 1,
    minHeight: 1,
    maxWidth: 4,
    maxHeight: 3,
  },
  "my-briefed-tasks": {
    type: "my-briefed-tasks",
    name: "My Briefed Tasks",
    description: "Tasks you created and briefed to the team",
    icon: "Send",
    defaultSize: "2x2",
    minWidth: 2,
    minHeight: 2,
    maxWidth: 4,
    maxHeight: 3,
  },
  "team-capacity": {
    type: "team-capacity",
    name: "Team Capacity",
    description: "Team utilization and availability",
    icon: "Users",
    defaultSize: "2x2",
    minWidth: 2,
    minHeight: 1,
    maxWidth: 4,
    maxHeight: 3,
    permissions: ["team:view"],
  },
  "upcoming-deadlines": {
    type: "upcoming-deadlines",
    name: "Upcoming Deadlines",
    description: "Briefs due soon",
    icon: "Calendar",
    defaultSize: "2x1",
    minWidth: 1,
    minHeight: 1,
    maxWidth: 4,
    maxHeight: 3,
  },
  "recent-briefs": {
    type: "recent-briefs",
    name: "Recent Briefs",
    description: "Recently created or updated briefs",
    icon: "FileText",
    defaultSize: "3x1",
    minWidth: 2,
    minHeight: 1,
    maxWidth: 4,
    maxHeight: 2,
  },
  "client-activity": {
    type: "client-activity",
    name: "Client Activity",
    description: "Recent client interactions",
    icon: "Activity",
    defaultSize: "2x2",
    minWidth: 1,
    minHeight: 1,
    maxWidth: 4,
    maxHeight: 3,
  },
  "time-logged": {
    type: "time-logged",
    name: "Time Logged",
    description: "Your weekly time tracking",
    icon: "Clock",
    defaultSize: "2x1",
    minWidth: 2,
    minHeight: 1,
    maxWidth: 4,
    maxHeight: 2,
  },
  "pipeline-summary": {
    type: "pipeline-summary",
    name: "Pipeline Summary",
    description: "Deal and RFP pipeline stats",
    icon: "TrendingUp",
    defaultSize: "2x1",
    minWidth: 2,
    minHeight: 1,
    maxWidth: 4,
    maxHeight: 2,
    permissions: ["pipeline:view"],
  },
  "nps-score": {
    type: "nps-score",
    name: "NPS Score",
    description: "Client satisfaction overview",
    icon: "Heart",
    defaultSize: "1x1",
    minWidth: 1,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 2,
  },
  "quick-actions": {
    type: "quick-actions",
    name: "Quick Actions",
    description: "Common shortcuts and actions",
    icon: "Zap",
    defaultSize: "1x1",
    minWidth: 1,
    minHeight: 1,
    maxWidth: 2,
    maxHeight: 2,
  },
};

// Convert size string to width/height
export function sizeToPosition(size: WidgetSize): { w: number; h: number } {
  const [w, h] = size.split("x").map(Number);
  return { w, h };
}

// Default layout for new users
export const defaultLayout: LayoutConfig = {
  columns: 12,
  widgets: [
    {
      id: "default-tasks",
      type: "my-tasks",
      position: { x: 0, y: 0, w: 4, h: 2 },
    },
    {
      id: "default-deadlines",
      type: "upcoming-deadlines",
      position: { x: 4, y: 0, w: 4, h: 2 },
    },
    {
      id: "default-time",
      type: "time-logged",
      position: { x: 8, y: 0, w: 4, h: 2 },
    },
    {
      id: "default-briefs",
      type: "recent-briefs",
      position: { x: 0, y: 2, w: 6, h: 2 },
    },
    {
      id: "default-actions",
      type: "quick-actions",
      position: { x: 6, y: 2, w: 2, h: 2 },
    },
    {
      id: "default-nps",
      type: "nps-score",
      position: { x: 8, y: 2, w: 2, h: 2 },
    },
  ],
};
