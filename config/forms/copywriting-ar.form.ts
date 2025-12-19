import type { FormConfig } from "@/types/forms";

export const copywritingArForm: FormConfig = {
  id: "COPYWRITING_AR",
  name: "Arabic Copywriting Request",
  description: "Request Arabic copywriting",
  namingConvention: "Copy: [Client] – [Topic]",
  namingPrefix: "Copy",
  example: "Copy: CCAD – Arabic Captions",

  sections: [
    {
      id: "basic",
      title: "Basic Information",
      fields: [
        {
          id: "topic",
          label: "Topic / Project Name",
          type: "text",
          required: true,
          maxLength: 100,
          placeholder: "e.g., Arabic Captions, Website Localization",
        },
        {
          id: "clientId",
          label: "Client",
          type: "client-select",
          required: true,
        },
        {
          id: "assigneeId",
          label: "Assigned Arabic Copywriter",
          type: "user-select",
          required: true,
          filter: { departments: ["Copywriting"] },
          placeholder: "Select Arabic copywriter",
        },
      ],
    },
    {
      id: "copy-details",
      title: "Copy Details",
      fields: [
        {
          id: "copyType",
          label: "Type of Copy",
          type: "multi-select",
          required: true,
          options: [
            { value: "social_captions", label: "Social Media Captions" },
            { value: "website", label: "Website Copy" },
            { value: "translation", label: "Translation from English" },
            { value: "transcreation", label: "Transcreation" },
            { value: "ad_copy", label: "Ad Copy" },
            { value: "script", label: "Video Script" },
            { value: "brochure", label: "Brochure/Print" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "arabicDialect",
          label: "Arabic Dialect/Style",
          type: "select",
          required: true,
          options: [
            { value: "msa", label: "Modern Standard Arabic (MSA)" },
            { value: "gulf", label: "Gulf Arabic" },
            { value: "egyptian", label: "Egyptian Arabic" },
            { value: "levantine", label: "Levantine Arabic" },
            { value: "flexible", label: "Flexible/Brand Dependent" },
          ],
        },
        {
          id: "wordCount",
          label: "Estimated Word Count",
          type: "text",
          required: true,
          placeholder: "e.g., 500 words, 10 captions",
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
      id: "brief",
      title: "Brief",
      fields: [
        {
          id: "objective",
          label: "Objective / Context",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "What is the purpose of this copy?",
        },
        {
          id: "sourceContent",
          label: "Source Content (if translation)",
          type: "textarea",
          required: false,
          maxLength: 5000,
          placeholder: "Paste the English content to be translated/adapted",
        },
        {
          id: "keyMessages",
          label: "Key Messages",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "Main points or messages to include",
        },
        {
          id: "additionalNotes",
          label: "Additional Notes",
          type: "textarea",
          required: false,
          maxLength: 2000,
          placeholder: "Any cultural considerations or specific requirements",
        },
      ],
    },
    {
      id: "references",
      title: "References",
      fields: [
        {
          id: "referenceLink",
          label: "Reference Link",
          type: "url",
          required: false,
        },
        {
          id: "attachments",
          label: "Reference Files",
          type: "file-upload",
          required: false,
          multiple: true,
          accept: ["application/pdf", ".doc", ".docx", "image/*"],
        },
      ],
    },
  ],

  qualityRules: [
    { field: "objective", weight: 25, check: "minLength", value: 50 },
    { field: "keyMessages", weight: 20, check: "minLength", value: 30 },
    { field: "wordCount", weight: 15, check: "notEmpty" },
    { field: "copyType", weight: 15, check: "minItems", value: 1 },
    { field: "sourceContent", weight: 15, check: "minLength", value: 20 },
    { field: "additionalNotes", weight: 10, check: "minLength", value: 10 },
  ],
};
