import { db } from "@/lib/db";
import type { TaskAssignment, AssigneeRole } from "../types";
import { ASSIGNEE_ROLES } from "../types";

interface UserWithCapacity {
  id: string;
  name: string;
  role: string;
  department: string;
  weeklyCapacity: number;
  currentLoad: number;
  isOnLeave: boolean;
  skillMatch: number;
}

/**
 * Find the best assignee for a task based on role and availability
 */
export async function findBestAssignee(
  organizationId: string,
  assigneeRole: string,
  specificUserId?: string,
  dueDate?: Date
): Promise<TaskAssignment> {
  // If a specific user is requested, verify and return
  if (specificUserId) {
    const user = await db.user.findFirst({
      where: {
        id: specificUserId,
        organizationId,
        isActive: true,
      },
    });

    if (user) {
      return {
        taskId: "",
        assigneeId: user.id,
        assigneeRole,
        reason: "Specific user assigned",
      };
    }
  }

  // Get role configuration
  const roleConfig = ASSIGNEE_ROLES[assigneeRole as AssigneeRole];
  if (!roleConfig) {
    return {
      taskId: "",
      assigneeId: null,
      assigneeRole,
      reason: `Unknown role: ${assigneeRole}`,
    };
  }

  // Get date range for capacity check
  const startOfWeek = getStartOfWeek(dueDate || new Date());
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  // Find users matching the role/department
  const candidates = await db.user.findMany({
    where: {
      organizationId,
      isActive: true,
      OR: [
        { role: { contains: roleConfig.label, mode: "insensitive" } },
        { department: roleConfig.department },
      ],
    },
    include: {
      timeEntries: {
        where: {
          date: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
        },
        select: { hours: true },
      },
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { lte: dueDate || new Date() },
          endDate: { gte: dueDate || new Date() },
        },
        select: { id: true },
      },
    },
  });

  if (candidates.length === 0) {
    return {
      taskId: "",
      assigneeId: null,
      assigneeRole,
      reason: `No users found matching role: ${roleConfig.label}`,
    };
  }

  // Calculate capacity and score each candidate
  const scoredCandidates: UserWithCapacity[] = candidates.map((user) => {
    const currentLoad = user.timeEntries.reduce(
      (sum, entry) => sum + Number(entry.hours),
      0
    );
    const isOnLeave = user.leaveRequests.length > 0;

    // Score based on:
    // 1. Available capacity (higher is better)
    // 2. Role match (exact match preferred)
    // 3. Not on leave
    let skillMatch = 0;
    if (user.role.toLowerCase().includes(roleConfig.label.toLowerCase())) {
      skillMatch = 100;
    } else if (user.department === roleConfig.department) {
      skillMatch = 50;
    }

    return {
      id: user.id,
      name: user.name,
      role: user.role,
      department: user.department,
      weeklyCapacity: user.weeklyCapacity,
      currentLoad,
      isOnLeave,
      skillMatch,
    };
  });

  // Filter out users on leave
  const availableCandidates = scoredCandidates.filter((c) => !c.isOnLeave);

  if (availableCandidates.length === 0) {
    // All candidates on leave, return best match anyway with warning
    const bestUnavailable = scoredCandidates.sort(
      (a, b) => b.skillMatch - a.skillMatch
    )[0];

    return {
      taskId: "",
      assigneeId: bestUnavailable.id,
      assigneeRole,
      reason: `Assigned ${bestUnavailable.name} (currently on leave - may need reassignment)`,
    };
  }

  // Sort by: skill match (desc), available capacity (desc)
  availableCandidates.sort((a, b) => {
    // Primary: skill match
    if (a.skillMatch !== b.skillMatch) {
      return b.skillMatch - a.skillMatch;
    }

    // Secondary: available capacity
    const aCapacity = a.weeklyCapacity - a.currentLoad;
    const bCapacity = b.weeklyCapacity - b.currentLoad;
    return bCapacity - aCapacity;
  });

  const best = availableCandidates[0];
  const availableHours = best.weeklyCapacity - best.currentLoad;

  return {
    taskId: "",
    assigneeId: best.id,
    assigneeRole,
    reason: `Assigned ${best.name} (${Math.round(availableHours)}h available, ${best.skillMatch}% skill match)`,
  };
}

