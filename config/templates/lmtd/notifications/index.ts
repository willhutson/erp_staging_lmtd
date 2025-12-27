/**
 * LMTD Notification Templates
 *
 * Pre-configured notification rules extracted from TeamLMTD.
 */

import type { NotificationTemplate } from "../../types";

// ============================================
// BRIEF NOTIFICATIONS
// ============================================

export const briefSubmittedNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-brief-submitted-v1",
    name: "Brief Submitted Notification",
    description: "Notify team lead when a new brief is submitted for review",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["brief", "submission", "team-lead"],
    icon: "FileText",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "users"],
  },
  data: {
    name: "Brief Submitted",
    trigger: {
      event: "brief.status_changed",
      conditions: [
        { field: "status", operator: "eq", value: "SUBMITTED" },
      ],
    },
    channels: ["in-app", "email"],
    recipients: [
      { type: "role", value: "TEAM_LEAD" },
    ],
    template: {
      subject: "New Brief Submitted: {brief.title}",
      body: "A new brief has been submitted for review.\n\n**Brief:** {brief.title}\n**Client:** {client.name}\n**Submitted by:** {submitter.name}\n**Due Date:** {brief.dueDate}\n\n[View Brief]({brief.url})",
      variables: ["brief.title", "brief.url", "brief.dueDate", "client.name", "submitter.name"],
    },
  },
};

export const briefApprovedNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-brief-approved-v1",
    name: "Brief Approved Notification",
    description: "Notify assignee when their brief is approved",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["brief", "approval", "assignee"],
    icon: "CheckCircle",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "users"],
  },
  data: {
    name: "Brief Approved",
    trigger: {
      event: "brief.status_changed",
      conditions: [
        { field: "status", operator: "eq", value: "APPROVED" },
      ],
    },
    channels: ["in-app", "slack"],
    recipients: [
      { type: "field", value: "assigneeId" },
      { type: "field", value: "createdById" },
    ],
    template: {
      subject: "Brief Approved: {brief.title}",
      body: "Your brief has been approved and is ready to start.\n\n**Brief:** {brief.title}\n**Approved by:** {approver.name}\n**Start Date:** {brief.startDate}\n\n[View Brief]({brief.url})",
      variables: ["brief.title", "brief.url", "brief.startDate", "approver.name"],
    },
  },
};

export const briefRevisionRequestedNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-brief-revision-v1",
    name: "Brief Revision Requested",
    description: "Notify creator when revisions are requested on their brief",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["brief", "revision", "feedback"],
    icon: "AlertTriangle",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "users"],
  },
  data: {
    name: "Brief Revision Requested",
    trigger: {
      event: "brief.status_changed",
      conditions: [
        { field: "status", operator: "eq", value: "REVISIONS" },
      ],
    },
    channels: ["in-app", "email"],
    recipients: [
      { type: "field", value: "createdById" },
    ],
    template: {
      subject: "Revisions Requested: {brief.title}",
      body: "Revisions have been requested on your brief.\n\n**Brief:** {brief.title}\n**Requested by:** {reviewer.name}\n**Feedback:**\n{feedback.content}\n\n[View Brief]({brief.url})",
      variables: ["brief.title", "brief.url", "reviewer.name", "feedback.content"],
    },
  },
};

export const briefDeadlineReminderNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-brief-deadline-reminder-v1",
    name: "Brief Deadline Reminder",
    description: "Remind assignee about upcoming brief deadline",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["brief", "deadline", "reminder"],
    icon: "Clock",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "users"],
  },
  data: {
    name: "Brief Deadline Reminder",
    trigger: {
      event: "schedule.daily",
      conditions: [
        { field: "dueDate", operator: "eq", value: "tomorrow" },
        { field: "status", operator: "in", value: ["IN_PROGRESS", "IN_REVIEW"] },
      ],
    },
    channels: ["in-app", "email"],
    recipients: [
      { type: "field", value: "assigneeId" },
    ],
    template: {
      subject: "Deadline Tomorrow: {brief.title}",
      body: "Reminder: This brief is due tomorrow.\n\n**Brief:** {brief.title}\n**Client:** {client.name}\n**Due Date:** {brief.dueDate}\n**Current Status:** {brief.status}\n\n[View Brief]({brief.url})",
      variables: ["brief.title", "brief.url", "brief.dueDate", "brief.status", "client.name"],
    },
  },
};

// ============================================
// TIME TRACKING NOTIFICATIONS
// ============================================

export const weeklyTimesheetReminderNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-timesheet-reminder-v1",
    name: "Weekly Timesheet Reminder",
    description: "Remind team members to submit their weekly timesheets",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["time-tracking", "timesheet", "weekly"],
    icon: "Clock",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["timeEntries", "users"],
  },
  data: {
    name: "Weekly Timesheet Reminder",
    trigger: {
      event: "schedule.weekly",
      conditions: [
        { field: "dayOfWeek", operator: "eq", value: "friday" },
        { field: "hour", operator: "eq", value: 14 },
      ],
    },
    channels: ["in-app", "slack"],
    recipients: [
      { type: "role", value: "STAFF" },
    ],
    template: {
      subject: "Timesheet Reminder: Submit Your Hours",
      body: "It's Friday! Please make sure to log all your hours for this week.\n\n**Your Hours This Week:** {user.hoursThisWeek}h / {user.targetHours}h\n\n[Log Time]({timesheet.url})",
      variables: ["user.hoursThisWeek", "user.targetHours", "timesheet.url"],
    },
  },
};

