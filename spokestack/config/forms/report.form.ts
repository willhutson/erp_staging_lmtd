import type { FormConfig } from "@/types/forms";

export const reportForm: FormConfig = {
  id: "REPORT",
  name: "Report Request",
  description: "Request analytics or performance report",
  namingConvention: "Report: [Client] – [Topic]",
  namingPrefix: "Report",
  example: "Report: CCAD – Monthly Analytics",

  sections: [
    {
      id: "basic",
      title: "Basic Information",
      fields: [
        {
          id: "topic",
          label: "Report Name",
          type: "text",
          required: true,
          maxLength: 100,
          placeholder: "e.g., Monthly Analytics, Campaign Performance",
        },
        {
          id: "clientId",
          label: "Client",
          type: "client-select",
          required: true,
        },
        {
          id: "assigneeId",
          label: "Assigned To",
          type: "user-select",
          required: true,
          filter: { departments: ["Paid Media", "Client Servicing"] },
          placeholder: "Select team member",
        },
      ],
    },
    {
      id: "report-details",
      title: "Report Details",
      fields: [
        {
          id: "reportType",
          label: "Type of Report",
          type: "select",
          required: true,
          options: [
            { value: "monthly", label: "Monthly Performance Report" },
            { value: "quarterly", label: "Quarterly Report" },
            { value: "campaign", label: "Campaign Report" },
            { value: "social", label: "Social Media Analytics" },
            { value: "paid_media", label: "Paid Media Report" },
            { value: "competitor", label: "Competitor Analysis" },
            { value: "custom", label: "Custom Report" },
          ],
        },
        {
          id: "reportPeriod",
          label: "Reporting Period",
          type: "date-range",
          required: true,
        },
        {
          id: "platforms",
          label: "Platforms to Include",
          type: "multi-select",
          required: true,
          options: [
            { value: "instagram", label: "Instagram" },
            { value: "facebook", label: "Facebook" },
            { value: "linkedin", label: "LinkedIn" },
            { value: "twitter", label: "X (Twitter)" },
            { value: "tiktok", label: "TikTok" },
            { value: "youtube", label: "YouTube" },
            { value: "google_ads", label: "Google Ads" },
            { value: "website", label: "Website Analytics" },
          ],
        },
        {
          id: "deadline",
          label: "Deadline",
          type: "date",
          required: true,
        },
      ],
    },
    {
      id: "requirements",
      title: "Requirements",
      fields: [
        {
          id: "objective",
          label: "Report Objective",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "What insights are you looking for? What decisions will this inform?",
        },
        {
          id: "metrics",
          label: "Key Metrics to Include",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "List specific metrics (reach, engagement, conversions, etc.)",
        },
        {
          id: "additionalNotes",
          label: "Additional Notes",
          type: "textarea",
          required: false,
          maxLength: 2000,
          placeholder: "Any specific comparisons, benchmarks, or formatting requirements",
        },
      ],
    },
    {
      id: "references",
      title: "References",
      fields: [
        {
          id: "previousReportLink",
          label: "Previous Report Link",
          type: "url",
          required: false,
          placeholder: "Link to previous reports for reference",
        },
        {
          id: "attachments",
          label: "Additional Files",
          type: "file-upload",
          required: false,
          multiple: true,
          accept: ["application/pdf", ".doc", ".docx", ".ppt", ".pptx", "image/*"],
        },
      ],
    },
  ],

  qualityRules: [
    { field: "objective", weight: 25, check: "minLength", value: 50 },
    { field: "metrics", weight: 25, check: "minLength", value: 30 },
    { field: "platforms", weight: 20, check: "minItems", value: 1 },
    { field: "additionalNotes", weight: 15, check: "minLength", value: 10 },
    { field: "previousReportLink", weight: 15, check: "notEmpty" },
  ],
};
