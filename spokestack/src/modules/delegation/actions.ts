"use server";

import { getStudioUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type {
  DelegationScope,
  EscalationRules,
  DelegationResolution,
  UserAvailability,
  DelegationSummary,
} from "./types";

const MAX_CHAIN_DEPTH = 5;

// ============================================
// PROFILE ACTIONS
// ============================================

/**
 * Get the current user's delegation profile
 */
export async function getMyDelegationProfile() {
  const user = await getStudioUser();

  const profile = await prisma.delegationProfile.findUnique({
    where: { userId: user.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, department: true },
      },
      primaryDelegate: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  return profile;
}

/**
 * Get a user's delegation profile by user ID
 */
export async function getDelegationProfile(
  userId: string
): Promise<{
  userId: string;
  primaryDelegateId: string | null;
  scope: DelegationScope;
  escalationRules: EscalationRules;
} | null> {
  const profile = await prisma.delegationProfile.findUnique({
    where: { userId },
  });

  if (!profile) return null;

  return {
    userId: profile.userId,
    primaryDelegateId: profile.primaryDelegateId,
    scope: profile.scope as unknown as DelegationScope,
    escalationRules: profile.escalationRules as unknown as EscalationRules,
  };
}

/**
 * Create or update the current user's delegation profile
 */
export async function updateMyDelegationProfile(data: {
  primaryDelegateId: string | null;
  scope: DelegationScope;
  escalationRules: EscalationRules;
}) {
  const user = await getStudioUser();

  await prisma.delegationProfile.upsert({
    where: { userId: user.id },
    create: {
      organizationId: user.organizationId,
      userId: user.id,
      primaryDelegateId: data.primaryDelegateId,
      scope: data.scope as object,
      escalationRules: data.escalationRules as object,
    },
    update: {
      primaryDelegateId: data.primaryDelegateId,
      scope: data.scope as object,
      escalationRules: data.escalationRules as object,
      updatedAt: new Date(),
    },
  });

  revalidatePath("/team/delegation");
  return { success: true };
}

/**
 * Find potential delegates for the current user
 */
export async function getPotentialDelegates(): Promise<
  Array<{
    id: string;
    name: string;
    role: string;
    department: string;
    matchScore: number;
    alreadyDelegatingTo: boolean;
  }>
> {
  const sessionUser = await getStudioUser();

  // Fetch full user data including department and role
  const currentUser = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      department: true,
      role: true,
      permissionLevel: true,
      delegationProfile: {
        select: { primaryDelegateId: true },
      },
    },
  });

  if (!currentUser) return [];

  const potentialDelegates = await prisma.user.findMany({
    where: {
      organizationId: sessionUser.organizationId,
      id: { not: sessionUser.id },
      isActive: true,
      isFreelancer: false,
    },
    select: {
      id: true,
      name: true,
      role: true,
      department: true,
      permissionLevel: true,
    },
  });

  const levelOrder = ["FREELANCER", "STAFF", "TEAM_LEAD", "LEADERSHIP", "ADMIN"];
  const userLevel = levelOrder.indexOf(currentUser.permissionLevel);

  return potentialDelegates
    .map((candidate: {
      id: string;
      name: string;
      role: string;
      department: string;
      permissionLevel: string;
    }) => {
      let score = 0;

      // Same department is preferred (+30)
      if (candidate.department === currentUser.department) {
        score += 30;
      }

      // Same permission level is ideal (+40)
      if (candidate.permissionLevel === currentUser.permissionLevel) {
        score += 40;
      }

      // Higher permission level can cover (+20)
      const candidateLevel = levelOrder.indexOf(candidate.permissionLevel);
      if (candidateLevel >= userLevel) {
        score += 20;
      }

      // Similar role name (+10)
      if (candidate.role.toLowerCase().includes(currentUser.role.toLowerCase().split(" ")[0])) {
        score += 10;
      }

      return {
        id: candidate.id,
        name: candidate.name,
        role: candidate.role,
        department: candidate.department,
        matchScore: score,
        alreadyDelegatingTo: currentUser.delegationProfile?.primaryDelegateId === candidate.id,
      };
    })
    .filter((c: { matchScore: number }) => c.matchScore >= 20)
    .sort((a: { matchScore: number }, b: { matchScore: number }) => b.matchScore - a.matchScore);
}

/**
 * Get default delegation scope for new profiles
 */
export async function getDefaultScope(): Promise<DelegationScope> {
  return {
    clients: "all",
    briefTypes: "all",
    clientFacing: true,
    authority: "execute_only",
  };
}

/**
 * Get default escalation rules
 */
export async function getDefaultEscalationRules(): Promise<EscalationRules> {
  const sessionUser = await getStudioUser();

  // Fetch team lead ID from database
  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { teamLeadId: true },
  });

  return {
    escalateIf: ["high_priority", "new_client"],
    escalateTo: user?.teamLeadId || "",
  };
}

