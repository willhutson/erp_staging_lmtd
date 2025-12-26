import type { ResourceConfig } from "./types";

export const clientsResource: ResourceConfig = {
  name: "clients",
  label: "Client",
  labelPlural: "Clients",
  model: "Client",
  module: "CORE",
  icon: "Building2",
  description: "Agency clients and their details",

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
      name: "code",
      label: "Code",
      type: "string",
      list: true,
      description: "Short code for the client (e.g., CCAD, DET)",
      validation: { required: true, maxLength: 10 },
    },
    {
      name: "logoUrl",
      label: "Logo",
      type: "image",
      list: true,
      width: "xs",
    },
    {
      name: "industry",
      label: "Industry",
      type: "select",
      list: true,
      filter: true,
      options: [
        { value: "government", label: "Government" },
        { value: "real_estate", label: "Real Estate" },
        { value: "hospitality", label: "Hospitality" },
        { value: "retail", label: "Retail" },
        { value: "technology", label: "Technology" },
        { value: "finance", label: "Finance" },
        { value: "healthcare", label: "Healthcare" },
        { value: "education", label: "Education" },
        { value: "entertainment", label: "Entertainment" },
        { value: "other", label: "Other" },
      ],
    },
    {
      name: "status",
      label: "Status",
      type: "enum",
      enumName: "ClientStatus",
      list: true,
      filter: true,
      options: [
        { value: "ACTIVE", label: "Active", color: "green" },
        { value: "INACTIVE", label: "Inactive", color: "gray" },
        { value: "PROSPECT", label: "Prospect", color: "blue" },
        { value: "CHURNED", label: "Churned", color: "red" },
      ],
    },
    {
      name: "accountManager",
      label: "Account Manager",
      type: "relation",
      list: true,
      filter: true,
      relation: {
        resource: "users",
        field: "accountManagerId",
        displayField: "name",
        searchFields: ["name", "email"],
        filter: { department: "Account Management" },
      },
    },

    // Contact info
    {
      name: "primaryContactName",
      label: "Primary Contact",
      type: "string",
      list: false,
    },
    {
      name: "primaryContactEmail",
      label: "Contact Email",
      type: "email",
      list: false,
    },
    {
      name: "primaryContactPhone",
      label: "Contact Phone",
      type: "phone",
      list: false,
    },

    // Billing
    {
      name: "billingEmail",
      label: "Billing Email",
      type: "email",
      list: false,
    },
    {
      name: "billingAddress",
      label: "Billing Address",
      type: "text",
      list: false,
    },
    {
      name: "vatNumber",
      label: "VAT Number",
      type: "string",
      list: false,
    },

    // Retainer
    {
      name: "retainerType",
      label: "Retainer Type",
      type: "select",
      list: true,
      filter: true,
      options: [
        { value: "none", label: "No Retainer" },
        { value: "monthly", label: "Monthly" },
        { value: "quarterly", label: "Quarterly" },
        { value: "annual", label: "Annual" },
      ],
    },
    {
      name: "retainerAmount",
      label: "Retainer Amount",
      type: "decimal",
      list: false,
      showWhen: {
        field: "retainerType",
        operator: "neq",
        value: "none",
      },
    },
    {
      name: "retainerHours",
      label: "Retainer Hours",
      type: "number",
      list: false,
      description: "Monthly hours included in retainer",
      showWhen: {
        field: "retainerType",
        operator: "neq",
        value: "none",
      },
    },

    // Brand guidelines
    {
      name: "brandColor",
      label: "Brand Color",
      type: "color",
      list: false,
    },
    {
      name: "brandGuidelines",
      label: "Brand Guidelines URL",
      type: "url",
      list: false,
    },

    // Notes
    {
      name: "notes",
      label: "Notes",
      type: "text",
      list: false,
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
    columns: ["logoUrl", "name", "code", "industry", "status", "accountManager", "retainerType"],
    defaultSort: { field: "name", order: "asc" },
    pageSize: 20,
    searchable: true,
    searchFields: ["name", "code"],
    defaultFilters: ["status", "industry", "accountManager"],
    rowActions: [
      {
        name: "edit",
        label: "Edit",
        icon: "Pencil",
        position: "row",
        type: "link",
        href: "/admin/clients/{{id}}/edit",
      },
      {
        name: "view",
        label: "View",
        icon: "Eye",
        position: "row",
        type: "link",
        href: "/admin/clients/{{id}}",
      },
    ],
    headerActions: [
      {
        name: "create",
        label: "Add Client",
        icon: "Plus",
        position: "header",
        type: "link",
        href: "/admin/clients/create",
        color: "primary",
        permissions: ["ADMIN", "LEADERSHIP"],
      },
    ],
    emptyTitle: "No clients found",
    emptyDescription: "Add your first client to get started.",
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "code", "logoUrl", "industry", "status", "accountManager"],
      },
      {
        id: "contact",
        title: "Primary Contact",
        fields: ["primaryContactName", "primaryContactEmail", "primaryContactPhone"],
      },
      {
        id: "billing",
        title: "Billing",
        fields: ["billingEmail", "billingAddress", "vatNumber"],
        collapsible: true,
      },
      {
        id: "retainer",
        title: "Retainer",
        fields: ["retainerType", "retainerAmount", "retainerHours"],
        collapsible: true,
      },
      {
        id: "brand",
        title: "Brand",
        fields: ["brandColor", "brandGuidelines"],
        collapsible: true,
      },
      {
        id: "notes",
        title: "Notes",
        fields: ["notes"],
        collapsible: true,
      },
    ],
    layout: "single",
    submitLabel: "Create Client",
    redirectOnSuccess: "list",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "code", "logoUrl", "industry", "status", "accountManager"],
      },
      {
        id: "contact",
        title: "Primary Contact",
        fields: ["primaryContactName", "primaryContactEmail", "primaryContactPhone"],
      },
      {
        id: "billing",
        title: "Billing",
        fields: ["billingEmail", "billingAddress", "vatNumber"],
        collapsible: true,
      },
      {
        id: "retainer",
        title: "Retainer",
        fields: ["retainerType", "retainerAmount", "retainerHours"],
        collapsible: true,
      },
      {
        id: "brand",
        title: "Brand",
        fields: ["brandColor", "brandGuidelines"],
        collapsible: true,
      },
      {
        id: "notes",
        title: "Notes",
        fields: ["notes"],
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
        fields: ["name", "code", "industry", "status", "accountManager"],
        columns: 2,
      },
      {
        id: "contact",
        title: "Primary Contact",
        fields: ["primaryContactName", "primaryContactEmail", "primaryContactPhone"],
        columns: 3,
      },
      {
        id: "billing",
        title: "Billing",
        fields: ["billingEmail", "billingAddress", "vatNumber"],
        columns: 2,
      },
      {
        id: "retainer",
        title: "Retainer Details",
        fields: ["retainerType", "retainerAmount", "retainerHours"],
        columns: 3,
      },
      {
        id: "brand",
        title: "Brand",
        fields: ["brandColor", "brandGuidelines"],
        columns: 2,
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
        title: "Recent Briefs",
        field: "briefs",
        displayMode: "table",
        limit: 10,
      },
      {
        resource: "projects",
        title: "Projects",
        field: "projects",
        displayMode: "cards",
        limit: 6,
      },
    ],
    actions: [
      {
        name: "edit",
        label: "Edit Client",
        icon: "Pencil",
        position: "toolbar",
        type: "link",
        href: "/admin/clients/{{id}}/edit",
        color: "primary",
      },
    ],
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    show: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"],
    create: ["ADMIN", "LEADERSHIP"],
    edit: ["ADMIN", "LEADERSHIP"],
    delete: ["ADMIN"],
    fields: {
      retainerAmount: {
        view: ["ADMIN", "LEADERSHIP"],
        edit: ["ADMIN"],
      },
      billingEmail: {
        view: ["ADMIN", "LEADERSHIP"],
        edit: ["ADMIN"],
      },
    },
  },

  audit: true,
  softDelete: false,
  tenantField: "organizationId",
};
