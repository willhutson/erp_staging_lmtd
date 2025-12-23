"use client";

import { useState, useTransition } from "react";
import { User, ChevronDown, Check, Loader2 } from "lucide-react";
import { updateBriefAssignee } from "../actions/update-brief";
import { cn } from "@/lib/utils";

interface UserInfo {
  id: string;
  name: string | null;
}

interface AssigneeSelectorProps {
  briefId: string;
  currentAssignee: UserInfo | null;
  assignedBy?: UserInfo | null;
  assignedAt?: Date | null;
  availableUsers: UserInfo[];
  canEdit: boolean;
}

export function AssigneeSelector({
  briefId,
  currentAssignee,
  assignedBy,
  assignedAt,
  availableUsers,
  canEdit,
}: AssigneeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSelect = (userId: string | null) => {
    if (userId === currentAssignee?.id) {
      setIsOpen(false);
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await updateBriefAssignee(briefId, userId);
        setIsOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update assignee");
      }
    });
  };

  const formatAssignmentInfo = () => {
    if (!assignedBy || !assignedAt) return null;
    const date = new Date(assignedAt).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
    return `by ${assignedBy.name} on ${date}`;
  };

  if (!canEdit) {
    return (
      <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
        <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
          <User className="w-4 h-4" />
          <span className="text-sm">Assignee</span>
        </div>
        <p className="font-medium text-ltd-text-1">
          {currentAssignee?.name || "Unassigned"}
        </p>
        {formatAssignmentInfo() && (
          <p className="text-xs text-ltd-text-3 mt-1">
            Assigned {formatAssignmentInfo()}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="w-full bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4 text-left hover:border-ltd-border-2 transition-colors"
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
              <User className="w-4 h-4" />
              <span className="text-sm">Assignee</span>
            </div>
            <p className="font-medium text-ltd-text-1 flex items-center gap-2">
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Updating...
                </>
              ) : (
                currentAssignee?.name || "Unassigned"
              )}
            </p>
            {!isPending && formatAssignmentInfo() && (
              <p className="text-xs text-ltd-text-3">
                Assigned {formatAssignmentInfo()}
              </p>
            )}
          </div>
          <ChevronDown
            className={cn(
              "w-4 h-4 text-ltd-text-2 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {error && (
        <p className="text-sm text-red-500 mt-1">{error}</p>
      )}

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 shadow-lg z-20 max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => handleSelect(null)}
              className={cn(
                "w-full px-4 py-2 text-left hover:bg-ltd-surface-3 flex items-center justify-between",
                !currentAssignee && "bg-ltd-surface-3"
              )}
            >
              <span className="text-ltd-text-2">Unassigned</span>
              {!currentAssignee && <Check className="w-4 h-4 text-ltd-primary" />}
            </button>
            {availableUsers.map((user) => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleSelect(user.id)}
                className={cn(
                  "w-full px-4 py-2 text-left hover:bg-ltd-surface-3 flex items-center justify-between",
                  user.id === currentAssignee?.id && "bg-ltd-surface-3"
                )}
              >
                <span className="text-ltd-text-1">{user.name}</span>
                {user.id === currentAssignee?.id && (
                  <Check className="w-4 h-4 text-ltd-primary" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
