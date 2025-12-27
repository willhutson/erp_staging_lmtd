/**
 * Copywriting Brief Form Template
 *
 * Extracted from TeamLMTD's copywriting brief form.
 */

import type { FormTemplate } from "../../types";

export const copywritingFormTemplate: FormTemplate = {
  category: "form",
  metadata: {
    id: "lmtd-copywriting-form-v1",
    name: "Copywriting Brief Form",
    description: "A comprehensive brief form for copywriting requests including social media, articles, and marketing content.",
    category: "form",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["copywriting", "content", "marketing", "brief", "creative"],
    icon: "Pen",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "clients", "users"],
  },
  data: {
    name: "Copywriting Brief",
    titlePattern: "Copy: {client} – {topic}",
    requiresApproval: true,
    defaultAssignee: "teamLead",
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        description: "Core details about the copywriting request",
        fields: [
          {
            name: "clientId",
            label: "Client",
            type: "relation",
            required: true,
            description: "Select the client for this copy",
          },
          {
            name: "topic",
            label: "Topic / Campaign",
            type: "string",
            required: true,
            placeholder: "e.g., Product Launch Copy, Social Campaign",
          },
          {
            name: "language",
            label: "Language",
            type: "select",
            required: true,
            options: [
              { value: "en", label: "English" },
              { value: "ar", label: "Arabic" },
              { value: "en_ar", label: "English & Arabic (both)" },
            ],
          },
          {
            name: "dueDate",
            label: "Required By",
            type: "date",
            required: true,
          },
        ],
      },
      {
        id: "content-type",
        title: "Content Type",
        description: "What type of copy is needed",
        collapsible: true,
        fields: [
          {
            name: "copyType",
            label: "Type of Content",
            type: "multiselect",
            required: true,
            options: [
              { value: "social_captions", label: "Social Media Captions" },
              { value: "article", label: "Article / Blog Post" },
              { value: "website_copy", label: "Website Copy" },
              { value: "email", label: "Email Content" },
              { value: "ad_copy", label: "Ad Copy" },
              { value: "script", label: "Script (Video/Audio)" },
              { value: "press_release", label: "Press Release" },
              { value: "brochure", label: "Brochure / Print" },
              { value: "tagline", label: "Taglines / Slogans" },
              { value: "seo", label: "SEO Content" },
            ],
          },
          {
            name: "wordCount",
            label: "Approximate Word Count",
            type: "select",
            options: [
              { value: "micro", label: "Micro (under 50 words)" },
              { value: "short", label: "Short (50-150 words)" },
              { value: "medium", label: "Medium (150-500 words)" },
              { value: "long", label: "Long (500-1000 words)" },
              { value: "extended", label: "Extended (1000+ words)" },
            ],
          },
          {
            name: "quantity",
            label: "Number of Pieces",
            type: "number",
            required: true,
            defaultValue: 1,
            validation: {
              min: 1,
              max: 50,
            },
          },
          {
            name: "platforms",
            label: "Target Platforms",
            type: "multiselect",
            options: [
              { value: "instagram", label: "Instagram" },
              { value: "facebook", label: "Facebook" },
              { value: "linkedin", label: "LinkedIn" },
              { value: "twitter", label: "Twitter/X" },
              { value: "tiktok", label: "TikTok" },
              { value: "youtube", label: "YouTube" },
              { value: "website", label: "Website" },
              { value: "email", label: "Email" },
              { value: "print", label: "Print" },
            ],
          },
        ],
      },
      {
        id: "creative-brief",
        title: "Creative Brief",
        description: "Content direction and objectives",
        collapsible: true,
        fields: [
          {
            name: "objective",
            label: "Objective / Goal",
            type: "text",
            required: true,
            description: "What should this copy achieve?",
          },
          {
            name: "targetAudience",
            label: "Target Audience",
            type: "text",
            required: true,
            placeholder: "Demographics, interests, pain points",
          },
          {
            name: "keyMessages",
            label: "Key Messages",
            type: "text",
            required: true,
            description: "Main points that must be communicated",
          },
          {
            name: "callToAction",
            label: "Desired Call to Action",
            type: "string",
            placeholder: "What action should readers take?",
          },
        ],
      },
      {
        id: "tone-style",
        title: "Tone & Style",
        description: "Voice and brand personality",
        collapsible: true,
        fields: [
          {
            name: "toneOfVoice",
            label: "Tone of Voice",
            type: "multiselect",
            options: [
              { value: "professional", label: "Professional" },
              { value: "friendly", label: "Friendly & Approachable" },
              { value: "authoritative", label: "Authoritative" },
              { value: "playful", label: "Playful & Fun" },
              { value: "inspirational", label: "Inspirational" },
              { value: "urgent", label: "Urgent" },
              { value: "conversational", label: "Conversational" },
              { value: "formal", label: "Formal" },
              { value: "luxurious", label: "Luxurious & Premium" },
            ],
          },
          {
            name: "writingStyle",
            label: "Writing Style",
            type: "select",
            options: [
              { value: "concise", label: "Concise & Punchy" },
              { value: "detailed", label: "Detailed & Informative" },
              { value: "storytelling", label: "Storytelling" },
              { value: "listicle", label: "List-based" },
              { value: "qa", label: "Q&A Format" },
            ],
          },
          {
            name: "brandVoiceNotes",
            label: "Brand Voice Notes",
            type: "text",
            placeholder: "Any specific brand voice guidelines",
          },
          {
            name: "avoidPhrases",
            label: "Words/Phrases to Avoid",
            type: "text",
            placeholder: "List any terms that shouldn't be used",
          },
        ],
      },
      {
        id: "context",
        title: "Context & Supporting Info",
        description: "Background information and resources",
        collapsible: true,
        fields: [
          {
            name: "backgroundInfo",
            label: "Background Information",
            type: "text",
            description: "Relevant context about the product/service/campaign",
          },
          {
            name: "competitorExamples",
            label: "Competitor Examples",
            type: "text",
            placeholder: "Links to competitor content for reference",
          },
          {
            name: "previousContent",
            label: "Previous Content",
            type: "text",
            description: "Links to previous content for reference",
          },
          {
            name: "seoKeywords",
            label: "SEO Keywords (if applicable)",
            type: "text",
            placeholder: "Primary and secondary keywords",
          },
          {
            name: "hashtagRequirements",
            label: "Hashtag Requirements",
            type: "text",
            placeholder: "Brand hashtags, campaign hashtags",
          },
        ],
      },
      {
        id: "deliverables",
        title: "Deliverables",
        description: "Format and delivery requirements",
        collapsible: true,
        fields: [
          {
            name: "deliveryFormat",
            label: "Delivery Format",
            type: "multiselect",
            options: [
              { value: "google_doc", label: "Google Doc" },
              { value: "word", label: "Word Document" },
              { value: "notion", label: "Notion" },
              { value: "spreadsheet", label: "Spreadsheet" },
              { value: "figma", label: "Figma (design file)" },
            ],
          },
          {
            name: "includeVariations",
            label: "Include Copy Variations",
            type: "boolean",
            defaultValue: false,
            description: "Include A/B testing variations",
          },
          {
            name: "revisionRounds",
            label: "Expected Revision Rounds",
            type: "select",
            options: [
              { value: "1", label: "1 round" },
              { value: "2", label: "2 rounds" },
              { value: "3", label: "3 rounds" },
              { value: "unlimited", label: "As needed" },
            ],
          },
        ],
      },
    ],
    submitLabel: "Submit Copywriting Brief",
  },
};

export default copywritingFormTemplate;
