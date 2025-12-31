"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import {
  checkLeaveConflicts,
  startDelegation,
  getDelegationProfile,
} from "@/modules/delegation";

// UAE Labor Law default leave types
const DEFAULT_LEAVE_TYPES = [
  { name: "Annual Leave", code: "ANNUAL", defaultDays: 30, carryOverLimit: 5, color: "#3B82F6" },
  { name: "Sick Leave", code: "SICK", defaultDays: 90, carryOverLimit: 0, color: "#EF4444" },
  { name: "Maternity Leave", code: "MATERNITY", defaultDays: 60, carryOverLimit: 0, color: "#EC4899" },
  { name: "Paternity Leave", code: "PATERNITY", defaultDays: 5, carryOverLimit: 0, color: "#8B5CF6" },
  { name: "Hajj Leave", code: "HAJJ", defaultDays: 30, carryOverLimit: 0, color: "#10B981" },
  { name: "Bereavement Leave", code: "BEREAVEMENT", defaultDays: 5, carryOverLimit: 0, color: "#6B7280" },
  { name: "Unpaid Leave", code: "UNPAID", defaultDays: 0, carryOverLimit: 0, isPaid: false, color: "#9CA3AF" },
];

export async function initializeLeaveTypes(organizationId: string) {
  const existing = await db.leaveType.findMany({
    where: { organizationId },
  });

  if (existing.length > 0) {
    return existing;
  }

  await db.leaveType.createMany({
    data: DEFAULT_LEAVE_TYPES.map((type) => ({
      organizationId,
      ...type,
      isPaid: type.isPaid ?? true,
    })),
  });

  return db.leaveType.findMany({ where: { organizationId } });
}

export async function createLeaveRequest(data: {
  leaveTypeId: string;
  startDate: Date;
  endDate: Date;
  reason?: string;
  isHalfDay?: boolean;
  halfDayPeriod?: "MORNING" | "AFTERNOON";
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Calculate total days (excluding weekends)
  const totalDays = calculateWorkingDays(data.startDate, data.endDate, data.isHalfDay);

  // Check for blackout periods
  const blackouts = await db.blackoutPeriod.findMany({
    where: {
      organizationId: session.user.organizationId,
      OR: [
        {
          startDate: { lte: data.endDate },
          endDate: { gte: data.startDate },
        },
      ],
    },
  });

  if (blackouts.length > 0) {
    throw new Error(`Leave request overlaps with blackout period: ${blackouts[0].name}`);
  }

  // Check leave balance
  const year = new Date(data.startDate).getFullYear();
  const balance = await db.leaveBalance.findUnique({
    where: {
      userId_leaveTypeId_year: {
        userId: session.user.id,
        leaveTypeId: data.leaveTypeId,
        year,
      },
    },
  });

  if (balance) {
    const available = Number(balance.entitlement) + Number(balance.carriedOver) + Number(balance.adjustment) - Number(balance.used);
    if (totalDays > available) {
      throw new Error(`Insufficient leave balance. Available: ${available} days`);
    }
  }

  const request = await db.leaveRequest.create({
    data: {
      organizationId: session.user.organizationId,
      userId: session.user.id,
      leaveTypeId: data.leaveTypeId,
      startDate: data.startDate,
      endDate: data.endDate,
      totalDays,
      reason: data.reason,
      isHalfDay: data.isHalfDay ?? false,
      halfDayPeriod: data.halfDayPeriod,
    },
    include: {
      leaveType: true,
      user: { select: { id: true, name: true } },
    },
  });

  revalidatePath("/leave");
  return request;
}

export async function reviewLeaveRequest(
  requestId: string,
  status: "APPROVED" | "REJECTED",
  notes?: string
) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Check permission
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    throw new Error("You don't have permission to review leave requests");
  }

  const request = await db.leaveRequest.findUnique({
    where: { id: requestId },
    include: { user: true },
  });

  if (!request) throw new Error("Leave request not found");

  // Team leads can only approve their team members
  if (session.user.permissionLevel === "TEAM_LEAD") {
    const isTeamMember = request.user.teamLeadId === session.user.id;
    if (!isTeamMember) {
      throw new Error("You can only review requests from your team members");
    }
  }

  const updated = await db.leaveRequest.update({
    where: { id: requestId },
    data: {
      status,
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      reviewNotes: notes,
    },
  });

  // If approved, update leave balance and create delegation
  if (status === "APPROVED") {
    const year = new Date(request.startDate).getFullYear();
    await db.leaveBalance.upsert({
      where: {
        userId_leaveTypeId_year: {
          userId: request.userId,
          leaveTypeId: request.leaveTypeId,
          year,
        },
      },
      create: {
        userId: request.userId,
        leaveTypeId: request.leaveTypeId,
        year,
        entitlement: 30, // Default, should be set properly
        used: request.totalDays,
      },
      update: {
        used: { increment: Number(request.totalDays) },
      },
    });

    // Create active delegation if user has a delegate configured
    const delegationProfile = await getDelegationProfile(request.userId);
    if (delegationProfile?.primaryDelegateId) {
      await startDelegation({
        organizationId: request.organizationId,
        delegatorId: request.userId,
        delegateId: delegationProfile.primaryDelegateId,
        leaveRequestId: request.id,
        startDate: request.startDate,
        endDate: request.endDate,
      });
    }
  }

  revalidatePath("/leave");
  return updated;
}

