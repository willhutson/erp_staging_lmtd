import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft, Calendar, Clock, FileText, Edit, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProjectStatus, BriefStatus } from "@prisma/client";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusColors: Record<ProjectStatus, { bg: string; text: string; dot: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  ACTIVE: { bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
  ON_HOLD: { bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  COMPLETED: { bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
  CANCELLED: { bg: "bg-red-50", text: "text-red-700", dot: "bg-red-500" },
};

const statusLabels: Record<ProjectStatus, string> = {
  DRAFT: "Draft",
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

const briefStatusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-600",
  SUBMITTED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-amber-100 text-amber-700",
  INTERNAL_REVIEW: "bg-purple-100 text-purple-700",
  CLIENT_REVIEW: "bg-indigo-100 text-indigo-700",
  REVISIONS: "bg-orange-100 text-orange-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default async function ProjectDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  const project = await db.project.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      client: {
        select: { id: true, name: true, code: true },
      },
      briefs: {
        include: {
          assignee: { select: { id: true, name: true } },
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: [
          { status: "asc" },
          { deadline: "asc" },
        ],
      },
    },
  });

  if (!project) {
    notFound();
  }

  const statusStyle = statusColors[project.status];

  // Calculate brief stats
  const briefStats = {
    total: project.briefs.length,
    active: project.briefs.filter((b) => !["DRAFT", "CANCELLED", "COMPLETED"].includes(b.status)).length,
    completed: project.briefs.filter((b) => b.status === "COMPLETED").length,
  };

  const isLeadership = ["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Projects
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-[#52EDC7]/10 flex items-center justify-center">
              <span className="font-bold text-[#1BA098]">{project.client.code}</span>
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{project.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{project.client.name}</span>
                {project.code && (
                  <>
                    <span className="text-gray-300">|</span>
                    <span className="text-sm font-mono text-gray-500">{project.code}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
              statusStyle.bg,
              statusStyle.text
            )}
          >
            <span className={cn("w-2 h-2 rounded-full", statusStyle.dot)} />
            {statusLabels[project.status]}
          </span>

          {isLeadership && (
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Settings className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Project Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Timeline Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <Calendar className="w-4 h-4" />
            <span>Timeline</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Start</span>
              <span className="font-medium">
                {project.startDate
                  ? new Date(project.startDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not set"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">End</span>
              <span className="font-medium">
                {project.endDate
                  ? new Date(project.endDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })
                  : "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <Clock className="w-4 h-4" />
            <span>Budget</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Hours</span>
              <span className="font-medium">
                {project.budgetHours ? `${project.budgetHours}h` : "Not set"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Amount</span>
              <span className="font-medium">
                {project.budgetAmount
                  ? `AED ${Number(project.budgetAmount).toLocaleString()}`
                  : "Not set"}
              </span>
            </div>
          </div>
        </div>

        {/* Briefs Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <FileText className="w-4 h-4" />
            <span>Briefs</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Active</span>
              <span className="font-medium text-amber-600">{briefStats.active}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Completed</span>
              <span className="font-medium text-green-600">{briefStats.completed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {project.description && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-medium text-gray-900 mb-2">Description</h3>
          <p className="text-gray-600 text-sm whitespace-pre-wrap">{project.description}</p>
        </div>
      )}

      {/* Briefs Section */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-medium text-gray-900">Project Briefs</h3>
          <Link
            href={`/briefs/new?projectId=${project.id}&clientId=${project.clientId}`}
            className="text-sm text-[#52EDC7] hover:text-[#1BA098] font-medium"
          >
            + Add Brief
          </Link>
        </div>

        {project.briefs.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p>No briefs yet</p>
            <p className="text-sm mt-1">Create briefs to add them to this project</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {project.briefs.map((brief) => (
              <Link
                key={brief.id}
                href={`/briefs/${brief.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 truncate">{brief.title}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                    {brief.assignee && <span>Assigned to {brief.assignee.name.split(" ")[0]}</span>}
                    {brief.deadline && (
                      <>
                        <span className="text-gray-300">|</span>
                        <span>
                          Due {new Date(brief.deadline).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <span
                  className={cn(
                    "px-2 py-0.5 rounded text-xs font-medium",
                    briefStatusColors[brief.status] || "bg-gray-100 text-gray-600"
                  )}
                >
                  {brief.status.replace(/_/g, " ")}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