// ============================================
// ACTIVE DELEGATION ACTIONS
// ============================================

interface DelegationListItem {
  id: string;
  delegateName?: string;
  delegatorName?: string;
  startDate: Date;
  endDate: Date;
  status: string;
}

/**
 * Get the current user's delegations (both as delegator and delegate)
 */
export async function getMyDelegations(): Promise<{
  asDelegator: Array<{
    id: string;
    delegateName: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
  asDelegate: Array<{
    id: string;
    delegatorName: string;
    startDate: Date;
    endDate: Date;
    status: string;
  }>;
}> {
  const user = await getStudioUser();

  const [asDelegator, asDelegate] = await Promise.all([
    prisma.activeDelegation.findMany({
      where: {
        delegatorId: user.id,
        status: { in: ["PENDING", "ACTIVE"] },
      },
      include: { delegate: { select: { name: true } } },
      orderBy: { startDate: "asc" },
    }),
    prisma.activeDelegation.findMany({
      where: {
        delegateId: user.id,
        status: { in: ["PENDING", "ACTIVE"] },
      },
      include: { delegator: { select: { name: true } } },
      orderBy: { startDate: "asc" },
    }),
  ]);

  return {
    asDelegator: asDelegator.map((d: typeof asDelegator[number]) => ({
      id: d.id,
      delegateName: d.delegate.name,
      startDate: d.startDate,
      endDate: d.endDate,
      status: d.status,
    })),
    asDelegate: asDelegate.map((d: typeof asDelegate[number]) => ({
      id: d.id,
      delegatorName: d.delegator.name,
      startDate: d.startDate,
      endDate: d.endDate,
      status: d.status,
    })),
  };
}

/**
 * Get active delegations where current user is the delegate
 */
export async function getActiveDelegationsForMe(): Promise<
  Array<{
    id: string;
    delegatorId: string;
    delegatorName: string;
    startDate: Date;
    endDate: Date;
    scope: DelegationScope;
  }>
> {
  const user = await getStudioUser();
  const now = new Date();

  const delegations = await prisma.activeDelegation.findMany({
    where: {
      delegateId: user.id,
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

  return delegations.map((d: typeof delegations[number]) => ({
    id: d.id,
    delegatorId: d.delegatorId,
    delegatorName: d.delegator.name,
    startDate: d.startDate,
    endDate: d.endDate,
    scope: d.scopeSnapshot as unknown as DelegationScope,
  }));
}

/**
 * Get delegation details by ID
 */
export async function getDelegationDetails(
  delegationId: string
): Promise<DelegationSummary | null> {
  const user = await getStudioUser();

  const delegation = await prisma.activeDelegation.findUnique({
    where: { id: delegationId },
    include: {
      delegator: { select: { id: true, name: true } },
      delegate: { select: { id: true, name: true } },
      activities: true,
    },
  });

  if (!delegation) return null;

  // Verify access
  if (delegation.delegatorId !== user.id && delegation.delegateId !== user.id) {
    return null;
  }

  // Count activities by type
  const counts = {
    tasksAssigned: 0,
    tasksCompleted: 0,
    tasksEscalated: 0,
    clientCommunications: 0,
    approvalsGiven: 0,
    decisionsMade: 0,
  };

  for (const activity of delegation.activities) {
    switch (activity.activityType) {
      case "TASK_ASSIGNED":
        counts.tasksAssigned++;
        break;
      case "TASK_COMPLETED":
        counts.tasksCompleted++;
        break;
      case "TASK_ESCALATED":
        counts.tasksEscalated++;
        break;
      case "CLIENT_COMMUNICATION":
        counts.clientCommunications++;
        break;
      case "APPROVAL_GIVEN":
        counts.approvalsGiven++;
        break;
      case "DECISION_MADE":
        counts.decisionsMade++;
        break;
    }
  }

  return {
    delegationId: delegation.id,
    delegatorName: delegation.delegator.name,
    delegateName: delegation.delegate.name,
    startDate: delegation.startDate,
    endDate: delegation.endDate,
    status: delegation.status,
    activities: counts,
  };
}

/**
 * Cancel an active delegation
 */
export async function cancelDelegation(
  delegationId: string,
  _reason?: string
): Promise<{ success: boolean }> {
  const user = await getStudioUser();

  const delegation = await prisma.activeDelegation.findUnique({
    where: { id: delegationId },
  });

  if (!delegation) {
    throw new Error("Delegation not found");
  }

  // Only delegator or admin can cancel
  if (delegation.delegatorId !== user.id && user.permissionLevel !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  if (delegation.status === "COMPLETED" || delegation.status === "CANCELLED") {
    throw new Error("Delegation is already ended");
  }

  await prisma.activeDelegation.update({
    where: { id: delegationId },
    data: {
      status: "CANCELLED",
      cancelledAt: new Date(),
    },
  });

  revalidatePath("/team/delegation");
  return { success: true };
}

// ============================================
// DELEGATION CHAIN RESOLUTION
// ============================================

/**
 * Check if a user is currently available
 */
export async function checkUserAvailability(
  userId: string,
  asOfDate: Date = new Date()
): Promise<UserAvailability> {
  // Check for active leave
  const activeLeave = await prisma.leaveRequest.findFirst({
    where: {
      userId,
      status: "APPROVED",
      startDate: { lte: asOfDate },
      endDate: { gte: asOfDate },
    },
  });

  if (activeLeave) {
    const activeDelegation = await prisma.activeDelegation.findFirst({
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
  const userRecord = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true },
  });

  if (!userRecord?.isActive) {
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
 * Resolve who should handle a task when intended assignee is unavailable
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

    if (availability.delegateId) {
      chain.push(availability.delegateId);
      currentUserId = availability.delegateId;
      depth++;
      continue;
    }

    // Check profile for delegate
    const profile = await prisma.delegationProfile.findUnique({
      where: { userId: currentUserId },
      select: { primaryDelegateId: true },
    });

    if (profile?.primaryDelegateId) {
      chain.push(profile.primaryDelegateId);
      currentUserId = profile.primaryDelegateId;
      depth++;
      continue;
    }

    break;
  }

  // Escalate to manager
  return escalateToManager(organizationId, intendedAssigneeId, chain, "No available delegate in chain");
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
  const user = await prisma.user.findUnique({
    where: { id: originalAssigneeId },
    select: {
      department: true,
      teamLeadId: true,
      delegationProfile: {
        select: { escalationRules: true },
      },
    },
  });

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

  // Find any available leader in same department
  const departmentLeader = await prisma.user.findFirst({
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

  // Last resort: find any admin
  const admin = await prisma.user.findFirst({
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

  return {
    assigneeId: originalAssigneeId,
    originalAssigneeId,
    wasDelegated: false,
    delegationChain: chain,
    wasEscalated: true,
    escalationReason: `${reason}. CRITICAL: No available assignee found.`,
  };
}

// ============================================
// ADMIN ACTIONS
// ============================================

/**
 * Get organization-wide delegation overview (admin only)
 */
export async function getOrganizationDelegationOverview(): Promise<{
  totalProfiles: number;
  activeDelegations: number;
  pendingDelegations: number;
  usersOnLeave: number;
} | null> {
  const user = await getStudioUser();

  if (!["ADMIN", "LEADERSHIP"].includes(user.permissionLevel)) {
    return null;
  }

  const [totalProfiles, activeDelegations, pendingDelegations, usersOnLeave] =
    await Promise.all([
      prisma.delegationProfile.count({
        where: { organizationId: user.organizationId },
      }),
      prisma.activeDelegation.count({
        where: {
          organizationId: user.organizationId,
          status: "ACTIVE",
        },
      }),
      prisma.activeDelegation.count({
        where: {
          organizationId: user.organizationId,
          status: "PENDING",
        },
      }),
      prisma.leaveRequest.count({
        where: {
          user: { organizationId: user.organizationId },
          status: "APPROVED",
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
    ]);

  return {
    totalProfiles,
    activeDelegations,
    pendingDelegations,
    usersOnLeave,
  };
}

/**
 * Get all active delegations in the organization (admin only)
 */
export async function getAllActiveDelegations(): Promise<
  Array<{
    id: string;
    delegator: { id: string; name: string; department: string };
    delegate: { id: string; name: string; department: string };
    startDate: Date;
    endDate: Date;
    status: string;
    handoffScheduled: boolean;
  }>
> {
  const user = await getStudioUser();

  if (!["ADMIN", "LEADERSHIP"].includes(user.permissionLevel)) {
    return [];
  }

  const delegations = await prisma.activeDelegation.findMany({
    where: {
      organizationId: user.organizationId,
      status: { in: ["ACTIVE", "PENDING"] },
    },
    include: {
      delegator: { select: { id: true, name: true, department: true } },
      delegate: { select: { id: true, name: true, department: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return delegations.map((d: typeof delegations[number]) => ({
    id: d.id,
    delegator: d.delegator,
    delegate: d.delegate,
    startDate: d.startDate,
    endDate: d.endDate,
    status: d.status,
    handoffScheduled: d.handoffScheduled,
  }));
}

/**
 * Log a delegation activity
 */
export async function logDelegationActivity(options: {
  activeDelegationId: string;
  activityType:
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
  entityType: string;
  entityId: string;
  description: string;
  performedById: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.delegationActivity.create({
    data: {
      activeDelegationId: options.activeDelegationId,
      activityType: options.activityType,
      entityType: options.entityType,
      entityId: options.entityId,
      description: options.description,
      performedById: options.performedById,
      metadata: options.metadata as object | undefined,
    },
  });
}
