"use client";

import { useState } from "react";
import Link from "next/link";
import type { BuilderTemplate, BuilderTemplateType, TemplateStatus } from "@prisma/client";
import {
  Plus,
  Search,
  FileText,
  Workflow,
  LayoutDashboard,
  BarChart,
  Brain,
  ClipboardList,
  Bell,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
  Archive,
  Hammer,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TemplateCounts {
  templateType: BuilderTemplateType;
  _count: { id: number };
}

interface BuilderDashboardProps {
  templates: BuilderTemplate[];
  templateCounts: TemplateCounts[];
  pendingCount: number;
}

const templateTypeConfig: Record<BuilderTemplateType, { label: string; icon: typeof FileText; color: string }> = {
  BRIEF_TEMPLATE: { label: "Brief Templates", icon: FileText, color: "text-blue-600 bg-blue-50" },
  WORKFLOW: { label: "Workflows", icon: Workflow, color: "text-purple-600 bg-purple-50" },
  DASHBOARD_WIDGET: { label: "Dashboard Widgets", icon: LayoutDashboard, color: "text-green-600 bg-green-50" },
  REPORT_TEMPLATE: { label: "Report Templates", icon: BarChart, color: "text-amber-600 bg-amber-50" },
  AI_SKILL_CONFIG: { label: "AI Skills", icon: Brain, color: "text-pink-600 bg-pink-50" },
  FORM_TEMPLATE: { label: "Form Templates", icon: ClipboardList, color: "text-indigo-600 bg-indigo-50" },
  NOTIFICATION_TEMPLATE: { label: "Notification Templates", icon: Bell, color: "text-orange-600 bg-orange-50" },
};

const statusConfig: Record<TemplateStatus, { label: string; icon: typeof Clock; color: string }> = {
  DRAFT: { label: "Draft", icon: Clock, color: "text-gray-600 bg-gray-100" },
  PENDING_APPROVAL: { label: "Pending Approval", icon: AlertCircle, color: "text-amber-600 bg-amber-100" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-blue-600 bg-blue-100" },
  PUBLISHED: { label: "Published", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
  DEPRECATED: { label: "Deprecated", icon: Archive, color: "text-gray-500 bg-gray-100" },
};

const moduleLabels: Record<string, string> = {
  agency: "Agency",
  crm: "CRM",
  content: "Content Engine",
  team: "Team",
  messaging: "Messaging",
  insights: "Insights",
};

export function BuilderDashboard({ templates, templateCounts, pendingCount }: BuilderDashboardProps) {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<BuilderTemplateType | "ALL">("ALL");
  const [statusFilter, setStatusFilter] = useState<TemplateStatus | "ALL">("ALL");
  const [moduleFilter, setModuleFilter] = useState<string>("ALL");

  const filteredTemplates = templates.filter((template) => {
    const matchesSearch =
      search === "" ||
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.description?.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === "ALL" || template.templateType === typeFilter;
    const matchesStatus = statusFilter === "ALL" || template.status === statusFilter;
    const matchesModule = moduleFilter === "ALL" || template.module === moduleFilter;

    return matchesSearch && matchesType && matchesStatus && matchesModule;
  });

  // Get unique modules from templates
  const modules = Array.from(new Set(templates.map((t) => t.module)));

  // Calculate counts for quick filters
  const getCountForType = (type: BuilderTemplateType) => {
    return templateCounts.find((c) => c.templateType === type)?._count.id || 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#52EDC7]/10 flex items-center justify-center">
            <Hammer className="w-5 h-5 text-[#1BA098]" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Builder</h1>
            <p className="text-gray-500 text-sm">Configure templates, workflows, and automations</p>
          </div>
        </div>
        <Link
          href="/admin/builder/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#1BA098] hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      </div>

      {/* Pending Approval Banner */}
      {pendingCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <span className="text-amber-800">
              <strong>{pendingCount}</strong> template{pendingCount === 1 ? "" : "s"} pending approval
            </span>
          </div>
          <button
            onClick={() => setStatusFilter("PENDING_APPROVAL")}
            className="text-sm font-medium text-amber-700 hover:text-amber-900"
          >
            Review now
          </button>
        </div>
      )}

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(templateTypeConfig).map(([type, config]) => {
          const count = getCountForType(type as BuilderTemplateType);
          const Icon = config.icon;
          const isSelected = typeFilter === type;

          return (
            <button
              key={type}
              onClick={() => setTypeFilter(isSelected ? "ALL" : (type as BuilderTemplateType))}
              className={cn(
                "p-3 rounded-lg border transition-all text-left",
                isSelected
                  ? "border-[#52EDC7] bg-[#52EDC7]/5"
                  : "border-gray-200 bg-white hover:border-gray-300"
              )}
            >
              <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2", config.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-medium text-gray-900 text-sm">{count}</p>
              <p className="text-xs text-gray-500 truncate">{config.label}</p>
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as TemplateStatus | "ALL")}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] bg-white"
        >
          <option value="ALL">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="PENDING_APPROVAL">Pending Approval</option>
          <option value="PUBLISHED">Published</option>
          <option value="DEPRECATED">Deprecated</option>
        </select>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] bg-white"
        >
          <option value="ALL">All Modules</option>
          {modules.map((module) => (
            <option key={module} value={module}>
              {moduleLabels[module] || module}
            </option>
          ))}
        </select>

        {(typeFilter !== "ALL" || statusFilter !== "ALL" || moduleFilter !== "ALL") && (
          <button
            onClick={() => {
              setTypeFilter("ALL");
              setStatusFilter("ALL");
              setModuleFilter("ALL");
            }}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 text-sm"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Templates List */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          hasFilters={typeFilter !== "ALL" || statusFilter !== "ALL" || moduleFilter !== "ALL" || search !== ""}
        />
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="divide-y divide-gray-100">
            {filteredTemplates.map((template) => (
              <TemplateRow key={template.id} template={template} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateRow({ template }: { template: BuilderTemplate }) {
  const typeConfig = templateTypeConfig[template.templateType];
  const statusConf = statusConfig[template.status];
  const Icon = typeConfig.icon;
  const StatusIcon = statusConf.icon;

  return (
    <Link
      href={`/admin/builder/${template.id}`}
      className="flex items-center justify-between px-4 py-4 hover:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center", typeConfig.color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="font-medium text-gray-900">{template.name}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
            <span>{typeConfig.label}</span>
            <span className="text-gray-300">|</span>
            <span>{moduleLabels[template.module] || template.module}</span>
            <span className="text-gray-300">|</span>
            <span>v{template.version}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            statusConf.color
          )}
        >
          <StatusIcon className="w-3 h-3" />
          {statusConf.label}
        </span>
        <span className="text-xs text-gray-400">
          {new Date(template.updatedAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </Link>
  );
}

function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
      <Hammer className="w-12 h-12 mx-auto text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasFilters ? "No templates match your filters" : "No templates yet"}
      </h3>
      <p className="text-gray-500 text-sm mb-4">
        {hasFilters
          ? "Try adjusting your search or filters"
          : "Create your first template to configure the platform"}
      </p>
      {!hasFilters && (
        <Link
          href="/admin/builder/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#1BA098] hover:text-white transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Template
        </Link>
      )}
    </div>
  );
}
