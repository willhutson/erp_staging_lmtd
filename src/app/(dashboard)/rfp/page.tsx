import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { Plus, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { RFPPipeline } from "@/modules/rfp/components/RFPPipeline";
import { RFPConvertButton } from "@/modules/rfp/components/RFPConvertButton";
import { RFPDropZone } from "@/modules/rfp/components/RFPDropZone";
import { PageShell } from "@/components/ltd/patterns/page-shell";

// Inferred type from Prisma
type RFPWithRelations = Awaited<ReturnType<typeof db.rFP.findMany<{
  include: { subitems: true; convertedToClient: true }
}>>>[number];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function RFPPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const canCreateRFP = can(
    session.user as Parameters<typeof can>[0],
    "rfp:create"
  );

  const rfps = await db.rFP.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      subitems: true,
      convertedToClient: true,
    },
    orderBy: { deadline: "asc" },
  });

  const statusGroups = {
    active: rfps.filter((r: RFPWithRelations) =>
      ["VETTING", "ACTIVE", "AWAITING_REVIEW", "READY_TO_SUBMIT"].includes(
        r.status
      )
    ),
    submitted: rfps.filter((r: RFPWithRelations) =>
      ["SUBMITTED", "AWAITING_RESPONSE"].includes(r.status)
    ),
    won: rfps.filter((r: RFPWithRelations) => r.status === "WON"),
    lost: rfps.filter((r: RFPWithRelations) => r.status === "LOST"),
  };

  const totalValue = rfps
    .filter((r: RFPWithRelations) => !["LOST", "ABANDONED"].includes(r.status) && r.estimatedValue)
    .reduce((sum: number, r: RFPWithRelations) => sum + Number(r.estimatedValue || 0), 0);

  const wonValue = statusGroups.won.reduce(
    (sum: number, r: RFPWithRelations) => sum + Number(r.estimatedValue || 0),
    0
  );

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const pipelineRFPs = rfps.filter(
    (r: RFPWithRelations) => !["WON", "LOST", "ABANDONED"].includes(r.status)
  );

  return (
    <PageShell
      title="RFP Pipeline"
      description="Manage new business opportunities"
      actions={
        canCreateRFP ? (
          <Link
            href="/rfp/new"
            className="flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors"
          >
            <Plus className="w-5 h-5" />
            New RFP
          </Link>
        ) : undefined
      }
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <p className="text-sm text-ltd-text-2">Active Pipeline</p>
          <p className="text-2xl font-bold text-ltd-text-1 mt-1">
            {statusGroups.active.length + statusGroups.submitted.length}
          </p>
          <p className="text-xs text-ltd-text-3 mt-1">RFPs in progress</p>
        </div>
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <p className="text-sm text-ltd-text-2">Pipeline Value</p>
          <p className="text-2xl font-bold text-ltd-text-1 mt-1">
            {formatCurrency(totalValue)}
          </p>
          <p className="text-xs text-ltd-text-3 mt-1">Potential revenue</p>
        </div>
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-ltd-success" />
            <p className="text-sm text-ltd-text-2">Won</p>
          </div>
          <p className="text-2xl font-bold text-ltd-success mt-1">
            {statusGroups.won.length}
          </p>
          <p className="text-xs text-ltd-success mt-1">
            {formatCurrency(wonValue)}
          </p>
        </div>
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-ltd-error" />
            <p className="text-sm text-ltd-text-2">Lost</p>
          </div>
          <p className="text-2xl font-bold text-ltd-error mt-1">
            {statusGroups.lost.length}
          </p>
          <p className="text-xs text-ltd-text-3 mt-1">
            {statusGroups.won.length + statusGroups.lost.length > 0
              ? `${Math.round(
                  (statusGroups.won.length /
                    (statusGroups.won.length + statusGroups.lost.length)) *
                    100
                )}% win rate`
              : "No data yet"}
          </p>
        </div>
      </div>

      {/* Pipeline view */}
      {pipelineRFPs.length > 0 ? (
        <RFPPipeline rfps={pipelineRFPs} />
      ) : (
        <RFPDropZone canCreate={canCreateRFP} />
      )}

      {/* Closed RFPs */}
      {(statusGroups.won.length > 0 || statusGroups.lost.length > 0) && (
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay">
          <div className="p-4 border-b border-ltd-border-1">
            <h2 className="font-semibold text-ltd-text-1">Closed RFPs</h2>
          </div>
          <div className="divide-y divide-ltd-border-1">
            {[...statusGroups.won, ...statusGroups.lost].map((rfp) => (
              <div
                key={rfp.id}
                className="flex items-center justify-between p-4 hover:bg-ltd-surface-2"
              >
                <Link href={`/rfp/${rfp.id}`} className="flex-1">
                  <p className="font-medium text-ltd-text-1">{rfp.name}</p>
                  <p className="text-sm text-ltd-text-2">
                    {rfp.clientName}
                    {rfp.estimatedValue &&
                      ` • ${formatCurrency(Number(rfp.estimatedValue))}`}
                  </p>
                </Link>
                <div className="flex items-center gap-2">
                  {rfp.status === "WON" && !rfp.convertedToClient && (
                    <RFPConvertButton rfpId={rfp.id} />
                  )}
                  {rfp.convertedToClient && (
                    <Link
                      href={`/clients/${rfp.convertedToClient.id}`}
                      className="px-2 py-1 text-xs font-medium text-ltd-success bg-ltd-success/10 rounded hover:bg-ltd-success/20"
                    >
                      View Client
                    </Link>
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      rfp.status === "WON"
                        ? "bg-ltd-success/10 text-ltd-success"
                        : "bg-ltd-error/10 text-ltd-error"
                    }`}
                  >
                    {rfp.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </PageShell>
  );
}
