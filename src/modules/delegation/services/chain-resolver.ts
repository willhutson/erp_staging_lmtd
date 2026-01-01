/**
 * Delegation Chain Resolver
 *
 * Resolves who should handle a task when the intended assignee is unavailable.
 * Implements the delegation chain logic with escalation fallbacks.
 */

import { db } from "@/lib/db";
import type {
  DelegationResolution,
  UserAvailability,
  DelegationScope,
} from "../types";

const MAX_CHAIN_DEPTH = 5; // Prevent infinite loops

/**
 * Check if a user is currently available
 */
export async function checkUserAvailability(
  userId: string,
  asOfDate: Date = new Date()
): Promise<UserAvailability> {
  // Check for active leave
  const activeLeave = await db.leaveRequest.findFirst({
    where: {
      userId,
      status: "APPROVED",
      startDate: { lte: asOfDate },
      endDate: { gte: asOfDate },
    },
  });

  if (activeLeave) {
    // Check if there's an active delegation
    const activeDelegation = await db.activeDelegation.findFirst({
      where: {
        delegatorId: userId,
        status: "ACTIVE",
        startDate: { lte: asOfDate },
        endDate: { gte: asOfDate },
      },
    });

    return {
      userId,
      isAvailable: false,
      unavailableReason: "on_leave",
      unavailableUntil: activeLeave.endDate,
      delegateId: activeDelegation?.delegateId,
      activeDelegationId: activeDelegation?.id,
    };
  }

  // Check if user is active
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  if (!user?.isActive) {
    return {
      userId,
      isAvailable: false,
      unavailableReason: "inactive",
    };
  }

  return {
    userId,
    isAvailable: true,
  };
}

/**
 * Resolve who should handle a task
 *
 * This implements the delegation chain:
 * 1. Check if intended assignee is available
 * 2. If not, get their delegate
 * 3. Check if delegate is available
 * 4. Chain to delegate's delegate if needed
 * 5. Escalate to department head if chain exhausted
 */
export async function resolveDelegation(
  organizationId: string,
  intendedAssigneeId: string,
  asOfDate: Date = new Date()
): Promise<DelegationResolution> {
  const chain: string[] = [intendedAssigneeId];
  let currentUserId = intendedAssigneeId;
  let depth = 0;

  while (depth < MAX_CHAIN_DEPTH) {
    const availability = await checkUserAvailability(currentUserId, asOfDate);

    // User is available - they handle the task
    if (availability.isAvailable) {
      return {
        assigneeId: currentUserId,
        originalAssigneeId: intendedAssigneeId,
        wasDelegated: currentUserId !== intendedAssigneeId,
        delegationChain: chain,
        activeDelegationId: undefined,
        wasEscalated: false,
      };
    }

    // User not available - check for delegate
    if (availability.delegateId) {
      // Add to chain and continue
      chain.push(availability.delegateId);
      currentUserId = availability.delegateId;
      depth++;
      continue;
    }

    // No delegate configured - try to find from profile
    const profile = await db.delegationProfile.findUnique({
      where: { userId: currentUserId },
      select: { primaryDelegateId: true, escalationRules: true },
    });

    if (profile?.primaryDelegateId) {
      chain.push(profile.primaryDelegateId);
      currentUserId = profile.primaryDelegateId;
      depth++;
      continue;
    }

    // No delegate - need to escalate
    break;
  }

  // Chain exhausted or no delegates found - escalate
  return await escalateToManager(
    organizationId,
    intendedAssigneeId,
    chain,
    "No available delegate in chain"
  );
}

/**
 * Escalate to department head or admin
 */
