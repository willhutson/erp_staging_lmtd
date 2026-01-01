import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus, MoreVertical, Mail } from "lucide-react";
import Link from "next/link";

// Inferred type for user with relations
type UserWithRelations = Awaited<
  ReturnType<
    typeof db.user.findMany<{
      include: {
        teamLead: { select: { id: true; name: true } };
        _count: { select: { briefsAssigned: true } };
      };
    }>
  >
>[number];

const permissionColors: Record<string, { bg: string; text: string }> = {
  ADMIN: { bg: "bg-red-100", text: "text-red-700" },
  LEADERSHIP: { bg: "bg-purple-100", text: "text-purple-700" },
  TEAM_LEAD: { bg: "bg-blue-100", text: "text-blue-700" },
  STAFF: { bg: "bg-gray-100", text: "text-gray-700" },
  FREELANCER: { bg: "bg-yellow-100", text: "text-yellow-700" },
  CLIENT: { bg: "bg-green-100", text: "text-green-700" },
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function UsersSettingsPage() {
  const session = await auth();

  const users = await db.user.findMany({
    where: { organizationId: session!.user.organizationId },
    include: {
      teamLead: { select: { id: true, name: true } },
      _count: { select: { briefsAssigned: true } },
    },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const departments = Array.from(new Set(users.map((u: UserWithRelations) => u.department))).sort();
  const activeCount = users.filter((u: UserWithRelations) => u.isActive).length;
  const freelancerCount = users.filter((u: UserWithRelations) => u.isFreelancer && u.isActive).length;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{users.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Active</p>
          <p className="text-2xl font-bold text-green-600">{activeCount}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Freelancers</p>
          <p className="text-2xl font-bold text-yellow-600">{freelancerCount}</p>
        </div>
      </div>

      {/* User List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team Members</h2>
          <Link
            href="/settings/users/new"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#52EDC7] text-gray-900 text-sm font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add User
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 dark:border-gray-700">
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">User</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Role</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Department</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Permission</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400">Briefs</th>
                <th className="text-left p-4 text-sm font-medium text-gray-500 dark:text-gray-400"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {users.map((user: UserWithRelations) => {
                const permColor = permissionColors[user.permissionLevel] || permissionColors.STAFF;
                return (
                  <tr key={user.id} className={!user.isActive ? "opacity-50" : ""}>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#52EDC7] flex items-center justify-center text-sm font-medium text-gray-900">
                          {user.name
                            .split(" ")
                            .map((n: string) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.role}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user.department}</td>
                    <td className="p-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${permColor.bg} ${permColor.text}`}
                      >
                        {user.permissionLevel}
                      </span>
                    </td>
                    <td className="p-4">
                      {user.isActive ? (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-500">
                          Inactive
                        </span>
                      )}
                      {user.isFreelancer && (
                        <span className="ml-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          Freelancer
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{user._count.briefsAssigned}</td>
                    <td className="p-4">
                      <Link
                        href={`/settings/users/${user.id}`}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                      >
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Departments Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">By Department</h3>
        <div className="flex flex-wrap gap-2">
          {departments.map((dept: string | null) => {
            const count = users.filter((u: UserWithRelations) => u.department === dept && u.isActive).length;
            return (
              <span
                key={dept ?? "none"}
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm rounded-full"
              >
                {dept ?? "Unassigned"} ({count})
              </span>
            );
          })}
        </div>
      </div>
    </>
  );
}
