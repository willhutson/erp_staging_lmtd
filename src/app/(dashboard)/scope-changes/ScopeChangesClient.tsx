"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GitBranch,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Building2,
  User,
  Filter,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { ScopeChangeImpact, ScopeApprovalStatus } from "@/modules/scope-changes/actions/scope-change-actions";
import type { Decimal } from "@prisma/client/runtime/library";

interface ScopeChange {
  id: string;
  title: string;
  originalDirection: string;
  newDirection: string;
  reason: string | null;
  impactLevel: ScopeChangeImpact;
  hoursSpentBefore: Decimal | null;
  estimatedAdditionalHours: Decimal | null;
  costImpact: Decimal | null;
  requiresApproval: boolean;
  approvalStatus: ScopeApprovalStatus;
  clientNotes: string | null;
  createdAt: Date;
  brief: {
    id: string;
    title: string;
    client: { id: string; name: string; code: string };
    assignee: { id: string; name: string } | null;
  };
}

interface ScopeChangesClientProps {
  scopeChanges: ScopeChange[];
}

const impactConfig: Record<ScopeChangeImpact, { label: string; color: string; icon: React.ReactNode }> = {
  MINOR: { label: "Minor", color: "bg-blue-100 text-blue-700", icon: <Info className="w-4 h-4" /> },
  MODERATE: { label: "Moderate", color: "bg-yellow-100 text-yellow-700", icon: <AlertCircle className="w-4 h-4" /> },
  MAJOR: { label: "Major", color: "bg-orange-100 text-orange-700", icon: <AlertTriangle className="w-4 h-4" /> },
  CRITICAL: { label: "Critical", color: "bg-red-100 text-red-700", icon: <AlertTriangle className="w-4 h-4" /> },
};

const approvalConfig: Record<ScopeApprovalStatus, { label: string; color: string }> = {
  NOT_REQUIRED: { label: "Not Required", color: "bg-gray-100 text-gray-600" },
  PENDING: { label: "Pending", color: "bg-yellow-100 text-yellow-700" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "bg-blue-100 text-blue-700" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
  DISPUTED: { label: "Disputed", color: "bg-red-100 text-red-700" },
};

export function ScopeChangesClient({ scopeChanges }: ScopeChangesClientProps) {
  const [filterImpact, setFilterImpact] = useState<ScopeChangeImpact | "ALL">("ALL");
  const [filterApproval, setFilterApproval] = useState<ScopeApprovalStatus | "ALL">("ALL");

  const filteredChanges = scopeChanges.filter((change) => {
    if (filterImpact !== "ALL" && change.impactLevel !== filterImpact) return false;
    if (filterApproval !== "ALL" && change.approvalStatus !== filterApproval) return false;
    return true;
  });

  // Summary stats
  const stats = {
    total: scopeChanges.length,
    pending: scopeChanges.filter((c) => c.approvalStatus === "PENDING").length,
    critical: scopeChanges.filter((c) => c.impactLevel === "CRITICAL" || c.impactLevel === "MAJOR").length,
    totalHoursAdded: scopeChanges.reduce((sum, c) => sum + (Number(c.estimatedAdditionalHours) || 0), 0),
    totalCostImpact: scopeChanges.reduce((sum, c) => sum + (Number(c.costImpact) || 0), 0),
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <GitBranch className="w-4 h-4" />
            Total Changes
          </div>
          <p className="text-2xl font-bold mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-yellow-600 text-sm">
            <Clock className="w-4 h-4" />
            Pending Approval
          </div>
          <p className="text-2xl font-bold mt-1">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-red-600 text-sm">
            <AlertTriangle className="w-4 h-4" />
            High Impact
          </div>
          <p className="text-2xl font-bold mt-1">{stats.critical}</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-blue-600 text-sm">
            <Clock className="w-4 h-4" />
            Hours Added
          </div>
          <p className="text-2xl font-bold mt-1">{stats.totalHoursAdded}h</p>
        </div>
        <div className="bg-white rounded-lg border p-4">
          <div className="flex items-center gap-2 text-green-600 text-sm">
            <DollarSign className="w-4 h-4" />
            Cost Impact
          </div>
          <p className="text-2xl font-bold mt-1">
            ${stats.totalCostImpact.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white rounded-lg border p-4">
        <Filter className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Impact:</span>
          <select
            value={filterImpact}
            onChange={(e) => setFilterImpact(e.target.value as ScopeChangeImpact | "ALL")}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="ALL">All</option>
            <option value="MINOR">Minor</option>
            <option value="MODERATE">Moderate</option>
            <option value="MAJOR">Major</option>
            <option value="CRITICAL">Critical</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Status:</span>
          <select
            value={filterApproval}
            onChange={(e) => setFilterApproval(e.target.value as ScopeApprovalStatus | "ALL")}
            className="text-sm border rounded px-2 py-1"
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="ACKNOWLEDGED">Acknowledged</option>
            <option value="APPROVED">Approved</option>
            <option value="DISPUTED">Disputed</option>
            <option value="NOT_REQUIRED">Not Required</option>
          </select>
        </div>
        <span className="text-sm text-gray-400">
          Showing {filteredChanges.length} of {scopeChanges.length}
        </span>
      </div>

      {/* Scope Changes List */}
      {filteredChanges.length === 0 ? (
        <div className="bg-white rounded-lg border p-12 text-center">
          <GitBranch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No scope changes</h3>
          <p className="text-gray-500 mt-1">
            Scope changes will appear here when projects deviate from their original direction.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChanges.map((change) => {
            const impact = impactConfig[change.impactLevel];
            const approval = approvalConfig[change.approvalStatus];

            return (
              <div key={change.id} className="bg-white rounded-lg border p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", impact.color)}>
                        {impact.icon}
                        {impact.label}
                      </span>
                      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium", approval.color)}>
                        {change.approvalStatus === "APPROVED" && <CheckCircle className="w-3 h-3" />}
                        {approval.label}
                      </span>
                    </div>

                    <h3 className="font-semibold text-gray-900 mb-1">{change.title}</h3>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                      <Link
                        href={`/briefs/${change.brief.id}`}
                        className="flex items-center gap-1 hover:text-[#52EDC7]"
                      >
                        <FileText className="w-4 h-4" />
                        {change.brief.title}
                      </Link>
                      <span className="flex items-center gap-1">
                        <Building2 className="w-4 h-4" />
                        {change.brief.client.name}
                      </span>
                      {change.brief.assignee && (
                        <span className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {change.brief.assignee.name}
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 rounded-lg p-3 text-sm">
                      <div>
                        <p className="text-gray-500 font-medium mb-1">Original Direction</p>
                        <p className="text-gray-700">{change.originalDirection}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 font-medium mb-1">New Direction</p>
                        <p className="text-gray-700">{change.newDirection}</p>
                      </div>
                    </div>

                    {change.reason && (
                      <p className="text-sm text-gray-600 mt-3">
                        <span className="font-medium">Reason:</span> {change.reason}
                      </p>
                    )}
                  </div>

                  <div className="text-right text-sm space-y-1">
                    {change.estimatedAdditionalHours && (
                      <div className="text-gray-500">
                        +{Number(change.estimatedAdditionalHours)}h added
                      </div>
                    )}
                    {change.costImpact && (
                      <div className="text-gray-500">
                        ${Number(change.costImpact).toLocaleString()} impact
                      </div>
                    )}
                    <div className="text-gray-400 text-xs">
                      {new Date(change.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
