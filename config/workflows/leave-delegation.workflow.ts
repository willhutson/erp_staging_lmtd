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

import type { WorkflowDefinition } from "@/modules/builder/types";

export const leaveDelegationWorkflow: WorkflowDefinition = {
  trigger: {
    type: "leave.approved",
    conditions: [
      {
        field: "status",
        operator: "equals",
        value: "APPROVED",
      },
    ],
  },
  tasks: [
    // Phase 1: Pre-Leave Preparation (before leave starts)
    {
      id: "confirm-delegate",
      name: "Confirm Delegate Availability",
      description:
        "Verify that your assigned delegate is available and aware of the upcoming coverage period.",
      assigneeRole: "account_manager", // Person going on leave
      dueOffset: {
        value: 3,
        unit: "days",
        from: "deadline",
      },
      dependsOn: [],
      estimatedHours: 0.25,
    },
    {
      id: "list-active-tasks",
      name: "Document Active Tasks & Briefs",
      description:
        "Create a list of all in-progress tasks, pending briefs, and upcoming deadlines that will need coverage.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 2,
        unit: "days",
        from: "deadline",
      },
      dependsOn: [],
      estimatedHours: 1,
    },
    {
      id: "document-client-context",
      name: "Document Client Context",
      description:
        "Prepare notes on each active client: current status, key contacts, any sensitivities or ongoing issues.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 2,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["list-active-tasks"],
      estimatedHours: 1.5,
    },
    {
      id: "brief-delegate",
      name: "Brief Delegate on Coverage",
      description:
        "Meet with your delegate to walk through active work, priorities, and any special handling required.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 1,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["document-client-context"],
      estimatedHours: 1,
    },
    {
      id: "set-out-of-office",
      name: "Set Out-of-Office & Notifications",
      description:
        "Configure email auto-reply, Slack status, and calendar blocking. Include delegate contact info.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 1,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["brief-delegate"],
      estimatedHours: 0.25,
    },
    {
      id: "notify-stakeholders",
      name: "Notify Key Stakeholders",
      description:
        "Send email to key clients and internal stakeholders about your absence and who to contact.",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 1,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["confirm-delegate"],
      estimatedHours: 0.5,
    },

    // Phase 2: During Leave (assigned to delegate - using project_manager as proxy)
    {
      id: "daily-check-in",
      name: "Daily Task Review",
      description:
        "Review delegated tasks daily. Flag any issues or decisions needed. Log significant activities.",
      assigneeRole: "project_manager", // Delegate role
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["notify-stakeholders"],
      estimatedHours: 0.5,
    },
    {
      id: "escalation-check",
      name: "Check for Escalations",
      description:
        "Review if any items need escalation per the delegator's escalation rules. Escalate as needed.",
      assigneeRole: "project_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["daily-check-in"],
      estimatedHours: 0.25,
    },

    // Phase 3: Return Handoff (when leave ends)
    {
      id: "prepare-handoff-briefing",
      name: "Prepare Return Handoff Briefing",
      description:
        "Compile summary of activities during coverage: completed tasks, new items, decisions made, issues encountered.",
      assigneeRole: "project_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["escalation-check"],
      estimatedHours: 1,
    },
    {
      id: "schedule-handoff-meeting",
      name: "Schedule Handoff Sync",
      description:
        "Book 30-minute meeting with returning team member for their first day back.",
      assigneeRole: "project_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["prepare-handoff-briefing"],
      estimatedHours: 0.25,
    },
    {
      id: "conduct-handoff",
      name: "Conduct Return Handoff",
      description:
        "Meet with returning team member to walk through what happened, transfer context, and hand back tasks.",
      assigneeRole: "project_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["schedule-handoff-meeting"],
      estimatedHours: 0.5,
    },
    {
      id: "reassign-tasks-back",
      name: "Reassign Tasks to Returning Member",
      description:
        "Transfer all delegated tasks back to the original owner. Update assignees in system.",
      assigneeRole: "project_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["conduct-handoff"],
      estimatedHours: 0.25,
    },
    {
      id: "acknowledge-handoff",
      name: "Acknowledge Handoff Complete",
      description:
        "Confirm you've received all context and are ready to resume. Thank your delegate!",
      assigneeRole: "account_manager",
      dueOffset: {
        value: 0,
        unit: "days",
        from: "deadline",
      },
      dependsOn: ["reassign-tasks-back"],
      estimatedHours: 0.25,
    },
  ],
  nudgeRules: [
    {
      id: "pre-leave-reminder",
      name: "Pre-Leave Reminder",
      trigger: {
        type: "before_due",
        offset: 1,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee"],
      messageTemplate:
        "Your leave starts soon! {{taskName}} is due {{dueDateRelative}}. Make sure your delegate is prepared.",
    },
    {
      id: "handoff-prep-reminder",
      name: "Handoff Prep Reminder",
      trigger: {
        type: "before_due",
        offset: 1,
        unit: "days",
      },
      channel: "email",
      recipients: ["assignee"],
      messageTemplate:
        "Team member returning tomorrow. Please complete: {{taskName}}",
    },
    {
      id: "delegate-check-in",
      name: "Delegate Check-in",
      trigger: {
        type: "on_due",
        offset: 0,
        unit: "days",
      },
      channel: "slack",
      recipients: ["assignee"],
      messageTemplate:
        "Coverage check-in: Review delegated tasks and log any significant updates.",
    },
    {
      id: "overdue-alert",
      name: "Overdue Alert",
      trigger: {
        type: "after_due",
        offset: 1,
        unit: "days",
      },
      channel: "email",
      recipients: ["assignee", "manager"],
      messageTemplate:
        "OVERDUE: {{taskName}} for leave handoff is {{dueDateRelative}}. Please complete immediately.",
    },
  ],
  stageGates: [
    {
      id: "handoff-gate",
      taskId: "brief-delegate",
      requirements: [
        {
          type: "tasks_complete",
          config: {
            taskIds: ["document-client-context", "list-active-tasks"],
          },
        },
      ],
    },
    {
      id: "return-gate",
      taskId: "acknowledge-handoff",
      requirements: [
        {
          type: "tasks_complete",
          config: {
            taskIds: ["conduct-handoff", "reassign-tasks-back"],
          },
        },
      ],
    },
  ],
  aiSkills: [
    {
      event: "task.started:list-active-tasks",
      skillId: "generate-task-summary",
    },
    {
      event: "task.started:prepare-handoff-briefing",
      skillId: "generate-handoff-briefing",
    },
  ],
};

export default leaveDelegationWorkflow;
