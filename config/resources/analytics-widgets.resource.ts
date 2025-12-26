import type { ResourceConfig } from "./types";

/**
 * Analytics Widgets Resource
 *
 * Manages individual widgets that display on dashboards.
 * Each widget has a type, data source, and visual configuration.
 */
export const analyticsWidgetsResource: ResourceConfig = {
  name: "analytics-widgets",
  label: "Analytics Widget",
  labelPlural: "Analytics Widgets",
  model: "AnalyticsWidget",
  module: "ANALYTICS",
  icon: "BarChart3",
  description: "Configurable data visualization widgets for dashboards",

  fields: [
    {
      name: "id",
      label: "ID",
      type: "string",
      list: false,
      show: true,
      create: false,
      edit: false,
    },
    {
      name: "name",
      label: "Name",
      type: "string",
      list: true,
      sortable: true,
      validation: { required: true, minLength: 2, maxLength: 100 },
    },
    {
      name: "dashboardId",
      label: "Dashboard",
      type: "reference",
      referenceResource: "analytics-dashboards",
      referenceField: "name",
      list: true,
      filter: true,
      validation: { required: true },
    },
    {
      name: "type",
      label: "Widget Type",
      type: "enum",
      enumName: "AnalyticsWidgetType",
      list: true,
      filter: true,
      options: [
        // Numbers
        { value: "METRIC_CARD", label: "Metric Card", color: "blue" },
        { value: "COUNTER", label: "Live Counter", color: "green" },
        { value: "GAUGE", label: "Gauge", color: "purple" },
        // Charts
        { value: "LINE_CHART", label: "Line Chart", color: "indigo" },
        { value: "BAR_CHART", label: "Bar Chart", color: "cyan" },
        { value: "AREA_CHART", label: "Area Chart", color: "teal" },
        { value: "PIE_CHART", label: "Pie Chart", color: "pink" },
        { value: "DONUT_CHART", label: "Donut Chart", color: "rose" },
        // Tables
        { value: "DATA_TABLE", label: "Data Table", color: "gray" },
        { value: "LEADERBOARD", label: "Leaderboard", color: "amber" },
        // Time-based
        { value: "TIMELINE", label: "Timeline", color: "orange" },
        { value: "HEATMAP", label: "Heatmap", color: "red" },
        { value: "CALENDAR_HEATMAP", label: "Calendar Heatmap", color: "emerald" },
        // Graph (Neo4j powered)
        { value: "NETWORK_GRAPH", label: "Network Graph", color: "violet" },
        { value: "SANKEY_DIAGRAM", label: "Sankey Diagram", color: "fuchsia" },
        { value: "TREEMAP", label: "Treemap", color: "lime" },
        { value: "SUNBURST", label: "Sunburst", color: "sky" },
        // Comparisons
        { value: "COMPARISON_CARD", label: "Comparison Card", color: "slate" },
        { value: "SPARKLINE", label: "Sparkline", color: "zinc" },
      ],
      validation: { required: true },
    },
    {
      name: "chartType",
      label: "Chart Variant",
      type: "enum",
      enumName: "ChartType",
      list: false,
      options: [
        { value: "LINE", label: "Line" },
        { value: "BAR", label: "Bar" },
        { value: "HORIZONTAL_BAR", label: "Horizontal Bar" },
        { value: "STACKED_BAR", label: "Stacked Bar" },
        { value: "AREA", label: "Area" },
        { value: "STACKED_AREA", label: "Stacked Area" },
        { value: "PIE", label: "Pie" },
        { value: "DONUT", label: "Donut" },
        { value: "SCATTER", label: "Scatter" },
        { value: "BUBBLE", label: "Bubble" },
        { value: "RADAR", label: "Radar" },
        { value: "FUNNEL", label: "Funnel" },
      ],
    },
    {
      name: "size",
      label: "Size",
      type: "select",
      list: true,
      options: [
        { value: "small", label: "Small" },
        { value: "medium", label: "Medium" },
        { value: "large", label: "Large" },
        { value: "full", label: "Full Width" },
      ],
      defaultValue: "medium",
    },
    {
      name: "position",
      label: "Grid Position",
      type: "json",
      list: false,
      description: "{ x, y, w, h } grid coordinates",
    },

    // Data configuration
    {
      name: "metric",
      label: "Metric",
      type: "string",
      list: true,
      validation: { required: true },
      description: "What to measure (e.g., 'briefs.count', 'time.total_hours')",
    },
    {
      name: "dimensions",
      label: "Dimensions",
      type: "json",
      list: false,
      defaultValue: [],
      description: "Fields to group by",
    },
    {
      name: "filters",
      label: "Widget Filters",
      type: "json",
      list: false,
      description: "Widget-specific data filters",
    },

    // Time settings
    {
      name: "timeRange",
      label: "Time Range",
      type: "select",
      list: false,
      options: [
        { value: "realtime", label: "Real-time" },
        { value: "24h", label: "Last 24 Hours" },
        { value: "7d", label: "Last 7 Days" },
        { value: "30d", label: "Last 30 Days" },
        { value: "90d", label: "Last 90 Days" },
        { value: "1y", label: "Last Year" },
        { value: "custom", label: "Custom" },
      ],
    },
    {
      name: "refreshInterval",
      label: "Refresh Interval",
      type: "number",
      list: false,
      description: "Auto-refresh interval in seconds (null = manual)",
    },
    {
      name: "compareWith",
      label: "Compare With",
      type: "select",
      list: false,
      options: [
        { value: "previous_period", label: "Previous Period" },
        { value: "same_period_last_year", label: "Same Period Last Year" },
      ],
    },

    // Thresholds
    {
      name: "thresholds",
      label: "Thresholds",
      type: "json",
      list: false,
      description: "Warning and critical thresholds for alerts",
    },

    // Timestamps
    {
      name: "createdAt",
      label: "Created",
      type: "datetime",
      list: false,
      show: true,
      create: false,
      edit: false,
    },
    {
      name: "updatedAt",
      label: "Updated",
      type: "datetime",
      list: false,
      show: true,
      create: false,
      edit: false,
    },
  ],

  list: {
    columns: ["name", "dashboardId", "type", "metric", "size"],
    defaultSort: { field: "name", order: "asc" },
    pageSize: 20,
    searchable: true,
    searchFields: ["name", "metric"],
    defaultFilters: ["dashboardId", "type"],
    rowActions: [
      {
        name: "edit",
        label: "Edit",
        icon: "Pencil",
        position: "row",
        type: "link",
        href: "/admin/analytics-widgets/{{id}}/edit",
      },
      {
        name: "view",
        label: "View",
        icon: "Eye",
        position: "row",
        type: "link",
        href: "/admin/analytics-widgets/{{id}}",
      },
    ],
    headerActions: [
      {
        name: "create",
        label: "New Widget",
        icon: "Plus",
        position: "header",
        type: "link",
        href: "/admin/analytics-widgets/create",
        color: "primary",
        permissions: ["ADMIN", "LEADERSHIP"],
      },
    ],
    emptyTitle: "No widgets",
    emptyDescription: "Create widgets to visualize data on your dashboards.",
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "dashboardId", "type", "chartType"],
      },
      {
        id: "data",
        title: "Data Configuration",
        description: "What data to display",
        fields: ["metric", "dimensions", "filters"],
      },
      {
        id: "visual",
        title: "Visual Settings",
        fields: ["size", "position"],
      },
      {
        id: "time",
        title: "Time Settings",
        fields: ["timeRange", "refreshInterval", "compareWith"],
        collapsible: true,
        defaultOpen: false,
      },
      {
        id: "alerts",
        title: "Thresholds",
        description: "Alert thresholds for monitoring",
        fields: ["thresholds"],
        collapsible: true,
        defaultOpen: false,
      },
    ],
    layout: "single",
    submitLabel: "Create Widget",
    redirectOnSuccess: "show",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "dashboardId", "type", "chartType"],
      },
      {
        id: "data",
        title: "Data Configuration",
        fields: ["metric", "dimensions", "filters"],
      },
      {
        id: "visual",
        title: "Visual Settings",
        fields: ["size", "position"],
      },
      {
        id: "time",
        title: "Time Settings",
        fields: ["timeRange", "refreshInterval", "compareWith"],
        collapsible: true,
      },
      {
        id: "alerts",
        title: "Thresholds",
        fields: ["thresholds"],
        collapsible: true,
      },
    ],
    layout: "single",
    submitLabel: "Save Changes",
    redirectOnSuccess: "show",
  },

  show: {
    sections: [
      {
        id: "overview",
        title: "Overview",
        fields: ["name", "dashboardId", "type", "size"],
        columns: 4,
      },
      {
        id: "data",
        title: "Data Configuration",
        fields: ["metric", "dimensions", "filters"],
        columns: 3,
      },
      {
        id: "visual",
        title: "Visual",
        fields: ["chartType", "position"],
        columns: 2,
      },
      {
        id: "time",
        title: "Time Settings",
        fields: ["timeRange", "refreshInterval", "compareWith"],
        columns: 3,
      },
      {
        id: "alerts",
        title: "Thresholds",
        fields: ["thresholds"],
        columns: 1,
      },
      {
        id: "meta",
        title: "Metadata",
        fields: ["id", "createdAt", "updatedAt"],
        columns: 3,
      },
    ],
    layout: "single",
    actions: [
      {
        name: "edit",
        label: "Edit Widget",
        icon: "Pencil",
        position: "toolbar",
        type: "link",
        href: "/admin/analytics-widgets/{{id}}/edit",
        color: "primary",
      },
    ],
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    show: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    create: ["ADMIN", "LEADERSHIP"],
    edit: ["ADMIN", "LEADERSHIP"],
    delete: ["ADMIN", "LEADERSHIP"],
  },

  audit: true,
  softDelete: false,
};
