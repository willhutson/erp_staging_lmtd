import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { can } from "@/lib/permissions";
import { Plus, FileStack, TrendingUp, TrendingDown } from "lucide-react";
import Link from "next/link";
import { RFPPipeline } from "@/modules/rfp/components/RFPPipeline";
import { RFPConvertButton } from "@/modules/rfp/components/RFPConvertButton";

// Inferred type from Prisma
type RFPWithRelations = Awaited<ReturnType<typeof db.rFP.findMany<{
  include: { subitems: true; convertedToClient: true }
}>>>[number];

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">RFP Pipeline</h1>
          <p className="text-gray-500 mt-1">
            Manage new business opportunities
          </p>
        </div>
        {canCreateRFP && (
          <Link
            href="/rfp/new"
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
          >
            <Plus className="w-5 h-5" />
            New RFP
          </Link>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Active Pipeline</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {statusGroups.active.length + statusGroups.submitted.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">RFPs in progress</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Pipeline Value</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {formatCurrency(totalValue)}
          </p>
          <p className="text-xs text-gray-400 mt-1">Potential revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <p className="text-sm text-gray-500">Won</p>
          </div>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {statusGroups.won.length}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {formatCurrency(wonValue)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-500" />
            <p className="text-sm text-gray-500">Lost</p>
          </div>
          <p className="text-2xl font-bold text-red-600 mt-1">
            {statusGroups.lost.length}
          </p>
          <p className="text-xs text-gray-400 mt-1">
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
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <FileStack className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No active RFPs in the pipeline.</p>
          {canCreateRFP && (
            <p className="text-sm text-gray-400 mt-1">
              <Link href="/rfp/new" className="text-[#52EDC7] hover:underline">
                Create your first RFP
              </Link>{" "}
              to start tracking opportunities.
            </p>
          )}
        </div>
      )}

      {/* Closed RFPs */}
      {(statusGroups.won.length > 0 || statusGroups.lost.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Closed RFPs</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {[...statusGroups.won, ...statusGroups.lost].map((rfp) => (
              <div
                key={rfp.id}
                className="flex items-center justify-between p-4 hover:bg-gray-50"
              >
                <Link href={`/rfp/${rfp.id}`} className="flex-1">
                  <p className="font-medium text-gray-900">{rfp.name}</p>
                  <p className="text-sm text-gray-500">
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
                      className="px-2 py-1 text-xs font-medium text-green-600 bg-green-50 rounded hover:bg-green-100"
                    >
                      View Client
                    </Link>
                  )}
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${
                      rfp.status === "WON"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
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
    </div>
  );
}
