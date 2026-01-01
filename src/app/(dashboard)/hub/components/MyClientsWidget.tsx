import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface MyClientsWidgetProps {
  userId: string;
}

export async function MyClientsWidget({ userId }: MyClientsWidgetProps) {
  const session = await auth();
  if (!session?.user) return null;

  // Get clients where user has created briefs or is assigned briefs
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  // Get brief stats by client for this user
  const briefsByClient = await db.brief.groupBy({
    by: ["clientId"],
    where: {
      organizationId: session.user.organizationId,
      OR: [
        { createdById: userId },
        { assigneeId: userId },
      ],
    },
    _count: { id: true },
  });

  const clientIds = briefsByClient.map((b) => b.clientId);

  if (clientIds.length === 0) {
    return (
      <div className="text-center text-gray-500 py-4">
        <p className="text-sm">No client activity yet</p>
      </div>
    );
  }

  // Get client details with recent activity
  const clients = await db.client.findMany({
    where: {
      id: { in: clientIds },
      organizationId: session.user.organizationId,
    },
    include: {
      briefs: {
        where: {
          status: { notIn: ["DRAFT", "CANCELLED", "COMPLETED"] },
          OR: [
            { createdById: userId },
            { assigneeId: userId },
          ],
        },
        select: { id: true },
      },
      _count: {
        select: {
          briefs: {
            where: {
              createdAt: { gte: thirtyDaysAgo },
            },
          },
        },
      },
    },
    orderBy: { name: "asc" },
    take: 6,
  });

  return (
    <div className="space-y-3">
      {clients.map((client) => {
        const activeBriefs = client.briefs.length;
        const recentActivity = client._count.briefs;

        return (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#52EDC7]/10 flex items-center justify-center">
                <span className="font-bold text-[#1BA098] text-sm">
                  {client.code}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">{client.name}</p>
                <p className="text-xs text-gray-500">
                  {activeBriefs} active brief{activeBriefs === 1 ? "" : "s"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {recentActivity > 0 && (
                <span className="text-xs text-gray-500">
                  {recentActivity} this month
                </span>
              )}
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#52EDC7] transition-colors" />
            </div>
          </Link>
        );
      })}

      <Link
        href="/clients"
        className="block text-center text-xs text-[#52EDC7] hover:text-[#1BA098] pt-2"
      >
        View all clients
      </Link>
    </div>
  );
}