export async function cancelLeaveRequest(requestId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const request = await db.leaveRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) throw new Error("Leave request not found");
  if (request.userId !== session.user.id) throw new Error("Unauthorized");
  if (request.status !== "PENDING") throw new Error("Can only cancel pending requests");

  const updated = await db.leaveRequest.update({
    where: { id: requestId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/leave");
  return updated;
}

export async function getLeaveBalance(userId: string, year: number) {
  const balances = await db.leaveBalance.findMany({
    where: { userId, year },
    include: { leaveType: true },
  });

  return balances.map((b) => ({
    ...b,
    available: Number(b.entitlement) + Number(b.carriedOver) + Number(b.adjustment) - Number(b.used),
  }));
}

export async function initializeUserLeaveBalance(userId: string, year: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { organizationId: true },
  });

  if (!user) throw new Error("User not found");

  const leaveTypes = await db.leaveType.findMany({
    where: { organizationId: user.organizationId, isActive: true },
  });

  for (const type of leaveTypes) {
    await db.leaveBalance.upsert({
      where: {
        userId_leaveTypeId_year: {
          userId,
          leaveTypeId: type.id,
          year,
        },
      },
      create: {
        userId,
        leaveTypeId: type.id,
        year,
        entitlement: type.defaultDays,
      },
      update: {},
    });
  }

  revalidatePath("/leave");
}

function calculateWorkingDays(startDate: Date, endDate: Date, isHalfDay?: boolean): number {
  if (isHalfDay) return 0.5;

  let count = 0;
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    const dayOfWeek = current.getDay();
    // Skip Friday (5) and Saturday (6) - UAE weekend
    if (dayOfWeek !== 5 && dayOfWeek !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

/**
 * Check for delegation conflicts before submitting a leave request
 */
export async function checkLeaveConflictsAction(startDate: Date, endDate: Date) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return checkLeaveConflicts(
    session.user.organizationId,
    session.user.id,
    startDate,
    endDate
  );
}

/**
 * Get delegation profile for current user (for leave request form)
 */
export async function getMyDelegateInfo() {
  const session = await auth();
  if (!session?.user) return null;

  const profile = await getDelegationProfile(session.user.id);
  if (!profile?.primaryDelegateId) {
    return { hasDelegate: false, delegateName: null };
  }

  const delegate = await db.user.findUnique({
    where: { id: profile.primaryDelegateId },
    select: { name: true },
  });

  return {
    hasDelegate: true,
    delegateName: delegate?.name || null,
  };
}
