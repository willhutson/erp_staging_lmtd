/**
 * SpokeStack Widget Registry
 *
 * Registry of all deployable UI widgets extracted from LMTD.
 * These widgets can be configured and composed via the WYSIWYG editor
 * to build dashboard layouts for new SpokeStack instances.
 */

import type { UIWidgetTemplate } from "../../types";

// ============================================
// DASHBOARD WIDGETS (from LMTD)
// ============================================

export const myTasksWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-my-tasks",
    name: "My Tasks",
    description: "Shows the current user's assigned briefs and tasks",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "tasks", "briefs", "personal"],
    icon: "CheckSquare",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs"],
  },
  data: {
    name: "My Tasks",
    component: "MyTasksWidget",
    props: [
      {
        name: "limit",
        type: "number",
        label: "Number of tasks to show",
        defaultValue: 5,
      },
      {
        name: "showCompleted",
        type: "boolean",
        label: "Show completed tasks",
        defaultValue: false,
      },
      {
        name: "sortBy",
        type: "select",
        label: "Sort by",
        defaultValue: "dueDate",
        options: [
          { value: "dueDate", label: "Due Date" },
          { value: "priority", label: "Priority" },
          { value: "createdAt", label: "Created" },
        ],
      },
    ],
    preview: "/previews/my-tasks-widget.png",
    category: "data",
  },
};

export const upcomingDeadlinesWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-upcoming-deadlines",
    name: "Upcoming Deadlines",
    description: "Calendar view of upcoming brief deadlines",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "calendar", "deadlines", "briefs"],
    icon: "Calendar",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs"],
  },
  data: {
    name: "Upcoming Deadlines",
    component: "UpcomingDeadlinesWidget",
    props: [
      {
        name: "daysAhead",
        type: "number",
        label: "Days to look ahead",
        defaultValue: 14,
      },
      {
        name: "showOverdue",
        type: "boolean",
        label: "Highlight overdue items",
        defaultValue: true,
      },
      {
        name: "groupBy",
        type: "select",
        label: "Group by",
        defaultValue: "day",
        options: [
          { value: "day", label: "Day" },
          { value: "week", label: "Week" },
          { value: "client", label: "Client" },
        ],
      },
    ],
    preview: "/previews/deadlines-widget.png",
    category: "data",
  },
};

export const recentBriefsWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-recent-briefs",
    name: "Recent Briefs",
    description: "List of recently created or updated briefs",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "briefs", "activity"],
    icon: "FileText",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs"],
  },
  data: {
    name: "Recent Briefs",
    component: "RecentBriefsWidget",
    props: [
      {
        name: "limit",
        type: "number",
        label: "Number to show",
        defaultValue: 8,
      },
      {
        name: "filterByStatus",
        type: "select",
        label: "Filter by status",
        defaultValue: "all",
        options: [
          { value: "all", label: "All" },
          { value: "active", label: "Active only" },
          { value: "completed", label: "Completed only" },
        ],
      },
    ],
    preview: "/previews/recent-briefs-widget.png",
    category: "data",
  },
};

export const timeLoggedWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-time-logged",
    name: "Time Logged",
    description: "Time tracking summary with weekly/monthly views",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "time-tracking", "metrics"],
    icon: "Clock",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["timeEntries"],
  },
  data: {
    name: "Time Logged",
    component: "TimeLoggedWidget",
    props: [
      {
        name: "period",
        type: "select",
        label: "Time period",
        defaultValue: "week",
        options: [
          { value: "today", label: "Today" },
          { value: "week", label: "This Week" },
          { value: "month", label: "This Month" },
        ],
      },
      {
        name: "showTarget",
        type: "boolean",
        label: "Show target hours",
        defaultValue: true,
      },
      {
        name: "targetHours",
        type: "number",
        label: "Weekly target (hours)",
        defaultValue: 40,
      },
    ],
    preview: "/previews/time-logged-widget.png",
    category: "data",
  },
};

