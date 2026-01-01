"use client";

import { useState } from "react";
import Link from "next/link";
import type { PermissionLevel, ProjectStatus, ProjectType } from "@prisma/client";
import { Plus, FolderKanban, Search, Calendar, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { NewProjectDialog } from "./NewProjectDialog";

interface Project {
  id: string;
  name: string;
  code: string | null;
  type: ProjectType;
  status: ProjectStatus;
  startDate: Date | null;
  endDate: Date | null;
  budgetHours: number | null;
  description: string | null;
  client: {
    id: string;
    name: string;
    code: string;
  };
  _count: {
    briefs: number;
  };
}

interface Client {
  id: string;
  name: string;
  code: string;
}

interface ProjectsViewProps {
  projects: Project[];
  clients: Client[];
  permissionLevel: PermissionLevel;
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

export function ProjectsView({ projects, clients, permissionLevel }: ProjectsViewProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | "ALL">("ALL");
  const [clientFilter, setClientFilter] = useState<string>("ALL");
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);

  const canCreate = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(permissionLevel);

  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      search === "" ||
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      project.code?.toLowerCase().includes(search.toLowerCase()) ||
      project.client.name.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
    const matchesClient = clientFilter === "ALL" || project.client.id === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  });

  const activeCount = projects.filter((p) => p.status === "ACTIVE").length;
  const onHoldCount = projects.filter((p) => p.status === "ON_HOLD").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Projects</h1>
          <p className="text-gray-500 text-sm mt-1">
            {activeCount} active, {onHoldCount} on hold
          </p>
        </div>
        {canCreate && (
          <button
            onClick={() => setIsNewDialogOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#1BA098] hover:text-white transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ProjectStatus | "ALL")}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="ON_HOLD">On Hold</option>
          <option value="COMPLETED">Completed</option>
          <option value="DRAFT">Draft</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent bg-white"
        >
          <option value="ALL">All Clients</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FolderKanban className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
          <p className="text-gray-500 text-sm">
            {search || statusFilter !== "ALL" || clientFilter !== "ALL"
              ? "Try adjusting your filters"
              : "Create your first project to get started"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* New Project Dialog */}
      <NewProjectDialog
        isOpen={isNewDialogOpen}
        onClose={() => setIsNewDialogOpen(false)}
        clients={clients}
      />
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const statusStyle = statusColors[project.status];

  return (
    <Link
      href={`/projects/${project.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-[#52EDC7] hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-[#52EDC7]/10 flex items-center justify-center">
            <span className="font-bold text-[#1BA098] text-xs">
              {project.client.code}
            </span>
          </div>
          <div>
            <h3 className="font-medium text-gray-900 group-hover:text-[#1BA098] transition-colors">
              {project.name}
            </h3>
            <p className="text-xs text-gray-500">{project.client.name}</p>
          </div>
        </div>
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            statusStyle.bg,
            statusStyle.text
          )}
        >
          <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
          {statusLabels[project.status]}
        </span>
      </div>

      {project.description && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">
          {project.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <FileText className="w-3.5 h-3.5" />
          <span>{project._count.briefs} brief{project._count.briefs === 1 ? "" : "s"}</span>
        </div>

        {project.startDate && (
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {new Date(project.startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        )}

        {project.budgetHours && (
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{project.budgetHours}h</span>
          </div>
        )}
      </div>
    </Link>
  );
}
