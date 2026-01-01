import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus, Search } from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/modules/briefs/components/StatusBadge";
import { briefTypeLabels } from "@/../config/forms";
import { can } from "@/lib/permissions";
import { PageShell } from "@/components/ltd/patterns/page-shell";

// Inferred types from Prisma - avoids direct import issues
type BriefRecord = Awaited<ReturnType<typeof db.brief.findMany<{ include: { client: true; assignee: true } }>>>[number];
type ClientRecord = Awaited<ReturnType<typeof db.client.findMany>>[number];
type BriefStatus = BriefRecord["status"];
type BriefType = BriefRecord["type"];

interface SearchParams {
  status?: string;
  type?: string;
  client?: string;
  q?: string;
}

interface PageProps {
  searchParams: Promise<SearchParams>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

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
    <PageShell
      title="Briefs"
      description="Manage all project briefs"
      actions={
        canCreate ? (
          <Link
            href="/briefs/new"
            className="flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Brief
          </Link>
        ) : undefined
      }
    >
      {/* Filters */}
      <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
        <form className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
            <input
              type="text"
              name="q"
              defaultValue={params.q}
              placeholder="Search briefs..."
              className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 bg-ltd-surface-overlay rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
          </div>

          {/* Status filter */}
          <select
            name="status"
            defaultValue={params.status}
            className="px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
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
            className="px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
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
            className="px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
          >
            <option value="">All Clients</option>
            {clients.map((client: ClientRecord) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="px-4 py-2 bg-ltd-surface-3 text-ltd-text-1 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-2 text-sm transition-colors"
          >
            Filter
          </button>

          {(params.status || params.type || params.client || params.q) && (
            <Link
              href="/briefs"
              className="px-4 py-2 text-ltd-text-2 hover:text-ltd-text-1 text-sm transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Briefs list */}
      <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay">
        {briefs.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-ltd-text-2">No briefs found.</p>
            {canCreate && (
              <p className="text-sm text-ltd-text-3 mt-1">
                <Link href="/briefs/new" className="text-ltd-primary hover:underline">
                  Create your first brief
                </Link>{" "}
                to get started.
              </p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-ltd-border-1">
            {briefs.map((brief: BriefRecord) => (
              <Link
                key={brief.id}
                href={`/briefs/${brief.id}`}
                className="block p-4 hover:bg-ltd-surface-2 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="font-medium text-ltd-text-1 truncate">
                        {brief.title}
                      </p>
                      <StatusBadge status={brief.status} />
                    </div>
                    <p className="text-sm text-ltd-text-2">
                      {brief.briefNumber} • {brief.client.name} •{" "}
                      {briefTypeLabels[brief.type]}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-ltd-text-2">
                      {brief.assignee?.name || "Unassigned"}
                    </p>
                    <p className="text-xs text-ltd-text-3">
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
    </PageShell>
  );
}
