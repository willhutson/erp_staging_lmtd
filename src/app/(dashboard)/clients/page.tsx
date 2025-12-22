import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus, Building2, User, FileText, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Inferred type from Prisma query
type ClientWithRelations = Awaited<ReturnType<typeof db.client.findMany<{
  include: { accountManager: { select: { id: true; name: true } }; _count: { select: { briefs: true; contacts: true } } }
}>>>[number];

const relationshipStatusConfig: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  LEAD: { label: "Lead", color: "text-gray-600", bgColor: "bg-gray-100" },
  PROSPECT: { label: "Prospect", color: "text-blue-600", bgColor: "bg-blue-100" },
  ACTIVE: { label: "Active", color: "text-green-600", bgColor: "bg-green-100" },
  AT_RISK: { label: "At Risk", color: "text-red-600", bgColor: "bg-red-100" },
  CHURNED: { label: "Churned", color: "text-gray-500", bgColor: "bg-gray-100" },
  DORMANT: { label: "Dormant", color: "text-yellow-600", bgColor: "bg-yellow-100" },
};

export default async function ClientsPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const clients = await db.client.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      accountManager: {
        select: { id: true, name: true },
      },
      _count: {
        select: {
          briefs: true,
          contacts: true,
        },
      },
    },
    orderBy: { name: "asc" },
  });

  const activeClients = clients.filter((c: ClientWithRelations) => c.relationshipStatus === "ACTIVE");
  const atRiskClients = clients.filter((c: ClientWithRelations) => c.relationshipStatus === "AT_RISK");
  const totalValue = clients.reduce(
    (sum: number, c: ClientWithRelations) => sum + Number(c.lifetimeValue || 0),
    0
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `AED ${(value / 1000).toFixed(0)}K`;
    }
    return `AED ${value.toFixed(0)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
          <p className="text-gray-500 mt-1">Manage client relationships</p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Client
        </Link>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total Clients</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {clients.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {activeClients.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <AlertTriangle className="w-3 h-3 text-red-500" />
            <span>At Risk</span>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {atRiskClients.length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Lifetime Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalValue)}
          </p>
        </div>
      </div>

      {/* Client list */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Client
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Status
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Account Manager
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Contacts
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Briefs
                </th>
                <th className="text-left p-4 text-sm font-medium text-gray-500">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clients.map((client: ClientWithRelations) => {
                const statusConfig =
                  relationshipStatusConfig[client.relationshipStatus] ||
                  relationshipStatusConfig.ACTIVE;

                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <Link
                        href={`/clients/${client.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                          {client.logoUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={client.logoUrl}
                              alt={client.name}
                              className="w-10 h-10 rounded-lg object-cover"
                            />
                          ) : (
                            <Building2 className="w-5 h-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 hover:text-[#1BA098]">
                            {client.name}
                          </p>
                          <p className="text-xs text-gray-500">{client.code}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="p-4">
                      <span
                        className={cn(
                          "px-2 py-1 text-xs font-medium rounded-full",
                          statusConfig.bgColor,
                          statusConfig.color
                        )}
                      >
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      {client.accountManager ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-[#52EDC7] flex items-center justify-center text-xs font-medium text-gray-900">
                            {client.accountManager.name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <span className="text-sm text-gray-600">
                            {client.accountManager.name.split(" ")[0]}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>{client._count.contacts}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{client._count.briefs}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {client.isRetainer ? (
                        <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 rounded">
                          Retainer
                          {client.retainerHours && ` (${client.retainerHours}h)`}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">Project</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {clients.length === 0 && (
          <div className="p-12 text-center">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No clients yet.</p>
            <Link
              href="/clients/new"
              className="text-sm text-[#52EDC7] hover:underline mt-1 inline-block"
            >
              Add your first client
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
