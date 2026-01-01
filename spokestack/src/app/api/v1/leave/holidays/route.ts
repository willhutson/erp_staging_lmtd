/**
 * GET /api/v1/leave/holidays - List public holidays
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  parseFilters,
} from "@/lib/api";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(searchParams, ["year"]);

    const year = filters.year ? parseInt(filters.year) : new Date().getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31);

    const holidays = await prisma.publicHoliday.findMany({
      where: {
        date: {
          gte: startOfYear,
          lte: endOfYear,
        },
      },
      orderBy: { date: "asc" },
      select: {
        id: true,
        name: true,
        date: true,
        year: true,
        isOptional: true,
      },
    });

    return success({
      year,
      holidays,
      count: holidays.length,
    });
  });
}
