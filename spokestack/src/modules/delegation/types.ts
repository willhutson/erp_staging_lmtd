/**
 * Delegation of Authority Types
 *
 * TypeScript definitions for the DOA system that enables automatic
 * task handoff when team members are unavailable.
 */

// ============================================
// DELEGATION STATUS & ACTIVITY TYPES
// ============================================

export type DelegationStatus = "PENDING" | "ACTIVE" | "COMPLETED" | "CANCELLED";

export type DelegationActivityType =
  | "TASK_ASSIGNED"
  | "TASK_COMPLETED"
  | "TASK_ESCALATED"
  | "TASK_REASSIGNED"
  | "APPROVAL_GIVEN"
  | "DECISION_MADE"
  | "CLIENT_COMMUNICATION"
  | "BRIEF_CREATED"
  | "BRIEF_UPDATED"
  | "HANDOFF_STARTED"
  | "HANDOFF_COMPLETED";

// ============================================
// DELEGATION SCOPE CONFIGURATION
// ============================================

/**
 * Authority level for the delegate
 */
export type DelegationAuthority =
  | "full"           // Full decision-making power
  | "execute_only"   // Handle day-to-day, escalate decisions
  | "keep_in_loop"   // Act independently but CC delegator on everything
  | "monitor_only";  // Read-only visibility

/**
 * Conditions that trigger escalation to manager
 */
export type EscalationTrigger =
  | "over_threshold"
  | "new_client"
  | "high_priority"
  | "external_stakeholder"
  | "budget_impact";

/**
 * Delegation scope - what is delegated and how
 */
export interface DelegationScope {
  /** Which clients are delegated - 'all' or specific client IDs */
  clients: "all" | string[];

  /** Which brief types are delegated - 'all' or specific types */
  briefTypes: "all" | string[];

  /** Whether delegate can handle client-facing communications */
  clientFacing: boolean;

  /** Value threshold - escalate if project value exceeds this */
  valueThreshold?: number;

  /** Authority level for the delegate */
  authority: DelegationAuthority;
}

/**
 * Rules for when to escalate to manager
 */
export interface EscalationRules {
  /** Conditions that trigger escalation */
  escalateIf: EscalationTrigger[];

  /** Who to escalate to (user ID) */
  escalateTo: string;

  /** Optional secondary escalation */
  secondaryEscalateTo?: string;
}

/**
 * Full delegation profile configuration
 */
export interface DelegationProfileConfig {
  userId: string;
  primaryDelegateId: string | null;
  scope: DelegationScope;
  escalationRules: EscalationRules;
}

// ============================================
// ACTIVE DELEGATION
// ============================================

/**
 * Context for starting an active delegation
 */
export interface StartDelegationContext {
  organizationId: string;
  delegatorId: string;
  delegateId: string;
  leaveRequestId?: string;
  startDate: Date;
  endDate: Date;
  scope?: DelegationScope; // If not provided, uses profile scope
}

/**
 * Summary of delegation activities
 */
export interface DelegationSummary {
  delegationId: string;
  delegatorName: string;
  delegateName: string;
  startDate: Date;
  endDate: Date;
  status: DelegationStatus;
  activities: {
    tasksAssigned: number;
    tasksCompleted: number;
    tasksEscalated: number;
    clientCommunications: number;
    approvalsGiven: number;
    decisionsMade: number;
  };
}

/**
 * Handoff briefing structure (AI-generated)
 */
export interface HandoffBriefing {
  generatedAt: Date;
  coveragePeriod: {
    start: Date;
    end: Date;
  };
  delegateName: string;
  summary: {
    completed: Array<{
      entityType: string;
      entityId: string;
      title: string;
      completedAt: Date;
      notes?: string;
    }>;
    inProgress: Array<{
      entityType: string;
      entityId: string;
      title: string;
      progress: string;
      nextSteps?: string;
    }>;
    escalated: Array<{
      entityType: string;
      entityId: string;
      title: string;
      reason: string;
      escalatedTo: string;
    }>;
    newAssignments: Array<{
      entityType: string;
      entityId: string;
      title: string;
      assignedAt: Date;
      dueDate: Date;
    }>;
  };
  recommendedActions: string[];
  suggestedMeetingAgenda: string[];
}

// ============================================
// DELEGATION CHAIN RESOLUTION
// ============================================

/**
 * Result of resolving who should handle a task
 */
