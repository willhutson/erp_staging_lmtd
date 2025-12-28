/**
 * GET /api/v1/leave/types - List leave types
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
} from "@/lib/api";

export async function GET() {
  return handleRoute(async () => {
    const context = await getAuthContext();

    const leaveTypes = await prisma.leaveType.findMany({
      where: { organizationId: context.organizationId },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        code: true,
        defaultDays: true,
        carryOverLimit: true,
        requiresApproval: true,
        isPaid: true,
      },
    });

    return success(leaveTypes);
  });
}
