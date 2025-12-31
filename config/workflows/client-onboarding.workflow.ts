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

import type { WorkflowTemplateConfig } from "@/modules/workflows/types";

export const clientOnboardingWorkflow: WorkflowTemplateConfig = {
  name: "Client Onboarding",
  description:
    "Complete onboarding workflow for new clients after deal is won. Covers contracts, account setup, team introductions, and kickoff.",
  category: "CRM",
  version: "1.0.0",

  trigger: {
    type: "entity_status_change",
    entityType: "Deal",
    conditions: {
      stage: "WON",
    },
  },

  defaultDeadlineDays: 14, // Complete onboarding within 2 weeks

  tasks: [
    // Phase 1: Contract & Legal
    {
      id: "send-contract",
      name: "Send Client Agreement",
      description:
        "Prepare and send the master services agreement or scope of work to the client for signature.",
      assigneeRole: "LEADERSHIP",
      relativeDueDays: -12,
      estimatedHours: 2,
      stage: "legal",
      isStageGate: false,
      requiredOutputs: ["contract_sent_date", "contract_type"],
    },
    {
      id: "collect-signatures",
      name: "Collect Signed Contract",
      description:
        "Follow up with client to ensure contract is signed and returned. Upload signed copy to Drive.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["send-contract"],
      relativeDueDays: -9,
      estimatedHours: 1,
      stage: "legal",
      isStageGate: true,
      requiredOutputs: ["signed_contract_url"],
    },
    {
      id: "setup-billing",
      name: "Set Up Billing & Payment Terms",
      description:
        "Configure invoicing schedule, payment terms, and billing contact. Set up in accounting system.",
      assigneeRole: "FINANCE",
      dependsOn: ["collect-signatures"],
      relativeDueDays: -8,
      estimatedHours: 1,
      stage: "legal",
      isStageGate: false,
    },

    // Phase 2: Account Setup
    {
      id: "create-client-record",
      name: "Create Client in System",
      description:
        "Set up client record in ERP with all relevant details, assign Account Manager, and configure access.",
      assigneeRole: "ADMIN",
      dependsOn: ["collect-signatures"],
      relativeDueDays: -8,
      estimatedHours: 0.5,
      stage: "setup",
      isStageGate: false,
    },
    {
      id: "setup-drive-folders",
      name: "Set Up Google Drive Structure",
      description:
        "Create client folder structure in Google Drive following template. Set up sharing permissions.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["create-client-record"],
      relativeDueDays: -7,
      estimatedHours: 0.5,
      stage: "setup",
      isStageGate: false,
    },
    {
      id: "setup-slack-channel",
      name: "Create Slack Channel",
      description:
        "Set up internal #client-[name] Slack channel. Add core team members.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["create-client-record"],
      relativeDueDays: -7,
      estimatedHours: 0.25,
      stage: "setup",
      isStageGate: false,
    },
    {
      id: "collect-brand-assets",
      name: "Collect Brand Assets & Guidelines",
      description:
        "Request and organize logo files, brand guidelines, color codes, fonts, and any existing assets from client.",
      assigneeRole: "DESIGNER",
      dependsOn: ["create-client-record"],
      relativeDueDays: -5,
      estimatedHours: 2,
      stage: "setup",
      isStageGate: false,
      requiredOutputs: ["brand_assets_folder_url"],
    },
    {
      id: "setup-portal-access",
      name: "Set Up Client Portal Access",
      description:
        "Create client portal login credentials and send welcome email with access instructions.",
      assigneeRole: "ADMIN",
      dependsOn: ["create-client-record"],
      relativeDueDays: -6,
      estimatedHours: 0.5,
      stage: "setup",
      isStageGate: true,
    },

    // Phase 3: Team Introduction
    {
      id: "assign-team",
      name: "Assign Core Team",
      description:
        "Identify and assign Account Manager, Creative Lead, and other key team members to the client.",
      assigneeRole: "LEADERSHIP",
      dependsOn: ["create-client-record"],
      relativeDueDays: -7,
      estimatedHours: 0.5,
      stage: "team",
      isStageGate: false,
    },
    {
      id: "send-team-intro",
      name: "Send Team Introduction",
      description:
        "Send client an email introducing their dedicated team with photos, roles, and contact info.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["assign-team"],
      relativeDueDays: -5,
      estimatedHours: 1,
      stage: "team",
      isStageGate: false,
    },
    {
      id: "internal-briefing",
      name: "Internal Team Briefing",
      description:
        "Hold internal meeting to brief the team on client background, goals, preferences, and scope of work.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["assign-team"],
      relativeDueDays: -4,
      estimatedHours: 1,
      stage: "team",
      isStageGate: false,
    },

    // Phase 4: Kickoff
    {
      id: "schedule-kickoff",
      name: "Schedule Kickoff Meeting",
      description:
        "Coordinate with client to schedule the kickoff meeting. Send calendar invite to all participants.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["setup-portal-access", "assign-team"],
      relativeDueDays: -4,
      estimatedHours: 0.5,
      stage: "kickoff",
      isStageGate: false,
    },
    {
      id: "prepare-kickoff-deck",
      name: "Prepare Kickoff Presentation",
      description:
        "Create kickoff deck covering team intro, process overview, timelines, communication norms, and next steps.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["schedule-kickoff"],
      relativeDueDays: -2,
      estimatedHours: 3,
      stage: "kickoff",
      isStageGate: false,
      aiSkillHook: "generate-kickoff-deck",
    },
    {
      id: "conduct-kickoff",
      name: "Conduct Kickoff Meeting",
      description:
        "Hold kickoff meeting with client. Cover introductions, process, communication, and immediate priorities.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["prepare-kickoff-deck"],
      relativeDueDays: -1,
      estimatedHours: 1.5,
      stage: "kickoff",
      isStageGate: true,
    },

    // Phase 5: First Project
    {
      id: "capture-first-brief",
      name: "Capture First Project Brief",
      description:
        "Work with client to define and document the first project or retainer deliverables.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["conduct-kickoff"],
      relativeDueDays: 0,
      estimatedHours: 2,
      stage: "first_project",
      isStageGate: false,
      createsBrief: true,
    },
    {
      id: "onboarding-complete",
      name: "Mark Onboarding Complete",
      description:
        "Verify all onboarding tasks are done, update client status, and send welcome completion email.",
      assigneeRole: "ACCOUNT_MANAGER",
      dependsOn: ["capture-first-brief", "collect-brand-assets"],
      relativeDueDays: 0,
      estimatedHours: 0.5,
      stage: "first_project",
      isStageGate: true,
    },
  ],

  stages: [
    { id: "legal", name: "Contract & Legal", order: 1 },
    { id: "setup", name: "Account Setup", order: 2 },
    { id: "team", name: "Team Assignment", order: 3 },
    { id: "kickoff", name: "Kickoff", order: 4 },
    { id: "first_project", name: "First Project", order: 5 },
  ],

  nudgeRules: [
    {
      id: "contract-reminder",
      trigger: { type: "before_due", offset: 2, unit: "days" },
      recipients: ["assignee"],
      channel: "EMAIL",
      messageTemplate:
        "Contract collection for {{taskName}} is due in 2 days. Please follow up with the client.",
    },
    {
      id: "kickoff-prep",
      trigger: { type: "before_due", offset: 1, unit: "days" },
      recipients: ["assignee"],
      channel: "SLACK",
      messageTemplate:
        "Reminder: {{taskName}} is tomorrow. Make sure all materials are ready.",
      taskIds: ["conduct-kickoff"],
    },
    {
      id: "overdue-escalation",
      trigger: { type: "after_due", offset: 1, unit: "days" },
      recipients: ["assignee", "manager"],
      channel: "EMAIL",
      messageTemplate:
        "OVERDUE: {{taskName}} is now {{dueDateRelative}}. This is blocking client onboarding.",
    },
  ],

  metadata: {
    estimatedDuration: "2 weeks",
    targetAudience: "Account Managers, Leadership",
    createdBy: "system",
    lastModified: new Date().toISOString(),
    tags: ["onboarding", "client", "crm", "sales"],
  },
};

export default clientOnboardingWorkflow;
