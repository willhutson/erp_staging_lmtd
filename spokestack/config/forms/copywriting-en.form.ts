import type { FormConfig } from "@/types/forms";

export const copywritingEnForm: FormConfig = {
  id: "COPYWRITING_EN",
  name: "English Copywriting Request",
  description: "Request English copywriting",
  namingConvention: "Copy: [Client] – [Topic]",
  namingPrefix: "Copy",
  example: "Copy: ECD – Website Content",

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
          placeholder: "e.g., Website Content, Social Captions",
        },
        {
          id: "clientId",
          label: "Client",
          type: "client-select",
          required: true,
        },
        {
          id: "assigneeId",
          label: "Assigned Copywriter",
          type: "user-select",
          required: true,
          filter: { departments: ["Copywriting"] },
          placeholder: "Select copywriter",
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
            { value: "blog", label: "Blog Post" },
            { value: "email", label: "Email/Newsletter" },
            { value: "ad_copy", label: "Ad Copy" },
            { value: "script", label: "Video Script" },
            { value: "press_release", label: "Press Release" },
            { value: "brochure", label: "Brochure/Print" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "wordCount",
          label: "Estimated Word Count",
          type: "text",
          required: true,
          placeholder: "e.g., 500 words, 10 captions x 50 words each",
        },
        {
          id: "toneOfVoice",
          label: "Tone of Voice",
          type: "select",
          required: true,
          options: [
            { value: "professional", label: "Professional" },
            { value: "casual", label: "Casual/Friendly" },
            { value: "formal", label: "Formal" },
            { value: "playful", label: "Playful/Fun" },
            { value: "inspirational", label: "Inspirational" },
            { value: "authoritative", label: "Authoritative" },
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
      id: "brief",
      title: "Brief",
      fields: [
        {
          id: "objective",
          label: "Objective / Context",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "What is the purpose of this copy? What action should readers take?",
        },
        {
          id: "keyMessages",
          label: "Key Messages / Points to Include",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "List the main points or messages that must be included",
        },
        {
          id: "additionalNotes",
          label: "Additional Notes",
          type: "textarea",
          required: false,
          maxLength: 2000,
          placeholder: "Any keywords, hashtags, or specific requirements",
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
          placeholder: "Link to brand guidelines or reference content",
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
    { field: "keyMessages", weight: 25, check: "minLength", value: 30 },
    { field: "wordCount", weight: 15, check: "notEmpty" },
    { field: "copyType", weight: 15, check: "minItems", value: 1 },
    { field: "additionalNotes", weight: 10, check: "minLength", value: 10 },
    { field: "referenceLink", weight: 10, check: "notEmpty" },
  ],
};
