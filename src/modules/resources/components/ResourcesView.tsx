"use client";

import { useState, useMemo } from "react";
import type { Brief, Client, User } from "@prisma/client";
import { KanbanBoard } from "./KanbanBoard";
import { GanttTimeline } from "./GanttTimeline";
import { CapacityOverview } from "./CapacityOverview";
import { FilterBar, type FilterState } from "./FilterBar";
import { cn } from "@/lib/utils";

type BriefWithRelations = Brief & {
  client: Client;
  assignee: User | null;
  createdBy: User;
};

interface ResourcesViewProps {
  briefs: BriefWithRelations[];
  users: User[];
  clients: Client[];
}

type ViewType = "kanban" | "timeline" | "capacity";

const initialFilters: FilterState = {
  assigneeId: null,
  clientId: null,
  briefType: null,
  briefedById: null,
};

export function ResourcesView({ briefs, users, clients }: ResourcesViewProps) {
  const [activeView, setActiveView] = useState<ViewType>("kanban");
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  // Filter briefs based on active filters
  const filteredBriefs = useMemo(() => {
    return briefs.filter((brief) => {
      if (filters.assigneeId && brief.assigneeId !== filters.assigneeId) {
        return false;
      }
      if (filters.clientId && brief.clientId !== filters.clientId) {
        return false;
      }
      if (filters.briefType && brief.type !== filters.briefType) {
        return false;
      }
      if (filters.briefedById && brief.createdById !== filters.briefedById) {
        return false;
      }
      return true;
    });
  }, [briefs, filters]);

  const views: { id: ViewType; label: string }[] = [
    { id: "kanban", label: "Kanban" },
    { id: "timeline", label: "Timeline" },
    { id: "capacity", label: "Capacity" },
  ];

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        clients={clients}
        users={users}
      />

      {/* View toggle tabs */}
      <div className="flex items-center justify-between">
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

        {/* Brief count */}
        <span className="text-sm text-gray-500">
          {filteredBriefs.length} of {briefs.length} briefs
        </span>
      </div>

      {/* View content */}
      {activeView === "kanban" && <KanbanBoard briefs={filteredBriefs} />}
      {activeView === "timeline" && (
        <GanttTimeline briefs={filteredBriefs} users={users} />
      )}
      {activeView === "capacity" && (
        <CapacityOverview users={users} briefs={filteredBriefs} />
      )}
    </div>
  );
}