export const quickActionsWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-quick-actions",
    name: "Quick Actions",
    description: "One-click buttons for common tasks",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "actions", "shortcuts"],
    icon: "Zap",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: [],
  },
  data: {
    name: "Quick Actions",
    component: "QuickActionsWidget",
    props: [
      {
        name: "actions",
        type: "select",
        label: "Available actions",
        defaultValue: "all",
        options: [
          { value: "all", label: "All Actions" },
          { value: "briefs", label: "Brief Actions Only" },
          { value: "time", label: "Time Actions Only" },
        ],
      },
      {
        name: "layout",
        type: "select",
        label: "Button layout",
        defaultValue: "grid",
        options: [
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ],
      },
    ],
    preview: "/previews/quick-actions-widget.png",
    category: "navigation",
  },
};

export const npsScoreWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-nps-score",
    name: "NPS Score",
    description: "Client Net Promoter Score visualization",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "nps", "client-health", "metrics"],
    icon: "TrendingUp",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["npsResponses"],
  },
  data: {
    name: "NPS Score",
    component: "NPSScoreWidget",
    props: [
      {
        name: "period",
        type: "select",
        label: "Time period",
        defaultValue: "quarter",
        options: [
          { value: "month", label: "Last Month" },
          { value: "quarter", label: "Last Quarter" },
          { value: "year", label: "Last Year" },
          { value: "all", label: "All Time" },
        ],
      },
      {
        name: "showTrend",
        type: "boolean",
        label: "Show trend chart",
        defaultValue: true,
      },
      {
        name: "showBreakdown",
        type: "boolean",
        label: "Show promoter/detractor breakdown",
        defaultValue: true,
      },
    ],
    preview: "/previews/nps-widget.png",
    category: "data",
  },
};

export const pipelineSummaryWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-pipeline-summary",
    name: "Pipeline Summary",
    description: "RFP/Sales pipeline overview with stage counts",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "sales", "pipeline", "rfp"],
    icon: "GitBranch",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["rfps", "deals"],
  },
  data: {
    name: "Pipeline Summary",
    component: "PipelineSummaryWidget",
    props: [
      {
        name: "showValue",
        type: "boolean",
        label: "Show monetary value",
        defaultValue: true,
      },
      {
        name: "showWinRate",
        type: "boolean",
        label: "Show win rate",
        defaultValue: true,
      },
      {
        name: "pipelineType",
        type: "select",
        label: "Pipeline type",
        defaultValue: "rfp",
        options: [
          { value: "rfp", label: "RFP Pipeline" },
          { value: "deals", label: "Deals Pipeline" },
          { value: "both", label: "Combined" },
        ],
      },
    ],
    preview: "/previews/pipeline-widget.png",
    category: "data",
  },
};

export const teamCapacityWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-team-capacity",
    name: "Team Capacity",
    description: "Resource utilization across team members",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "resources", "team", "capacity"],
    icon: "Users",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["users", "briefs", "timeEntries"],
  },
  data: {
    name: "Team Capacity",
    component: "TeamCapacityWidget",
    props: [
      {
        name: "view",
        type: "select",
        label: "View type",
        defaultValue: "bars",
        options: [
          { value: "bars", label: "Progress Bars" },
          { value: "heatmap", label: "Heatmap" },
          { value: "list", label: "Simple List" },
        ],
      },
      {
        name: "filterDepartment",
        type: "select",
        label: "Filter by department",
        defaultValue: "all",
        options: [
          { value: "all", label: "All Departments" },
          { value: "creative", label: "Creative" },
          { value: "production", label: "Production" },
          { value: "client-servicing", label: "Client Servicing" },
        ],
      },
      {
        name: "showAvailability",
        type: "boolean",
        label: "Show availability",
        defaultValue: true,
      },
    ],
    preview: "/previews/team-capacity-widget.png",
    category: "data",
  },
};

