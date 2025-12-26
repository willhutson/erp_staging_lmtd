import type { ResourceConfig } from "./types";

/**
 * Doc Templates Resource
 *
 * Manages template configurations for the doc-engine microservice.
 * Templates define how to generate Google Docs from Figma designs.
 */
export const docTemplatesResource: ResourceConfig = {
  name: "doc-templates",
  label: "Doc Template",
  labelPlural: "Doc Templates",
  model: "DocTemplate",
  module: "CONTENT_ENGINE",
  icon: "FileText",
  description: "Templates for generating Google Docs from Figma designs",

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
      name: "category",
      label: "Category",
      type: "enum",
      enumName: "DocTemplateCategory",
      list: true,
      filter: true,
      options: [
        { value: "BRIEF", label: "Brief", color: "blue" },
        { value: "PROPOSAL", label: "Proposal", color: "green" },
        { value: "REPORT", label: "Report", color: "purple" },
        { value: "CONTRACT", label: "Contract", color: "orange" },
        { value: "INVOICE", label: "Invoice", color: "yellow" },
        { value: "OTHER", label: "Other", color: "gray" },
      ],
    },
    {
      name: "isActive",
      label: "Active",
      type: "boolean",
      list: true,
      filter: true,
      defaultValue: true,
    },

    // Figma source
    {
      name: "figmaFileKey",
      label: "Figma File Key",
      type: "string",
      list: false,
      validation: { required: true },
      description: "The key from the Figma file URL",
    },
    {
      name: "figmaFileUrl",
      label: "Figma URL",
      type: "url",
      list: false,
      description: "Full URL to the Figma design file",
    },

    // Google Doc target
    {
      name: "googleDocId",
      label: "Google Doc Template ID",
      type: "string",
      list: false,
      validation: { required: true },
      description: "ID of the Google Doc template to copy",
    },
    {
      name: "googleDocUrl",
      label: "Template URL",
      type: "url",
      list: true,
      create: false,
      edit: false,
      description: "Link to the Google Doc template",
    },

    // Field mappings
    {
      name: "mappings",
      label: "Field Mappings",
      type: "json",
      list: false,
      description: "Array of {figma_node, doc_var} mappings",
      defaultValue: [],
    },

    // Output settings
    {
      name: "outputFolder",
      label: "Output Folder ID",
      type: "string",
      list: false,
      description: "Google Drive folder ID for generated docs",
    },
    {
      name: "namingPattern",
      label: "Naming Pattern",
      type: "string",
      list: false,
      placeholder: "Generated Doc - {{date}} - {{client}}",
      description: "Pattern for naming generated documents",
    },

    // Stats
    {
      name: "generationCount",
      label: "Generations",
      type: "number",
      list: true,
      sortable: true,
      create: false,
      edit: false,
    },
    {
      name: "lastGeneratedAt",
      label: "Last Generated",
      type: "datetime",
      list: false,
      show: true,
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
    columns: ["name", "category", "isActive", "googleDocUrl", "generationCount"],
    defaultSort: { field: "name", order: "asc" },
    pageSize: 20,
    searchable: true,
    searchFields: ["name", "description"],
    defaultFilters: ["category", "isActive"],
    rowActions: [
      {
        name: "edit",
        label: "Edit",
        icon: "Pencil",
        position: "row",
        type: "link",
        href: "/admin/doc-templates/{{id}}/edit",
      },
      {
        name: "view",
        label: "View",
        icon: "Eye",
        position: "row",
        type: "link",
        href: "/admin/doc-templates/{{id}}",
      },
      {
        name: "generate",
        label: "Generate",
        icon: "FileOutput",
        position: "row",
        type: "api",
        color: "primary",
        api: {
          method: "POST",
          endpoint: "/api/admin/doc-templates/{{id}}/generate",
        },
      },
    ],
    headerActions: [
      {
        name: "create",
        label: "New Template",
        icon: "Plus",
        position: "header",
        type: "link",
        href: "/admin/doc-templates/create",
        color: "primary",
        permissions: ["ADMIN", "LEADERSHIP"],
      },
    ],
    emptyTitle: "No doc templates",
    emptyDescription: "Create a template to generate Google Docs from Figma designs.",
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "description", "category", "isActive"],
      },
      {
        id: "figma",
        title: "Figma Source",
        description: "Connect to your Figma design file",
        fields: ["figmaFileKey", "figmaFileUrl"],
      },
      {
        id: "google",
        title: "Google Doc Template",
        description: "The template document to copy and populate",
        fields: ["googleDocId", "outputFolder", "namingPattern"],
      },
      {
        id: "mappings",
        title: "Field Mappings",
        description: "Map Figma text nodes to document variables",
        fields: ["mappings"],
        collapsible: true,
        defaultOpen: true,
      },
    ],
    layout: "single",
    submitLabel: "Create Template",
    redirectOnSuccess: "show",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "description", "category", "isActive"],
      },
      {
        id: "figma",
        title: "Figma Source",
        fields: ["figmaFileKey", "figmaFileUrl"],
      },
      {
        id: "google",
        title: "Google Doc Template",
        fields: ["googleDocId", "outputFolder", "namingPattern"],
      },
      {
        id: "mappings",
        title: "Field Mappings",
        fields: ["mappings"],
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
        fields: ["name", "category", "isActive"],
        columns: 3,
      },
      {
        id: "description",
        title: "Description",
        fields: ["description"],
        columns: 1,
      },
      {
        id: "figma",
        title: "Figma Source",
        fields: ["figmaFileKey", "figmaFileUrl"],
        columns: 2,
      },
      {
        id: "google",
        title: "Google Doc",
        fields: ["googleDocId", "googleDocUrl", "outputFolder", "namingPattern"],
        columns: 2,
      },
      {
        id: "mappings",
        title: "Field Mappings",
        fields: ["mappings"],
        columns: 1,
      },
      {
        id: "stats",
        title: "Statistics",
        fields: ["generationCount", "lastGeneratedAt"],
        columns: 2,
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
        label: "Edit Template",
        icon: "Pencil",
        position: "toolbar",
        type: "link",
        href: "/admin/doc-templates/{{id}}/edit",
        color: "primary",
      },
      {
        name: "generate",
        label: "Generate Document",
        icon: "FileOutput",
        position: "toolbar",
        type: "api",
        color: "success",
        api: {
          method: "POST",
          endpoint: "/api/admin/doc-templates/{{id}}/generate",
          confirm: "This will create a new document. Continue?",
        },
      },
      {
        name: "openFigma",
        label: "Open in Figma",
        icon: "ExternalLink",
        position: "toolbar",
        type: "link",
        href: "{{figmaFileUrl}}",
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

  // Custom API path since this uses Supabase, not Prisma
  api: {
    basePath: "/api/admin/doc-templates",
  },
};
