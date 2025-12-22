"use client";

import { useState, useTransition } from "react";
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
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";
import type { Deal, Client, User, DealStage } from "@prisma/client";
import { DealCard } from "./DealCard";
import { updateDealStage } from "../actions/deal-actions";
import { cn } from "@/lib/utils";

type DealWithRelations = Deal & {
  client: Client | null;
  owner: User;
};

interface DealPipelineProps {
  deals: DealWithRelations[];
}

const stages: { id: DealStage; label: string; color: string }[] = [
  { id: "LEAD", label: "Lead", color: "bg-ltd-surface-2" },
  { id: "PITCH", label: "Pitch", color: "bg-blue-500/10 dark:bg-blue-500/20" },
  { id: "NEGOTIATION", label: "Negotiation", color: "bg-purple-500/10 dark:bg-purple-500/20" },
  { id: "WON", label: "Won", color: "bg-ltd-success/10" },
  { id: "LOST", label: "Lost", color: "bg-ltd-error/10" },
];

function PipelineColumn({
  stage,
  deals,
  totalValue,
}: {
  stage: { id: DealStage; label: string; color: string };
  deals: DealWithRelations[];
  totalValue: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `AED ${(value / 1000).toFixed(0)}K`;
    }
    return `AED ${value}`;
  };

  return (
    <div className={cn("flex-shrink-0 w-72 rounded-[var(--ltd-radius-lg)]", stage.color)}>
      <div className="p-3 border-b border-ltd-border-1">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-ltd-text-1 text-sm">{stage.label}</h3>
          <span className="text-xs text-ltd-text-2 bg-ltd-surface-overlay px-2 py-0.5 rounded-full">
            {deals.length}
          </span>
        </div>
        {totalValue > 0 && (
          <p className="text-xs text-ltd-text-2 mt-1">
            {formatCurrency(totalValue)}
          </p>
        )}
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "p-2 space-y-2 min-h-[300px] transition-colors",
          isOver && "bg-ltd-surface-3/50"
        )}
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="text-center py-8 text-sm text-ltd-text-3">
            No deals
          </div>
        )}
      </div>
    </div>
  );
}

export function DealPipeline({ deals: initialDeals }: DealPipelineProps) {
  const [deals, setDeals] = useState(initialDeals);
  const [activeDeal, setActiveDeal] = useState<DealWithRelations | null>(null);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor)
  );

  const getDealsByStage = (stage: DealStage) => {
    return deals.filter((d) => d.stage === stage);
  };

  const getStageValue = (stage: DealStage) => {
    return getDealsByStage(stage).reduce(
      (sum, d) => sum + Number(d.value || 0),
      0
    );
  };

  const handleDragStart = (event: DragStartEvent) => {
    const deal = deals.find((d) => d.id === event.active.id);
    if (deal) {
      setActiveDeal(deal);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = active.id as string;
    const newStage = over.id as DealStage;

    const deal = deals.find((d) => d.id === dealId);
    if (!deal || deal.stage === newStage) return;

    // Optimistic update
    setDeals((prev) =>
      prev.map((d) => (d.id === dealId ? { ...d, stage: newStage } : d))
    );

    // Server update
    startTransition(async () => {
      try {
        await updateDealStage(dealId, newStage);
      } catch {
        // Revert on error
        setDeals((prev) =>
          prev.map((d) => (d.id === dealId ? { ...d, stage: deal.stage } : d))
        );
      }
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map((stage) => (
          <PipelineColumn
            key={stage.id}
            stage={stage}
            deals={getDealsByStage(stage.id)}
            totalValue={getStageValue(stage.id)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeDeal && <DealCard deal={activeDeal} />}
      </DragOverlay>
    </DndContext>
  );
}
