// Delegation of Authority Module Entry Point
// Exports all public APIs for the DOA system

// Types
export * from "./types";

// Profile Management
export {
  getDelegationProfile,
  upsertDelegationProfile,
  updatePrimaryDelegate,
  getUsersDelegatingTo,
  findPotentialDelegates,
  validateDelegationConfig,
  getDefaultDelegationScope,
  getDefaultEscalationRules,
} from "./services/profile-service";

// Chain Resolution
export {
  checkUserAvailability,
  resolveDelegation,
  shouldDelegateTask,
  getActiveDelegationsForDelegate,
  getActiveDelegationForUser,
} from "./services/chain-resolver";

// Conflict Detection
export {
  checkLeaveConflicts,
  checkBatchLeaveConflicts,
  getUpcomingConflicts,
} from "./services/conflict-detector";

// Handoff
export {
  generateHandoffBriefing,
  startHandoff,
  completeHandoff,
  logDelegationActivity,
  getDelegationsNeedingHandoff,
  getUpcomingReturns,
} from "./services/handoff-service";

// Delegation Engine
export {
  startDelegation,
  activatePendingDelegations,
  routeTaskWithDelegation,
  cancelDelegation,
  getDelegationSummary,
  getUserDelegations,
} from "./services/delegation-engine";

// Notifications
export {
  notifyDelegationActivated,
  notifyTaskDelegated,
  notifyReturnReminder,
  notifyHandoffReady,
  notifyDelegationConflict,
  processReturnReminders,
} from "./services/notification-service";
