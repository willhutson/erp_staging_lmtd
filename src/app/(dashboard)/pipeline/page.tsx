import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { PipelinePageClient } from "@/modules/crm/components/PipelinePageClient";
import { TrendingUp, DollarSign, Target, Clock } from "lucide-react";
import { PageShell } from "@/components/ltd/patterns/page-shell";

// Inferred types from Prisma
type DealWithRelations = Awaited<ReturnType<typeof db.deal.findMany<{
  include: { client: true; owner: true; convertedToClient: true }
}>>>[number];

export default async function PipelinePage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const [deals, clients] = await Promise.all([
    db.deal.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        client: true,
        owner: true,
        convertedToClient: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    db.client.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      orderBy: { name: "asc" },
    }),
  ]);

  // Calculate metrics
  const activeDeals = deals.filter(
    (d: DealWithRelations) => !["WON", "LOST"].includes(d.stage)
  );
  const wonDeals = deals.filter((d: DealWithRelations) => d.stage === "WON");
  const lostDeals = deals.filter((d: DealWithRelations) => d.stage === "LOST");

  const pipelineValue = activeDeals.reduce(
    (sum: number, d: DealWithRelations) => sum + Number(d.value || 0),
    0
  );
  const weightedPipeline = activeDeals.reduce(
    (sum: number, d: DealWithRelations) => sum + Number(d.value || 0) * (d.probability || 0) / 100,
    0
  );
  const wonValue = wonDeals.reduce((sum: number, d: DealWithRelations) => sum + Number(d.value || 0), 0);
  const winRate =
    wonDeals.length + lostDeals.length > 0
      ? Math.round(
          (wonDeals.length / (wonDeals.length + lostDeals.length)) * 100
        )
      : 0;

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `AED ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `AED ${(value / 1000).toFixed(0)}K`;
    }
    return `AED ${value.toFixed(0)}`;
  };

  return (
    <PageShell
      title="Pipeline"
      description="Manage deals and opportunities"
    >
      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <DollarSign className="w-4 h-4" />
            <span className="text-sm">Pipeline Value</span>
          </div>
          <p className="text-2xl font-bold text-ltd-text-1">
            {formatCurrency(pipelineValue)}
          </p>
          <p className="text-xs text-ltd-text-3 mt-1">
            {activeDeals.length} active deals
          </p>
        </div>

        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <Target className="w-4 h-4" />
            <span className="text-sm">Weighted Pipeline</span>
          </div>
          <p className="text-2xl font-bold text-ltd-text-1">
            {formatCurrency(weightedPipeline)}
          </p>
          <p className="text-xs text-ltd-text-3 mt-1">Based on probability</p>
        </div>

        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <div className="flex items-center gap-2 text-ltd-success mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Won</span>
          </div>
          <p className="text-2xl font-bold text-ltd-success">
            {formatCurrency(wonValue)}
          </p>
          <p className="text-xs text-ltd-text-3 mt-1">
            {wonDeals.length} deals won
          </p>
        </div>

        <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-overlay p-4">
          <div className="flex items-center gap-2 text-ltd-text-2 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm">Win Rate</span>
          </div>
          <p className="text-2xl font-bold text-ltd-text-1">{winRate}%</p>
          <p className="text-xs text-ltd-text-3 mt-1">
            {wonDeals.length}W / {lostDeals.length}L
          </p>
        </div>
      </div>

      {/* Pipeline board */}
      <PipelinePageClient deals={deals} clients={clients} />
    </PageShell>
  );
}
