"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  ArrowRight,
  
  XCircle,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

interface ScopeChangeListProps {
  scopeChanges: ScopeChange[];
  onAdd?: () => void;
}

const IMPACT_CONFIG: Record<ScopeChangeImpact, { label: string; color: string; icon: React.ReactNode }> = {
  MINOR: { label: "Minor", color: "bg-blue-100 text-blue-700", icon: <HelpCircle className="h-3 w-3" /> },
  MODERATE: { label: "Moderate", color: "bg-yellow-100 text-yellow-700", icon: <AlertCircle className="h-3 w-3" /> },
  MAJOR: { label: "Major", color: "bg-orange-100 text-orange-700", icon: <AlertTriangle className="h-3 w-3" /> },
  CRITICAL: { label: "Critical", color: "bg-red-100 text-red-700", icon: <XCircle className="h-3 w-3" /> },
};

const APPROVAL_CONFIG: Record<ScopeApprovalStatus, { label: string; color: string }> = {
  NOT_REQUIRED: { label: "No Approval Needed", color: "bg-gray-100 text-gray-600" },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
  DISPUTED: { label: "Disputed", color: "bg-red-100 text-red-700" },
};

function ScopeChangeCard({ change }: { change: ScopeChange }) {
  const [expanded, setExpanded] = useState(false);
  const impactConfig = IMPACT_CONFIG[change.impactLevel];
  const approvalConfig = APPROVAL_CONFIG[change.approvalStatus];

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={cn("p-1.5 rounded", impactConfig.color)}>
            {impactConfig.icon}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{change.title}</h4>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(change.createdAt), { addSuffix: true })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={impactConfig.color}>
            {impactConfig.label}
          </Badge>
          {change.requiresApproval && (
            <Badge variant="outline" className={approvalConfig.color}>
              {approvalConfig.label}
            </Badge>
          )}
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-gray-100 p-4 bg-gray-50 space-y-4">
          {/* Direction change */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white rounded-lg border border-gray-200">
              <p className="text-xs font-medium text-gray-500 mb-1">Original Direction</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{change.originalDirection}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-[#52EDC7]/30">
              <p className="text-xs font-medium text-[#1BA098] mb-1">New Direction</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{change.newDirection}</p>
            </div>
          </div>

          {/* Arrow indicator for mobile */}
          <div className="flex justify-center md:hidden">
            <ArrowRight className="h-5 w-5 text-gray-400 rotate-90" />
          </div>

          {/* Reason */}
          {change.reason && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-1">Reason for Change</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{change.reason}</p>
            </div>
          )}

          {/* Impact metrics */}
          <div className="grid grid-cols-3 gap-4">
            {change.hoursSpentBefore !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Hours Before</p>
                  <p className="text-sm font-medium">{change.hoursSpentBefore}h</p>
                </div>
              </div>
            )}
            {change.estimatedAdditionalHours !== null && (
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-400" />
                <div>
                  <p className="text-xs text-gray-500">Additional Hours</p>
                  <p className="text-sm font-medium text-orange-600">+{change.estimatedAdditionalHours}h</p>
                </div>
              </div>
            )}
            {change.costImpact !== null && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <div>
                  <p className="text-xs text-gray-500">Cost Impact</p>
                  <p className="text-sm font-medium text-red-600">
                    {new Intl.NumberFormat("en-AE", {
                      style: "currency",
                      currency: "AED",
                    }).format(change.costImpact)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Client notes */}
          {change.clientNotes && (
            <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
              <p className="text-xs font-medium text-blue-700 mb-1">Client Notes</p>
              <p className="text-sm text-blue-900 whitespace-pre-wrap">{change.clientNotes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ScopeChangeList({ scopeChanges, onAdd }: ScopeChangeListProps) {
  if (scopeChanges.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <AlertTriangle className="h-8 w-8 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-3">No scope changes recorded</p>
        {onAdd && (
          <Button variant="outline" size="sm" onClick={onAdd}>
            Record First Change
          </Button>
        )}
      </div>
    );
  }

  // Calculate summary stats
  const totalAdditionalHours = scopeChanges.reduce(
    (sum, c) => sum + (c.estimatedAdditionalHours ?? 0),
    0
  );
  const totalCostImpact = scopeChanges.reduce(
    (sum, c) => sum + (c.costImpact ?? 0),
    0
  );
  const pendingApprovals = scopeChanges.filter(
    (c) => c.requiresApproval && c.approvalStatus === "PENDING"
  ).length;

  return (
    <div className="space-y-4">
      {/* Summary bar */}
      <div className="flex flex-wrap gap-4 p-3 bg-gray-50 rounded-lg text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-500">Total Changes:</span>
          <span className="font-medium">{scopeChanges.length}</span>
        </div>
        {totalAdditionalHours > 0 && (
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-orange-500" />
            <span className="text-gray-500">Added Hours:</span>
            <span className="font-medium text-orange-600">+{totalAdditionalHours}h</span>
          </div>
        )}
        {totalCostImpact > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <span className="text-gray-500">Cost Impact:</span>
            <span className="font-medium text-red-600">
              {new Intl.NumberFormat("en-AE", {
                style: "currency",
                currency: "AED",
              }).format(totalCostImpact)}
            </span>
          </div>
        )}
        {pendingApprovals > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-yellow-500" />
            <span className="font-medium text-yellow-600">{pendingApprovals} pending approval</span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="space-y-3">
        {scopeChanges.map((change) => (
          <ScopeChangeCard key={change.id} change={change} />
        ))}
      </div>

      {/* Add button */}
      {onAdd && (
        <div className="pt-2">
          <Button variant="outline" className="w-full" onClick={onAdd}>
            + Record Another Change
          </Button>
        </div>
      )}
    </div>
  );
}
