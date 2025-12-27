/**
 * Video Shoot Brief Form Template
 *
 * Extracted from TeamLMTD's video production brief form.
 */

import type { FormTemplate } from "../../types";

export const videoShootFormTemplate: FormTemplate = {
  category: "form",
  metadata: {
    id: "lmtd-video-shoot-form-v1",
    name: "Video Shoot Brief Form",
    description: "A comprehensive brief form for video production shoots including location, talent, and equipment requirements.",
    category: "form",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["video", "production", "shoot", "brief", "creative"],
    icon: "Video",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "clients", "users"],
  },
  data: {
    name: "Video Shoot Brief",
    titlePattern: "Shoot: {client} – {topic}",
    requiresApproval: true,
    defaultAssignee: "teamLead",
    sections: [
      {
        id: "basic",
        title: "Basic Information",
        description: "Core details about the video shoot",
        fields: [
          {
            name: "clientId",
            label: "Client",
            type: "relation",
            required: true,
            description: "Select the client for this shoot",
          },
          {
            name: "topic",
            label: "Topic / Subject",
            type: "string",
            required: true,
            placeholder: "e.g., Product Launch, Interview, Event Coverage",
          },
          {
            name: "objective",
            label: "Objective",
            type: "text",
            required: true,
            description: "What is the goal of this video?",
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
        id: "logistics",
        title: "Shoot Logistics",
        description: "Location and timing details",
        collapsible: true,
        fields: [
          {
            name: "shootDate",
            label: "Shoot Date",
            type: "date",
            required: true,
          },
          {
            name: "shootTime",
            label: "Start Time",
            type: "time",
            required: true,
          },
          {
            name: "duration",
            label: "Expected Duration (hours)",
            type: "number",
            defaultValue: 4,
            validation: {
              min: 1,
              max: 24,
            },
          },
          {
            name: "locationType",
            label: "Location Type",
            type: "select",
            required: true,
            options: [
              { value: "studio", label: "Studio" },
              { value: "on_location", label: "On Location" },
              { value: "client_office", label: "Client Office" },
              { value: "outdoor", label: "Outdoor" },
              { value: "multiple", label: "Multiple Locations" },
            ],
          },
          {
            name: "locationAddress",
            label: "Location Address",
            type: "text",
            conditional: {
              field: "locationType",
              operator: "neq",
              value: "studio",
            },
          },
          {
            name: "locationNotes",
            label: "Location Notes",
            type: "text",
            placeholder: "Parking, access restrictions, contact person...",
          },
        ],
      },
      {
        id: "creative",
        title: "Creative Requirements",
        description: "Style and content specifications",
        collapsible: true,
        fields: [
          {
            name: "videoStyle",
            label: "Video Style",
            type: "select",
            required: true,
            options: [
              { value: "corporate", label: "Corporate / Professional" },
              { value: "documentary", label: "Documentary" },
              { value: "promotional", label: "Promotional" },
              { value: "social", label: "Social Media" },
              { value: "event", label: "Event Coverage" },
              { value: "interview", label: "Interview" },
              { value: "testimonial", label: "Testimonial" },
            ],
          },
          {
            name: "deliverableFormats",
            label: "Deliverable Formats",
            type: "multiselect",
            required: true,
            options: [
              { value: "16:9_landscape", label: "16:9 Landscape (YouTube)" },
              { value: "9:16_vertical", label: "9:16 Vertical (Reels/TikTok)" },
              { value: "1:1_square", label: "1:1 Square (Instagram)" },
              { value: "4:5_portrait", label: "4:5 Portrait (Instagram)" },
            ],
          },
          {
            name: "expectedDuration",
            label: "Final Video Duration",
            type: "select",
            options: [
              { value: "15s", label: "15 seconds" },
              { value: "30s", label: "30 seconds" },
              { value: "60s", label: "1 minute" },
              { value: "2-3m", label: "2-3 minutes" },
              { value: "5m+", label: "5+ minutes" },
            ],
          },
          {
            name: "references",
            label: "Reference Links",
            type: "text",
            description: "Links to reference videos or mood boards",
          },
          {
            name: "brandGuidelines",
            label: "Brand Guidelines Available",
            type: "boolean",
            defaultValue: false,
          },
        ],
      },
      {
        id: "talent",
        title: "Talent & Crew",
        description: "People involved in the shoot",
        collapsible: true,
        fields: [
          {
            name: "talentRequired",
            label: "Talent Required",
            type: "boolean",
            defaultValue: false,
          },
          {
            name: "talentCount",
            label: "Number of Talent",
            type: "number",
            defaultValue: 1,
            conditional: {
              field: "talentRequired",
              operator: "eq",
              value: true,
            },
          },
          {
            name: "talentNotes",
            label: "Talent Requirements",
            type: "text",
            placeholder: "Demographics, speaking requirements, wardrobe...",
            conditional: {
              field: "talentRequired",
              operator: "eq",
              value: true,
            },
          },
          {
            name: "crewSize",
            label: "Crew Size",
            type: "select",
            options: [
              { value: "minimal", label: "Minimal (1-2 crew)" },
              { value: "standard", label: "Standard (3-5 crew)" },
              { value: "full", label: "Full Production (6+ crew)" },
            ],
          },
        ],
      },
      {
        id: "equipment",
        title: "Equipment & Technical",
        description: "Technical requirements",
        collapsible: true,
        fields: [
          {
            name: "cameraSetup",
            label: "Camera Setup",
            type: "select",
            options: [
              { value: "single", label: "Single Camera" },
              { value: "multi", label: "Multi-Camera" },
              { value: "drone", label: "Drone Required" },
              { value: "gimbal", label: "Gimbal/Steadicam" },
            ],
          },
          {
            name: "audioRequirements",
            label: "Audio Requirements",
            type: "multiselect",
            options: [
              { value: "lav", label: "Lavalier Mics" },
              { value: "boom", label: "Boom Mic" },
              { value: "ambient", label: "Ambient Audio" },
              { value: "voiceover", label: "Voiceover (Post)" },
              { value: "music", label: "Licensed Music" },
            ],
          },
          {
            name: "lightingSetup",
            label: "Lighting Setup",
            type: "select",
            options: [
              { value: "natural", label: "Natural Light" },
              { value: "basic", label: "Basic LED Kit" },
              { value: "professional", label: "Professional Lighting" },
            ],
          },
          {
            name: "specialEquipment",
            label: "Special Equipment Notes",
            type: "text",
            placeholder: "Teleprompter, green screen, etc.",
          },
        ],
      },
    ],
    submitLabel: "Submit Brief for Review",
  },
};

export default videoShootFormTemplate;
