import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { TrendingUp, TrendingDown } from "lucide-react";

export async function PipelineSummaryWidget() {
  const session = await auth();
  if (!session?.user) return null;

  const [deals, rfps] = await Promise.all([
    db.deal.findMany({
      where: {
        organizationId: session.user.organizationId,
        stage: { notIn: ["WON", "LOST"] },
      },
      select: {
        value: true,
        stage: true,
      },
    }),
    db.rFP.findMany({
      where: {
        organizationId: session.user.organizationId,
        status: { notIn: ["WON", "LOST", "ABANDONED"] },
      },
      select: {
        estimatedValue: true,
        status: true,
      },
    }),
  ]);

  const totalDealValue = deals.reduce(
    (sum, d) => sum + (d.value ? Number(d.value) : 0),
    0
  );
  const totalRfpValue = rfps.reduce(
    (sum, r) => sum + (r.estimatedValue ? Number(r.estimatedValue) : 0),
    0
  );

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toString();
  };

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          href="/pipeline"
          className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <p className="text-xs text-blue-600 font-medium">Deals</p>
          <p className="text-lg font-bold text-blue-700">{deals.length}</p>
          <p className="text-xs text-blue-500">
            AED {formatCurrency(totalDealValue)}
          </p>
        </Link>
        <Link
          href="/rfp"
          className="p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <p className="text-xs text-purple-600 font-medium">RFPs</p>
          <p className="text-lg font-bold text-purple-700">{rfps.length}</p>
          <p className="text-xs text-purple-500">
            AED {formatCurrency(totalRfpValue)}
          </p>
        </Link>
      </div>

      {/* Total Pipeline */}
      <div className="p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Total Pipeline</p>
            <p className="text-lg font-bold text-gray-900">
              AED {formatCurrency(totalDealValue + totalRfpValue)}
            </p>
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
      </div>
    </div>
  );
}
