/**
 * Chat Services Exports
 *
 * @module chat/services
 */

// Chat Notifications
export {
  notifyBriefCreated,
  notifyBriefAssigned,
  notifyBriefCompleted,
  notifyContentSubmitted,
  notifyContentApproved,
  notifyContentRevision,
  notifyContentPublished,
  notifyClientFeedback,
  notifyDeadlineReminder,
  sendCelebration,
  batchNotify,
} from "./chat-notifications";

// Module Integrations
export {
  onBriefCreated,
  onBriefCompleted,
  onContentSubmitted,
  onContentApproved,
  onContentRevisionRequested,
  onContentPublished,
  onClientFeedback,
  celebrateMilestone,
  celebrateAchievement,
  celebrateBirthday,
  celebrateAnniversary,
} from "./module-integrations";

// Holiday Reminders
export {
  processHolidayReminders,
  processAllOrganizationReminders,
  celebrateHoliday,
  previewUpcomingReminders,
  sendManualContentReminder,
} from "./holiday-reminders";
