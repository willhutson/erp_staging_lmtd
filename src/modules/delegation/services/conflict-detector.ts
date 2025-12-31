/**
 * Leave Conflict Detector
 *
 * Detects delegation conflicts when leave requests are submitted.
 * Implements the "air traffic control" logic from the spec.
 */

import { db } from "@/lib/db";
import type { DelegationConflict, ConflictCheckResult } from "../types";

/**
 * Check for delegation conflicts when a leave request is submitted
 */
export async function checkLeaveConflicts(
  organizationId: string,
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<ConflictCheckResult> {
  const conflicts: DelegationConflict[] = [];

  // Get user's delegation profile
  const profile = await db.delegationProfile.findUnique({
    where: { userId },
    select: {
      primaryDelegateId: true,
      user: { select: { name: true } },
      primaryDelegate: { select: { id: true, name: true } },
    },
  });

  if (!profile?.primaryDelegateId) {
    // No delegate configured - that's a conflict
    conflicts.push({
      type: "coverage_gap",
      description: "No primary delegate configured for this user",
      affectedUsers: [
        {
          userId,
          userName: profile?.user.name || "Unknown",
          leaveStart: startDate,
          leaveEnd: endDate,
        },
      ],
      suggestedResolutions: [
        {
          action: "assign_alternative",
          description: "Configure a primary delegate before requesting leave",
        },
      ],
    });

    return {
      hasConflicts: true,
      conflicts,
      canProceedWithChaining: false,
    };
  }

  // Check if delegate is also on leave during this period
  const delegateLeave = await db.leaveRequest.findFirst({
    where: {
      userId: profile.primaryDelegateId,
      status: { in: ["PENDING", "APPROVED"] },
      OR: [
        // Delegate's leave overlaps with requested leave
        {
          AND: [
            { startDate: { lte: endDate } },
            { endDate: { gte: startDate } },
          ],
        },
      ],
    },
    include: {
      user: { select: { name: true } },
    },
  });

  if (delegateLeave) {
    // Check if this is a mutual delegation conflict
    const delegateProfile = await db.delegationProfile.findUnique({
      where: { userId: profile.primaryDelegateId },
      select: { primaryDelegateId: true },
    });

    if (delegateProfile?.primaryDelegateId === userId) {
      // Mutual delegation conflict!
      conflicts.push({
        type: "mutual_delegation",
        description: `${profile.user.name} and ${profile.primaryDelegate?.name} are each other's delegates and both requesting overlapping leave`,
        affectedUsers: [
          {
            userId,
            userName: profile.user.name,
            leaveStart: startDate,
            leaveEnd: endDate,
            delegateId: profile.primaryDelegateId,
          },
          {
            userId: profile.primaryDelegateId,
            userName: delegateLeave.user.name,
            leaveStart: delegateLeave.startDate,
            leaveEnd: delegateLeave.endDate,
            delegateId: userId,
          },
        ],
        suggestedResolutions: await getSuggestedResolutions(
          organizationId,
          userId,
          startDate,
          endDate,
          [userId, profile.primaryDelegateId]
        ),
      });
    } else {
      // Delegate unavailable - need to chain
      conflicts.push({
        type: "chain_unavailable",
        description: `Primary delegate ${profile.primaryDelegate?.name} is on leave during this period`,
        affectedUsers: [
          {
            userId,
            userName: profile.user.name,
            leaveStart: startDate,
            leaveEnd: endDate,
            delegateId: profile.primaryDelegateId,
          },
          {
            userId: profile.primaryDelegateId,
            userName: delegateLeave.user.name,
            leaveStart: delegateLeave.startDate,
            leaveEnd: delegateLeave.endDate,
          },
        ],
        suggestedResolutions: await getSuggestedResolutions(
          organizationId,
          userId,
          startDate,
          endDate,
          [userId, profile.primaryDelegateId]
        ),
      });
    }
  }

  // Check for chain availability if there's a conflict
  let chainDelegateId: string | undefined;
  let canProceedWithChaining = false;

  if (conflicts.length > 0) {
    // Try to find an available chain delegate
    chainDelegateId = await findAvailableChainDelegate(
      organizationId,
      userId,
      startDate,
      endDate,
      [userId, profile.primaryDelegateId]
    );

    canProceedWithChaining = !!chainDelegateId;
  }

  return {
    hasConflicts: conflicts.length > 0,
    conflicts,
    canProceedWithChaining,
    chainDelegateId,
  };
}

/**
 * Find an available delegate for chain delegation
 */
async function findAvailableChainDelegate(
  organizationId: string,
  originalUserId: string,
  startDate: Date,
  endDate: Date,
  excludeUserIds: string[]
): Promise<string | undefined> {
  // Get original user's details for matching
  const user = await db.user.findUnique({
    where: { id: originalUserId },
    select: {
      department: true,
      permissionLevel: true,
      role: true,
    },
  });

  if (!user) return undefined;

  // Find users with same department and similar permission level
  const candidates = await db.user.findMany({
    where: {
      organizationId,
      id: { notIn: excludeUserIds },
      isActive: true,
      isFreelancer: false,
      department: user.department,
    },
    select: {
      id: true,
      name: true,
      permissionLevel: true,
    },
  });

  // Check each candidate for availability
  for (const candidate of candidates) {
    const hasOverlappingLeave = await db.leaveRequest.findFirst({
      where: {
        userId: candidate.id,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (!hasOverlappingLeave) {
      return candidate.id;
    }
  }

  // No one in same department available, try organization-wide
  const orgWideCandidates = await db.user.findMany({
    where: {
      organizationId,
      id: { notIn: [...excludeUserIds, ...candidates.map((c) => c.id)] },
      isActive: true,
      isFreelancer: false,
      permissionLevel: { in: ["TEAM_LEAD", "LEADERSHIP", "ADMIN"] },
    },
    select: { id: true },
  });

  for (const candidate of orgWideCandidates) {
    const hasOverlappingLeave = await db.leaveRequest.findFirst({
      where: {
        userId: candidate.id,
        status: { in: ["PENDING", "APPROVED"] },
        startDate: { lte: endDate },
        endDate: { gte: startDate },
      },
    });

    if (!hasOverlappingLeave) {
      return candidate.id;
    }
  }

  return undefined;
}

/**
 * Generate suggested resolutions for conflicts
 */
async function getSuggestedResolutions(
  organizationId: string,
  userId: string,
  startDate: Date,
  endDate: Date,
  excludeUserIds: string[]
): Promise<DelegationConflict["suggestedResolutions"]> {
  const resolutions: DelegationConflict["suggestedResolutions"] = [];

  // Try to find a chain delegate
  const chainDelegate = await findAvailableChainDelegate(
    organizationId,
    userId,
    startDate,
    endDate,
    excludeUserIds
  );

  if (chainDelegate) {
    const delegateUser = await db.user.findUnique({
      where: { id: chainDelegate },
      select: { name: true },
    });

    resolutions.push({
      action: "chain_to_next",
      description: `Approve leave with chain delegation to ${delegateUser?.name}`,
      suggestedDelegateId: chainDelegate,
      suggestedDelegateName: delegateUser?.name,
    });
  }

  // Always offer date adjustment
  resolutions.push({
    action: "adjust_dates",
    description: "Request the employee to adjust their leave dates to avoid conflict",
  });

  // Always offer alternative assignment
  resolutions.push({
    action: "assign_alternative",
    description: "Manually assign an alternative delegate for this period",
  });

  return resolutions;
}

/**
 * Check multiple leave requests for conflicts (batch check)
 */
export async function checkBatchLeaveConflicts(
  leaveRequests: Array<{
    userId: string;
    startDate: Date;
    endDate: Date;
  }>
): Promise<
  Array<{
    userId: string;
    conflicts: DelegationConflict[];
  }>
> {
  const results: Array<{
    userId: string;
    conflicts: DelegationConflict[];
  }> = [];

  // Build a map of all leave periods
  const leavePeriods = new Map<
    string,
    { startDate: Date; endDate: Date }
  >();

  for (const req of leaveRequests) {
    leavePeriods.set(req.userId, {
      startDate: req.startDate,
      endDate: req.endDate,
    });
  }

  // Check each request against all others
  for (const req of leaveRequests) {
    const conflicts: DelegationConflict[] = [];

    // Get user's delegate
    const profile = await db.delegationProfile.findUnique({
      where: { userId: req.userId },
      include: {
        user: { select: { name: true } },
        primaryDelegate: { select: { id: true, name: true } },
      },
    });

    if (profile?.primaryDelegateId) {
      // Check if delegate is in the batch with overlapping dates
      const delegateLeave = leavePeriods.get(profile.primaryDelegateId);

      if (delegateLeave) {
        const overlaps =
          delegateLeave.startDate <= req.endDate &&
          delegateLeave.endDate >= req.startDate;

        if (overlaps) {
          conflicts.push({
            type: "chain_unavailable",
            description: `Delegate ${profile.primaryDelegate?.name} also requesting leave in this batch`,
            affectedUsers: [
              {
                userId: req.userId,
                userName: profile.user.name,
                leaveStart: req.startDate,
                leaveEnd: req.endDate,
              },
              {
                userId: profile.primaryDelegateId,
                userName: profile.primaryDelegate?.name || "",
                leaveStart: delegateLeave.startDate,
                leaveEnd: delegateLeave.endDate,
              },
            ],
            suggestedResolutions: [
              {
                action: "adjust_dates",
                description: "Stagger leave dates to ensure coverage",
              },
            ],
          });
        }
      }
    }

    results.push({ userId: req.userId, conflicts });
  }

  return results;
}

/**
 * Get upcoming potential conflicts (proactive alert)
 */
export async function getUpcomingConflicts(
  organizationId: string,
  daysAhead: number = 30
): Promise<
  Array<{
    type: "potential_coverage_gap" | "multiple_leaves";
    period: { start: Date; end: Date };
    affectedDepartments: string[];
    users: Array<{ id: string; name: string; leaveStart: Date; leaveEnd: Date }>;
  }>
> {
  const now = new Date();
  const futureDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

  // Get all approved future leaves
  const upcomingLeaves = await db.leaveRequest.findMany({
    where: {
      user: { organizationId },
      status: "APPROVED",
      startDate: { gte: now, lte: futureDate },
    },
    include: {
      user: {
        select: { id: true, name: true, department: true },
      },
    },
    orderBy: { startDate: "asc" },
  });

  // Group by department and check for overlaps
  const departmentLeaves = new Map<
    string,
    Array<{
      userId: string;
      userName: string;
      startDate: Date;
      endDate: Date;
    }>
  >();

  for (const leave of upcomingLeaves) {
    const dept = leave.user.department;
    if (!departmentLeaves.has(dept)) {
      departmentLeaves.set(dept, []);
    }
    departmentLeaves.get(dept)!.push({
      userId: leave.userId,
      userName: leave.user.name,
      startDate: leave.startDate,
      endDate: leave.endDate,
    });
  }

  const alerts: Array<{
    type: "potential_coverage_gap" | "multiple_leaves";
    period: { start: Date; end: Date };
    affectedDepartments: string[];
    users: Array<{ id: string; name: string; leaveStart: Date; leaveEnd: Date }>;
  }> = [];

  // Check each department for multiple overlapping leaves
  for (const [department, leaves] of departmentLeaves.entries()) {
    if (leaves.length < 2) continue;

    // Find overlapping periods
    for (let i = 0; i < leaves.length; i++) {
      for (let j = i + 1; j < leaves.length; j++) {
        const a = leaves[i];
        const b = leaves[j];

        if (a.startDate <= b.endDate && a.endDate >= b.startDate) {
          alerts.push({
            type: "multiple_leaves",
            period: {
              start: new Date(Math.max(a.startDate.getTime(), b.startDate.getTime())),
              end: new Date(Math.min(a.endDate.getTime(), b.endDate.getTime())),
            },
            affectedDepartments: [department],
            users: [
              {
                id: a.userId,
                name: a.userName,
                leaveStart: a.startDate,
                leaveEnd: a.endDate,
              },
              {
                id: b.userId,
                name: b.userName,
                leaveStart: b.startDate,
                leaveEnd: b.endDate,
              },
            ],
          });
        }
      }
    }
  }

  return alerts;
}
