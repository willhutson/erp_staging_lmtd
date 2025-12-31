// Workflow Module Entry Point
// Exports all public APIs for the Workflow Engine

// Types
export * from "./types";

// Workflow Engine
export {
  startWorkflow,
  completeTask,
  startTask,
  blockTask,
  reassignTask,
  cancelWorkflow,
  checkTriggerConditions,
} from "./services/workflow-engine";

// Deadline Calculator
export {
  calculateTaskDates,
  recalculateDatesForDelay,
  calculateCriticalPath,
  calculateBufferDays,
} from "./services/deadline-calculator";

// Auto-Assigner
export {
  findBestAssignee,
  findBackupAssignee,
  checkUserCapacity,
  getTeamCapacityForWorkflow,
} from "./services/auto-assigner";

// Nudge Dispatcher
export {
  scheduleTaskNudges,
  processDueNudges,
  acknowledgeNudge,
  getPendingNudgesForUser,
} from "./services/nudge-dispatcher";

// Activity Logger
export {
  logWorkflowActivity,
  getWorkflowActivityLog,
  getWorkflowStats,
  getRecentOrgActivity,
} from "./services/activity-logger";

// Server Actions
export {
  getWorkflowInstances,
  getWorkflowDetail,
  getWorkflowTemplates,
  startWorkflowAction,
  seedWorkflowTemplates,
  getAvailableDefaultTemplates,
  type WorkflowListItem,
  type WorkflowDetail,
} from "./actions";
