"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Brief, Client, User } from "@prisma/client";
import { Calendar, User as UserIcon, Send } from "lucide-react";
import { briefTypeLabels } from "@/../config/forms";

interface KanbanCardProps {
  brief: Brief & { client: Client; assignee: User | null; createdBy: User };
}

export function KanbanCard({ brief }: KanbanCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: brief.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formData = brief.formData as Record<string, unknown>;
  const deadline = formData.deadline as string | undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-2">
        <div>
          <p className="font-medium text-gray-900 text-sm line-clamp-2">
            {brief.title}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {brief.client.code} • {briefTypeLabels[brief.type]}
          </p>
        </div>

        {/* Assignee and Briefer row */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1" title="Assigned to">
            <UserIcon className="w-3 h-3" />
            <span>{brief.assignee?.name?.split(" ")[0] || "Unassigned"}</span>
          </div>

          <div
            className="flex items-center gap-1 text-[#1BA098]"
            title={`Briefed by ${brief.createdBy.name}`}
          >
            <Send className="w-3 h-3" />
            <span>{brief.createdBy.name?.split(" ")[0]}</span>
          </div>
        </div>

        {/* Deadline row */}
        {deadline && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Calendar className="w-3 h-3" />
            <span>
              {new Date(deadline).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
