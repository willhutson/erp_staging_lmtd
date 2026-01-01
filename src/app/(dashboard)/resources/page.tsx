import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { ResourcesView } from "@/modules/resources/components/ResourcesView";

export default async function ResourcesPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const [briefs, users, clients] = await Promise.all([
    db.brief.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: {
          notIn: ["DRAFT", "CANCELLED", "COMPLETED"],
        },
      },
      include: {
        client: true,
        assignee: true,
        createdBy: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.user.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    }),
    db.client.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resources</h1>
        <p className="text-gray-500 mt-1">
          Team capacity and resource planning
        </p>
      </div>

      <ResourcesView briefs={briefs} users={users} clients={clients} />
    </div>
  );
}
