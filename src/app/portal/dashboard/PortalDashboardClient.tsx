"use client";

import Link from "next/link";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  LucideIcon,
  Package,
  Eye,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Brief {
  id: string;
  title: string;
  type: string;
  status: string;
  updatedAt: Date;
  assignee: { name: string } | null;
}

interface Deliverable {
  id: string;
  title: string;
  type: string;
  briefTitle: string;
  updatedAt: Date;
}

interface Props {
  userName: string;
  briefs: Brief[];
  pendingApprovalsCount: number;
  inProgressCount: number;
  awaitingReviewCount: number;
  completedCount: number;
  deliverablesAwaitingReview: Deliverable[];
}

export function PortalDashboardClient({
  userName,
  briefs,
  pendingApprovalsCount,
  inProgressCount,
  awaitingReviewCount,
  completedCount,
  deliverablesAwaitingReview,
}: Props) {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {userName}
        </h1>
        <p className="text-gray-500 mt-1">
          Here&apos;s what&apos;s happening with your projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          title="Active Projects"
          value={briefs.length}
          icon={FileText}
          color="blue"
        />
        <StatCard
          title="In Progress"
          value={inProgressCount}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Awaiting Review"
          value={awaitingReviewCount}
          icon={AlertCircle}
          color="orange"
          highlight={awaitingReviewCount > 0}
        />
        <StatCard
          title="Completed"
          value={completedCount}
          icon={CheckCircle}
          color="green"
        />
      </div>

      {/* Deliverables Awaiting Review */}
      {deliverablesAwaitingReview.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Eye className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Deliverables to Review
                </h2>
                <p className="text-sm text-gray-500">
                  {deliverablesAwaitingReview.length} deliverable(s) need your approval
                </p>
              </div>
            </div>
            <Link
              href="/portal/dashboard/deliverables"
              className="text-sm text-yellow-600 hover:text-yellow-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="space-y-2">
            {deliverablesAwaitingReview.slice(0, 3).map((d) => (
              <Link
                key={d.id}
                href={`/portal/dashboard/deliverables/${d.id}`}
                className="flex items-center justify-between p-3 bg-white rounded-lg hover:bg-yellow-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Package className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{d.title}</p>
                    <p className="text-xs text-gray-500">{d.briefTitle}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(d.updatedAt), { addSuffix: true })}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Pending Approvals */}
      {pendingApprovalsCount > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">
                  Pending Approvals
                </h2>
                <p className="text-sm text-gray-500">
                  {pendingApprovalsCount} item(s) need your review
                </p>
              </div>
            </div>
            <Link
              href="/portal/dashboard/approvals"
              className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Recent Briefs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Recent Briefs</h2>
          <Link
            href="/portal/dashboard/briefs"
            className="text-sm text-[#52EDC7] hover:text-[#3dd4b0] font-medium flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          {briefs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No briefs yet</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Brief
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Assigned To
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">
                    Updated
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {briefs.map((brief) => (
                  <tr key={brief.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/portal/briefs/${brief.id}`}
                        className="font-medium text-gray-900 hover:text-[#52EDC7]"
                      >
                        {brief.title}
                      </Link>
                      <p className="text-xs text-gray-500">{brief.type}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={brief.status} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {brief.assignee?.name || "Unassigned"}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {formatDistanceToNow(new Date(brief.updatedAt), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  highlight = false,
}: {
  title: string;
  value: number;
  icon: LucideIcon;
  color: "blue" | "yellow" | "orange" | "green";
  highlight?: boolean;
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    yellow: "bg-yellow-100 text-yellow-600",
    orange: "bg-orange-100 text-orange-600",
    green: "bg-green-100 text-green-600",
  };

  return (
    <div
      className={`bg-white border rounded-xl p-4 ${
        highlight ? "border-orange-300 ring-2 ring-orange-100" : "border-gray-200"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-sm text-gray-500">{title}</p>
        </div>
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
    CANCELLED: { label: "Cancelled", className: "bg-gray-100 text-gray-600" },
  };

  const config = statusConfig[status] || {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
    >
      {config.label}
    </span>
  );
}
