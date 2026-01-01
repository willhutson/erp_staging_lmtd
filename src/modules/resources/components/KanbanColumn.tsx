"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Brief, Client, User, BriefStatus } from "@prisma/client";
import { KanbanCard } from "./KanbanCard";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: BriefStatus;
  title: string;
  briefs: (Brief & { client: Client; assignee: User | null; createdBy: User })[];
  color: string;
}

export function KanbanColumn({ id, title, briefs, color }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        "flex flex-col min-w-[280px] max-w-[280px] bg-gray-50 rounded-lg",
        isOver && "ring-2 ring-[#52EDC7]"
      )}
    >
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={cn("w-3 h-3 rounded-full", color)} />
          <h3 className="font-medium text-gray-900 text-sm">{title}</h3>
          <span className="ml-auto text-xs text-gray-500 bg-gray-200 px-1.5 py-0.5 rounded">
            {briefs.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 p-2 space-y-2 min-h-[200px] overflow-y-auto"
      >
        <SortableContext
          items={briefs.map((b) => b.id)}
          strategy={verticalListSortingStrategy}
        >
          {briefs.map((brief) => (
            <KanbanCard key={brief.id} brief={brief} />
          ))}
        </SortableContext>

        {briefs.length === 0 && (
          <div className="text-center py-8 text-gray-400 text-sm">
            No briefs
          </div>
        )}
      </div>
    </div>
  );
}
