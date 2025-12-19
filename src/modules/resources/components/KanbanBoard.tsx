"use client";

import { useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import type { Brief, Client, User, BriefStatus } from "@prisma/client";
import { KanbanColumn } from "./KanbanColumn";
import { KanbanCard } from "./KanbanCard";
import { updateBriefStatus } from "../actions/update-brief-status";

type BriefWithRelations = Brief & { client: Client; assignee: User | null };

interface KanbanBoardProps {
  briefs: BriefWithRelations[];
}

const columns: { id: BriefStatus; title: string; color: string }[] = [
  { id: "SUBMITTED", title: "Submitted", color: "bg-blue-500" },
  { id: "IN_REVIEW", title: "In Review", color: "bg-yellow-500" },
  { id: "APPROVED", title: "Approved", color: "bg-green-500" },
  { id: "IN_PROGRESS", title: "In Progress", color: "bg-purple-500" },
  { id: "INTERNAL_REVIEW", title: "Internal Review", color: "bg-orange-500" },
  { id: "CLIENT_REVIEW", title: "Client Review", color: "bg-pink-500" },
  { id: "COMPLETED", title: "Completed", color: "bg-emerald-500" },
];

export function KanbanBoard({ briefs: initialBriefs }: KanbanBoardProps) {
  const [briefs, setBriefs] = useState(initialBriefs);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeBrief = activeId ? briefs.find((b) => b.id === activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const briefId = active.id as string;
    const newStatus = over.id as BriefStatus;

    const brief = briefs.find((b) => b.id === briefId);
    if (!brief || brief.status === newStatus) return;

    // Optimistically update UI
    setBriefs((prev) =>
      prev.map((b) => (b.id === briefId ? { ...b, status: newStatus } : b))
    );

    // Update in database
    try {
      await updateBriefStatus(briefId, newStatus);
    } catch (error) {
      // Revert on error
      setBriefs((prev) =>
        prev.map((b) => (b.id === briefId ? { ...b, status: brief.status } : b))
      );
      console.error("Failed to update status:", error);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            id={column.id}
            title={column.title}
            color={column.color}
            briefs={briefs.filter((b) => b.status === column.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeBrief && <KanbanCard brief={activeBrief} />}
      </DragOverlay>
    </DndContext>
  );
}
