import type { ResourceConfig } from "./types";

export const usersResource: ResourceConfig = {
  name: "users",
  label: "User",
  labelPlural: "Users",
  model: "User",
  module: "CORE",
  icon: "Users",
  description: "Team members and their permissions",

  fields: [
    // Identity
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
      name: "email",
      label: "Email",
      type: "email",
      list: true,
      filter: true,
      sortable: true,
      validation: { required: true },
    },
    {
      name: "avatarUrl",
      label: "Avatar",
      type: "image",
      list: true,
      width: "xs",
    },
    {
      name: "role",
      label: "Role",
      type: "string",
      list: true,
      filter: true,
      placeholder: "e.g., Senior Designer, Account Manager",
      validation: { required: true },
    },
    {
      name: "department",
      label: "Department",
      type: "select",
      list: true,
      filter: true,
      validation: { required: true },
      options: [
        { value: "Executive", label: "Executive" },
        { value: "Creative", label: "Creative" },
        { value: "Video Production", label: "Video Production" },
        { value: "Design", label: "Design" },
        { value: "Copywriting", label: "Copywriting" },
        { value: "Social Media", label: "Social Media" },
        { value: "Paid Media", label: "Paid Media" },
        { value: "Account Management", label: "Account Management" },
        { value: "Operations", label: "Operations" },
        { value: "Finance", label: "Finance" },
      ],
    },
    {
      name: "permissionLevel",
      label: "Permission Level",
      type: "enum",
      enumName: "PermissionLevel",
      list: true,
      filter: true,
      validation: { required: true },
      options: [
        { value: "ADMIN", label: "Admin", color: "red" },
        { value: "LEADERSHIP", label: "Leadership", color: "orange" },
        { value: "TEAM_LEAD", label: "Team Lead", color: "yellow" },
        { value: "STAFF", label: "Staff", color: "blue" },
        { value: "FREELANCER", label: "Freelancer", color: "gray" },
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
    {
      name: "isFreelancer",
      label: "Freelancer",
      type: "boolean",
      list: true,
      filter: true,
      defaultValue: false,
    },

    // Capacity & Rates
    {
      name: "weeklyCapacity",
      label: "Weekly Capacity (hrs)",
      type: "number",
      list: false,
      defaultValue: 40,
      validation: { min: 0, max: 80 },
    },
    {
      name: "hourlyRate",
      label: "Hourly Rate",
      type: "decimal",
      list: false,
      description: "For freelancers and contractors",
    },
    {
      name: "skills",
      label: "Skills",
      type: "tags",
      list: false,
      description: "Comma-separated list of skills",
    },

    // Team relations
    {
      name: "teamLead",
      label: "Team Lead",
      type: "relation",
      list: false,
      relation: {
        resource: "users",
        field: "teamLeadId",
        displayField: "name",
        searchFields: ["name", "email"],
      },
    },

    // Contact info
    {
      name: "phone",
      label: "Phone",
      type: "phone",
      list: false,
    },
    {
      name: "dateOfBirth",
      label: "Date of Birth",
      type: "date",
      list: false,
    },

    // Employment details
    {
      name: "employmentType",
      label: "Employment Type",
      type: "enum",
      enumName: "EmploymentType",
      list: false,
      filter: true,
      options: [
        { value: "FULL_TIME", label: "Full Time" },
        { value: "PART_TIME", label: "Part Time" },
        { value: "CONTRACT", label: "Contract" },
        { value: "FREELANCE", label: "Freelance" },
        { value: "INTERN", label: "Intern" },
      ],
    },
    {
      name: "startDate",
      label: "Start Date",
      type: "date",
      list: false,
    },
    {
      name: "contractEnd",
      label: "Contract End",
      type: "date",
      list: false,
      showWhen: {
        field: "employmentType",
        operator: "in",
        value: ["CONTRACT", "FREELANCE"],
      },
    },

    // UAE-specific
    {
      name: "emiratesId",
      label: "Emirates ID",
      type: "string",
      list: false,
    },
    {
      name: "emiratesIdExpiry",
      label: "Emirates ID Expiry",
      type: "date",
      list: false,
    },
    {
      name: "visaStatus",
      label: "Visa Status",
      type: "enum",
      enumName: "VisaStatus",
      list: false,
      options: [
        { value: "EMPLOYMENT", label: "Employment" },
        { value: "INVESTOR", label: "Investor" },
        { value: "GOLDEN", label: "Golden" },
        { value: "FREELANCE", label: "Freelance" },
        { value: "VISIT", label: "Visit" },
        { value: "EXPIRED", label: "Expired", color: "red" },
      ],
    },
    {
      name: "visaExpiry",
      label: "Visa Expiry",
      type: "date",
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

    // Notes
    {
      name: "notes",
      label: "Notes",
      type: "text",
      list: false,
      description: "Internal notes about this user",
    },
  ],

  list: {
    columns: ["avatarUrl", "name", "email", "role", "department", "permissionLevel", "isActive"],
    defaultSort: { field: "name", order: "asc" },
    pageSize: 20,
    pageSizeOptions: [10, 20, 50, 100],
    searchable: true,
    searchFields: ["name", "email", "role"],
    defaultFilters: ["department", "permissionLevel", "isActive"],
    rowActions: [
      {
        name: "edit",
        label: "Edit",
        icon: "Pencil",
        position: "row",
        type: "link",
        href: "/admin/users/{{id}}/edit",
      },
      {
        name: "view",
        label: "View",
        icon: "Eye",
        position: "row",
        type: "link",
        href: "/admin/users/{{id}}",
      },
    ],
    headerActions: [
      {
        name: "create",
        label: "Add User",
        icon: "Plus",
        position: "header",
        type: "link",
        href: "/admin/users/create",
        color: "primary",
        permissions: ["ADMIN"],
      },
      {
        name: "export",
        label: "Export",
        icon: "Download",
        position: "header",
        type: "api",
        api: {
          method: "GET",
          endpoint: "/api/admin/users/export",
        },
      },
    ],
    emptyTitle: "No users found",
    emptyDescription: "Get started by adding your first team member.",
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "email", "role", "department", "permissionLevel"],
      },
      {
        id: "status",
        title: "Status",
        fields: ["isActive", "isFreelancer"],
      },
      {
        id: "capacity",
        title: "Capacity & Skills",
        fields: ["weeklyCapacity", "hourlyRate", "skills", "teamLead"],
        collapsible: true,
        defaultOpen: false,
      },
      {
        id: "contact",
        title: "Contact Information",
        fields: ["phone", "dateOfBirth"],
        collapsible: true,
        defaultOpen: false,
      },
      {
        id: "employment",
        title: "Employment Details",
        fields: ["employmentType", "startDate", "contractEnd"],
        collapsible: true,
        defaultOpen: false,
      },
      {
        id: "uae",
        title: "UAE Documentation",
        fields: ["emiratesId", "emiratesIdExpiry", "visaStatus", "visaExpiry"],
        collapsible: true,
        defaultOpen: false,
      },
      {
        id: "notes",
        title: "Notes",
        fields: ["notes"],
        collapsible: true,
        defaultOpen: false,
      },
    ],
    layout: "single",
    submitLabel: "Create User",
    redirectOnSuccess: "list",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "email", "avatarUrl", "role", "department", "permissionLevel"],
      },
      {
        id: "status",
        title: "Status",
        fields: ["isActive", "isFreelancer"],
      },
      {
        id: "capacity",
        title: "Capacity & Skills",
        fields: ["weeklyCapacity", "hourlyRate", "skills", "teamLead"],
        collapsible: true,
      },
      {
        id: "contact",
        title: "Contact Information",
        fields: ["phone", "dateOfBirth"],
        collapsible: true,
      },
      {
        id: "employment",
        title: "Employment Details",
        fields: ["employmentType", "startDate", "contractEnd"],
        collapsible: true,
      },
      {
        id: "uae",
        title: "UAE Documentation",
        fields: ["emiratesId", "emiratesIdExpiry", "visaStatus", "visaExpiry"],
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
        fields: ["name", "email", "role", "department", "permissionLevel", "isActive"],
        columns: 2,
      },
      {
        id: "capacity",
        title: "Capacity & Skills",
        fields: ["weeklyCapacity", "hourlyRate", "skills", "teamLead"],
        columns: 2,
      },
      {
        id: "contact",
        title: "Contact Information",
        fields: ["phone", "dateOfBirth"],
        columns: 2,
      },
      {
        id: "employment",
        title: "Employment",
        fields: ["employmentType", "startDate", "contractEnd"],
        columns: 2,
      },
      {
        id: "uae",
        title: "UAE Documentation",
        fields: ["emiratesId", "emiratesIdExpiry", "visaStatus", "visaExpiry"],
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
        title: "Assigned Briefs",
        field: "briefsAssigned",
        displayMode: "table",
        limit: 5,
      },
      {
        resource: "time-entries",
        title: "Recent Time Entries",
        field: "timeEntries",
        displayMode: "table",
        limit: 10,
      },
    ],
    actions: [
      {
        name: "edit",
        label: "Edit User",
        icon: "Pencil",
        position: "toolbar",
        type: "link",
        href: "/admin/users/{{id}}/edit",
        color: "primary",
      },
      {
        name: "deactivate",
        label: "Deactivate",
        icon: "UserX",
        position: "toolbar",
        type: "api",
        color: "danger",
        api: {
          method: "PUT",
          endpoint: "/api/admin/users/{{id}}/deactivate",
          confirm: "Are you sure you want to deactivate this user?",
        },
        permissions: ["ADMIN"],
      },
    ],
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    show: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    create: ["ADMIN"],
    edit: ["ADMIN", "LEADERSHIP"],
    delete: ["ADMIN"],
    fields: {
      hourlyRate: {
        view: ["ADMIN", "LEADERSHIP"],
        edit: ["ADMIN"],
      },
      emiratesId: {
        view: ["ADMIN"],
        edit: ["ADMIN"],
      },
      bankAccountNumber: {
        view: ["ADMIN"],
        edit: ["ADMIN"],
      },
    },
  },

  audit: true,
  softDelete: false,
  tenantField: "organizationId",
};
