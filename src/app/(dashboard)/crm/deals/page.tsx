import { Suspense } from "react";
import Link from "next/link";
import { Plus, TrendingUp, DollarSign, Building2, User } from "lucide-react";
import { getSalesPipelines, getDeals } from "@/modules/crm/actions/crm-actions";

interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
  isClosed?: boolean;
  isWon?: boolean;
}

async function DealsPipeline() {
  const [pipelines, deals] = await Promise.all([
    getSalesPipelines(),
    getDeals(),
  ]);

  type Deal = Awaited<ReturnType<typeof getDeals>>[number];
  type Pipeline = Awaited<ReturnType<typeof getSalesPipelines>>[number];

  if (pipelines.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No pipelines configured</h3>
        <p className="text-gray-500 mt-1 mb-4">
          Create a sales pipeline to start tracking deals.
        </p>
        <Link
          href="/crm/pipelines/new"
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Pipeline
        </Link>
      </div>
    );
  }

  const pipeline = pipelines[0];
  const stages = (pipeline.stages as PipelineStage[]).sort((a, b) => a.order - b.order);

  // Group deals by stage
  const dealsByStage = stages.reduce((acc, stage) => {
    acc[stage.id] = deals.filter((d: Deal) => d.stageId === stage.id && d.pipelineId === pipeline.id);
    return acc;
  }, {} as Record<string, Deal[]>);

  // Calculate stage totals
  const stageTotals = stages.map((stage) => {
    const stageDeals = dealsByStage[stage.id] || [];
    return {
      ...stage,
      count: stageDeals.length,
      value: stageDeals.reduce((sum: number, d: Deal) => sum + Number(d.amount || 0), 0),
    };
  });

  return (
    <div className="space-y-4">
      {/* Pipeline Header */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{pipeline.name}</h2>
            <p className="text-sm text-gray-500">
              {deals.length} deals · ${deals.reduce((sum: number, d: Deal) => sum + Number(d.amount || 0), 0).toLocaleString()} total value
            </p>
          </div>
          {pipelines.length > 1 && (
            <select className="text-sm border rounded px-2 py-1">
              {pipelines.map((p: Pipeline) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Pipeline Board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stageTotals.map((stage) => (
            <div key={stage.id} className="w-72 flex-shrink-0">
              {/* Stage Header */}
              <div
                className="rounded-t-lg p-3 border-t-4"
                style={{ borderTopColor: stage.color, backgroundColor: `${stage.color}10` }}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                  <span className="text-sm text-gray-500">{stage.count}</span>
                </div>
                <p className="text-sm text-gray-600 mt-0.5">
                  ${stage.value.toLocaleString()}
                </p>
              </div>

              {/* Stage Cards */}
              <div className="bg-gray-100 rounded-b-lg p-2 min-h-[400px] space-y-2">
                {(dealsByStage[stage.id] || []).map((deal: Deal) => (
                  <Link
                    key={deal.id}
                    href={`/crm/deals/${deal.id}`}
                    className="block bg-white rounded-lg border p-3 hover:shadow-md transition-shadow"
                  >
                    <p className="font-medium text-gray-900 truncate">{deal.name}</p>

                    {deal.client && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Building2 className="w-3 h-3" />
                        {deal.client.name}
                      </div>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      {deal.amount && (
                        <span className="font-semibold text-gray-900">
                          ${Number(deal.amount).toLocaleString()}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <User className="w-3 h-3" />
                        {deal.owner.name.split(" ")[0]}
                      </div>
                    </div>

                    {deal.expectedCloseDate && (
                      <p className="text-xs text-gray-400 mt-2">
                        Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                      </p>
                    )}
                  </Link>
                ))}

                {(dealsByStage[stage.id] || []).length === 0 && (
                  <div className="text-center py-8 text-sm text-gray-400">
                    No deals in this stage
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function DealsPage() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Deals</h1>
          <p className="text-gray-500 mt-1">Track your sales pipeline and opportunities</p>
        </div>
        <Link
          href="/crm/deals/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deal
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="bg-white rounded-lg border p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-100 rounded w-48 mb-4" />
              <div className="flex gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-72 h-96 bg-gray-100 rounded" />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <DealsPipeline />
      </Suspense>
    </div>
  );
}
