/**
 * Leave Types Resource Configuration
 *
 * Extracted from LMTD's leave management module.
 */

import type { ResourceConfig } from "./types";

export const leaveTypesResource: ResourceConfig = {
  name: "leave-types",
  label: "Leave Type",
  labelPlural: "Leave Types",
  model: "LeaveType",
  module: "CORE",
  icon: "CalendarOff",
  description: "Configure leave types for time-off requests",

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
      validation: { required: true, minLength: 2, maxLength: 50 },
    },
    {
      name: "code",
      label: "Code",
      type: "string",
      list: true,
      description: "Short code for the leave type (e.g., AL, SL, UL)",
      validation: { required: true, maxLength: 10 },
    },
    {
      name: "description",
      label: "Description",
      type: "text",
      list: false,
    },
    {
      name: "color",
      label: "Color",
      type: "color",
      list: true,
      defaultValue: "#52EDC7",
    },
    {
      name: "isPaid",
      label: "Paid Leave",
      type: "boolean",
      list: true,
      defaultValue: true,
    },
    {
      name: "requiresApproval",
      label: "Requires Approval",
      type: "boolean",
      list: true,
      defaultValue: true,
    },
    {
      name: "requiresDocument",
      label: "Requires Document",
      type: "boolean",
      list: false,
      defaultValue: false,
      description: "Whether supporting documents are required (e.g., medical certificate)",
    },
    {
      name: "maxDaysPerYear",
      label: "Max Days/Year",
      type: "number",
      list: true,
      description: "Maximum days allowed per year (0 = unlimited)",
      validation: { min: 0, max: 365 },
    },
    {
      name: "carryOverDays",
      label: "Carry Over Days",
      type: "number",
      list: false,
      description: "Maximum days that can be carried to next year",
      defaultValue: 0,
      validation: { min: 0, max: 30 },
    },
    {
      name: "minNoticeDays",
      label: "Min Notice (Days)",
      type: "number",
      list: false,
      description: "Minimum days notice required before leave",
      defaultValue: 1,
      validation: { min: 0, max: 90 },
    },
    {
      name: "allowHalfDay",
      label: "Allow Half Day",
      type: "boolean",
      list: false,
      defaultValue: true,
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
      name: "applicableTo",
      label: "Applicable To",
      type: "multi-select",
      list: false,
      options: [
        { value: "ADMIN", label: "Admin" },
        { value: "LEADERSHIP", label: "Leadership" },
        { value: "TEAM_LEAD", label: "Team Lead" },
        { value: "STAFF", label: "Staff" },
        { value: "FREELANCER", label: "Freelancer" },
      ],
      defaultValue: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"],
    },
    {
      name: "createdAt",
      label: "Created",
      type: "datetime",
      list: false,
      create: false,
      edit: false,
    },
  ],

  list: {
    columns: ["name", "code", "color", "isPaid", "requiresApproval", "maxDaysPerYear", "isActive"],
    defaultSort: { field: "name", order: "asc" },
    pageSize: 20,
    searchable: true,
    searchFields: ["name", "code"],
    defaultFilters: ["isActive"],
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "code", "description", "color"],
      },
      {
        id: "policy",
        title: "Leave Policy",
        description: "Configure leave rules and limits",
        fields: ["isPaid", "maxDaysPerYear", "carryOverDays", "minNoticeDays", "allowHalfDay"],
      },
      {
        id: "requirements",
        title: "Requirements",
        fields: ["requiresApproval", "requiresDocument", "applicableTo"],
      },
      {
        id: "status",
        title: "Status",
        fields: ["isActive"],
      },
    ],
    redirectOnSuccess: "list",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "code", "description", "color"],
      },
      {
        id: "policy",
        title: "Leave Policy",
        fields: ["isPaid", "maxDaysPerYear", "carryOverDays", "minNoticeDays", "allowHalfDay"],
      },
      {
        id: "requirements",
        title: "Requirements",
        fields: ["requiresApproval", "requiresDocument", "applicableTo"],
      },
      {
        id: "status",
        title: "Status",
        fields: ["isActive"],
      },
    ],
    redirectOnSuccess: "list",
  },

  show: {
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        fields: ["name", "code", "description", "color"],
        columns: 2,
      },
      {
        id: "policy",
        title: "Leave Policy",
        fields: ["isPaid", "maxDaysPerYear", "carryOverDays", "minNoticeDays", "allowHalfDay"],
        columns: 3,
      },
      {
        id: "requirements",
        title: "Requirements",
        fields: ["requiresApproval", "requiresDocument", "applicableTo"],
        columns: 2,
      },
    ],
    layout: "single",
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP"],
    show: ["ADMIN", "LEADERSHIP"],
    create: ["ADMIN"],
    edit: ["ADMIN"],
    delete: ["ADMIN"],
  },

  audit: true,
};
