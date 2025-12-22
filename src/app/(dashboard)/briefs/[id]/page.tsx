import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { getFormConfig, briefTypeLabels } from "@/../config/forms";
import { StatusBadge } from "@/modules/briefs/components/StatusBadge";
import { BriefScopeChangesSection } from "@/modules/scope-changes/components";
import { DocumentUpload } from "@/components/documents";
import { ArrowLeft, Calendar, User, Building2, Clock } from "lucide-react";
import Link from "next/link";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function BriefDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const brief = await db.brief.findUnique({
    where: { id },
    include: {
      client: true,
      createdBy: true,
      assignee: true,
      statusHistory: {
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      scopeChanges: {
        orderBy: { createdAt: "desc" },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!brief || brief.organizationId !== session.user.organizationId) {
    notFound();
  }

  const formConfig = getFormConfig(brief.type);
  const formData = brief.formData as Record<string, unknown>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/briefs"
            className="p-2 hover:bg-ltd-surface-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ltd-text-2" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-ltd-text-1">{brief.title}</h1>
              <StatusBadge status={brief.status} size="md" />
            </div>
            <p className="text-ltd-text-2">
              {brief.briefNumber} • {briefTypeLabels[brief.type]}
            </p>
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Client</span>
          </div>
          <p className="font-medium text-ltd-text-1">{brief.client.name}</p>
        </div>

        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <User className="w-4 h-4" />
            <span className="text-sm">Assignee</span>
          </div>
          <p className="font-medium text-ltd-text-1">
            {brief.assignee?.name || "Unassigned"}
          </p>
        </div>

        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Created</span>
          </div>
          <p className="font-medium text-ltd-text-1">
            {new Date(brief.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Deadline</span>
          </div>
          <p className="font-medium text-ltd-text-1">
            {formData.deadline
              ? new Date(formData.deadline as string).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })
              : "Not set"}
          </p>
        </div>
      </div>

      {/* Form data sections */}
      {formConfig.sections.map((section) => (
        <div
          key={section.id}
          className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1 p-6"
        >
          <h2 className="text-lg font-semibold text-ltd-text-1 mb-4">
            {section.title}
          </h2>
          <dl className="space-y-4">
            {section.fields.map((field) => {
              const value = formData[field.id];
              if (value === undefined || value === null || value === "") {
                return null;
              }

              let displayValue: React.ReactNode;

              if (Array.isArray(value)) {
                displayValue = value.join(", ");
              } else if (typeof value === "object" && value !== null && "start" in value) {
                const dateRange = value as { start: string; end: string };
                displayValue = `${dateRange.start} to ${dateRange.end}`;
              } else if (field.type === "client-select") {
                displayValue = brief.client.name;
              } else if (field.type === "user-select" && field.id === "assigneeId") {
                displayValue = brief.assignee?.name || "Unassigned";
              } else {
                displayValue = String(value);
              }

              return (
                <div key={field.id}>
                  <dt className="text-sm font-medium text-ltd-text-2">
                    {field.label}
                  </dt>
                  <dd className="mt-1 text-ltd-text-1 whitespace-pre-wrap">
                    {displayValue}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>
      ))}

      {/* Scope Changes */}
      <BriefScopeChangesSection
        briefId={brief.id}
        scopeChanges={brief.scopeChanges.map((sc) => ({
          id: sc.id,
          title: sc.title,
          originalDirection: sc.originalDirection,
          newDirection: sc.newDirection,
          reason: sc.reason,
          impactLevel: sc.impactLevel as "MINOR" | "MODERATE" | "MAJOR" | "CRITICAL",
          hoursSpentBefore: sc.hoursSpentBefore ? Number(sc.hoursSpentBefore) : null,
          estimatedAdditionalHours: sc.estimatedAdditionalHours ? Number(sc.estimatedAdditionalHours) : null,
          costImpact: sc.costImpact ? Number(sc.costImpact) : null,
          requiresApproval: sc.requiresApproval,
          approvalStatus: sc.approvalStatus as "NOT_REQUIRED" | "PENDING" | "ACKNOWLEDGED" | "APPROVED" | "DISPUTED",
          clientNotes: sc.clientNotes,
          createdAt: sc.createdAt,
        }))}
        canEdit={brief.status !== "COMPLETED" && brief.status !== "CANCELLED"}
      />

      {/* Supporting Documents */}
      <DocumentUpload
        attachments={brief.attachments}
        entityType="brief"
        entityId={brief.id}
        canUpload={brief.status !== "COMPLETED" && brief.status !== "CANCELLED"}
      />

      {/* Status History */}
      {brief.statusHistory.length > 0 && (
        <div className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1 p-6">
          <h2 className="text-lg font-semibold text-ltd-text-1 mb-4">
            Status History
          </h2>
          <div className="space-y-3">
            {brief.statusHistory.map((history) => (
              <div
                key={history.id}
                className="flex items-center gap-3 text-sm"
              >
                <StatusBadge status={history.toStatus} />
                <span className="text-ltd-text-2">
                  {new Date(history.createdAt).toLocaleString("en-GB", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                {history.notes && (
                  <span className="text-ltd-text-3">– {history.notes}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Created by */}
      <div className="text-sm text-ltd-text-2">
        Created by {brief.createdBy.name} on{" "}
        {new Date(brief.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  );
}
