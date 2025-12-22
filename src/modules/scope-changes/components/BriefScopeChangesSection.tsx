"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScopeChangeList } from "./ScopeChangeList";
import { ScopeChangeForm } from "./ScopeChangeForm";

type ScopeChangeImpact = "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL";
type ScopeApprovalStatus = "NOT_REQUIRED" | "PENDING" | "ACKNOWLEDGED" | "APPROVED" | "DISPUTED";

interface ScopeChange {
  id: string;
  title: string;
  originalDirection: string;
  newDirection: string;
  reason: string | null;
  impactLevel: ScopeChangeImpact;
  hoursSpentBefore: number | null;
  estimatedAdditionalHours: number | null;
  costImpact: number | null;
  requiresApproval: boolean;
  approvalStatus: ScopeApprovalStatus;
  clientNotes: string | null;
  createdAt: Date;
}

interface BriefScopeChangesSectionProps {
  briefId: string;
  scopeChanges: ScopeChange[];
  canEdit?: boolean;
}

export function BriefScopeChangesSection({
  briefId,
  scopeChanges,
  canEdit = true,
}: BriefScopeChangesSectionProps) {
  const [expanded, setExpanded] = useState(scopeChanges.length > 0);
  const [showForm, setShowForm] = useState(false);

  const hasChanges = scopeChanges.length > 0;
  const pendingCount = scopeChanges.filter(
    (c) => c.requiresApproval && c.approvalStatus === "PENDING"
  ).length;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${hasChanges ? "bg-orange-100" : "bg-gray-100"}`}>
            <AlertTriangle className={`h-5 w-5 ${hasChanges ? "text-orange-600" : "text-gray-400"}`} />
          </div>
          <div className="text-left">
            <h2 className="text-lg font-semibold text-gray-900">Scope Changes</h2>
            <p className="text-sm text-gray-500">
              {hasChanges
                ? `${scopeChanges.length} change${scopeChanges.length !== 1 ? "s" : ""} recorded`
                : "No scope changes recorded"}
              {pendingCount > 0 && (
                <span className="ml-2 text-yellow-600">
                  ({pendingCount} pending approval)
                </span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {canEdit && !expanded && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setExpanded(true);
                setShowForm(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
          {expanded ? (
            <ChevronUp className="h-5 w-5 text-gray-400" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Content */}
      {expanded && (
        <div className="px-6 pb-6 space-y-4">
          {/* Add Form */}
          {showForm && canEdit && (
            <div className="border border-[#52EDC7]/30 rounded-lg p-4 bg-[#52EDC7]/5">
              <ScopeChangeForm
                briefId={briefId}
                onSuccess={() => setShowForm(false)}
                onCancel={() => setShowForm(false)}
              />
            </div>
          )}

          {/* List */}
          {!showForm && (
            <ScopeChangeList
              scopeChanges={scopeChanges}
              onAdd={canEdit ? () => setShowForm(true) : undefined}
            />
          )}

          {/* Add button if list is showing and has items */}
          {!showForm && hasChanges && canEdit && (
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Record Scope Change
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
