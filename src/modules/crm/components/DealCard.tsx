"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Deal, Client, User } from "@prisma/client";
import { Calendar, DollarSign, User as UserIcon } from "lucide-react";

type DealWithRelations = Deal & {
  client: Client | null;
  owner: User;
};

interface DealCardProps {
  deal: DealWithRelations;
}

export function DealCard({ deal }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: deal.currency || "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

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
            {deal.name}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {deal.client?.name || deal.companyName || "No company"}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          {deal.value && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium text-gray-900">
                {formatCurrency(Number(deal.value))}
              </span>
            </div>
          )}

          {deal.expectedCloseDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>
                {new Date(deal.expectedCloseDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-400">
          <UserIcon className="w-3 h-3" />
          <span>{deal.owner.name.split(" ")[0]}</span>
        </div>
      </div>
    </div>
  );
}
