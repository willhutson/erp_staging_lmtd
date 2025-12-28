/**
 * GET /api/v1/leave/balances - Get leave balances for current user or specified user
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  parseFilters,
  ApiError,
} from "@/lib/api";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(searchParams, ["userId", "year"]);

    // Determine which user's balances to fetch
    let userId = context.user.id;

    if (filters.userId && filters.userId !== context.user.id) {
      // Only managers can view other users' balances
      if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(context.user.permissionLevel)) {
        throw ApiError.forbidden("Cannot view other users' leave balances");
      }

      // Verify user exists in org
      const targetUser = await prisma.user.findFirst({
        where: {
          id: filters.userId,
          organizationId: context.organizationId,
        },
      });

      if (!targetUser) {
        throw ApiError.notFound("User");
      }

      userId = filters.userId;
    }

    const year = filters.year ? parseInt(filters.year) : new Date().getFullYear();

    const balances = await prisma.leaveBalance.findMany({
      where: {
        userId,
        year,
      },
      select: {
        id: true,
        year: true,
        entitlement: true,
        used: true,
        pending: true,
        carriedOver: true,
        leaveType: {
          select: {
            id: true,
            name: true,
            code: true,
            isPaid: true,
          },
        },
      },
    });

    type Balance = typeof balances[number];

    // Calculate remaining for each type
    const balancesWithRemaining = balances.map((b: Balance) => ({
      ...b,
      remaining: b.entitlement + b.carriedOver - b.used - b.pending,
    }));

    return success({
      userId,
      year,
      balances: balancesWithRemaining,
    });
  });
}
