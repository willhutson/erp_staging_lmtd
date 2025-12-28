/**
 * GET /api/v1/team - Team directory
 */

import prisma from "@/lib/prisma";
import {
  getAuthContext,
  success,
  handleRoute,
  parseFilters,
} from "@/lib/api";

export async function GET(request: Request) {
  return handleRoute(async () => {
    const context = await getAuthContext();
    const { searchParams } = new URL(request.url);

    const filters = parseFilters(searchParams, [
      "department",
      "isActive",
      "search",
      "view", // "list" | "by-department" | "org-chart"
    ]);

    const where: Record<string, unknown> = {
      organizationId: context.organizationId,
      isActive: filters.isActive !== "false",
    };

    if (filters.department) {
      where.department = filters.department;
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { role: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const members = await prisma.user.findMany({
      where,
      orderBy: [{ department: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        permissionLevel: true,
        isFreelancer: true,
        avatarUrl: true,
        phone: true,
        skills: true,
        isActive: true,
        teamLead: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            teamMembers: true,
          },
        },
      },
    });

    type Member = typeof members[number];

    // Handle different view modes
    const view = filters.view || "list";

    if (view === "by-department") {
      // Group by department
      const byDepartment: Record<string, Member[]> = {};
      members.forEach((member: Member) => {
        const dept = member.department || "Unassigned";
        if (!byDepartment[dept]) {
          byDepartment[dept] = [];
        }
        byDepartment[dept].push(member);
      });

      return success({
        view: "by-department",
        departments: Object.entries(byDepartment).map(([name, deptMembers]) => ({
          name,
          count: deptMembers.length,
          members: deptMembers,
        })),
        total: members.length,
      });
    }

    if (view === "org-chart") {
      // Build org chart hierarchy
      const leadership = members.filter((m: Member) =>
        ["ADMIN", "LEADERSHIP"].includes(m.permissionLevel)
      );
      const teamLeads = members.filter((m: Member) => m.permissionLevel === "TEAM_LEAD");
      const staff = members.filter((m: Member) =>
        ["STAFF", "FREELANCER"].includes(m.permissionLevel)
      );

      return success({
        view: "org-chart",
        hierarchy: {
          leadership,
          teamLeads,
          staff,
        },
        total: members.length,
      });
    }

    // Default list view
    return success({
      view: "list",
      members,
      total: members.length,
    });
  });
}
