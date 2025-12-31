"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { DelegationScope, EscalationRules } from "../types";
import {
  getDelegationProfile,
  upsertDelegationProfile,
  findPotentialDelegates,
  getDefaultDelegationScope,
} from "../services/profile-service";
import {
  getUserDelegations,
  getDelegationSummary,
  cancelDelegation as cancelDelegationEngine,
} from "../services/delegation-engine";
import {
  checkLeaveConflicts,
  getUpcomingConflicts,
} from "../services/conflict-detector";
import {
  startHandoff,
  completeHandoff,
  generateHandoffBriefing,
  getUpcomingReturns,
} from "../services/handoff-service";
import { getActiveDelegationsForDelegate } from "../services/chain-resolver";

// ============================================
// PROFILE ACTIONS
// ============================================

export async function getMyDelegationProfile() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return getDelegationProfile(session.user.id);
}

export async function updateMyDelegationProfile(data: {
  primaryDelegateId: string | null;
  scope: DelegationScope;
  escalationRules: EscalationRules;
}) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  await upsertDelegationProfile(
    session.user.organizationId,
    session.user.id,
    data
  );

  revalidatePath("/settings/delegation");
  return { success: true };
}

export async function getPotentialDelegates() {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organizationId) {
    return [];
  }

  return findPotentialDelegates(
    session.user.organizationId,
    session.user.id
  );
}

export async function getDefaultScope() {
  return getDefaultDelegationScope();
}

// ============================================
// DELEGATION ACTIONS
// ============================================

export async function getMyDelegations() {
  const session = await auth();
  if (!session?.user?.id) {
    return { asDelegator: [], asDelegate: [] };
  }

  return getUserDelegations(session.user.id);
}

export async function getActiveDelegationsForMe() {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }

  return getActiveDelegationsForDelegate(session.user.id);
}

export async function getDelegationDetails(delegationId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const summary = await getDelegationSummary(delegationId);
  if (!summary) return null;

  // Verify user has access (is delegator or delegate)
  const delegation = await db.activeDelegation.findUnique({
    where: { id: delegationId },
    select: { delegatorId: true, delegateId: true },
  });

  if (
    delegation?.delegatorId !== session.user.id &&
    delegation?.delegateId !== session.user.id
  ) {
    return null;
  }

  return summary;
}

export async function cancelDelegation(delegationId: string, reason?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await cancelDelegationEngine(delegationId, session.user.id, reason);

  revalidatePath("/settings/delegation");
  return { success: true };
}

// ============================================
// CONFLICT DETECTION
// ============================================

export async function checkConflictsForLeave(startDate: Date, endDate: Date) {
  const session = await auth();
  if (!session?.user?.id || !session?.user?.organizationId) {
    throw new Error("Unauthorized");
  }

  return checkLeaveConflicts(
    session.user.organizationId,
    session.user.id,
    startDate,
    endDate
  );
}

export async function getUpcomingDelegationConflicts(daysAhead: number = 30) {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  return getUpcomingConflicts(session.user.organizationId, daysAhead);
}

// ============================================
// HANDOFF ACTIONS
// ============================================

export async function initiateHandoff(delegationId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await startHandoff(delegationId);

  revalidatePath("/settings/delegation");
  return { success: true };
}

export async function completeMyHandoff(delegationId: string, notes?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await completeHandoff(delegationId, notes);

  revalidatePath("/settings/delegation");
  return { success: true };
}

export async function getHandoffBriefing(delegationId: string) {
  const session = await auth();
  if (!session?.user?.id) return null;

  return generateHandoffBriefing(delegationId);
}

export async function getUpcomingTeamReturns() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  return getUpcomingReturns(session.user.organizationId, 7);
}

// ============================================
// ADMIN ACTIONS
// ============================================

export async function getOrganizationDelegationOverview() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return null;
  }

  // Get counts
  const [
    totalProfiles,
    activeDelegations,
    pendingDelegations,
    upcomingReturns,
  ] = await Promise.all([
    db.delegationProfile.count({
      where: { organizationId: session.user.organizationId },
    }),
    db.activeDelegation.count({
      where: {
        organizationId: session.user.organizationId,
        status: "ACTIVE",
      },
    }),
    db.activeDelegation.count({
      where: {
        organizationId: session.user.organizationId,
        status: "PENDING",
      },
    }),
    getUpcomingReturns(session.user.organizationId, 7),
  ]);

  return {
    totalProfiles,
    activeDelegations,
    pendingDelegations,
    upcomingReturns: upcomingReturns.length,
  };
}

export async function getAllActiveDelegations() {
  const session = await auth();
  if (!session?.user?.organizationId) {
    return [];
  }

  const delegations = await db.activeDelegation.findMany({
    where: {
      organizationId: session.user.organizationId,
      status: { in: ["ACTIVE", "PENDING"] },
    },
    include: {
      delegator: { select: { id: true, name: true, department: true } },
      delegate: { select: { id: true, name: true, department: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return delegations.map((d) => ({
    id: d.id,
    delegator: d.delegator,
    delegate: d.delegate,
    startDate: d.startDate,
    endDate: d.endDate,
    status: d.status,
    handoffScheduled: d.handoffScheduled,
  }));
}
