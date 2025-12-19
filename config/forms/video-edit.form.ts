import type { FormConfig } from "@/types/forms";

export const videoEditForm: FormConfig = {
  id: "VIDEO_EDIT",
  name: "Video Edit Request",
  description: "Request video editing for existing footage",
  namingConvention: "Edit: [Client] – [Topic]",
  namingPrefix: "Edit",
  example: "Edit: DET – Event Recap",

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
          placeholder: "e.g., Event Recap, Interview Edit",
        },
        {
          id: "clientId",
          label: "Client",
          type: "client-select",
          required: true,
        },
        {
          id: "assigneeId",
          label: "Assigned Editor",
          type: "user-select",
          required: true,
          filter: { departments: ["Video Production"] },
          placeholder: "Select editor",
        },
      ],
    },
    {
      id: "edit-details",
      title: "Edit Details",
      fields: [
        {
          id: "videoType",
          label: "Type of Video",
          type: "select",
          required: true,
          options: [
            { value: "social_reel", label: "Social Media Reel" },
            { value: "long_form", label: "Long Form (2+ min)" },
            { value: "interview", label: "Interview" },
            { value: "event_recap", label: "Event Recap" },
            { value: "product", label: "Product Video" },
            { value: "animation", label: "Animation/Motion Graphics" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "duration",
          label: "Target Duration",
          type: "text",
          required: true,
          placeholder: "e.g., 30 seconds, 2-3 minutes",
        },
        {
          id: "aspectRatio",
          label: "Aspect Ratio",
          type: "multi-select",
          required: true,
          options: [
            { value: "16:9", label: "16:9 (Landscape)" },
            { value: "9:16", label: "9:16 (Vertical/Stories)" },
            { value: "1:1", label: "1:1 (Square)" },
            { value: "4:5", label: "4:5 (Instagram Feed)" },
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
      id: "creative",
      title: "Creative Direction",
      fields: [
        {
          id: "objective",
          label: "Objective / Brief",
          type: "textarea",
          required: true,
          maxLength: 2000,
          placeholder: "Describe what this video should achieve",
        },
        {
          id: "musicStyle",
          label: "Music / Audio Direction",
          type: "textarea",
          required: false,
          maxLength: 500,
          placeholder: "Describe the music style or provide specific tracks",
        },
        {
          id: "additionalNotes",
          label: "Additional Notes",
          type: "textarea",
          required: false,
          maxLength: 2000,
          placeholder: "Any special requirements or instructions",
        },
      ],
    },
    {
      id: "assets",
      title: "Assets",
      fields: [
        {
          id: "footageLink",
          label: "Footage Link",
          type: "url",
          required: false,
          placeholder: "Link to raw footage (Google Drive, Dropbox, etc.)",
        },
        {
          id: "attachments",
          label: "Additional Files",
          type: "file-upload",
          required: false,
          multiple: true,
          accept: ["image/*", "video/*", "application/pdf", ".doc", ".docx"],
        },
      ],
    },
  ],

  qualityRules: [
    { field: "objective", weight: 25, check: "minLength", value: 50 },
    { field: "duration", weight: 15, check: "notEmpty" },
    { field: "aspectRatio", weight: 15, check: "minItems", value: 1 },
    { field: "footageLink", weight: 20, check: "notEmpty" },
    { field: "musicStyle", weight: 15, check: "minLength", value: 10 },
    { field: "additionalNotes", weight: 10, check: "minLength", value: 10 },
  ],
};
