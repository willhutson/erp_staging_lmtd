"use client";

import { useState, useTransition } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Deal, Client, User } from "@prisma/client";
import {
  Calendar,
  DollarSign,
  User as UserIcon,
  UserPlus,
  Check,
  Loader2,
} from "lucide-react";
import { convertDealToClient } from "@/modules/crm/actions/client-actions";

type DealWithRelations = Deal & {
  client: Client | null;
  owner: User;
  convertedToClient?: Client | null;
};

interface DealCardProps {
  deal: DealWithRelations;
}

export function DealCard({ deal }: DealCardProps) {
  const [isPending, startTransition] = useTransition();
  const [isConverted, setIsConverted] = useState(!!deal.convertedToClient);

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

  const handleConvert = (e: React.MouseEvent) => {
    e.stopPropagation();
    startTransition(async () => {
      try {
        await convertDealToClient(deal.id);
        setIsConverted(true);
      } catch (error) {
        console.error("Failed to convert deal:", error);
      }
    });
  };

  const showConvertButton = deal.stage === "WON" && !isConverted;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-ltd-surface-overlay rounded-[var(--ltd-radius-md)] border border-ltd-border-1 p-3 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
    >
      <div className="space-y-2">
        <div>
          <p className="font-medium text-ltd-text-1 text-sm line-clamp-2">
            {deal.name}
          </p>
          <p className="text-xs text-ltd-text-2 mt-0.5">
            {deal.client?.name || deal.companyName || "No company"}
          </p>
        </div>

        <div className="flex items-center justify-between text-xs text-ltd-text-2">
          {deal.value && (
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              <span className="font-medium text-ltd-text-1">
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

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-xs text-ltd-text-3">
            <UserIcon className="w-3 h-3" />
            <span>{deal.owner.name.split(" ")[0]}</span>
          </div>

          {showConvertButton && (
            <button
              onClick={handleConvert}
              disabled={isPending}
              className="flex items-center gap-1 px-2 py-1 text-xs font-medium bg-ltd-primary text-ltd-primary-text rounded hover:bg-ltd-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-3 h-3 animate-spin" />
              ) : (
                <UserPlus className="w-3 h-3" />
              )}
              Convert to Client
            </button>
          )}

          {isConverted && deal.stage === "WON" && (
            <div className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-ltd-success bg-ltd-success/10 rounded">
              <Check className="w-3 h-3" />
              Converted
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
