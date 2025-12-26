import type { ResourceConfig } from "./types";

export const auditLogsResource: ResourceConfig = {
  name: "audit-logs",
  label: "Audit Log",
  labelPlural: "Audit Logs",
  model: "AuditLog",
  module: "CORE",
  icon: "FileText",
  description: "System activity and change history",

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
      name: "createdAt",
      label: "Timestamp",
      type: "datetime",
      list: true,
      show: true,
      create: false,
      edit: false,
      sortable: true,
    },
    {
      name: "user",
      label: "User",
      type: "relation",
      list: true,
      filter: true,
      create: false,
      edit: false,
      relation: {
        resource: "users",
        field: "userId",
        displayField: "name",
        searchFields: ["name", "email"],
      },
    },
    {
      name: "action",
      label: "Action",
      type: "enum",
      enumName: "AuditAction",
      list: true,
      filter: true,
      create: false,
      edit: false,
      options: [
        { value: "CREATE", label: "Create", color: "green" },
        { value: "UPDATE", label: "Update", color: "blue" },
        { value: "DELETE", label: "Delete", color: "red" },
        { value: "LOGIN", label: "Login", color: "gray" },
        { value: "LOGOUT", label: "Logout", color: "gray" },
        { value: "EXPORT", label: "Export", color: "purple" },
        { value: "IMPORT", label: "Import", color: "purple" },
        { value: "APPROVE", label: "Approve", color: "green" },
        { value: "REJECT", label: "Reject", color: "red" },
        { value: "SUBMIT", label: "Submit", color: "yellow" },
      ],
    },
    {
      name: "resource",
      label: "Resource",
      type: "string",
      list: true,
      filter: true,
      create: false,
      edit: false,
      description: "The type of entity affected",
    },
    {
      name: "resourceId",
      label: "Resource ID",
      type: "string",
      list: true,
      create: false,
      edit: false,
    },
    {
      name: "oldState",
      label: "Previous State",
      type: "json",
      list: false,
      show: true,
      create: false,
      edit: false,
      description: "State before the change",
    },
    {
      name: "newState",
      label: "New State",
      type: "json",
      list: false,
      show: true,
      create: false,
      edit: false,
      description: "State after the change",
    },
    {
      name: "ipAddress",
      label: "IP Address",
      type: "string",
      list: false,
      show: true,
      create: false,
      edit: false,
    },
    {
      name: "userAgent",
      label: "User Agent",
      type: "string",
      list: false,
      show: true,
      create: false,
      edit: false,
    },
    {
      name: "metadata",
      label: "Metadata",
      type: "json",
      list: false,
      show: true,
      create: false,
      edit: false,
      description: "Additional context about the action",
    },
  ],

  list: {
    columns: ["createdAt", "user", "action", "resource", "resourceId"],
    defaultSort: { field: "createdAt", order: "desc" },
    pageSize: 50,
    pageSizeOptions: [25, 50, 100, 200],
    searchable: true,
    searchFields: ["resource", "resourceId"],
    defaultFilters: ["action", "resource", "user"],
    rowActions: [
      {
        name: "view",
        label: "View Details",
        icon: "Eye",
        position: "row",
        type: "link",
        href: "/admin/audit-logs/{{id}}",
      },
    ],
    headerActions: [
      {
        name: "export",
        label: "Export Logs",
        icon: "Download",
        position: "header",
        type: "api",
        api: {
          method: "GET",
          endpoint: "/api/admin/audit-logs/export",
        },
        permissions: ["ADMIN"],
      },
    ],
    emptyTitle: "No audit logs found",
    emptyDescription: "Activity will appear here as users interact with the system.",
  },

  // Audit logs are read-only - no create/edit forms
  create: undefined,
  edit: undefined,

  show: {
    sections: [
      {
        id: "overview",
        title: "Overview",
        fields: ["createdAt", "user", "action", "resource", "resourceId"],
        columns: 2,
      },
      {
        id: "changes",
        title: "Changes",
        fields: ["oldState", "newState"],
        columns: 2,
      },
      {
        id: "context",
        title: "Context",
        fields: ["ipAddress", "userAgent", "metadata"],
        columns: 1,
      },
      {
        id: "meta",
        title: "Metadata",
        fields: ["id"],
        columns: 1,
      },
    ],
    layout: "single",
    actions: [],  // No actions on audit logs
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP"],
    show: ["ADMIN", "LEADERSHIP"],
    create: [],  // No one can manually create audit logs
    edit: [],    // No one can edit audit logs
    delete: [],  // No one can delete audit logs
  },

  audit: false,  // Don't audit the audit logs themselves
  softDelete: false,
  tenantField: "organizationId",
};