export interface DelegationResolution {
  /** Who should handle the task */
  assigneeId: string;

  /** Original intended assignee */
  originalAssigneeId: string;

  /** Was delegation applied? */
  wasDelegated: boolean;

  /** Chain of delegation (if multiple hops) */
  delegationChain: string[];

  /** Active delegation ID if applicable */
  activeDelegationId?: string;

  /** Was task escalated due to unavailable delegates? */
  wasEscalated: boolean;

  /** Escalation reason if applicable */
  escalationReason?: string;
}

/**
 * User availability status
 */
export interface UserAvailability {
  userId: string;
  isAvailable: boolean;
  unavailableReason?: "on_leave" | "capacity_full" | "inactive";
  unavailableUntil?: Date;
  delegateId?: string;
  activeDelegationId?: string;
}

// ============================================
// LEAVE CONFLICT DETECTION
// ============================================

/**
 * Conflict when delegate is also on leave
 */
export interface DelegationConflict {
  type: "mutual_delegation" | "chain_unavailable" | "coverage_gap";
  description: string;
  affectedUsers: Array<{
    userId: string;
    userName: string;
    leaveStart: Date;
    leaveEnd: Date;
    delegateId?: string;
  }>;
  suggestedResolutions: Array<{
    action: "chain_to_next" | "adjust_dates" | "assign_alternative";
    description: string;
    suggestedDelegateId?: string;
    suggestedDelegateName?: string;
  }>;
}

/**
 * Result of checking for conflicts
 */
export interface ConflictCheckResult {
  hasConflicts: boolean;
  conflicts: DelegationConflict[];
  canProceedWithChaining: boolean;
  chainDelegateId?: string;
}

// ============================================
// MATCHING CRITERIA
// ============================================

/**
 * Role hierarchy for like-for-like matching
 */
export const ROLE_HIERARCHY: Record<string, string[]> = {
  // Leadership can delegate to leadership
  ADMIN: ["ADMIN", "LEADERSHIP"],
  LEADERSHIP: ["LEADERSHIP", "ADMIN"],

  // Team leads can delegate to other team leads or senior staff
  TEAM_LEAD: ["TEAM_LEAD", "STAFF"],

  // Staff delegates to same level
  STAFF: ["STAFF"],

  // Freelancers typically don't delegate
  FREELANCER: [],
};

/**
 * Department matching for delegation
 */
export const DEPARTMENT_MATCHING: Record<string, string[]> = {
  "Client Services": ["Client Services", "Production"],
  Creative: ["Creative"],
  Design: ["Design", "Creative"],
  Production: ["Production", "Client Services"],
  Strategy: ["Strategy", "Client Services"],
  Media: ["Media"],
  Finance: ["Finance", "Operations"],
  Operations: ["Operations", "Finance"],
  HR: ["HR", "Operations"],
};

// ============================================
// ACTIVITY LOGGING
// ============================================

/**
 * Options for logging delegation activity
 */
export interface LogDelegationActivityOptions {
  activeDelegationId: string;
  activityType: DelegationActivityType;
  entityType: string;
  entityId: string;
  description: string;
  performedById: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// PRISMA MODEL TYPES WITH RELATIONS
// ============================================

export interface DelegationProfileWithRelations {
  id: string;
  organizationId: string;
  userId: string;
  primaryDelegateId: string | null;
  scope: DelegationScope;
  escalationRules: EscalationRules;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user: { id: string; name: string; email: string; department: string };
  primaryDelegate?: { id: string; name: string; email: string } | null;
}

export interface ActiveDelegationWithRelations {
  id: string;
  organizationId: string;
  delegatorId: string;
  delegateId: string;
  leaveRequestId: string | null;
  startDate: Date;
  endDate: Date;
  scopeSnapshot: DelegationScope;
  status: DelegationStatus;
  activatedAt: Date | null;
  completedAt: Date | null;
  cancelledAt: Date | null;
  handoffScheduled: boolean;
  handoffCompletedAt: Date | null;
  handoffNotes: string | null;
  handoffBriefing: HandoffBriefing | null;
  chainedFromId: string | null;
  chainDepth: number;
  createdAt: Date;
  updatedAt: Date;
  delegator: { id: string; name: string; email: string; department: string };
  delegate: { id: string; name: string; email: string; department: string };
  leaveRequest?: { id: string; startDate: Date; endDate: Date } | null;
}
