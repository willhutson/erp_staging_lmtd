import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { PlusCircle, FileText, Clock, CheckCircle, XCircle } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";

export const dynamic = 'force-dynamic';

export default async function PortalRequestsPage() {
  const user = await getPortalUser();

  if (!user) {
    return null;
  }

  const requests = await db.clientBriefRequest.findMany({
    where: {
      clientId: user.clientId,
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingRequests = requests.filter((r) =>
    ["SUBMITTED", "IN_REVIEW"].includes(r.status)
  );
  const processedRequests = requests.filter((r) =>
    ["APPROVED", "REJECTED", "ON_HOLD"].includes(r.status)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Your Requests</h1>
          <p className="text-gray-500 mt-1">Track your brief requests</p>
        </div>
        <Link
          href="/portal/dashboard/requests/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
        >
          <PlusCircle className="w-5 h-5" />
          New Request
        </Link>
      </div>

      {requests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No requests yet
          </h3>
          <p className="text-gray-500 mb-6">
            Submit your first brief request to get started
          </p>
          <Link
            href="/portal/dashboard/requests/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
          >
            <PlusCircle className="w-5 h-5" />
            Submit Request
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Pending ({pendingRequests.length})
              </h2>
              <div className="space-y-4">
                {pendingRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </div>
          )}

          {/* Processed Requests */}
          {processedRequests.length > 0 && (
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Processed ({processedRequests.length})
              </h2>
              <div className="space-y-4">
                {processedRequests.map((request) => (
                  <RequestCard key={request.id} request={request} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function RequestCard({
  request,
}: {
  request: {
    id: string;
    title: string;
    description: string;
    briefType: string | null;
    priority: string;
    status: string;
    desiredDeadline: Date | null;
    createdAt: Date;
    briefId: string | null;
    reviewNotes: string | null;
  };
}) {
  const statusConfig: Record<
    string,
    { label: string; className: string; icon: typeof Clock }
  > = {
    DRAFT: {
      label: "Draft",
      className: "bg-gray-100 text-gray-600",
      icon: FileText,
    },
    SUBMITTED: {
      label: "Submitted",
      className: "bg-blue-100 text-blue-700",
      icon: Clock,
    },
    IN_REVIEW: {
      label: "In Review",
      className: "bg-yellow-100 text-yellow-700",
      icon: Clock,
    },
    APPROVED: {
      label: "Approved",
      className: "bg-green-100 text-green-700",
      icon: CheckCircle,
    },
    REJECTED: {
      label: "Declined",
      className: "bg-red-100 text-red-700",
      icon: XCircle,
    },
    ON_HOLD: {
      label: "On Hold",
      className: "bg-orange-100 text-orange-700",
      icon: Clock,
    },
  };

  const config = statusConfig[request.status] || statusConfig.SUBMITTED;
  const StatusIcon = config.icon;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {request.briefType && (
              <span className="text-xs font-medium text-gray-400 uppercase">
                {request.briefType.replace("_", " ")}
              </span>
            )}
            {request.priority === "URGENT" && (
              <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 text-red-700 rounded">
                Urgent
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900">{request.title}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
            {request.description}
          </p>

          {request.reviewNotes && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Team response:</span>{" "}
                {request.reviewNotes}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
            <span>
              Submitted{" "}
              {formatDistanceToNow(new Date(request.createdAt), {
                addSuffix: true,
              })}
            </span>
            {request.desiredDeadline && (
              <span>
                Requested by{" "}
                {format(new Date(request.desiredDeadline), "MMM d, yyyy")}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${config.className}`}
          >
            <StatusIcon className="w-4 h-4" />
            {config.label}
          </span>

          {request.briefId && (
            <Link
              href={`/portal/briefs/${request.briefId}`}
              className="text-sm text-[#52EDC7] hover:text-[#3dd4b0] font-medium"
            >
              View Brief
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
