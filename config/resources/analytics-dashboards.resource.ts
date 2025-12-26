import type { ResourceConfig } from "./types";

/**
 * Analytics Dashboards Resource
 *
 * Manages configurable dashboards with widgets for data visualization.
 * Dashboards can be internal (team metrics) or external (client-facing).
 */
export const analyticsDashboardsResource: ResourceConfig = {
  name: "analytics-dashboards",
  label: "Analytics Dashboard",
  labelPlural: "Analytics Dashboards",
  model: "AnalyticsDashboard",
  module: "ANALYTICS",
  icon: "BarChart3",
  description: "Configurable dashboards for data visualization and KPIs",

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
      filter: true,
      sortable: true,
      validation: { required: true, minLength: 2, maxLength: 100 },
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      list: false,
    },
    {
      name: "type",
      label: "Type",
      type: "enum",
      enumName: "AnalyticsDashboardType",
      list: true,
      filter: true,
      options: [
        { value: "INTERNAL_OVERVIEW", label: "Internal Overview", color: "blue" },
        { value: "INTERNAL_TEAM", label: "Team Performance", color: "indigo" },
        { value: "INTERNAL_RESOURCE", label: "Resource Utilization", color: "purple" },
        { value: "INTERNAL_FINANCIAL", label: "Financial Tracking", color: "green" },
        { value: "EXTERNAL_REALTIME", label: "Real-time Client", color: "orange" },
        { value: "EXTERNAL_PERIOD", label: "Historical Client", color: "yellow" },
        { value: "EXTERNAL_CAMPAIGN", label: "Campaign Performance", color: "pink" },
        { value: "CUSTOM", label: "Custom", color: "gray" },
      ],
      validation: { required: true },
    },
    {
      name: "isPublic",
      label: "Public",
      type: "boolean",
      list: true,
      filter: true,
      defaultValue: false,
      description: "Visible to all organization users",
    },
    {
      name: "ownerId",
      label: "Owner",
      type: "reference",
      referenceResource: "users",
      referenceField: "name",
      list: false,
    },
    {
      name: "layout",
      label: "Layout Config",
      type: "json",
      list: false,
      defaultValue: [],
      description: "Grid layout configuration for widgets",
    },
    {
      name: "defaultFilters",
      label: "Default Filters",
      type: "json",
      list: false,
      description: "Default filter state when opening dashboard",
    },

    // Widget count (computed)
    {
      name: "_count",
      label: "Widgets",
      type: "number",
      list: true,
      sortable: true,
      create: false,
      edit: false,
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
    columns: ["name", "type", "isPublic", "_count", "createdAt"],
    defaultSort: { field: "name", order: "asc" },
    pageSize: 20,
    searchable: true,
    searchFields: ["name", "description"],
    defaultFilters: ["type", "isPublic"],
    rowActions: [
      {
        name: "edit",
        label: "Edit",
        icon: "Pencil",
        position: "row",
        type: "link",
        href: "/admin/analytics-dashboards/{{id}}/edit",
      },
      {
        name: "view",
        label: "View",
        icon: "Eye",
        position: "row",
        type: "link",
        href: "/admin/analytics-dashboards/{{id}}",
      },
      {
        name: "preview",
        label: "Preview",
        icon: "LayoutDashboard",
        position: "row",
        type: "link",
        color: "primary",
        href: "/dashboards/{{id}}",
      },
    ],
    headerActions: [
      {
        name: "create",
        label: "New Dashboard",
        icon: "Plus",
        position: "header",
        type: "link",
        href: "/admin/analytics-dashboards/create",
        color: "primary",
        permissions: ["ADMIN", "LEADERSHIP"],
      },
    ],
    emptyTitle: "No dashboards",
    emptyDescription: "Create a dashboard to visualize your organization's metrics.",
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "description", "type"],
      },
      {
        id: "access",
        title: "Access",
        description: "Control who can view this dashboard",
        fields: ["isPublic", "ownerId"],
      },
      {
        id: "defaults",
        title: "Default Configuration",
        description: "Initial layout and filter settings",
        fields: ["defaultFilters"],
        collapsible: true,
        defaultOpen: false,
      },
    ],
    layout: "single",
    submitLabel: "Create Dashboard",
    redirectOnSuccess: "show",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "description", "type"],
      },
      {
        id: "access",
        title: "Access",
        fields: ["isPublic", "ownerId"],
      },
      {
        id: "layout",
        title: "Layout",
        description: "Widget grid layout configuration",
        fields: ["layout"],
        collapsible: true,
      },
      {
        id: "defaults",
        title: "Defaults",
        fields: ["defaultFilters"],
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
        fields: ["name", "type", "isPublic"],
        columns: 3,
      },
      {
        id: "description",
        title: "Description",
        fields: ["description"],
        columns: 1,
      },
      {
        id: "configuration",
        title: "Configuration",
        fields: ["layout", "defaultFilters"],
        columns: 2,
      },
      {
        id: "meta",
        title: "Metadata",
        fields: ["id", "ownerId", "createdAt", "updatedAt"],
        columns: 4,
      },
    ],
    layout: "single",
    actions: [
      {
        name: "edit",
        label: "Edit Dashboard",
        icon: "Pencil",
        position: "toolbar",
        type: "link",
        href: "/admin/analytics-dashboards/{{id}}/edit",
        color: "primary",
      },
      {
        name: "preview",
        label: "Open Dashboard",
        icon: "LayoutDashboard",
        position: "toolbar",
        type: "link",
        href: "/dashboards/{{id}}",
        color: "success",
      },
      {
        name: "manageWidgets",
        label: "Manage Widgets",
        icon: "Settings",
        position: "toolbar",
        type: "link",
        href: "/admin/analytics-dashboards/{{id}}/widgets",
      },
    ],
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    show: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    create: ["ADMIN", "LEADERSHIP"],
    edit: ["ADMIN", "LEADERSHIP"],
    delete: ["ADMIN"],
  },

  audit: true,
  softDelete: false,
  tenantField: "organizationId",
};
