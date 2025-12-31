/**
 * Leave Delegation Workflow Template
 *
 * Triggered when a Leave Request is approved.
 * Automates the handoff process before leave starts and return process after.
 *
 * Tasks:
 * 1. Pre-Leave Handoff (before leave starts)
 * 2. During Leave Monitoring
 * 3. Return Handoff (when leave ends)
 */

import type { WorkflowTemplateConfig } from "@/modules/workflows/types";

export const leaveDelegationWorkflow: WorkflowTemplateConfig = {
  name: "Leave Delegation Handoff",
  description:
    "Automated workflow for managing delegation during approved leave. Ensures smooth handoff before departure and structured return process.",
  category: "HR",
  version: "1.0.0",

  trigger: {
    type: "entity_status_change",
    entityType: "LeaveRequest",
    conditions: {
      status: "APPROVED",
    },
  },

  // Deadline is the leave start date (tasks due before leave begins)
  defaultDeadlineDays: 0, // Relative to leave start date

  tasks: [
    // Phase 1: Pre-Leave Preparation (before leave starts)
    {
      id: "confirm-delegate",
      name: "Confirm Delegate Availability",
      description:
        "Verify that your assigned delegate is available and aware of the upcoming coverage period.",
      assigneeRole: "DELEGATOR", // Special role = the person going on leave
      relativeDueDays: -3, // 3 days before leave starts
      estimatedHours: 0.25,
      stage: "pre_leave",
      isStageGate: false,
    },
    {
      id: "list-active-tasks",
      name: "Document Active Tasks & Briefs",
      description:
        "Create a list of all in-progress tasks, pending briefs, and upcoming deadlines that will need coverage.",
      assigneeRole: "DELEGATOR",
      relativeDueDays: -2,
      estimatedHours: 1,
      stage: "pre_leave",
      isStageGate: false,
      aiSkillHook: "generate-task-summary",
      requiredOutputs: ["active_tasks_count", "priority_items"],
    },
    {
      id: "document-client-context",
      name: "Document Client Context",
      description:
        "Prepare notes on each active client: current status, key contacts, any sensitivities or ongoing issues.",
      assigneeRole: "DELEGATOR",
      dependsOn: ["list-active-tasks"],
      relativeDueDays: -2,
      estimatedHours: 1.5,
      stage: "pre_leave",
      isStageGate: false,
    },
    {
      id: "brief-delegate",
      name: "Brief Delegate on Coverage",
      description:
        "Meet with your delegate to walk through active work, priorities, and any special handling required.",
      assigneeRole: "DELEGATOR",
      dependsOn: ["document-client-context"],
      relativeDueDays: -1,
      estimatedHours: 1,
      stage: "pre_leave",
      isStageGate: true,
    },
    {
      id: "set-out-of-office",
      name: "Set Out-of-Office & Notifications",
      description:
        "Configure email auto-reply, Slack status, and calendar blocking. Include delegate contact info.",
      assigneeRole: "DELEGATOR",
      dependsOn: ["brief-delegate"],
      relativeDueDays: -1,
      estimatedHours: 0.25,
      stage: "pre_leave",
      isStageGate: false,
    },
    {
      id: "notify-stakeholders",
      name: "Notify Key Stakeholders",
      description:
        "Send email to key clients and internal stakeholders about your absence and who to contact.",
      assigneeRole: "DELEGATOR",
      dependsOn: ["confirm-delegate"],
      relativeDueDays: -1,
      estimatedHours: 0.5,
      stage: "pre_leave",
      isStageGate: true,
    },

    // Phase 2: During Leave (assigned to delegate)
    {
      id: "daily-check-in",
      name: "Daily Task Review",
      description:
        "Review delegated tasks daily. Flag any issues or decisions needed. Log significant activities.",
      assigneeRole: "DELEGATE", // Special role = the covering person
      relativeDueDays: 3, // Midpoint of typical leave
      estimatedHours: 0.5,
      stage: "during_leave",
      isStageGate: false,
      isRecurring: true,
    },
    {
      id: "escalation-check",
      name: "Check for Escalations",
      description:
        "Review if any items need escalation per the delegator's escalation rules. Escalate as needed.",
      assigneeRole: "DELEGATE",
      relativeDueDays: 5,
      estimatedHours: 0.25,
      stage: "during_leave",
      isStageGate: false,
    },

    // Phase 3: Return Handoff (when leave ends)
    {
      id: "prepare-handoff-briefing",
      name: "Prepare Return Handoff Briefing",
      description:
        "Compile summary of activities during coverage: completed tasks, new items, decisions made, issues encountered.",
      assigneeRole: "DELEGATE",
      relativeDueDays: 7, // Day before return (assuming 7-day leave)
      estimatedHours: 1,
      stage: "return",
      isStageGate: false,
      aiSkillHook: "generate-handoff-briefing",
    },
    {
      id: "schedule-handoff-meeting",
      name: "Schedule Handoff Sync",
      description:
        "Book 30-minute meeting with returning team member for their first day back.",
      assigneeRole: "DELEGATE",
      dependsOn: ["prepare-handoff-briefing"],
      relativeDueDays: 7,
      estimatedHours: 0.25,
      stage: "return",
      isStageGate: false,
    },
    {
      id: "conduct-handoff",
      name: "Conduct Return Handoff",
      description:
        "Meet with returning team member to walk through what happened, transfer context, and hand back tasks.",
      assigneeRole: "DELEGATE",
      dependsOn: ["schedule-handoff-meeting"],
      relativeDueDays: 8, // First day back
      estimatedHours: 0.5,
      stage: "return",
      isStageGate: true,
    },
    {
      id: "reassign-tasks-back",
      name: "Reassign Tasks to Returning Member",
      description:
        "Transfer all delegated tasks back to the original owner. Update assignees in system.",
      assigneeRole: "DELEGATE",
      dependsOn: ["conduct-handoff"],
      relativeDueDays: 8,
      estimatedHours: 0.25,
      stage: "return",
      isStageGate: false,
    },
    {
      id: "acknowledge-handoff",
      name: "Acknowledge Handoff Complete",
      description:
        "Confirm you've received all context and are ready to resume. Thank your delegate!",
      assigneeRole: "DELEGATOR",
      dependsOn: ["reassign-tasks-back"],
      relativeDueDays: 8,
      estimatedHours: 0.25,
      stage: "return",
      isStageGate: true,
    },
  ],

  stages: [
    { id: "pre_leave", name: "Pre-Leave Handoff", order: 1 },
    { id: "during_leave", name: "During Leave", order: 2 },
    { id: "return", name: "Return Handoff", order: 3 },
  ],

  nudgeRules: [
    {
      id: "pre-leave-reminder",
      trigger: { type: "before_due", offset: 1, unit: "days" },
      recipients: ["assignee"],
      channel: "SLACK",
      messageTemplate:
        "Your leave starts soon! {{taskName}} is due {{dueDateRelative}}. Make sure your delegate is prepared.",
      taskIds: ["brief-delegate", "notify-stakeholders"],
    },
    {
      id: "handoff-prep-reminder",
      trigger: { type: "before_due", offset: 1, unit: "days" },
      recipients: ["assignee"],
      channel: "EMAIL",
      messageTemplate:
        "Team member returning tomorrow. Please complete: {{taskName}}",
      taskIds: ["prepare-handoff-briefing"],
    },
    {
      id: "delegate-check-in",
      trigger: { type: "on_due" },
      recipients: ["assignee"],
      channel: "SLACK",
      messageTemplate:
        "Coverage check-in: Review delegated tasks and log any significant updates.",
      taskIds: ["daily-check-in"],
    },
    {
      id: "overdue-alert",
      trigger: { type: "after_due", offset: 1, unit: "days" },
      recipients: ["assignee", "manager"],
      channel: "EMAIL",
      messageTemplate:
        "OVERDUE: {{taskName}} for leave handoff is {{dueDateRelative}}. Please complete immediately.",
    },
  ],

  metadata: {
    estimatedDuration: "Varies with leave length",
    targetAudience: "All staff taking leave",
    createdBy: "system",
    lastModified: new Date().toISOString(),
    tags: ["leave", "delegation", "handoff", "hr"],
    notes:
      "This workflow uses special role types (DELEGATOR/DELEGATE) that are resolved from the leave request context.",
  },
};

export default leaveDelegationWorkflow;
