"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  Video,
  MoreVertical,
  Trash2,
  Calendar,
  FileText,
  Layers,
  List,
  Clock,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoProjectWithRelations } from "../types";

interface VideoProjectListProps {
  projects: VideoProjectWithRelations[];
  onProjectClick: (project: VideoProjectWithRelations) => void;
  onDeleteClick?: (project: VideoProjectWithRelations) => void;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  CONCEPT: { label: "Concept", color: "bg-gray-100 text-gray-700" },
  SCRIPTING: { label: "Scripting", color: "bg-blue-100 text-blue-700" },
  PRE_PRODUCTION: { label: "Pre-Production", color: "bg-yellow-100 text-yellow-700" },
  PRODUCTION: { label: "Production", color: "bg-orange-100 text-orange-700" },
  POST_PRODUCTION: { label: "Post-Production", color: "bg-purple-100 text-purple-700" },
  REVIEW: { label: "Review", color: "bg-pink-100 text-pink-700" },
  COMPLETE: { label: "Complete", color: "bg-green-100 text-green-700" },
  CANCELLED: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const typeConfig = {
  SOCIAL_SHORT: { label: "Social Short", icon: "📱" },
  SOCIAL_LONG: { label: "Social Long", icon: "📹" },
  COMMERCIAL: { label: "Commercial", icon: "🎬" },
  DOCUMENTARY: { label: "Documentary", icon: "🎥" },
  INTERVIEW: { label: "Interview", icon: "🎙️" },
  EVENT: { label: "Event", icon: "🎪" },
  EXPLAINER: { label: "Explainer", icon: "💡" },
  TESTIMONIAL: { label: "Testimonial", icon: "💬" },
};

export function VideoProjectList({
  projects,
  onProjectClick,
  onDeleteClick,
}: VideoProjectListProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  if (projects.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => {
        const status = statusConfig[project.status] || statusConfig.CONCEPT;
        const type = typeConfig[project.type as keyof typeof typeConfig] || { label: project.type, icon: "🎬" };
        const hasScript = !!project.script;
        const hasStoryboard = project.storyboard && project.storyboard.frames.length > 0;
        const hasShotList = project.shotList && project.shotList.length > 0;

        return (
          <div
            key={project.id}
            className="group relative rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50 transition-colors cursor-pointer overflow-hidden"
            onClick={() => onProjectClick(project)}
          >
            {/* Preview area */}
            <div className="aspect-video bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center relative">
              <Video className="w-12 h-12 text-purple-500/50" />

              {/* Type badge */}
              <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs flex items-center gap-1">
                <span>{type.icon}</span>
                <span>{type.label}</span>
              </div>

              {/* Components indicators */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1">
                {hasScript && (
                  <div className="p-1.5 bg-black/50 rounded" title="Has Script">
                    <FileText className="w-3 h-3 text-white" />
                  </div>
                )}
                {hasStoryboard && (
                  <div className="p-1.5 bg-black/50 rounded" title="Has Storyboard">
                    <Layers className="w-3 h-3 text-white" />
                  </div>
                )}
                {hasShotList && (
                  <div className="p-1.5 bg-black/50 rounded" title="Has Shot List">
                    <List className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-ltd-text-1 truncate">
                    {project.title}
                  </h3>
                  {project.client && (
                    <p className="text-xs text-ltd-text-2 mt-0.5">
                      {project.client.name}
                    </p>
                  )}
                </div>
                <span className={cn("px-2 py-0.5 text-xs font-medium rounded", status.color)}>
                  {status.label}
                </span>
              </div>

              <div className="flex items-center gap-3 mt-3 text-xs text-ltd-text-3">
                {project.duration && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {Math.floor(project.duration / 60)}:{String(project.duration % 60).padStart(2, "0")}
                  </span>
                )}
                {project.shootDate && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {format(new Date(project.shootDate), "MMM d")}
                  </span>
                )}
                {project.director && (
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {project.director.name.split(" ")[0]}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="absolute top-2 right-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === project.id ? null : project.id);
                  }}
                  className="p-2 bg-white/90 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-sm"
                >
                  <MoreVertical className="w-4 h-4 text-ltd-text-2" />
                </button>

                {openMenuId === project.id && (
                  <div className="absolute right-0 top-full mt-1 w-48 bg-ltd-surface-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] shadow-lg z-10">
                    {onDeleteClick && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteClick(project);
                          setOpenMenuId(null);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
