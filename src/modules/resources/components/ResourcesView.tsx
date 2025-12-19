"use client";

import { useState } from "react";
import type { Brief, Client, User } from "@prisma/client";
import { KanbanBoard } from "./KanbanBoard";
import { GanttTimeline } from "./GanttTimeline";
import { CapacityOverview } from "./CapacityOverview";
import { cn } from "@/lib/utils";

type BriefWithRelations = Brief & { client: Client; assignee: User | null };

interface ResourcesViewProps {
  briefs: BriefWithRelations[];
  users: User[];
}

type ViewType = "kanban" | "timeline" | "capacity";

export function ResourcesView({ briefs, users }: ResourcesViewProps) {
  const [activeView, setActiveView] = useState<ViewType>("kanban");

  const views: { id: ViewType; label: string }[] = [
    { id: "kanban", label: "Kanban" },
    { id: "timeline", label: "Timeline" },
    { id: "capacity", label: "Capacity" },
  ];

  return (
    <div className="space-y-6">
      {/* View toggle tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        {views.map((view) => (
          <button
            key={view.id}
            onClick={() => setActiveView(view.id)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors",
              activeView === view.id
                ? "text-[#1BA098] border-b-2 border-[#52EDC7]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            {view.label}
          </button>
        ))}
      </div>

      {/* View content */}
      {activeView === "kanban" && (
        <KanbanBoard briefs={briefs} />
      )}
      {activeView === "timeline" && (
        <GanttTimeline briefs={briefs} users={users} />
      )}
      {activeView === "capacity" && (
        <CapacityOverview users={users} briefs={briefs} />
      )}
    </div>
  );
}
