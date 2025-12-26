import type { ResourceConfig } from "./types";

export const projectsResource: ResourceConfig = {
  name: "projects",
  label: "Project",
  labelPlural: "Projects",
  model: "Project",
  module: "CORE",
  icon: "FolderKanban",
  description: "Client projects and campaigns",

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
      validation: { required: true, minLength: 2, maxLength: 200 },
    },
    {
      name: "code",
      label: "Code",
      type: "string",
      list: true,
      description: "Project code (auto-generated or custom)",
      validation: { maxLength: 20 },
    },
    {
      name: "client",
      label: "Client",
      type: "relation",
      list: true,
      filter: true,
      validation: { required: true },
      relation: {
        resource: "clients",
        field: "clientId",
        displayField: "name",
        searchFields: ["name", "code"],
      },
    },
    {
      name: "status",
      label: "Status",
      type: "enum",
      enumName: "ProjectStatus",
      list: true,
      filter: true,
      options: [
        { value: "DRAFT", label: "Draft", color: "gray" },
        { value: "ACTIVE", label: "Active", color: "green" },
        { value: "ON_HOLD", label: "On Hold", color: "yellow" },
        { value: "COMPLETED", label: "Completed", color: "blue" },
        { value: "CANCELLED", label: "Cancelled", color: "red" },
      ],
    },
    {
      name: "projectType",
      label: "Type",
      type: "select",
      list: true,
      filter: true,
      options: [
        { value: "retainer", label: "Retainer" },
        { value: "project", label: "Project" },
        { value: "campaign", label: "Campaign" },
        { value: "pitch", label: "Pitch" },
        { value: "internal", label: "Internal" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      list: false,
    },

    // Timeline
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      list: true,
      sortable: true,
    },
    {
      name: "endDate",
      label: "End Date",
      type: "date",
      list: true,
      sortable: true,
    },

    // Budget
    {
      name: "budget",
      label: "Budget",
      type: "decimal",
      list: false,
    },
    {
      name: "budgetHours",
      label: "Budget Hours",
      type: "number",
      list: false,
    },
    {
      name: "currency",
      label: "Currency",
      type: "select",
      list: false,
      defaultValue: "AED",
      options: [
        { value: "AED", label: "AED" },
        { value: "USD", label: "USD" },
        { value: "EUR", label: "EUR" },
        { value: "GBP", label: "GBP" },
      ],
    },

    // Team
    {
      name: "projectLead",
      label: "Project Lead",
      type: "relation",
      list: true,
      filter: true,
      relation: {
        resource: "users",
        field: "projectLeadId",
        displayField: "name",
        searchFields: ["name", "email"],
      },
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
      sortable: true,
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
    columns: ["name", "code", "client", "status", "projectType", "startDate", "endDate", "projectLead"],
    defaultSort: { field: "updatedAt", order: "desc" },
    pageSize: 20,
    searchable: true,
    searchFields: ["name", "code"],
    defaultFilters: ["status", "client", "projectType"],
    rowActions: [
      {
        name: "edit",
        label: "Edit",
        icon: "Pencil",
        position: "row",
        type: "link",
        href: "/admin/projects/{{id}}/edit",
      },
      {
        name: "view",
        label: "View",
        icon: "Eye",
        position: "row",
        type: "link",
        href: "/admin/projects/{{id}}",
      },
    ],
    headerActions: [
      {
        name: "create",
        label: "New Project",
        icon: "Plus",
        position: "header",
        type: "link",
        href: "/admin/projects/create",
        color: "primary",
        permissions: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
      },
    ],
    emptyTitle: "No projects found",
    emptyDescription: "Create your first project to get started.",
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "code", "client", "status", "projectType", "description"],
      },
      {
        id: "timeline",
        title: "Timeline",
        fields: ["startDate", "endDate"],
      },
      {
        id: "budget",
        title: "Budget",
        fields: ["budget", "currency", "budgetHours"],
        collapsible: true,
      },
      {
        id: "team",
        title: "Team",
        fields: ["projectLead"],
      },
    ],
    layout: "single",
    submitLabel: "Create Project",
    redirectOnSuccess: "list",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "code", "client", "status", "projectType", "description"],
      },
      {
        id: "timeline",
        title: "Timeline",
        fields: ["startDate", "endDate"],
      },
      {
        id: "budget",
        title: "Budget",
        fields: ["budget", "currency", "budgetHours"],
        collapsible: true,
      },
      {
        id: "team",
        title: "Team",
        fields: ["projectLead"],
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
        fields: ["name", "code", "client", "status", "projectType"],
        columns: 2,
      },
      {
        id: "description",
        title: "Description",
        fields: ["description"],
        columns: 1,
      },
      {
        id: "timeline",
        title: "Timeline",
        fields: ["startDate", "endDate"],
        columns: 2,
      },
      {
        id: "budget",
        title: "Budget",
        fields: ["budget", "currency", "budgetHours"],
        columns: 3,
      },
      {
        id: "team",
        title: "Team",
        fields: ["projectLead"],
        columns: 1,
      },
      {
        id: "meta",
        title: "Metadata",
        fields: ["id", "createdAt", "updatedAt"],
        columns: 3,
      },
    ],
    layout: "two-column",
    related: [
      {
        resource: "briefs",
        title: "Briefs",
        field: "briefs",
        displayMode: "table",
        limit: 10,
      },
    ],
    actions: [
      {
        name: "edit",
        label: "Edit Project",
        icon: "Pencil",
        position: "toolbar",
        type: "link",
        href: "/admin/projects/{{id}}/edit",
        color: "primary",
      },
    ],
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    show: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"],
    create: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    edit: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    delete: ["ADMIN"],
    fields: {
      budget: {
        view: ["ADMIN", "LEADERSHIP"],
        edit: ["ADMIN", "LEADERSHIP"],
      },
    },
  },

  audit: true,
  softDelete: false,
  tenantField: "organizationId",
};
