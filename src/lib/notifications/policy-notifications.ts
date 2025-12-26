/**
 * Policy Notification Service
 *
 * Sends notifications for access control policy events:
 * - Policy submitted for approval (notify admins)
 * - Policy approved/rejected (notify creator)
 * - Policy assigned to user (notify user + team lead)
 * - Policy assignment removed (notify user)
 */

import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

interface NotificationParams {
  organizationId: string;
  userId: string;
  type: string;
  title: string;
  body: string;
  actionUrl?: string;
  actionLabel?: string;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Create a notification for a user
 */
async function createNotification(params: NotificationParams): Promise<void> {
  await db.notification.create({
    data: {
      organizationId: params.organizationId,
      userId: params.userId,
      type: params.type,
      title: params.title,
      body: params.body,
      actionUrl: params.actionUrl,
      actionLabel: params.actionLabel,
      entityType: params.entityType,
      entityId: params.entityId,
      metadata: params.metadata as Prisma.InputJsonValue | undefined,
      channels: ["in_app"], // Can be extended to include email, slack
    },
  });
}

/**
 * Get all admin users in an organization
 */
async function getAdminUsers(organizationId: string): Promise<{ id: string; name: string; email: string }[]> {
  return db.user.findMany({
    where: {
      organizationId,
      permissionLevel: "ADMIN",
      isActive: true,
    },
    select: { id: true, name: true, email: true },
  });
}

/**
 * Notify admins when a policy is submitted for approval
 */
export async function notifyPolicySubmitted(
  organizationId: string,
  policyId: string,
  policyName: string,
  submittedBy: { id: string; name: string }
): Promise<void> {
  const admins = await getAdminUsers(organizationId);

  for (const admin of admins) {
    await createNotification({
      organizationId,
      userId: admin.id,
      type: "policy.submitted",
      title: "New Policy Awaiting Approval",
      body: `${submittedBy.name} has submitted "${policyName}" for your approval.`,
      actionUrl: `/admin/access-policies/${policyId}`,
      actionLabel: "Review Policy",
      entityType: "access_policy",
      entityId: policyId,
      metadata: { submittedById: submittedBy.id, submittedByName: submittedBy.name },
    });
  }
}

/**
 * Notify creator when a policy is approved
 */
export async function notifyPolicyApproved(
  organizationId: string,
  policyId: string,
  policyName: string,
  createdById: string,
  approvedBy: { id: string; name: string }
): Promise<void> {
  await createNotification({
    organizationId,
    userId: createdById,
    type: "policy.approved",
    title: "Your Policy Was Approved",
    body: `${approvedBy.name} has approved your policy "${policyName}". It is now active.`,
    actionUrl: `/admin/access-policies/${policyId}`,
    actionLabel: "View Policy",
    entityType: "access_policy",
    entityId: policyId,
    metadata: { approvedById: approvedBy.id, approvedByName: approvedBy.name },
  });
}

/**
 * Notify creator when a policy is rejected
 */
export async function notifyPolicyRejected(
  organizationId: string,
  policyId: string,
  policyName: string,
  createdById: string,
  rejectedBy: { id: string; name: string },
  reason: string
): Promise<void> {
  await createNotification({
    organizationId,
    userId: createdById,
    type: "policy.rejected",
    title: "Your Policy Was Rejected",
    body: `${rejectedBy.name} has rejected your policy "${policyName}". Reason: ${reason}`,
    actionUrl: `/admin/access-policies/${policyId}`,
    actionLabel: "View Policy",
    entityType: "access_policy",
    entityId: policyId,
    metadata: {
      rejectedById: rejectedBy.id,
      rejectedByName: rejectedBy.name,
      reason,
    },
  });
}

/**
 * Notify user when a policy is assigned to them
 */
export async function notifyPolicyAssigned(
  organizationId: string,
  policyId: string,
  policyName: string,
  assignedUserId: string,
  assignedBy: { id: string; name: string },
  reason: string,
  expiresAt?: Date
): Promise<void> {
  const expiryText = expiresAt
    ? ` This access will expire on ${expiresAt.toLocaleDateString()}.`
    : "";

  await createNotification({
    organizationId,
    userId: assignedUserId,
    type: "policy.assigned",
    title: "New Access Policy Assigned",
    body: `${assignedBy.name} has assigned the "${policyName}" policy to you. Reason: ${reason}${expiryText}`,
    actionUrl: "/settings/access",
    actionLabel: "View My Access",
    entityType: "access_policy",
    entityId: policyId,
    metadata: {
      assignedById: assignedBy.id,
      assignedByName: assignedBy.name,
      reason,
      expiresAt: expiresAt?.toISOString(),
    },
  });
}

/**
 * Notify team lead when a policy is assigned to their team member
 */
export async function notifyTeamLeadOfAssignment(
  organizationId: string,
  policyId: string,
  policyName: string,
  teamLeadId: string,
  assignedUser: { id: string; name: string },
  assignedBy: { id: string; name: string },
  reason: string
): Promise<void> {
  await createNotification({
    organizationId,
    userId: teamLeadId,
    type: "policy.team_member_assigned",
    title: "Team Member Policy Assignment",
    body: `${assignedBy.name} has assigned the "${policyName}" policy to ${assignedUser.name}. Reason: ${reason}`,
    actionUrl: `/admin/access-policies/${policyId}`,
    actionLabel: "View Policy",
    entityType: "access_policy",
    entityId: policyId,
    metadata: {
      assignedUserId: assignedUser.id,
      assignedUserName: assignedUser.name,
      assignedById: assignedBy.id,
      assignedByName: assignedBy.name,
      reason,
    },
  });
}

/**
 * Notify user when a policy assignment is removed
 */
export async function notifyPolicyRemoved(
  organizationId: string,
  policyId: string,
  policyName: string,
  userId: string,
  removedBy: { id: string; name: string }
): Promise<void> {
  await createNotification({
    organizationId,
    userId,
    type: "policy.removed",
    title: "Access Policy Removed",
    body: `${removedBy.name} has removed the "${policyName}" policy from your account. Your access permissions have been updated.`,
    actionUrl: "/settings/access",
    actionLabel: "View My Access",
    entityType: "access_policy",
    entityId: policyId,
    metadata: {
      removedById: removedBy.id,
      removedByName: removedBy.name,
    },
  });
}

/**
 * Notify user when their policy assignment is about to expire
 */
export async function notifyPolicyExpiringSoon(
  organizationId: string,
  policyId: string,
  policyName: string,
  userId: string,
  expiresAt: Date
): Promise<void> {
  const daysRemaining = Math.ceil(
    (expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  await createNotification({
    organizationId,
    userId,
    type: "policy.expiring",
    title: "Access Policy Expiring Soon",
    body: `Your "${policyName}" policy access will expire in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}. Contact your administrator to extend if needed.`,
    actionUrl: "/settings/access",
    actionLabel: "View My Access",
    entityType: "access_policy",
    entityId: policyId,
    metadata: {
      expiresAt: expiresAt.toISOString(),
      daysRemaining,
    },
  });
}
