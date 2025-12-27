/**
 * Design Brief Form Template
 *
 * Extracted from TeamLMTD's graphic design brief form.
 */

import type { FormTemplate } from "../../types";

export const designFormTemplate: FormTemplate = {
  category: "form",
  metadata: {
    id: "lmtd-design-form-v1",
    name: "Design Brief Form",
    description: "A comprehensive brief form for graphic design requests including social media, print, and digital assets.",
    category: "form",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["design", "graphic", "creative", "brief", "social-media"],
    icon: "Palette",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "clients", "users"],
  },
  data: {
    name: "Design Brief",
    titlePattern: "Design: {client} – {topic}",
    requiresApproval: true,
    defaultAssignee: "teamLead",
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        description: "Core details about the design request",
        fields: [
          {
            name: "clientId",
            label: "Client",
            type: "relation",
            required: true,
            description: "Select the client for this design",
          },
          {
            name: "topic",
            label: "Project Name",
            type: "string",
            required: true,
            placeholder: "e.g., Social Campaign, Brand Refresh, Event Collateral",
          },
          {
            name: "objective",
            label: "Objective",
            type: "text",
            required: true,
            description: "What should this design achieve?",
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
        id: "design-specs",
        title: "Design Specifications",
        description: "Technical requirements for the design",
        collapsible: true,
        fields: [
          {
            name: "designType",
            label: "Design Type",
            type: "multiselect",
            required: true,
            options: [
              { value: "social_static", label: "Social Media Static" },
              { value: "social_carousel", label: "Social Media Carousel" },
              { value: "story_cover", label: "Story/Reel Cover" },
              { value: "presentation", label: "Presentation Deck" },
              { value: "print_collateral", label: "Print Collateral" },
              { value: "banner_billboard", label: "Banner/Billboard" },
              { value: "email_template", label: "Email Template" },
              { value: "infographic", label: "Infographic" },
              { value: "logo_branding", label: "Logo/Branding" },
              { value: "packaging", label: "Packaging" },
            ],
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
              { value: "print", label: "Print" },
            ],
          },
          {
            name: "dimensions",
            label: "Dimensions Required",
            type: "text",
            required: true,
            placeholder: "e.g., 1080x1080, 1920x1080, A4",
          },
          {
            name: "quantity",
            label: "Number of Unique Designs",
            type: "number",
            required: true,
            defaultValue: 1,
            validation: {
              min: 1,
              max: 50,
            },
          },
          {
            name: "fileFormats",
            label: "Required File Formats",
            type: "multiselect",
            options: [
              { value: "jpg", label: "JPG" },
              { value: "png", label: "PNG" },
              { value: "pdf", label: "PDF" },
              { value: "ai", label: "Adobe Illustrator (.ai)" },
              { value: "psd", label: "Photoshop (.psd)" },
              { value: "figma", label: "Figma" },
              { value: "svg", label: "SVG" },
            ],
          },
        ],
      },
      {
        id: "creative-direction",
        title: "Creative Direction",
        description: "Style and content guidance",
        collapsible: true,
        fields: [
          {
            name: "visualStyle",
            label: "Visual Style",
            type: "select",
            options: [
              { value: "modern_minimal", label: "Modern & Minimal" },
              { value: "bold_vibrant", label: "Bold & Vibrant" },
              { value: "corporate_professional", label: "Corporate & Professional" },
              { value: "playful_fun", label: "Playful & Fun" },
              { value: "luxurious_elegant", label: "Luxurious & Elegant" },
              { value: "follow_brand", label: "Follow Brand Guidelines" },
            ],
          },
          {
            name: "copyText",
            label: "Copy / Text Content",
            type: "text",
            description: "The text content to be included in the design",
          },
          {
            name: "callToAction",
            label: "Call to Action",
            type: "string",
            placeholder: "e.g., Shop Now, Learn More, Register Today",
          },
          {
            name: "mustInclude",
            label: "Must Include Elements",
            type: "text",
            placeholder: "Logo placement, QR codes, contact info, etc.",
          },
          {
            name: "avoidElements",
            label: "Elements to Avoid",
            type: "text",
            placeholder: "Any imagery or styles to avoid",
          },
        ],
      },
      {
        id: "brand-assets",
        title: "Brand Assets",
        description: "Brand guidelines and resources",
        collapsible: true,
        fields: [
          {
            name: "brandGuidelinesAvailable",
            label: "Brand Guidelines Available",
            type: "boolean",
            defaultValue: true,
          },
          {
            name: "primaryColors",
            label: "Primary Colors (if different from brand)",
            type: "string",
            placeholder: "Hex codes: #52EDC7, #1BA098",
          },
          {
            name: "fontsRequired",
            label: "Specific Fonts Required",
            type: "string",
            placeholder: "Font names if different from brand fonts",
          },
          {
            name: "existingAssets",
            label: "Existing Assets Available",
            type: "multiselect",
            options: [
              { value: "logos", label: "Logos" },
              { value: "photography", label: "Photography" },
              { value: "icons", label: "Icons" },
              { value: "templates", label: "Templates" },
              { value: "illustrations", label: "Illustrations" },
            ],
          },
        ],
      },
      {
        id: "references",
        title: "References & Inspiration",
        description: "Visual references and mood boards",
        collapsible: true,
        fields: [
          {
            name: "referenceLinks",
            label: "Reference Links",
            type: "text",
            description: "Links to inspiration or reference designs",
          },
          {
            name: "competitorReference",
            label: "Competitor Reference",
            type: "string",
            placeholder: "Any competitor designs to consider",
          },
          {
            name: "previousWork",
            label: "Previous Work Reference",
            type: "text",
            description: "Links to previous work that this should align with",
          },
        ],
      },
    ],
    submitLabel: "Submit Design Brief",
  },
};

export default designFormTemplate;
