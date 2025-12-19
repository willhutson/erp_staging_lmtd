import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { FileText, Users, Clock, TrendingUp } from "lucide-react";

async function getStats(organizationId: string) {
  const [briefCount, userCount, clientCount] = await Promise.all([
    db.brief.count({ where: { organizationId } }),
    db.user.count({ where: { organizationId, isActive: true } }),
    db.client.count({ where: { organizationId, isActive: true } }),
  ]);

  return { briefCount, userCount, clientCount };
}

export default async function DashboardPage() {
  const session = await auth();
  const stats = await getStats(session!.user.organizationId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {session!.user.name.split(" ")[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening at TeamLMTD today
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Active Briefs"
          value={stats.briefCount}
          icon={<FileText className="w-6 h-6" />}
          color="bg-blue-500"
        />
        <StatCard
          title="Team Members"
          value={stats.userCount}
          icon={<Users className="w-6 h-6" />}
          color="bg-green-500"
        />
        <StatCard
          title="Clients"
          value={stats.clientCount}
          icon={<TrendingUp className="w-6 h-6" />}
          color="bg-purple-500"
        />
        <StatCard
          title="Hours This Week"
          value={0}
          icon={<Clock className="w-6 h-6" />}
          color="bg-orange-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Briefs
          </h2>
          <p className="text-gray-500 text-sm">No briefs yet. Create your first brief to get started.</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            My Tasks
          </h2>
          <p className="text-gray-500 text-sm">No tasks assigned. Check back later.</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg text-white`}>{icon}</div>
      </div>
    </div>
  );
}
