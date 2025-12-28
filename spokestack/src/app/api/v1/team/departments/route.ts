/**
 * GET /api/v1/team/departments - List departments with member counts
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

    const users = await prisma.user.findMany({
      where: {
        organizationId: context.organizationId,
        isActive: true,
      },
      select: {
        department: true,
        permissionLevel: true,
      },
    });

    type UserItem = typeof users[number];

    // Aggregate by department
    const deptMap: Record<string, {
      count: number;
      leads: number;
      staff: number;
      freelancers: number;
    }> = {};

    users.forEach((user: UserItem) => {
      const dept = user.department || "Unassigned";
      if (!deptMap[dept]) {
        deptMap[dept] = { count: 0, leads: 0, staff: 0, freelancers: 0 };
      }
      deptMap[dept].count++;

      if (user.permissionLevel === "TEAM_LEAD") {
        deptMap[dept].leads++;
      } else if (user.permissionLevel === "FREELANCER") {
        deptMap[dept].freelancers++;
      } else {
        deptMap[dept].staff++;
      }
    });

    const departments = Object.entries(deptMap)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return success({
      departments,
      total: users.length,
      departmentCount: departments.length,
    });
  });
}