// ============================================
// CLIENT NOTIFICATIONS
// ============================================

export const clientDeliverableReadyNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-deliverable-ready-v1",
    name: "Deliverable Ready for Client",
    description: "Notify client servicing when a deliverable is ready for client review",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["deliverable", "client", "review"],
    icon: "Package",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["briefs", "clients", "users"],
  },
  data: {
    name: "Deliverable Ready for Client",
    trigger: {
      event: "brief.status_changed",
      conditions: [
        { field: "status", operator: "eq", value: "CLIENT_REVIEW" },
      ],
    },
    channels: ["in-app", "email"],
    recipients: [
      { type: "role", value: "CLIENT_SERVICING" },
    ],
    template: {
      subject: "Ready for Client: {brief.title}",
      body: "A deliverable is ready for client review.\n\n**Brief:** {brief.title}\n**Client:** {client.name}\n**Completed by:** {assignee.name}\n\nPlease review before sending to the client.\n\n[View Deliverable]({brief.url})",
      variables: ["brief.title", "brief.url", "client.name", "assignee.name"],
    },
  },
};

// ============================================
// RFP NOTIFICATIONS
// ============================================

export const rfpNewOpportunityNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-rfp-new-v1",
    name: "New RFP Opportunity",
    description: "Notify leadership about new RFP opportunities",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["rfp", "sales", "opportunity"],
    icon: "TrendingUp",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["rfps", "users"],
  },
  data: {
    name: "New RFP Opportunity",
    trigger: {
      event: "rfp.created",
    },
    channels: ["in-app", "slack", "email"],
    recipients: [
      { type: "role", value: "LEADERSHIP" },
    ],
    template: {
      subject: "New RFP: {rfp.entity}",
      body: "A new RFP opportunity has been added to the pipeline.\n\n**Entity:** {rfp.entity}\n**Estimated Value:** {rfp.estimatedValue}\n**Deadline:** {rfp.deadline}\n**Added by:** {creator.name}\n\n[View RFP]({rfp.url})",
      variables: ["rfp.entity", "rfp.estimatedValue", "rfp.deadline", "rfp.url", "creator.name"],
    },
  },
};

export const rfpDeadlineApproachingNotification: NotificationTemplate = {
  category: "notification",
  metadata: {
    id: "lmtd-rfp-deadline-v1",
    name: "RFP Deadline Approaching",
    description: "Notify team about approaching RFP submission deadlines",
    category: "notification",
    version: "1.0.0",
    author: "TeamLMTD",
    source: "lmtd",
    tags: ["rfp", "deadline", "submission"],
    icon: "AlertCircle",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-12-27T00:00:00Z",
  },
  dependencies: {
    modules: ["CORE"],
    resources: ["rfps", "users"],
  },
  data: {
    name: "RFP Deadline Approaching",
    trigger: {
      event: "schedule.daily",
      conditions: [
        { field: "submissionDate", operator: "lt", value: "3_days" },
        { field: "status", operator: "neq", value: "SUBMITTED" },
      ],
    },
    channels: ["in-app", "slack"],
    recipients: [
      { type: "field", value: "leadId" },
      { type: "role", value: "LEADERSHIP" },
    ],
    template: {
      subject: "RFP Deadline in {rfp.daysUntilDeadline} days: {rfp.entity}",
      body: "An RFP submission deadline is approaching!\n\n**Entity:** {rfp.entity}\n**Deadline:** {rfp.submissionDate}\n**Days Remaining:** {rfp.daysUntilDeadline}\n**Current Status:** {rfp.status}\n\n[View RFP]({rfp.url})",
      variables: ["rfp.entity", "rfp.submissionDate", "rfp.daysUntilDeadline", "rfp.status", "rfp.url"],
    },
  },
};

// ============================================
// REGISTRY EXPORT
// ============================================

export const lmtdNotificationTemplates: NotificationTemplate[] = [
  // Brief notifications
  briefSubmittedNotification,
  briefApprovedNotification,
  briefRevisionRequestedNotification,
  briefDeadlineReminderNotification,
  // Time tracking
  weeklyTimesheetReminderNotification,
  // Client notifications
  clientDeliverableReadyNotification,
  // RFP notifications
  rfpNewOpportunityNotification,
  rfpDeadlineApproachingNotification,
];

export function getNotificationTemplateById(id: string): NotificationTemplate | undefined {
  return lmtdNotificationTemplates.find((t) => t.metadata.id === id);
}

export function getNotificationTemplatesByTag(tag: string): NotificationTemplate[] {
  return lmtdNotificationTemplates.filter((t) => t.metadata.tags.includes(tag));
}

export default lmtdNotificationTemplates;
