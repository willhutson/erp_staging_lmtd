"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BuilderTemplate, BuilderTemplateType, TemplateStatus, BuilderAuditAction } from "@prisma/client";
import {
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
  Upload,
  History,
  FileText,
  Workflow,
  LayoutDashboard,
  BarChart,
  Brain,
  ClipboardList,
  Bell,
  Clock,
  AlertCircle,
  Archive,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateTemplate, submitForApproval, approveTemplate, publishTemplate } from "../actions";

interface AuditLog {
  id: string;
  action: BuilderAuditAction;
  performedAt: Date;
  performedByName: string;
  notes: string | null;
}

interface TemplateEditorProps {
  template: BuilderTemplate;
  auditLogs: AuditLog[];
}

const templateTypeConfig: Record<BuilderTemplateType, { label: string; icon: typeof FileText }> = {
  BRIEF_TEMPLATE: { label: "Brief Template", icon: FileText },
  WORKFLOW: { label: "Workflow", icon: Workflow },
  DASHBOARD_WIDGET: { label: "Dashboard Widget", icon: LayoutDashboard },
  REPORT_TEMPLATE: { label: "Report Template", icon: BarChart },
  AI_SKILL_CONFIG: { label: "AI Skill", icon: Brain },
  FORM_TEMPLATE: { label: "Form Template", icon: ClipboardList },
  NOTIFICATION_TEMPLATE: { label: "Notification Template", icon: Bell },
};

const statusConfig: Record<TemplateStatus, { label: string; icon: typeof Clock; color: string }> = {
  DRAFT: { label: "Draft", icon: Clock, color: "text-gray-600 bg-gray-100" },
  PENDING_APPROVAL: { label: "Pending Approval", icon: AlertCircle, color: "text-amber-600 bg-amber-100" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-blue-600 bg-blue-100" },
  PUBLISHED: { label: "Published", icon: CheckCircle2, color: "text-green-600 bg-green-100" },
  DEPRECATED: { label: "Deprecated", icon: Archive, color: "text-gray-500 bg-gray-100" },
};

const actionLabels: Record<BuilderAuditAction, string> = {
  CREATED: "Created",
  UPDATED: "Updated",
  SUBMITTED: "Submitted for approval",
  APPROVED: "Approved",
  REJECTED: "Rejected",
  PUBLISHED: "Published",
  DEPRECATED: "Deprecated",
  RESTORED: "Restored",
};

export function TemplateEditor({ template, auditLogs }: TemplateEditorProps) {
  const router = useRouter();
  const [name, setName] = useState(template.name);
  const [description, setDescription] = useState(template.description || "");
  const [definition, setDefinition] = useState(JSON.stringify(template.definition, null, 2));
  const [isSaving, setIsSaving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const typeConfig = templateTypeConfig[template.templateType];
  const statusConf = statusConfig[template.status];
  const TypeIcon = typeConfig.icon;
  const StatusIcon = statusConf.icon;

  const hasChanges =
    name !== template.name ||
    description !== (template.description || "") ||
    definition !== JSON.stringify(template.definition, null, 2);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);

    try {
      let parsedDefinition;
      try {
        parsedDefinition = JSON.parse(definition);
      } catch {
        throw new Error("Invalid JSON in definition");
      }

      await updateTemplate({
        id: template.id,
        name,
        description: description || undefined,
        definition: parsedDefinition,
      });

      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await submitForApproval(template.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      await approveTemplate(template.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setIsApproving(false);
    }
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    setError(null);

    try {
      await publishTemplate(template.id);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin/builder"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Builder
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <TypeIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">{template.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-sm text-gray-500">{typeConfig.label}</span>
                <span className="text-gray-300">|</span>
                <span className="text-sm text-gray-500">v{template.version}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium",
              statusConf.color
            )}
          >
            <StatusIcon className="w-4 h-4" />
            {statusConf.label}
          </span>

          <button
            onClick={() => setShowHistory(!showHistory)}
            className={cn(
              "p-2 rounded-lg transition-colors",
              showHistory ? "bg-gray-100" : "hover:bg-gray-100"
            )}
          >
            <History className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        {/* Main Editor */}
        <div className={cn("space-y-6", showHistory ? "col-span-8" : "col-span-12")}>
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h2 className="font-medium text-gray-900">Basic Information</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Definition Editor */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="font-medium text-gray-900">Template Definition</h2>
              <p className="text-sm text-gray-500 mt-1">JSON schema defining the template behavior</p>
            </div>
            <div className="p-4">
              <textarea
                value={definition}
                onChange={(e) => setDefinition(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 font-mono text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent resize-y"
                spellCheck={false}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {template.status === "DRAFT" && (
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || hasChanges}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Submitting..." : "Submit for Approval"}
                </button>
              )}

              {template.status === "PENDING_APPROVAL" && (
                <button
                  onClick={handleApprove}
                  disabled={isApproving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isApproving ? "Approving..." : "Approve"}
                </button>
              )}

              {["DRAFT", "APPROVED"].includes(template.status) && (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing || hasChanges}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="w-4 h-4" />
                  {isPublishing ? "Publishing..." : "Publish"}
                </button>
              )}
            </div>

            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-6 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        {/* History Sidebar */}
        {showHistory && (
          <div className="col-span-4">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden sticky top-6">
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-medium text-gray-900">History</h3>
              </div>
              <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
                {auditLogs.map((log) => (
                  <div key={log.id} className="px-4 py-3">
                    <p className="text-sm font-medium text-gray-900">
                      {actionLabels[log.action]}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      by {log.performedByName}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(log.performedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
