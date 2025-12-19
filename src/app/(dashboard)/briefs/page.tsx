import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/modules/briefs/components/StatusBadge";
import { briefTypeLabels } from "@/../config/forms";
import { can } from "@/lib/permissions";
import type { BriefStatus, BriefType } from "@prisma/client";

interface SearchParams {
  status?: string;
  type?: string;
  client?: string;
  q?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

export default async function BriefsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  // Build filter conditions
  const where: {
    organizationId: string;
    status?: BriefStatus;
    type?: BriefType;
    clientId?: string;
    title?: { contains: string; mode: "insensitive" };
  } = {
    organizationId: session.user.organizationId,
  };

  if (params.status) {
    where.status = params.status as BriefStatus;
  }

  if (params.type) {
    where.type = params.type as BriefType;
  }

  if (params.client) {
    where.clientId = params.client;
  }

  if (params.q) {
    where.title = { contains: params.q, mode: "insensitive" };
  }

  const [briefs, clients] = await Promise.all([
    db.brief.findMany({
      where,
      include: { client: true, assignee: true },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    db.client.findMany({
      where: { organizationId: session.user.organizationId, isActive: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const canCreate = can(session.user as Parameters<typeof can>[0], "brief:create");

  const statuses: BriefStatus[] = [
    "DRAFT",
    "SUBMITTED",
    "IN_REVIEW",
    "APPROVED",
    "IN_PROGRESS",
    "INTERNAL_REVIEW",
    "CLIENT_REVIEW",
    "REVISIONS",
    "COMPLETED",
  ];

  const types = Object.keys(briefTypeLabels) as BriefType[];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Briefs</h1>
          <p className="text-gray-500 mt-1">Manage all project briefs</p>
        </div>
        {canCreate && (
          <Link
            href="/briefs/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Brief
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <form className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search briefs..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            />
          </div>

          {/* Status filter */}
          <select
            name="status"
            defaultValue={params.status}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace(/_/g, " ")}
              </option>
            ))}
          </select>

          {/* Type filter */}
          <select
            name="type"
            defaultValue={params.type}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          >
            <option value="">All Types</option>
            {types.map((type) => (
              <option key={type} value={type}>
                {briefTypeLabels[type]}
              </option>
            ))}
          </select>

          {/* Client filter */}
          <select
            name="client"
            defaultValue={params.client}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            Filter
          </button>

          {(params.status || params.type || params.client || params.q) && (
            <Link
              href="/briefs"
              className="px-4 py-2 text-gray-500 hover:text-gray-700 text-sm"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Briefs list */}
      <div className="bg-white rounded-xl border border-gray-200">
        {briefs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No briefs found.</p>
            {canCreate && (
              <p className="text-sm text-gray-400 mt-1">
                <Link href="/briefs/new" className="text-[#52EDC7] hover:underline">
                  Create your first brief
                </Link>{" "}
                to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {briefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/briefs/${brief.id}`}
                className="block p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-gray-900 truncate">
                        {brief.title}
                      </p>
                      <StatusBadge status={brief.status} />
                    </div>
                    <p className="text-sm text-gray-500">
                      {brief.briefNumber} • {brief.client.name} •{" "}
                      {briefTypeLabels[brief.type]}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500">
                      {brief.assignee?.name || "Unassigned"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(brief.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
