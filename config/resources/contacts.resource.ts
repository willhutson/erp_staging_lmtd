/**
 * CRM Contacts Resource Configuration
 *
 * Extracted from LMTD's CRM module - full contact management.
 */

import type { ResourceConfig } from "./types";

export const contactsResource: ResourceConfig = {
  name: "contacts",
  label: "Contact",
  labelPlural: "Contacts",
  model: "Contact",
  module: "CORE",
  icon: "UserCircle",
  description: "CRM contacts including prospects, leads, and customers",

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
      name: "firstName",
      label: "First Name",
      type: "string",
      list: true,
      sortable: true,
      filter: true,
      validation: { required: true, minLength: 1, maxLength: 50 },
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "string",
      list: true,
      sortable: true,
      filter: true,
      validation: { required: true, minLength: 1, maxLength: 50 },
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      list: true,
      sortable: true,
      filter: true,
      validation: { required: true },
    },
    {
      name: "phone",
      label: "Phone",
      type: "phone",
      list: true,
    },
    {
      name: "company",
      label: "Company",
      type: "string",
      list: true,
      sortable: true,
      filter: true,
    },
    {
      name: "jobTitle",
      label: "Job Title",
      type: "string",
      list: true,
    },
    {
      name: "type",
      label: "Contact Type",
      type: "enum",
      list: true,
      filter: true,
      options: [
        { value: "PROSPECT", label: "Prospect", color: "blue" },
        { value: "LEAD", label: "Lead", color: "yellow" },
        { value: "CUSTOMER", label: "Customer", color: "green" },
        { value: "PARTNER", label: "Partner", color: "purple" },
        { value: "VENDOR", label: "Vendor", color: "orange" },
        { value: "INFLUENCER", label: "Influencer", color: "pink" },
      ],
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
        { value: "DO_NOT_CONTACT", label: "Do Not Contact", color: "red" },
      ],
    },
    {
      name: "role",
      label: "Role",
      type: "enum",
      list: false,
      options: [
        { value: "DECISION_MAKER", label: "Decision Maker", color: "green" },
        { value: "INFLUENCER", label: "Influencer", color: "blue" },
        { value: "CHAMPION", label: "Champion", color: "purple" },
        { value: "BLOCKER", label: "Blocker", color: "red" },
        { value: "END_USER", label: "End User", color: "gray" },
        { value: "TECHNICAL", label: "Technical", color: "orange" },
      ],
    },
    {
      name: "source",
      label: "Lead Source",
      type: "enum",
      list: false,
      options: [
        { value: "WEBSITE", label: "Website" },
        { value: "REFERRAL", label: "Referral" },
        { value: "EVENT", label: "Event" },
        { value: "COLD_OUTREACH", label: "Cold Outreach" },
        { value: "SOCIAL_MEDIA", label: "Social Media" },
        { value: "ADVERTISING", label: "Advertising" },
        { value: "OTHER", label: "Other" },
      ],
    },
    {
      name: "notes",
      label: "Notes",
      type: "text",
      list: false,
    },
    {
      name: "clientId",
      label: "Associated Client",
      type: "relation",
      referenceResource: "clients",
      referenceField: "name",
      list: true,
    },
    {
      name: "createdAt",
      label: "Created",
      type: "datetime",
      list: true,
      sortable: true,
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
    columns: ["firstName", "lastName", "email", "company", "type", "status", "clientId", "createdAt"],
    defaultSort: { field: "createdAt", order: "desc" },
    pageSize: 25,
    searchable: true,
    searchFields: ["firstName", "lastName", "email", "company"],
    defaultFilters: ["type", "status"],
  },

  create: {
    sections: [
      {
        id: "basic",
        title: "Contact Information",
        description: "Basic contact details",
        fields: ["firstName", "lastName", "email", "phone", "company", "jobTitle"],
      },
      {
        id: "classification",
        title: "Classification",
        description: "Contact type and status",
        fields: ["type", "status", "role", "source", "clientId"],
      },
      {
        id: "notes",
        title: "Notes",
        description: "Additional information",
        fields: ["notes"],
        collapsible: true,
      },
    ],
    redirectOnSuccess: "show",
  },

  edit: {
    sections: [
      {
        id: "basic",
        title: "Contact Information",
        fields: ["firstName", "lastName", "email", "phone", "company", "jobTitle"],
      },
      {
        id: "classification",
        title: "Classification",
        fields: ["type", "status", "role", "source", "clientId"],
      },
      {
        id: "notes",
        title: "Notes",
        fields: ["notes"],
        collapsible: true,
      },
    ],
    redirectOnSuccess: "show",
  },

  show: {
    sections: [
      {
        id: "basic",
        title: "Contact Information",
        fields: ["firstName", "lastName", "email", "phone", "company", "jobTitle"],
        columns: 2,
      },
      {
        id: "classification",
        title: "Classification",
        fields: ["type", "status", "role", "source", "clientId"],
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
  },

  permissions: {
    list: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    show: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    create: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    edit: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"],
    delete: ["ADMIN", "LEADERSHIP"],
  },

  audit: true,
};