export const clientActivityWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-client-activity",
    name: "Client Activity",
    description: "Recent client interactions and updates",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["dashboard", "clients", "activity", "crm"],
    icon: "Building2",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["clients", "briefs"],
  },
  data: {
    name: "Client Activity",
    component: "ClientActivityWidget",
    props: [
      {
        name: "limit",
        type: "number",
        label: "Number of items",
        defaultValue: 10,
      },
      {
        name: "filterClient",
        type: "string",
        label: "Filter by client (ID)",
        defaultValue: "",
      },
      {
        name: "activityTypes",
        type: "select",
        label: "Activity types",
        defaultValue: "all",
        options: [
          { value: "all", label: "All Activities" },
          { value: "briefs", label: "Brief Updates" },
          { value: "approvals", label: "Approvals" },
          { value: "feedback", label: "Feedback" },
        ],
      },
    ],
    preview: "/previews/client-activity-widget.png",
    category: "data",
  },
};

// ============================================
// LAYOUT WIDGETS
// ============================================

export const sectionHeaderWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-section-header",
    name: "Section Header",
    description: "Header with title and optional action buttons",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["layout", "header", "section"],
    icon: "Type",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: [],
    resources: [],
  },
  data: {
    name: "Section Header",
    component: "SectionHeader",
    props: [
      {
        name: "title",
        type: "string",
        label: "Title",
        defaultValue: "Section Title",
      },
      {
        name: "subtitle",
        type: "string",
        label: "Subtitle",
        defaultValue: "",
      },
      {
        name: "showDivider",
        type: "boolean",
        label: "Show divider line",
        defaultValue: true,
      },
    ],
    preview: "/previews/section-header.png",
    category: "layout",
  },
};

export const gridLayoutWidget: UIWidgetTemplate = {
  category: "ui-widget",
  metadata: {
    id: "widget-grid-layout",
    name: "Grid Layout",
    description: "Responsive grid container for widgets",
    category: "ui-widget",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["layout", "grid", "container"],
    icon: "LayoutGrid",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: [],
    resources: [],
  },
  data: {
    name: "Grid Layout",
    component: "GridLayout",
    props: [
      {
        name: "columns",
        type: "select",
        label: "Columns",
        defaultValue: "3",
        options: [
          { value: "1", label: "1 Column" },
          { value: "2", label: "2 Columns" },
          { value: "3", label: "3 Columns" },
          { value: "4", label: "4 Columns" },
        ],
      },
      {
        name: "gap",
        type: "select",
        label: "Gap size",
        defaultValue: "md",
        options: [
          { value: "sm", label: "Small" },
          { value: "md", label: "Medium" },
          { value: "lg", label: "Large" },
        ],
      },
    ],
    slots: [
      {
        name: "children",
        label: "Content",
        accepts: ["*"],
      },
    ],
    preview: "/previews/grid-layout.png",
    category: "layout",
  },
};

// ============================================
// REGISTRY EXPORT
// ============================================

export const lmtdWidgets: UIWidgetTemplate[] = [
  // Dashboard widgets
  myTasksWidget,
  upcomingDeadlinesWidget,
  recentBriefsWidget,
  timeLoggedWidget,
  quickActionsWidget,
  npsScoreWidget,
  pipelineSummaryWidget,
  teamCapacityWidget,
  clientActivityWidget,

  // Layout widgets
  sectionHeaderWidget,
  gridLayoutWidget,
];

export function getWidgetById(id: string): UIWidgetTemplate | undefined {
  return lmtdWidgets.find((w) => w.metadata.id === id);
}

export function getWidgetsByCategory(
  category: UIWidgetTemplate["data"]["category"]
): UIWidgetTemplate[] {
  return lmtdWidgets.filter((w) => w.data.category === category);
}

export function getWidgetsByTag(tag: string): UIWidgetTemplate[] {
  return lmtdWidgets.filter((w) => w.metadata.tags.includes(tag));
}

export default lmtdWidgets;