/**
 * Find backup assignee for delegation
 */
export async function findBackupAssignee(
  organizationId: string,
  primaryUserId: string,
  assigneeRole: string,
  dueDate?: Date
): Promise<TaskAssignment | null> {
  const primaryUser = await db.user.findUnique({
    where: { id: primaryUserId },
    select: { department: true, role: true },
  });

  if (!primaryUser) return null;

  // Find users in same department, excluding primary
  const candidates = await db.user.findMany({
    where: {
      organizationId,
      isActive: true,
      id: { not: primaryUserId },
      department: primaryUser.department,
    },
    include: {
      leaveRequests: {
        where: {
          status: "APPROVED",
          startDate: { lte: dueDate || new Date() },
          endDate: { gte: dueDate || new Date() },
        },
        select: { id: true },
      },
    },
    take: 5,
  });

  // Filter out users on leave
  const available = candidates.filter((c) => c.leaveRequests.length === 0);

  if (available.length === 0) {
    return null;
  }

  // Prefer users with similar roles
  available.sort((a, b) => {
    const aMatch = a.role.toLowerCase().includes(primaryUser.role.toLowerCase().split(" ")[0]);
    const bMatch = b.role.toLowerCase().includes(primaryUser.role.toLowerCase().split(" ")[0]);
    return Number(bMatch) - Number(aMatch);
  });

  return {
    taskId: "",
    assigneeId: available[0].id,
    assigneeRole,
    reason: `Backup: ${available[0].name}`,
  };
}

/**
 * Get start of week for a date
 */
function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const day = result.getDay();
  result.setDate(result.getDate() - day);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Check if a user has capacity for a task
 */
export async function checkUserCapacity(
  userId: string,
  estimatedHours: number,
  dueDate: Date
): Promise<{ hasCapacity: boolean; availableHours: number; utilizationPercent: number }> {
  const startOfWeek = getStartOfWeek(dueDate);
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(endOfWeek.getDate() + 7);

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      timeEntries: {
        where: {
          date: {
            gte: startOfWeek,
            lt: endOfWeek,
          },
        },
        select: { hours: true },
      },
    },
  });

  if (!user) {
    return { hasCapacity: false, availableHours: 0, utilizationPercent: 100 };
  }

  const currentLoad = user.timeEntries.reduce(
    (sum, entry) => sum + Number(entry.hours),
    0
  );

  const availableHours = user.weeklyCapacity - currentLoad;
  const utilizationPercent = Math.round((currentLoad / user.weeklyCapacity) * 100);

  return {
    hasCapacity: availableHours >= estimatedHours,
    availableHours,
    utilizationPercent,
  };
}

/**
 * Get team capacity overview for workflow planning
 */
export async function getTeamCapacityForWorkflow(
  organizationId: string,
  roles: string[],
  startDate: Date,
  endDate: Date
): Promise<Map<string, { role: string; totalCapacity: number; allocated: number; available: number }>> {
  const roleCapacity = new Map();

  for (const role of roles) {
    const roleConfig = ASSIGNEE_ROLES[role as AssigneeRole];
    if (!roleConfig) continue;

    const users = await db.user.findMany({
      where: {
        organizationId,
        isActive: true,
        OR: [
          { role: { contains: roleConfig.label, mode: "insensitive" } },
          { department: roleConfig.department },
        ],
      },
      select: { weeklyCapacity: true },
    });

    const totalCapacity = users.reduce((sum, u) => sum + u.weeklyCapacity, 0);

    // Calculate weeks between dates
    const weeks = Math.ceil(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );

    roleCapacity.set(role, {
      role: roleConfig.label,
      totalCapacity: totalCapacity * weeks,
      allocated: 0, // Would need to calculate from existing assignments
      available: totalCapacity * weeks,
    });
  }

  return roleCapacity;
}
