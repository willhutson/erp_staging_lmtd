import type { FormConfig } from "@/types/forms";

export const designForm: FormConfig = {
  id: "DESIGN",
  name: "Design Request",
  description: "Request graphic design work",
  namingConvention: "Design: [Client] – [Topic]",
  namingPrefix: "Design",
  example: "Design: ADEK – Social Posts",

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
          placeholder: "e.g., Social Posts, Event Collateral",
        },
        {
          id: "clientId",
          label: "Client",
          type: "client-select",
          required: true,
        },
        {
          id: "assigneeId",
          label: "Assigned Designer",
          type: "user-select",
          required: true,
          filter: { departments: ["Creative & Design"] },
          placeholder: "Select designer",
        },
      ],
    },
    {
      id: "design-details",
      title: "Design Details",
      fields: [
        {
          id: "designType",
          label: "Type of Design",
          type: "multi-select",
          required: true,
          options: [
            { value: "social_static", label: "Social Media Static" },
            { value: "social_carousel", label: "Social Media Carousel" },
            { value: "story", label: "Story/Reel Cover" },
            { value: "presentation", label: "Presentation" },
            { value: "print", label: "Print Material" },
            { value: "banner", label: "Banner/Billboard" },
            { value: "email", label: "Email Template" },
            { value: "infographic", label: "Infographic" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "dimensions",
          label: "Dimensions / Sizes Needed",
          type: "textarea",
          required: true,
          maxLength: 500,
          placeholder: "e.g., 1080x1080 for Instagram, 1920x1080 for LinkedIn",
        },
        {
          id: "quantity",
          label: "Number of Designs",
          type: "number",
          required: true,
          placeholder: "How many unique designs needed?",
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
      id: "creative",
      title: "Creative Direction",
      fields: [
        {
          id: "objective",
          label: "Objective / Brief",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "Describe what these designs should achieve",
        },
        {
          id: "copyText",
          label: "Copy / Text Content",
          type: "textarea",
          required: false,
          maxLength: 2000,
          placeholder: "Provide the text content to be included",
        },
        {
          id: "additionalNotes",
          label: "Additional Notes",
          type: "textarea",
          required: false,
          maxLength: 2000,
          placeholder: "Any special requirements (brand guidelines, colors, etc.)",
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
          placeholder: "Link to moodboards or reference designs",
        },
        {
          id: "attachments",
          label: "Reference Files",
          type: "file-upload",
          required: false,
          multiple: true,
          accept: ["image/*", "application/pdf", ".ai", ".psd", ".fig"],
        },
      ],
    },
  ],

  qualityRules: [
    { field: "objective", weight: 25, check: "minLength", value: 50 },
    { field: "dimensions", weight: 15, check: "notEmpty" },
    { field: "designType", weight: 15, check: "minItems", value: 1 },
    { field: "copyText", weight: 20, check: "minLength", value: 10 },
    { field: "referenceLink", weight: 15, check: "notEmpty" },
    { field: "additionalNotes", weight: 10, check: "minLength", value: 10 },
  ],
};
