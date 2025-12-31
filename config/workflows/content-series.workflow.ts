/**
 * Content Series Workflow
 *
 * Triggered when a content series brief is created. Manages the end-to-end
 * production of a multi-episode content series (video series, blog series,
 * podcast series, etc.).
 *
 * Timeline: Typically 6-8 weeks for a 4-episode series
 * Use Case: Hero content, educational series, campaign tentpoles
 */

import type { WorkflowDefinition } from "@/modules/builder/types";

export const contentSeriesWorkflow: WorkflowDefinition = {
  trigger: {
    type: "brief.created",
    conditions: [
      {
        field: "type",
        operator: "in",
        value: ["VIDEO_SHOOT", "VIDEO_EDIT"],
      },
      {
        field: "tags",
        operator: "contains",
        value: "series",
      },
    ],
  },
  tasks: [
    // Phase 1: Pre-Production (Weeks 1-2)
    {
      id: "series-brief",
      name: "Series Concept Development",
      description:
        "Define the overarching series theme, number of episodes, format, and key messaging",
      assigneeRole: "creative_director",
      dueOffset: {
        value: 42,
        unit: "days",
        from: "deadline",
      },
      dependsOn: [],
      estimatedHours: 8,
    },
    {
      id: "audience-research",
      name: "Audience & Platform Research",
      description:
        "Research target audience preferences, platform best practices, competitor content",
      assigneeRole: "strategist",
      dueOffset: {
        value: 40,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["series-brief"],
      estimatedHours: 6,
    },
    {
      id: "episode-outlines",
      name: "Episode Outlines & Scripts",
      description: "Create detailed outlines and scripts for each episode",
      assigneeRole: "copywriter",
      dueOffset: {
        value: 35,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["series-brief", "audience-research"],
      estimatedHours: 16,
      createsBrief: {
        briefType: "COPYWRITING_EN",
        titleTemplate: "Scripts: {{seriesName}}",
      },
    },
    {
      id: "visual-treatment",
      name: "Visual Treatment & Moodboard",
      description: "Develop the visual direction, style frames, and moodboard for the series",
      assigneeRole: "creative_director",
      dueOffset: {
        value: 35,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["series-brief"],
      estimatedHours: 8,
      createsBrief: {
        briefType: "DESIGN",
        titleTemplate: "Visual Treatment: {{seriesName}}",
      },
    },
    {
      id: "client-concept-approval",
      name: "Client Concept Approval",
      description:
        "Present series concept, scripts, and visual treatment for client approval",
      assigneeRole: "account_director",
      dueOffset: {
        value: 32,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-outlines", "visual-treatment"],
      estimatedHours: 4,
    },
    {
      id: "production-planning",
      name: "Production Planning",
      description:
        "Plan shoot schedule, location scouting, talent booking, equipment needs",
      assigneeRole: "producer",
      dueOffset: {
        value: 28,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["client-concept-approval"],
      estimatedHours: 8,
    },

    // Phase 2: Production (Weeks 3-4)
    {
      id: "episode-1-shoot",
      name: "Episode 1 Production",
      description: "Film Episode 1 content",
      assigneeRole: "videographer",
      dueOffset: {
        value: 25,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["production-planning"],
      estimatedHours: 8,
      createsBrief: {
        briefType: "VIDEO_SHOOT",
        titleTemplate: "{{seriesName}} – Ep. 1 Shoot",
      },
    },
    {
      id: "episode-2-shoot",
      name: "Episode 2 Production",
      description: "Film Episode 2 content",
      assigneeRole: "videographer",
      dueOffset: {
        value: 23,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-1-shoot"],
      estimatedHours: 8,
      createsBrief: {
        briefType: "VIDEO_SHOOT",
        titleTemplate: "{{seriesName}} – Ep. 2 Shoot",
      },
    },
    {
      id: "episode-3-shoot",
      name: "Episode 3 Production",
      description: "Film Episode 3 content",
      assigneeRole: "videographer",
      dueOffset: {
        value: 21,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-2-shoot"],
      estimatedHours: 8,
      createsBrief: {
        briefType: "VIDEO_SHOOT",
        titleTemplate: "{{seriesName}} – Ep. 3 Shoot",
      },
    },
    {
      id: "episode-4-shoot",
      name: "Episode 4 Production",
      description: "Film Episode 4 content",
      assigneeRole: "videographer",
      dueOffset: {
        value: 19,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-3-shoot"],
      estimatedHours: 8,
      createsBrief: {
        briefType: "VIDEO_SHOOT",
        titleTemplate: "{{seriesName}} – Ep. 4 Shoot",
      },
    },

    // Phase 3: Post-Production (Weeks 5-6)
    {
      id: "episode-1-edit",
      name: "Episode 1 Editing",
      description: "Edit Episode 1: rough cut, color grade, sound design, motion graphics",
      assigneeRole: "video_editor",
      dueOffset: {
        value: 16,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-1-shoot"],
      estimatedHours: 12,
      createsBrief: {
        briefType: "VIDEO_EDIT",
        titleTemplate: "{{seriesName}} – Ep. 1 Edit",
      },
    },
    {
      id: "episode-2-edit",
      name: "Episode 2 Editing",
      description: "Edit Episode 2: rough cut, color grade, sound design, motion graphics",
      assigneeRole: "video_editor",
      dueOffset: {
        value: 14,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-2-shoot", "episode-1-edit"],
      estimatedHours: 12,
      createsBrief: {
        briefType: "VIDEO_EDIT",
        titleTemplate: "{{seriesName}} – Ep. 2 Edit",
      },
    },
    {
      id: "episode-3-edit",
      name: "Episode 3 Editing",
      description: "Edit Episode 3: rough cut, color grade, sound design, motion graphics",
      assigneeRole: "video_editor",
      dueOffset: {
        value: 12,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-3-shoot", "episode-2-edit"],
      estimatedHours: 12,
      createsBrief: {
        briefType: "VIDEO_EDIT",
        titleTemplate: "{{seriesName}} – Ep. 3 Edit",
      },
    },
    {
      id: "episode-4-edit",
      name: "Episode 4 Editing",
      description: "Edit Episode 4: rough cut, color grade, sound design, motion graphics",
      assigneeRole: "video_editor",
      dueOffset: {
        value: 10,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-4-shoot", "episode-3-edit"],
      estimatedHours: 12,
      createsBrief: {
        briefType: "VIDEO_EDIT",
        titleTemplate: "{{seriesName}} – Ep. 4 Edit",
      },
    },

    // Phase 4: Review & Delivery (Week 7-8)
    {
      id: "internal-review",
      name: "Internal Creative Review",
      description: "Full series review with creative leadership",
      assigneeRole: "creative_director",
      dueOffset: {
        value: 7,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["episode-4-edit"],
      estimatedHours: 4,
    },
    {
      id: "client-review",
      name: "Client Review & Feedback",
      description: "Present all episodes to client, gather feedback",
      assigneeRole: "account_director",
      dueOffset: {
        value: 5,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["internal-review"],
      estimatedHours: 4,
    },
    {
      id: "revisions",
      name: "Apply Revisions",
      description: "Implement client feedback across all episodes",
      assigneeRole: "video_editor",
      dueOffset: {
        value: 3,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["client-review"],
      estimatedHours: 8,
    },
    {
      id: "final-exports",
      name: "Final Exports & Formats",
      description: "Export all platform-specific formats and specifications",
      assigneeRole: "video_editor",
      dueOffset: {
        value: 2,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["revisions"],
      estimatedHours: 4,
    },
    {
      id: "delivery",
      name: "Final Delivery",
      description: "Deliver all assets to client and/or upload to platforms",
      assigneeRole: "content_manager",
      dueOffset: {
        value: 1,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["final-exports"],
      estimatedHours: 2,
    },
  ],
  nudgeRules: [
    {
      id: "production-reminder",
      name: "Production Day Reminder",
      trigger: {
        type: "before_due",
        offset: 1,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee"],
      messageTemplate:
        "Tomorrow: \"{{taskName}}\" - Make sure all equipment and logistics are confirmed!",
    },
    {
      id: "edit-deadline-warning",
      name: "Edit Deadline Warning",
      trigger: {
        type: "before_due",
        offset: 2,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee", "manager"],
      messageTemplate: "Edit deadline in 2 days: \"{{taskName}}\" – please flag any blockers now",
    },
    {
      id: "review-reminder",
      name: "Review Reminder",
      trigger: {
        type: "on_due",
        offset: 0,
        unit: "days",
      },
      channel: "email",
      recipients: ["assignee", "owner"],
      messageTemplate:
        "Review due today: \"{{taskName}}\" – Please complete and provide feedback",
    },
    {
      id: "overdue-escalation",
      name: "Overdue Escalation",
      trigger: {
        type: "after_due",
        offset: 1,
        unit: "days",
      },
      channel: "email",
      recipients: ["assignee", "manager", "owner"],
      messageTemplate:
        "OVERDUE: \"{{taskName}}\" is blocking the series production timeline. Immediate action required.",
    },
  ],
  stageGates: [
    {
      id: "concept-approval-gate",
      taskId: "client-concept-approval",
      requirements: [
        {
          type: "approval",
          config: {
            approvers: ["client_contact", "account_director"],
            minApprovals: 2,
          },
        },
        {
          type: "tasks_complete",
          config: {
            taskIds: ["episode-outlines", "visual-treatment"],
          },
        },
      ],
    },
    {
      id: "production-gate",
      taskId: "production-planning",
      requirements: [
        {
          type: "field_value",
          config: {
            field: "budget_approved",
            value: true,
          },
        },
      ],
    },
    {
      id: "final-approval-gate",
      taskId: "client-review",
      requirements: [
        {
          type: "approval",
          config: {
            approvers: ["client_contact"],
            minApprovals: 1,
          },
        },
      ],
    },
  ],
  aiSkills: [
    {
      event: "task.started:series-brief",
      skillId: "content-series-ideation",
    },
    {
      event: "task.started:episode-outlines",
      skillId: "script-assistant",
    },
    {
      event: "task.completed:internal-review",
      skillId: "video-feedback-summarizer",
    },
  ],
};

export default contentSeriesWorkflow;
