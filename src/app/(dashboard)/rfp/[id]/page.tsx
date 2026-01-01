import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { RFPStatusBadge } from "@/modules/rfp/components/RFPStatusBadge";
import { RFPSubitemList } from "@/modules/rfp/components/RFPSubitemList";
import { DocumentUpload } from "@/components/documents";
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  Building2,
  FileText,
  AlertTriangle,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Inferred type for RFP subitem
type RFPSubitemRecord = Awaited<ReturnType<typeof db.rFPSubitem.findMany>>[number];
type WinProbability = "LOW" | "MEDIUM" | "HIGH";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function RFPDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const rfp = await db.rFP.findUnique({
    where: { id },
    include: {
      subitems: {
        orderBy: { sortOrder: "asc" },
      },
      attachments: {
        orderBy: { createdAt: "desc" },
      },
      convertedToClient: true,
    },
  });

  if (!rfp || rfp.organizationId !== session.user.organizationId) {
    notFound();
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const getDaysUntilDeadline = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(rfp.deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    return Math.ceil(
      (deadlineDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
  };

  const daysLeft = getDaysUntilDeadline();
  const isOverdue = daysLeft < 0;
  const isUrgent = daysLeft >= 0 && daysLeft <= 3;
  const completedSubitems = rfp.subitems.filter((s: RFPSubitemRecord) => s.status === "COMPLETED").length;
  const totalSubitems = rfp.subitems.length;
  const progressPercent = totalSubitems > 0 ? (completedSubitems / totalSubitems) * 100 : 0;

  const winProbabilityColors = {
    LOW: "text-ltd-error bg-ltd-error/10",
    MEDIUM: "text-ltd-warning bg-ltd-warning/10",
    HIGH: "text-ltd-success bg-ltd-success/10",
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/rfp"
            className="p-2 hover:bg-ltd-surface-3 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-ltd-text-2" />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-ltd-text-1">{rfp.name}</h1>
              <RFPStatusBadge status={rfp.status} />
            </div>
            <p className="text-ltd-text-2">
              {rfp.clientName}
              {rfp.rfpCode && ` • ${rfp.rfpCode}`}
            </p>
          </div>
        </div>

        {rfp.winProbability && (
          <span
            className={cn(
              "px-3 py-1 text-sm font-medium rounded-full",
              winProbabilityColors[rfp.winProbability as WinProbability]
            )}
          >
            {rfp.winProbability} Win Probability
          </span>
        )}
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">Deadline</span>
          </div>
          <p
            className={cn(
              "font-medium",
              isOverdue && "text-ltd-error",
              isUrgent && !isOverdue && "text-ltd-warning",
              !isOverdue && !isUrgent && "text-ltd-text-1"
            )}
          >
            {new Date(rfp.deadline).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
          <p className={cn(
            "text-xs mt-0.5",
            isOverdue && "text-ltd-error",
            isUrgent && !isOverdue && "text-ltd-warning",
            !isOverdue && !isUrgent && "text-ltd-text-3"
          )}>
            {isOverdue
              ? `${Math.abs(daysLeft)} days overdue`
              : daysLeft === 0
              ? "Due today"
              : `${daysLeft} days left`}
          </p>
        </div>

        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Estimated Value</span>
          </div>
          <p className="font-medium text-ltd-text-1">
            {rfp.estimatedValue
              ? formatCurrency(Number(rfp.estimatedValue))
              : "Not set"}
          </p>
        </div>

        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <Building2 className="w-4 h-4" />
            <span className="text-sm">Portal</span>
          </div>
          <p className="font-medium text-ltd-text-1">
            {rfp.portal || "Not specified"}
          </p>
        </div>

        <div className="bg-ltd-surface-overlay rounded-lg border border-ltd-border-1 p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <FileText className="w-4 h-4" />
            <span className="text-sm">Progress</span>
          </div>
          {totalSubitems > 0 ? (
            <>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 bg-ltd-surface-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-ltd-primary rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-ltd-text-1">
                  {completedSubitems}/{totalSubitems}
                </span>
              </div>
            </>
          ) : (
            <p className="font-medium text-ltd-text-3">No tasks</p>
          )}
        </div>
      </div>

      {/* Bid bond warning */}
      {rfp.bidBondRequired && (
        <div className="flex items-center gap-3 p-4 bg-ltd-warning/10 border border-ltd-warning/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 text-ltd-warning flex-shrink-0" />
          <div>
            <p className="font-medium text-ltd-warning">Bid Bond Required</p>
            <p className="text-sm text-ltd-text-2">
              This RFP requires a bid bond or security deposit
            </p>
          </div>
        </div>
      )}

      {/* Scope of Work */}
      {rfp.scopeOfWork && (
        <div className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1 p-6">
          <h2 className="text-lg font-semibold text-ltd-text-1 mb-4">
            Scope of Work
          </h2>
          <p className="text-ltd-text-1 whitespace-pre-wrap">{rfp.scopeOfWork}</p>
        </div>
      )}

      {/* Requirements */}
      {rfp.requirements && (
        <div className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1 p-6">
          <h2 className="text-lg font-semibold text-ltd-text-1 mb-4">
            Requirements
          </h2>
          <p className="text-ltd-text-1 whitespace-pre-wrap">{rfp.requirements}</p>
        </div>
      )}

      {/* Sub-items / Tasks */}
      <RFPSubitemList
        rfpId={rfp.id}
        subitems={rfp.subitems}
        canEdit={!["WON", "LOST", "ABANDONED"].includes(rfp.status)}
      />

      {/* Supporting Documents */}
      <DocumentUpload
        attachments={rfp.attachments}
        entityType="rfp"
        entityId={rfp.id}
        canUpload={!["WON", "LOST", "ABANDONED"].includes(rfp.status)}
      />

      {/* Notes */}
      {rfp.notes && (
        <div className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1 p-6">
          <h2 className="text-lg font-semibold text-ltd-text-1 mb-4">Notes</h2>
          <p className="text-ltd-text-1 whitespace-pre-wrap">{rfp.notes}</p>
        </div>
      )}

      {/* Outcome section for closed RFPs */}
      {(rfp.status === "WON" || rfp.status === "LOST") && (
        <div
          className={cn(
            "rounded-xl border p-6",
            rfp.status === "WON"
              ? "bg-ltd-success/5 border-ltd-success/20"
              : "bg-ltd-error/5 border-ltd-error/20"
          )}
        >
          <h2
            className={cn(
              "text-lg font-semibold mb-4",
              rfp.status === "WON" ? "text-ltd-success" : "text-ltd-error"
            )}
          >
            {rfp.status === "WON" ? "Won!" : "Lost"}
          </h2>
          {rfp.outcomeNotes && (
            <p className="text-ltd-text-1">{rfp.outcomeNotes}</p>
          )}
          {rfp.convertedToClient && (
            <Link
              href={`/clients/${rfp.convertedToClient.id}`}
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-ltd-success text-white font-medium rounded-md hover:bg-ltd-success/90 transition-colors"
            >
              View Client Record
            </Link>
          )}
        </div>
      )}

      {/* Metadata */}
      <div className="text-sm text-ltd-text-2">
        {rfp.dateReceived && (
          <>
            Received{" "}
            {new Date(rfp.dateReceived).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
            {" • "}
          </>
        )}
        Created{" "}
        {new Date(rfp.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
      </div>
    </div>
  );
}
