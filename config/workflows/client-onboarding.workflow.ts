/**
 * Client Onboarding Workflow Template
 *
 * Triggered when a Deal is marked as WON.
 * Manages the full onboarding process for new clients.
 *
 * Tasks:
 * 1. Contract & Legal Setup
 * 2. Account Setup
 * 3. Team Introduction
 * 4. Kickoff Meeting
 * 5. First Project Setup
 */

import type { WorkflowDefinition } from "@/modules/builder/types";

export const clientOnboardingWorkflow: WorkflowDefinition = {
  trigger: {
    type: "deal.won",
    conditions: [
      {
        field: "stage",
        operator: "equals",
        value: "WON",
      },
    ],
  },
  tasks: [
    // Phase 1: Contract & Legal
    {
      id: "send-contract",
      name: "Send Client Agreement",
      description:
        "Prepare and send the master services agreement or scope of work to the client for signature.",
      assigneeRole: "leadership",
      dueOffset: {
        value: 12,
        unit: "days",
        from: "deadline",
      },
      dependsOn: [],
      estimatedHours: 2,
    },
    {
      id: "collect-signatures",
      name: "Collect Signed Contract",
      description:
        "Follow up with client to ensure contract is signed and returned. Upload signed copy to Drive.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 9,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["send-contract"],
      estimatedHours: 1,
    },
    {
      id: "setup-billing",
      name: "Set Up Billing & Payment Terms",
      description:
        "Configure invoicing schedule, payment terms, and billing contact. Set up in accounting system.",
      assigneeRole: "finance",
      dueOffset: {
        value: 8,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["collect-signatures"],
      estimatedHours: 1,
    },

    // Phase 2: Account Setup
    {
      id: "create-client-record",
      name: "Create Client in System",
      description:
        "Set up client record in ERP with all relevant details, assign Account Manager, and configure access.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 8,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["collect-signatures"],
      estimatedHours: 0.5,
    },
    {
      id: "setup-drive-folders",
      name: "Set Up Google Drive Structure",
      description:
        "Create client folder structure in Google Drive following template. Set up sharing permissions.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 7,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["create-client-record"],
      estimatedHours: 0.5,
    },
    {
      id: "setup-slack-channel",
      name: "Create Slack Channel",
      description:
        "Set up internal #client-[name] Slack channel. Add core team members.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 7,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["create-client-record"],
      estimatedHours: 0.25,
    },
    {
      id: "collect-brand-assets",
      name: "Collect Brand Assets & Guidelines",
      description:
        "Request and organize logo files, brand guidelines, color codes, fonts, and any existing assets from client.",
      assigneeRole: "designer",
      dueOffset: {
        value: 5,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["create-client-record"],
      estimatedHours: 2,
    },
    {
      id: "setup-portal-access",
      name: "Set Up Client Portal Access",
      description:
        "Create client portal login credentials and send welcome email with access instructions.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 6,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["create-client-record"],
      estimatedHours: 0.5,
    },

    // Phase 3: Team Introduction
    {
      id: "assign-team",
      name: "Assign Core Team",
      description:
        "Identify and assign Account Manager, Creative Lead, and other key team members to the client.",
      assigneeRole: "leadership",
      dueOffset: {
        value: 7,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["create-client-record"],
      estimatedHours: 0.5,
    },
    {
      id: "send-team-intro",
      name: "Send Team Introduction",
      description:
        "Send client an email introducing their dedicated team with photos, roles, and contact info.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 5,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["assign-team"],
      estimatedHours: 1,
    },
    {
      id: "internal-briefing",
      name: "Internal Team Briefing",
      description:
        "Hold internal meeting to brief the team on client background, goals, preferences, and scope of work.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 4,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["assign-team"],
      estimatedHours: 1,
    },

    // Phase 4: Kickoff
    {
      id: "schedule-kickoff",
      name: "Schedule Kickoff Meeting",
      description:
        "Coordinate with client to schedule the kickoff meeting. Send calendar invite to all participants.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 4,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["setup-portal-access", "assign-team"],
      estimatedHours: 0.5,
    },
    {
      id: "prepare-kickoff-deck",
      name: "Prepare Kickoff Presentation",
      description:
        "Create kickoff deck covering team intro, process overview, timelines, communication norms, and next steps.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 2,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["schedule-kickoff"],
      estimatedHours: 3,
    },
    {
      id: "conduct-kickoff",
      name: "Conduct Kickoff Meeting",
      description:
        "Hold kickoff meeting with client. Cover introductions, process, communication, and immediate priorities.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 1,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["prepare-kickoff-deck"],
      estimatedHours: 1.5,
    },

    // Phase 5: First Project
    {
      id: "capture-first-brief",
      name: "Capture First Project Brief",
      description:
        "Work with client to define and document the first project or retainer deliverables.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["conduct-kickoff"],
      estimatedHours: 2,
      createsBrief: {
        briefType: "GENERAL",
        titleTemplate: "First Brief: {{clientName}}",
      },
    },
    {
      id: "onboarding-complete",
      name: "Mark Onboarding Complete",
      description:
        "Verify all onboarding tasks are done, update client status, and send welcome completion email.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["capture-first-brief", "collect-brand-assets"],
      estimatedHours: 0.5,
    },
  ],
  nudgeRules: [
    {
      id: "contract-reminder",
      name: "Contract Reminder",
      trigger: {
        type: "before_due",
        offset: 2,
        unit: "days",
      },
      channel: "email",
      recipients: ["assignee"],
      messageTemplate:
        "Contract collection for {{taskName}} is due in 2 days. Please follow up with the client.",
    },
    {
      id: "kickoff-prep",
      name: "Kickoff Prep Reminder",
      trigger: {
        type: "before_due",
        offset: 1,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee"],
      messageTemplate:
        "Reminder: {{taskName}} is tomorrow. Make sure all materials are ready.",
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
      recipients: ["assignee", "manager"],
      messageTemplate:
        "OVERDUE: {{taskName}} is now {{dueDateRelative}}. This is blocking client onboarding.",
    },
  ],
  stageGates: [
    {
      id: "contract-gate",
      taskId: "collect-signatures",
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
    {
      id: "kickoff-gate",
      taskId: "conduct-kickoff",
      requirements: [
        {
          type: "tasks_complete",
          config: {
            taskIds: ["prepare-kickoff-deck", "internal-briefing"],
          },
        },
      ],
    },
  ],
  aiSkills: [
    {
      event: "task.started:prepare-kickoff-deck",
      skillId: "generate-kickoff-deck",
    },
  ],
};

export default clientOnboardingWorkflow;
