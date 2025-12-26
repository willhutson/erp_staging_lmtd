import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

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
      orderBy: { createdAt: "desc" },
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
            rules: defaultPolicy.rules.map((rule) => ({
              id: rule.id,
              resource: rule.resource,
              action: rule.action,
              effect: rule.effect,
              conditionType: rule.conditionType,
            })),
          }
        : null,
      assignments: assignments.map((a) => ({
        id: a.id,
        reason: a.reason,
        assignedAt: a.createdAt,
        expiresAt: a.expiresAt,
        assignedBy: a.assignedBy,
        policy: {
          id: a.policy.id,
          name: a.policy.name,
          description: a.policy.description,
          priority: a.policy.priority,
          rules: a.policy.rules.map((rule) => ({
            id: rule.id,
            resource: rule.resource,
            action: rule.action,
            effect: rule.effect,
            conditionType: rule.conditionType,
          })),
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
