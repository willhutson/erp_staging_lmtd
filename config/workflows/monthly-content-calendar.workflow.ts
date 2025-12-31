/**
 * Monthly Content Calendar Workflow
 *
 * Triggered on a monthly schedule. Orchestrates the planning, creation,
 * approval, and scheduling of social media content for the upcoming month.
 *
 * Timeline: Runs monthly, typically starting 25 days before month end
 * Use Case: Client retainers with recurring content needs
 */

import type { WorkflowDefinition } from "@/modules/builder/types";

export const monthlyContentCalendarWorkflow: WorkflowDefinition = {
  trigger: {
    type: "schedule.monthly",
    conditions: [], // Runs for all active clients with content retainers
  },
  tasks: [
    {
      id: "performance-review",
      name: "Review Previous Month Performance",
      description:
        "Analyze metrics from previous month: engagement, reach, top performers, and learnings",
      assigneeRole: "strategist",
      dueOffset: {
        value: 25,
        unit: "days",
        from: "deadline",
      },
      dependsOn: [],
      estimatedHours: 3,
    },
    {
      id: "content-planning",
      name: "Content Strategy & Planning Session",
      description:
        "Develop content themes, pillars, and key messages for the month. Include tentpole dates and campaigns.",
      assigneeRole: "strategist",
      dueOffset: {
        value: 22,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["performance-review"],
      estimatedHours: 4,
    },
    {
      id: "calendar-draft",
      name: "Draft Content Calendar",
      description:
        "Create detailed calendar with post concepts, copy direction, and visual requirements",
      assigneeRole: "content_manager",
      dueOffset: {
        value: 20,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["content-planning"],
      estimatedHours: 6,
    },
    {
      id: "internal-calendar-review",
      name: "Internal Calendar Review",
      description: "Account team reviews calendar for strategy alignment and feasibility",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 18,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["calendar-draft"],
      estimatedHours: 2,
    },
    {
      id: "client-calendar-approval",
      name: "Client Calendar Approval",
      description: "Present calendar to client for approval. Incorporate feedback.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 15,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["internal-calendar-review"],
      estimatedHours: 3,
    },
    {
      id: "copy-development",
      name: "Develop Copy for All Posts",
      description: "Write final copy for all approved posts, including hashtags and CTAs",
      assigneeRole: "copywriter",
      dueOffset: {
        value: 12,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["client-calendar-approval"],
      estimatedHours: 8,
      createsBrief: {
        briefType: "COPYWRITING_EN",
        titleTemplate: "{{clientName}} – Monthly Content Copy ({{month}})",
      },
    },
    {
      id: "creative-production",
      name: "Produce Visual Assets",
      description: "Create all static and video assets per approved calendar",
      assigneeRole: "designer",
      dueOffset: {
        value: 10,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["client-calendar-approval"],
      estimatedHours: 16,
      createsBrief: {
        briefType: "DESIGN",
        titleTemplate: "{{clientName}} – Monthly Content Designs ({{month}})",
      },
    },
    {
      id: "copy-review",
      name: "Copy Review & Editing",
      description: "Proofread and refine all copy, ensure brand voice consistency",
      assigneeRole: "senior_copywriter",
      dueOffset: {
        value: 8,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["copy-development"],
      estimatedHours: 3,
    },
    {
      id: "creative-review",
      name: "Creative Review & Refinement",
      description: "Review all visuals against brand guidelines, make refinements",
      assigneeRole: "creative_director",
      dueOffset: {
        value: 7,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["creative-production"],
      estimatedHours: 3,
    },
    {
      id: "content-assembly",
      name: "Assemble Final Content Pack",
      description: "Match copy with visuals, prepare scheduling files",
      assigneeRole: "content_manager",
      dueOffset: {
        value: 5,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["copy-review", "creative-review"],
      estimatedHours: 4,
    },
    {
      id: "client-content-approval",
      name: "Client Final Content Approval",
      description: "Present assembled content for final client sign-off",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 4,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["content-assembly"],
      estimatedHours: 2,
    },
    {
      id: "schedule-content",
      name: "Schedule All Content",
      description: "Upload and schedule all approved content in publishing tools",
      assigneeRole: "social_media_manager",
      dueOffset: {
        value: 2,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["client-content-approval"],
      estimatedHours: 3,
    },
    {
      id: "final-qa",
      name: "Final QA & Verification",
      description: "Verify all posts are correctly scheduled with proper tags and links",
      assigneeRole: "content_manager",
      dueOffset: {
        value: 1,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["schedule-content"],
      estimatedHours: 1,
    },
  ],
  nudgeRules: [
    {
      id: "calendar-reminder",
      name: "Calendar Planning Reminder",
      trigger: {
        type: "before_due",
        offset: 5,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee"],
      messageTemplate:
        "Don't forget: \"{{taskName}}\" for {{clientName}} is coming up in 5 days",
    },
    {
      id: "2-day-warning",
      name: "2 Day Warning",
      trigger: {
        type: "before_due",
        offset: 2,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee"],
      messageTemplate:
        "Reminder: \"{{taskName}}\" is due in 2 days. Make sure you're on track!",
    },
    {
      id: "due-today",
      name: "Due Today",
      trigger: {
        type: "on_due",
        offset: 0,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee", "manager"],
      messageTemplate: "Today's the day: \"{{taskName}}\" is due. Please complete by EOD.",
    },
    {
      id: "overdue",
      name: "Overdue Alert",
      trigger: {
        type: "after_due",
        offset: 1,
        unit: "days",
      },
      channel: "email",
      recipients: ["assignee", "manager", "owner"],
      messageTemplate:
        "OVERDUE: \"{{taskName}}\" for {{clientName}} is now overdue. Please complete ASAP.",
    },
  ],
  stageGates: [
    {
      id: "client-calendar-gate",
      taskId: "client-calendar-approval",
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
    {
      id: "client-content-gate",
      taskId: "client-content-approval",
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
      event: "task.started:content-planning",
      skillId: "content-idea-generator",
    },
    {
      event: "task.started:copy-development",
      skillId: "social-copy-assistant",
    },
    {
      event: "task.completed:performance-review",
      skillId: "performance-insights",
    },
  ],
};

export default monthlyContentCalendarWorkflow;
