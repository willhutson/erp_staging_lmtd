/**
 * Integrations Resource Configuration
 *
 * Manage external service integrations (Google, Slack, Figma, etc.)
 */

import type { ResourceConfig } from "./types";

export const integrationsResource: ResourceConfig = {
  name: "integrations",
  label: "Integration",
  labelPlural: "Integrations",
  model: "Integration",
  module: "INTEGRATIONS",
  icon: "Plug",
  description: "Configure external service integrations",

  fields: [
    {
      name: "id",
      label: "ID",
      type: "string",
      list: false,
      create: false,
      edit: false,
    },
    {
      name: "name",
      label: "Name",
      type: "string",
      list: true,
      sortable: true,
      validation: { required: true },
    },
    {
      name: "provider",
      label: "Provider",
      type: "enum",
      list: true,
      filter: true,
      options: [
        { value: "GOOGLE", label: "Google Workspace", color: "blue" },
        { value: "SLACK", label: "Slack", color: "purple" },
        { value: "FIGMA", label: "Figma", color: "pink" },
        { value: "META", label: "Meta (Facebook/Instagram)", color: "blue" },
        { value: "OPENAI", label: "OpenAI", color: "green" },
        { value: "ANTHROPIC", label: "Anthropic", color: "orange" },
        { value: "RESEND", label: "Resend", color: "blue" },
        { value: "PUSHER", label: "Pusher", color: "purple" },
        { value: "CLOUDFLARE", label: "Cloudflare", color: "orange" },
        { value: "WHATSAPP", label: "WhatsApp", color: "green" },
        { value: "CUSTOM", label: "Custom Webhook", color: "gray" },
      ],
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      list: false,
    },
    {
      name: "status",
      label: "Status",
      type: "enum",
      list: true,
      filter: true,
      options: [
        { value: "ACTIVE", label: "Active", color: "green" },
        { value: "INACTIVE", label: "Inactive", color: "gray" },
        { value: "ERROR", label: "Error", color: "red" },
        { value: "PENDING", label: "Pending Setup", color: "yellow" },
      ],
    },
    {
      name: "config",
      label: "Configuration",
      type: "json",
      list: false,
      description: "Provider-specific configuration (JSON)",
    },
    {
      name: "credentials",
      label: "Credentials",
      type: "json",
      list: false,
      show: false,
      description: "Encrypted credentials (not visible in UI)",
    },
    {
      name: "scopes",
      label: "Scopes",
      type: "tags",
      list: false,
      description: "OAuth scopes or permissions granted",
    },
    {
      name: "webhookUrl",
      label: "Webhook URL",
      type: "url",
      list: false,
      description: "Incoming webhook endpoint for this integration",
    },
    {
      name: "lastSyncAt",
      label: "Last Sync",
      type: "datetime",
      list: true,
      sortable: true,
      create: false,
      edit: false,
    },
    {
      name: "lastErrorAt",
      label: "Last Error",
      type: "datetime",
      list: false,
      create: false,
      edit: false,
    },
    {
      name: "lastErrorMessage",
      label: "Last Error Message",
      type: "text",
      list: false,
      create: false,
      edit: false,
    },
    {
      name: "isEnabled",
      label: "Enabled",
      type: "boolean",
      list: true,
      filter: true,
      defaultValue: true,
    },
    {
      name: "createdAt",
      label: "Created",
      type: "datetime",
      list: false,
      create: false,
      edit: false,
    },
    {
      name: "updatedAt",
      label: "Updated",
      type: "datetime",
      list: false,
      create: false,
      edit: false,
    },
  ],

  list: {
    columns: ["name", "provider", "status", "isEnabled", "lastSyncAt"],
    defaultSort: { field: "name", order: "asc" },
    pageSize: 20,
    searchable: true,
    searchFields: ["name"],
    defaultFilters: ["provider", "status"],
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Integration Details",
        fields: ["name", "provider", "description"],
      },
      {
        id: "config",
        title: "Configuration",
        description: "Provider-specific settings",
        fields: ["config", "scopes", "webhookUrl"],
      },
      {
        id: "status",
        title: "Status",
        fields: ["isEnabled"],
      },
    ],
    redirectOnSuccess: "show",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Integration Details",
        fields: ["name", "description"],
      },
      {
        id: "config",
        title: "Configuration",
        fields: ["config", "scopes", "webhookUrl"],
      },
      {
        id: "status",
        title: "Status",
        fields: ["status", "isEnabled"],
      },
    ],
    redirectOnSuccess: "show",
  },

  show: {
    sections: [
      {
        id: "basic",
        title: "Integration Details",
        fields: ["name", "provider", "description", "status", "isEnabled"],
        columns: 2,
      },
      {
        id: "config",
        title: "Configuration",
        fields: ["config", "scopes", "webhookUrl"],
      },
      {
        id: "sync",
        title: "Sync Status",
        fields: ["lastSyncAt", "lastErrorAt", "lastErrorMessage"],
        columns: 3,
      },
      {
        id: "meta",
        title: "Metadata",
        fields: ["id", "createdAt", "updatedAt"],
        columns: 3,
      },
    ],
    layout: "single",
  },

  permissions: {
    list: ["ADMIN"],
    show: ["ADMIN"],
    create: ["ADMIN"],
    edit: ["ADMIN"],
    delete: ["ADMIN"],
  },

  audit: true,
};
