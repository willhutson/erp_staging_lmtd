"use client";

import { useState, useTransition } from "react";
import { Check, Circle, Loader2, Plus, Clock, AlertCircle } from "lucide-react";
import type { RFPSubitem, SubitemStatus } from "@prisma/client";
import { cn } from "@/lib/utils";

interface RFPSubitemListProps {
  rfpId: string;
  subitems: RFPSubitem[];
  canEdit: boolean;
}

const statusConfig: Record<SubitemStatus, { icon: typeof Check; color: string; label: string }> = {
  PENDING: { icon: Circle, color: "text-ltd-text-3", label: "Pending" },
  IN_PROGRESS: { icon: Clock, color: "text-ltd-primary", label: "In Progress" },
  COMPLETED: { icon: Check, color: "text-ltd-success", label: "Completed" },
  BLOCKED: { icon: AlertCircle, color: "text-ltd-error", label: "Blocked" },
};

export function RFPSubitemList({ rfpId, subitems, canEdit }: RFPSubitemListProps) {
  const [items, setItems] = useState(subitems);
  const [isPending, startTransition] = useTransition();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = (itemId: string, newStatus: SubitemStatus) => {
    setUpdatingId(itemId);
    // Optimistic update
    setItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, status: newStatus } : item
      )
    );

    // In a real app, this would call a server action
    startTransition(async () => {
      // await updateSubitemStatus(itemId, newStatus);
      setUpdatingId(null);
    });
  };

  const cycleStatus = (currentStatus: SubitemStatus): SubitemStatus => {
    const order: SubitemStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];
    const currentIndex = order.indexOf(currentStatus);
    return order[(currentIndex + 1) % order.length];
  };

  if (items.length === 0) {
    return (
      <div className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ltd-text-1">Tasks</h2>
        </div>
        <p className="text-sm text-ltd-text-3 text-center py-4">
          No tasks defined for this RFP
        </p>
      </div>
    );
  }

  return (
    <div className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1">
      <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-ltd-text-1">Tasks</h2>
          <span className="text-xs text-ltd-text-3 bg-ltd-surface-3 px-2 py-0.5 rounded-full">
            {items.filter((i) => i.status === "COMPLETED").length}/{items.length}
          </span>
        </div>
      </div>

      <div className="divide-y divide-ltd-border-1">
        {items.map((item) => {
          const config = statusConfig[item.status];
          const StatusIcon = config.icon;
          const isUpdating = updatingId === item.id;

          return (
            <div
              key={item.id}
              className="flex items-center gap-4 p-4 hover:bg-ltd-surface-2 transition-colors"
            >
              <button
                onClick={() => canEdit && handleStatusChange(item.id, cycleStatus(item.status))}
                disabled={!canEdit || isUpdating}
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  item.status === "COMPLETED"
                    ? "bg-ltd-success border-ltd-success"
                    : "border-ltd-border-2 hover:border-ltd-primary",
                  !canEdit && "opacity-50 cursor-not-allowed"
                )}
              >
                {isUpdating ? (
                  <Loader2 className="w-3 h-3 animate-spin text-ltd-text-2" />
                ) : item.status === "COMPLETED" ? (
                  <Check className="w-3 h-3 text-white" />
                ) : null}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "font-medium text-sm",
                    item.status === "COMPLETED"
                      ? "text-ltd-text-3 line-through"
                      : "text-ltd-text-1"
                  )}
                >
                  {item.name}
                </p>
                {item.description && (
                  <p className="text-xs text-ltd-text-3 mt-0.5 truncate">
                    {item.description}
                  </p>
                )}
              </div>

              {item.dueDate && (
                <span className="text-xs text-ltd-text-3">
                  {new Date(item.dueDate).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              )}

              <span
                className={cn(
                  "text-xs px-2 py-0.5 rounded-full",
                  item.status === "COMPLETED" && "bg-ltd-success/10 text-ltd-success",
                  item.status === "IN_PROGRESS" && "bg-ltd-primary/10 text-ltd-primary",
                  item.status === "PENDING" && "bg-ltd-surface-3 text-ltd-text-3",
                  item.status === "BLOCKED" && "bg-ltd-error/10 text-ltd-error"
                )}
              >
                {config.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
