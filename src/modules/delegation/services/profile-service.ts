/**
 * Delegation Profile Service
 *
 * Manages user delegation profiles - who they delegate to,
 * what scope is delegated, and escalation rules.
 */

import { db } from "@/lib/db";
import type {
  DelegationScope,
  EscalationRules,
  DelegationProfileConfig,
} from "../types";

/**
 * Get a user's delegation profile
 */
export async function getDelegationProfile(
  userId: string
): Promise<DelegationProfileConfig | null> {
  const profile = await db.delegationProfile.findUnique({
    where: { userId },
    include: {
      primaryDelegate: {
        select: { id: true, name: true, role: true, department: true },
      },
    },
  });

  if (!profile) return null;

  return {
    userId: profile.userId,
    primaryDelegateId: profile.primaryDelegateId,
    scope: profile.scope as DelegationScope,
    escalationRules: profile.escalationRules as EscalationRules,
  };
}

/**
 * Create or update a user's delegation profile
 */
export async function upsertDelegationProfile(
  organizationId: string,
  userId: string,
  config: {
    primaryDelegateId?: string | null;
    scope: DelegationScope;
    escalationRules: EscalationRules;
  }
): Promise<void> {
  await db.delegationProfile.upsert({
    where: { userId },
    create: {
      organizationId,
      userId,
      primaryDelegateId: config.primaryDelegateId,
      scope: config.scope,
      escalationRules: config.escalationRules,
    },
    update: {
      primaryDelegateId: config.primaryDelegateId,
      scope: config.scope,
      escalationRules: config.escalationRules,
      updatedAt: new Date(),
    },
  });
}

/**
 * Update just the primary delegate
 */
export async function updatePrimaryDelegate(
  userId: string,
  primaryDelegateId: string | null
): Promise<void> {
  await db.delegationProfile.update({
    where: { userId },
    data: {
      primaryDelegateId,
      updatedAt: new Date(),
    },
  });
}

/**
 * Get all users who have this user as their primary delegate
 */
export async function getUsersDelegatingTo(delegateId: string): Promise<
  Array<{
    userId: string;
    userName: string;
    scope: DelegationScope;
  }>
> {
  const profiles = await db.delegationProfile.findMany({
    where: {
      primaryDelegateId: delegateId,
      isActive: true,
    },
    include: {
      user: {
        select: { id: true, name: true },
      },
    },
  });

  return profiles.map((p) => ({
    userId: p.userId,
    userName: p.user.name,
    scope: p.scope as DelegationScope,
  }));
}

/**
 * Find potential delegates for a user based on role and department
 */
export async function findPotentialDelegates(
  organizationId: string,
  userId: string
): Promise<
  Array<{
    id: string;
    name: string;
    role: string;
    department: string;
    matchScore: number;
    alreadyDelegatingTo: boolean;
  }>
> {
  // Get the user's details
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      role: true,
      department: true,
      permissionLevel: true,
      delegationProfile: {
        select: { primaryDelegateId: true },
      },
    },
  });

  if (!user) return [];

  // Find users in the same organization with compatible roles
  const potentialDelegates = await db.user.findMany({
    where: {
      organizationId,
      id: { not: userId },
      isActive: true,
      isFreelancer: false, // Freelancers typically can't be delegates
    },
    select: {
      id: true,
      name: true,
      role: true,
      department: true,
      permissionLevel: true,
    },
  });

  // Score and filter candidates
  return potentialDelegates
    .map((candidate) => {
      let score = 0;

      // Same department is preferred (+30)
      if (candidate.department === user.department) {
        score += 30;
      }

      // Same permission level is ideal (+40)
      if (candidate.permissionLevel === user.permissionLevel) {
        score += 40;
      }

      // Higher permission level can cover (+20)
      const levelOrder = ["FREELANCER", "STAFF", "TEAM_LEAD", "LEADERSHIP", "ADMIN"];
      const userLevel = levelOrder.indexOf(user.permissionLevel);
      const candidateLevel = levelOrder.indexOf(candidate.permissionLevel);
      if (candidateLevel >= userLevel) {
        score += 20;
      }

      // Similar role name (+10)
      if (candidate.role.toLowerCase().includes(user.role.toLowerCase().split(" ")[0])) {
        score += 10;
      }

      return {
        id: candidate.id,
        name: candidate.name,
        role: candidate.role,
        department: candidate.department,
        matchScore: score,
        alreadyDelegatingTo:
          user.delegationProfile?.primaryDelegateId === candidate.id,
      };
    })
    .filter((c) => c.matchScore >= 20) // Minimum compatibility threshold
    .sort((a, b) => b.matchScore - a.matchScore);
}

/**
 * Validate delegation configuration
 */
export function validateDelegationConfig(config: {
  scope: DelegationScope;
  escalationRules: EscalationRules;
}): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Validate scope
  if (!config.scope.authority) {
    errors.push("Delegation authority level is required");
  }

  if (
    config.scope.clients !== "all" &&
    (!Array.isArray(config.scope.clients) || config.scope.clients.length === 0)
  ) {
    errors.push("At least one client must be selected or choose 'all'");
  }

  if (
    config.scope.briefTypes !== "all" &&
    (!Array.isArray(config.scope.briefTypes) || config.scope.briefTypes.length === 0)
  ) {
    errors.push("At least one brief type must be selected or choose 'all'");
  }

  // Validate escalation rules
  if (!config.escalationRules.escalateTo) {
    errors.push("Escalation contact is required");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get default delegation scope for new profiles
 */
export function getDefaultDelegationScope(): DelegationScope {
  return {
    clients: "all",
    briefTypes: "all",
    authority: "execute_only",
  };
}

/**
 * Get default escalation rules (escalate to team lead)
 */
export async function getDefaultEscalationRules(
  userId: string
): Promise<EscalationRules> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { teamLeadId: true },
  });

  return {
    escalateIf: ["high_priority", "new_client"],
    escalateTo: user?.teamLeadId || "",
  };
}