async function escalateToManager(
  organizationId: string,
  originalAssigneeId: string,
  chain: string[],
  reason: string
): Promise<DelegationResolution> {
  // Get original user's department and team lead
  const user = await db.user.findUnique({
    where: { id: originalAssigneeId },
    select: {
      department: true,
      teamLeadId: true,
      delegationProfile: {
        select: { escalationRules: true },
      },
    },
  });

  // Try escalation rules first
  const escalationRules = user?.delegationProfile?.escalationRules as unknown as {
    escalateTo?: string;
  } | null;

  if (escalationRules?.escalateTo) {
    const escalationTarget = await checkUserAvailability(escalationRules.escalateTo);
    if (escalationTarget.isAvailable) {
      return {
        assigneeId: escalationRules.escalateTo,
        originalAssigneeId,
        wasDelegated: true,
        delegationChain: [...chain, escalationRules.escalateTo],
        wasEscalated: true,
        escalationReason: reason,
      };
    }
  }

  // Try team lead
  if (user?.teamLeadId) {
    const teamLead = await checkUserAvailability(user.teamLeadId);
    if (teamLead.isAvailable) {
      return {
        assigneeId: user.teamLeadId,
        originalAssigneeId,
        wasDelegated: true,
        delegationChain: [...chain, user.teamLeadId],
        wasEscalated: true,
        escalationReason: reason,
      };
    }
  }

  // Find any available TEAM_LEAD or LEADERSHIP in same department
  const departmentLeader = await db.user.findFirst({
    where: {
      organizationId,
      department: user?.department,
      isActive: true,
      permissionLevel: { in: ["TEAM_LEAD", "LEADERSHIP", "ADMIN"] },
      id: { notIn: chain },
    },
    select: { id: true },
  });

  if (departmentLeader) {
    const leaderAvailability = await checkUserAvailability(departmentLeader.id);
    if (leaderAvailability.isAvailable) {
      return {
        assigneeId: departmentLeader.id,
        originalAssigneeId,
        wasDelegated: true,
        delegationChain: [...chain, departmentLeader.id],
        wasEscalated: true,
        escalationReason: reason,
      };
    }
  }

  // Last resort: find any available admin
  const admin = await db.user.findFirst({
    where: {
      organizationId,
      isActive: true,
      permissionLevel: "ADMIN",
      id: { notIn: chain },
    },
    select: { id: true },
  });

  if (admin) {
    return {
      assigneeId: admin.id,
      originalAssigneeId,
      wasDelegated: true,
      delegationChain: [...chain, admin.id],
      wasEscalated: true,
      escalationReason: `${reason}. Escalated to admin as last resort.`,
    };
  }

  // No one available - return original (task will be flagged)
  return {
    assigneeId: originalAssigneeId,
    originalAssigneeId,
    wasDelegated: false,
    delegationChain: chain,
    wasEscalated: true,
    escalationReason: `${reason}. CRITICAL: No available assignee found.`,
  };
}

/**
 * Check if a task should be delegated based on scope
 */
export function shouldDelegateTask(
  scope: DelegationScope,
  task: {
    clientId?: string;
    briefType?: string;
    estimatedValue?: number;
  }
): boolean {
  // Check client scope
  if (scope.clients !== "all" && task.clientId) {
    if (!scope.clients.includes(task.clientId)) {
      return false; // Task's client not in delegate scope
    }
  }

  // Check brief type scope
  if (scope.briefTypes !== "all" && task.briefType) {
    if (!scope.briefTypes.includes(task.briefType)) {
      return false; // Task's type not in delegate scope
    }
  }

  // Check value threshold (tasks above threshold should escalate, not delegate)
  if (scope.valueThreshold && task.estimatedValue) {
    if (task.estimatedValue > scope.valueThreshold) {
      return false; // Task exceeds value threshold
    }
  }

  return true;
}

/**
 * Get all active delegations where a user is the delegate
 */
export async function getActiveDelegationsForDelegate(
  delegateId: string
): Promise<
  Array<{
    id: string;
    delegatorId: string;
    delegatorName: string;
    startDate: Date;
    endDate: Date;
    scope: DelegationScope;
  }>
> {
  const now = new Date();

  const delegations = await db.activeDelegation.findMany({
    where: {
      delegateId,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      delegator: {
        select: { id: true, name: true },
      },
    },
  });

  return delegations.map((d) => ({
    id: d.id,
    delegatorId: d.delegatorId,
    delegatorName: d.delegator.name,
    startDate: d.startDate,
    endDate: d.endDate,
    scope: d.scopeSnapshot as unknown as DelegationScope,
  }));
}

/**
 * Check if user is currently delegating to anyone
 */
export async function getActiveDelegationForUser(
  userId: string
): Promise<{
  isDelegating: boolean;
  delegation?: {
    id: string;
    delegateId: string;
    delegateName: string;
    endDate: Date;
  };
}> {
  const now = new Date();

  const delegation = await db.activeDelegation.findFirst({
    where: {
      delegatorId: userId,
      status: "ACTIVE",
      startDate: { lte: now },
      endDate: { gte: now },
    },
    include: {
      delegate: {
        select: { id: true, name: true },
      },
    },
  });

  if (!delegation) {
    return { isDelegating: false };
  }

  return {
    isDelegating: true,
    delegation: {
      id: delegation.id,
      delegateId: delegation.delegateId,
      delegateName: delegation.delegate.name,
      endDate: delegation.endDate,
    },
  };
}
