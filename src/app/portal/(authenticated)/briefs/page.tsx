import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { FileText, Calendar, User } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export default async function PortalBriefsPage() {
  const user = await getPortalUser();

  if (!user) {
    return null;
  }

  const briefs = await db.brief.findMany({
    where: {
      clientId: user.clientId,
      status: { not: "CANCELLED" },
    },
    orderBy: { createdAt: "desc" },
    include: {
      assignee: { select: { id: true, name: true, avatarUrl: true } },
      project: { select: { id: true, name: true } },
    },
  });

  // Group by status
  const activeStatuses = [
    "IN_PROGRESS",
    "INTERNAL_REVIEW",
    "CLIENT_REVIEW",
    "REVISIONS",
  ];
  const activeBriefs = briefs.filter((b) => activeStatuses.includes(b.status));
  const completedBriefs = briefs.filter((b) => b.status === "COMPLETED");
  const otherBriefs = briefs.filter(
    (b) => !activeStatuses.includes(b.status) && b.status !== "COMPLETED"
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Your Briefs</h1>
        <p className="text-gray-500 mt-1">
          View all briefs and projects for {user.client.name}
        </p>
      </div>

      {/* Active Briefs */}
      {activeBriefs.length > 0 && (
        <BriefSection title="Active" briefs={activeBriefs} />
      )}

      {/* Pending Briefs */}
      {otherBriefs.length > 0 && (
        <BriefSection title="Pending" briefs={otherBriefs} />
      )}

      {/* Completed Briefs */}
      {completedBriefs.length > 0 && (
        <BriefSection title="Completed" briefs={completedBriefs} />
      )}

      {briefs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No briefs yet
          </h3>
          <p className="text-gray-500 mb-6">
            Request a new brief to get started
          </p>
          <Link
            href="/portal/requests/new"
            className="inline-flex px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
          >
            Submit a Request
          </Link>
        </div>
      )}
    </div>
  );
}

function BriefSection({
  title,
  briefs,
}: {
  title: string;
  briefs: Array<{
    id: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    deadline: Date | null;
    createdAt: Date;
    assignee: { id: string; name: string | null; avatarUrl: string | null } | null;
    project: { id: string; name: string } | null;
  }>;
}) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        {title} ({briefs.length})
      </h2>
      <div className="grid gap-4">
        {briefs.map((brief) => (
          <Link
            key={brief.id}
            href={`/portal/briefs/${brief.id}`}
            className="block bg-white border border-gray-200 rounded-xl p-5 hover:border-[#52EDC7] hover:shadow-sm transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400 uppercase">
                    {brief.type.replace("_", " ")}
                  </span>
                  {brief.priority === "URGENT" && (
                    <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                      Urgent
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-gray-900 truncate">
                  {brief.title}
                </h3>
                {brief.project && (
                  <p className="text-sm text-gray-500 mt-1">
                    {brief.project.name}
                  </p>
                )}
              </div>
              <StatusBadge status={brief.status} />
            </div>

            <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
              {brief.deadline && (
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  <span>Due {format(new Date(brief.deadline), "MMM d")}</span>
                </div>
              )}
              {brief.assignee && (
                <div className="flex items-center gap-1.5">
                  <User className="w-4 h-4" />
                  <span>{brief.assignee.name}</span>
                </div>
              )}
              <span className="text-gray-400">
                Created{" "}
                {formatDistanceToNow(new Date(brief.createdAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-gray-100 text-gray-600" },
    SUBMITTED: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
    IN_REVIEW: { label: "In Review", className: "bg-purple-100 text-purple-700" },
    APPROVED: { label: "Approved", className: "bg-green-100 text-green-700" },
    IN_PROGRESS: { label: "In Progress", className: "bg-yellow-100 text-yellow-700" },
    INTERNAL_REVIEW: { label: "Internal Review", className: "bg-indigo-100 text-indigo-700" },
    CLIENT_REVIEW: { label: "Your Review", className: "bg-orange-100 text-orange-700" },
    REVISIONS: { label: "Revisions", className: "bg-red-100 text-red-700" },
    COMPLETED: { label: "Completed", className: "bg-green-100 text-green-700" },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex px-2.5 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
