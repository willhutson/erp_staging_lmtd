import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Users, Mail, Phone } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Inferred type from Prisma query
type UserWithDetails = Awaited<ReturnType<typeof db.user.findMany<{
  include: { teamLead: { select: { id: true; name: true } }; _count: { select: { briefsAssigned: true; managedClients: true } } }
}>>>[number];

const departmentColors: Record<string, string> = {
  "Creative & Design": "bg-purple-100 text-purple-700",
  "Video Production": "bg-blue-100 text-blue-700",
  "Client Servicing": "bg-green-100 text-green-700",
  "HR & Operations": "bg-yellow-100 text-yellow-700",
  OCM: "bg-orange-100 text-orange-700",
  "Paid Media": "bg-red-100 text-red-700",
  Copywriting: "bg-indigo-100 text-indigo-700",
  Management: "bg-gray-100 text-gray-700",
};

export default async function TeamPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const users = await db.user.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
    },
    include: {
      teamLead: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          briefsAssigned: true,
          managedClients: true,
        },
      },
    },
    orderBy: [{ department: "asc" }, { name: "asc" }],
  });

  // Group by department
  const departments = users.reduce(
    (acc: Record<string, UserWithDetails[]>, user: UserWithDetails) => {
      if (!acc[user.department]) {
        acc[user.department] = [];
      }
      acc[user.department].push(user);
      return acc;
    },
    {} as Record<string, UserWithDetails[]>
  );

  const totalUsers = users.length;
  const freelancers = users.filter((u: UserWithDetails) => u.isFreelancer).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Team Directory</h1>
          <p className="text-gray-500 mt-1">
            {totalUsers} team members across {Object.keys(departments).length}{" "}
            departments
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Team</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{totalUsers}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Departments</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {Object.keys(departments).length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Full-time</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {totalUsers - freelancers}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Freelancers</p>
          <p className="text-2xl font-bold text-purple-600 mt-1">
            {freelancers}
          </p>
        </div>
      </div>

      {/* Department sections */}
      {Object.entries(departments).map(([department, members]: [string, UserWithDetails[]]) => (
        <div key={department} className="space-y-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-full",
                departmentColors[department] || "bg-gray-100 text-gray-700"
              )}
            >
              {department}
            </span>
            <span className="text-sm text-gray-500">{members.length} members</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((user: UserWithDetails) => (
              <Link
                key={user.id}
                href={`/team/${user.id}`}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#52EDC7] flex items-center justify-center text-gray-900 font-medium text-lg shrink-0">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      user.name
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")
                        .slice(0, 2)
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500 truncate">{user.role}</p>
                    {user.isFreelancer && (
                      <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                        Freelancer
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 space-y-1">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                {(user._count.briefsAssigned > 0 ||
                  user._count.managedClients > 0) && (
                  <div className="mt-3 flex gap-4 text-xs text-gray-400">
                    {user._count.briefsAssigned > 0 && (
                      <span>{user._count.briefsAssigned} briefs</span>
                    )}
                    {user._count.managedClients > 0 && (
                      <span>{user._count.managedClients} clients</span>
                    )}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      ))}

      {users.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No team members found.</p>
        </div>
      )}
    </div>
  );
}
