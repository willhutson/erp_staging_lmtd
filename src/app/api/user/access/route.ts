import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

interface AccessRuleData {
  id: string;
  resource: string;
  action: string;
  effect: string;
  conditionType: string;
}

interface PolicyAssignmentData {
  id: string;
  reason: string | null;
  createdAt: Date;
  expiresAt: Date | null;
  assignedBy: { id: string; name: string } | null;
  policy: {
    id: string;
    name: string;
    description: string | null;
    priority: number;
    rules: AccessRuleData[];
  };
}

/**
 * GET /api/user/access
 * Get the current user's access policies and permissions
 */
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { organizationId, id: userId, permissionLevel } = session.user;

    // Get user's assigned policies
    const assignments = await db.policyAssignment.findMany({
      where: {
        userId,
        organizationId,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
      include: {
        policy: {
          include: {
            rules: true,
            createdBy: { select: { id: true, name: true } },
          },
        },
        assignedBy: { select: { id: true, name: true } },
      },
      orderBy: { assignedAt: "desc" },
    });

    // Get default policy for user's permission level
    const defaultPolicy = await db.accessPolicy.findFirst({
      where: {
        organizationId,
        defaultLevel: permissionLevel,
        status: "APPROVED",
        isActive: true,
      },
      include: {
        rules: true,
        createdBy: { select: { id: true, name: true } },
      },
    });

    // Format response
    const mapRule = (rule: { id: string; resource: string; action: string; effect: string; conditionType: string }): AccessRuleData => ({
      id: rule.id,
      resource: rule.resource,
      action: rule.action,
      effect: rule.effect,
      conditionType: rule.conditionType,
    });

    const response = {
      user: {
        id: userId,
        name: session.user.name,
        email: session.user.email,
        permissionLevel,
      },
      defaultPolicy: defaultPolicy
        ? {
            id: defaultPolicy.id,
            name: defaultPolicy.name,
            description: defaultPolicy.description,
            rules: defaultPolicy.rules.map(mapRule),
          }
        : null,
      assignments: assignments.map((assignment: typeof assignments[number]) => ({
        id: assignment.id,
        reason: assignment.reason,
        assignedAt: assignment.assignedAt,
        expiresAt: assignment.expiresAt,
        assignedBy: assignment.assignedBy,
        policy: {
          id: assignment.policy.id,
          name: assignment.policy.name,
          description: assignment.policy.description,
          priority: assignment.policy.priority,
          rules: assignment.policy.rules.map(mapRule),
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching user access:", error);
    return NextResponse.json(
      { error: "Failed to fetch access information" },
      { status: 500 }
    );
  }
}
