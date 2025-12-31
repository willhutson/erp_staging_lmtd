/**
 * RFP Submission Workflow
 *
 * Triggered when an RFP is created. Orchestrates the entire proposal
 * development process from research through final submission.
 *
 * Timeline: Works backwards from submission deadline
 * Default: 21 days before deadline for first task
 */

import type { WorkflowDefinition } from "@/modules/builder/types";

export const rfpSubmissionWorkflow: WorkflowDefinition = {
  trigger: {
    type: "rfp.created",
    conditions: [
      {
        field: "status",
        operator: "equals",
        value: "ACTIVE",
      },
    ],
  },
  tasks: [
    {
      id: "research",
      name: "Initial Research & Discovery",
      description: "Research client, industry, competitors, and RFP requirements",
      assigneeRole: "strategist",
      dueOffset: {
        value: 21,
        unit: "days",
        from: "deadline",
      },
      dependsOn: [],
      estimatedHours: 8,
    },
    {
      id: "client-analysis",
      name: "Client & Market Analysis",
      description: "Deep dive into client's business challenges and market position",
      assigneeRole: "strategist",
      dueOffset: {
        value: 18,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["research"],
      estimatedHours: 6,
    },
    {
      id: "strategic-approach",
      name: "Draft Strategic Approach",
      description: "Develop the core strategic narrative and key differentiators",
      assigneeRole: "creative_director",
      dueOffset: {
        value: 14,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["client-analysis"],
      estimatedHours: 10,
    },
    {
      id: "team-selection",
      name: "Proposed Team Selection",
      description: "Identify and confirm team members for the pitch",
      assigneeRole: "account_director",
      dueOffset: {
        value: 14,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["strategic-approach"],
      estimatedHours: 2,
    },
    {
      id: "scope-budget",
      name: "Scope & Budget Development",
      description: "Create detailed scope of work and budget breakdown",
      assigneeRole: "account_director",
      dueOffset: {
        value: 12,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["strategic-approach", "team-selection"],
      estimatedHours: 6,
    },
    {
      id: "creative-concepts",
      name: "Creative Concepts",
      description: "Develop visual concepts and sample work",
      assigneeRole: "creative_director",
      dueOffset: {
        value: 10,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["strategic-approach"],
      estimatedHours: 16,
      createsBrief: {
        briefType: "DESIGN",
        titleTemplate: "RFP Concepts: {{rfpName}}",
      },
    },
    {
      id: "internal-review",
      name: "Internal Review & Refinement",
      description: "Leadership review of proposal draft with feedback integration",
      assigneeRole: "leadership",
      dueOffset: {
        value: 7,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["creative-concepts", "scope-budget"],
      estimatedHours: 4,
    },
    {
      id: "presentation-deck",
      name: "Finalize Presentation Deck",
      description: "Create final pitch deck with all approved content",
      assigneeRole: "designer",
      dueOffset: {
        value: 5,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["internal-review"],
      estimatedHours: 12,
      createsBrief: {
        briefType: "DESIGN",
        titleTemplate: "Final Deck: {{rfpName}}",
      },
    },
    {
      id: "rehearsal",
      name: "Pitch Rehearsal",
      description: "Practice presentation with full pitch team",
      assigneeRole: "account_director",
      dueOffset: {
        value: 3,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["presentation-deck"],
      estimatedHours: 3,
    },
    {
      id: "final-submission",
      name: "Final Submission",
      description: "Submit proposal through required channels",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 1,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["rehearsal"],
      estimatedHours: 2,
    },
  ],
  nudgeRules: [
    {
      id: "7-day-warning",
      name: "7 Day Warning",
      trigger: {
        type: "before_due",
        offset: 7,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee", "owner"],
      messageTemplate:
        "Heads up: \"{{taskName}}\" for {{workflowName}} is due in 7 days ({{dueDate}})",
    },
    {
      id: "3-day-warning",
      name: "3 Day Warning",
      trigger: {
        type: "before_due",
        offset: 3,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee"],
      messageTemplate:
        "Reminder: \"{{taskName}}\" is due in 3 days. Please ensure you're on track.",
    },
    {
      id: "1-day-warning",
      name: "1 Day Warning",
      trigger: {
        type: "before_due",
        offset: 1,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee", "manager"],
      messageTemplate:
        "Urgent: \"{{taskName}}\" is due tomorrow! Please complete or flag any blockers.",
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
        "OVERDUE: \"{{taskName}}\" was due {{dueDateRelative}}. This may impact the RFP deadline.",
    },
  ],
  stageGates: [
    {
      id: "approach-approval",
      taskId: "internal-review",
      requirements: [
        {
          type: "approval",
          config: {
            approvers: ["leadership"],
            minApprovals: 1,
          },
        },
      ],
    },
  ],
  aiSkills: [
    {
      event: "task.started:research",
      skillId: "competitive-analysis",
    },
    {
      event: "task.completed:strategic-approach",
      skillId: "proposal-outline",
    },
  ],
};

export default rfpSubmissionWorkflow;
