import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPublishQueue, getQueueStats } from "@/modules/content/services/publisher-service";
import { PublishQueueClient } from "./PublishQueueClient";

export default async function PublishQueuePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const organizationId = session.user.organizationId;

  const [queue, stats] = await Promise.all([
    getPublishQueue(organizationId),
    getQueueStats(organizationId),
  ]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/content-engine"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Publishing Queue</h1>
          <p className="text-gray-500 mt-1">
            Monitor and manage scheduled posts
          </p>
        </div>
      </div>

      <PublishQueueClient
        initialQueue={queue}
        stats={stats}
      />
    </div>
  );
}
