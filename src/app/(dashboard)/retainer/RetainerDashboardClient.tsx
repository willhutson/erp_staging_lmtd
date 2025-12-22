"use client";

import {
  TrendingUp,
  TrendingDown,
  
  Package,
  Clock,
  DollarSign,
  
  AlertTriangle,
  CheckCircle,
  BarChart3,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface RetainerPeriod {
  id: string;
  clientId: string;
  year: number;
  month: number;
  plannedDeliverables: number | null;
  deliverableBreakdown: Record<string, number> | null;
  budgetHours: number | null;
  budgetValue: number | null;
  contractValue: number | null;
  actualDeliverables: number;
  actualHours: number;
  actualCost: number;
  burnRate: number | null;
  marginPercent: number | null;
  status: string;
  notes: string | null;
  client: {
    id: string;
    name: string;
    code: string;
  };
}

interface Dashboard {
  year: number;
  month: number;
  periods: RetainerPeriod[];
  clientsWithoutPeriod: { id: string; name: string; code: string }[];
  summary: {
    totalPlannedDeliverables: number;
    totalActualDeliverables: number;
    totalPlannedHours: number;
    totalActualHours: number;
    totalContractValue: number;
    totalActualCost: number;
    averageBurnRate: number;
    averageMargin: number;
    clientsOnTrack: number;
    clientsOverBurn: number;
    clientsUnderBurn: number;
  };
}

interface Trend {
  year: number;
  month: number;
  totalPlanned: number;
  totalActual: number;
  totalRevenue: number;
  totalCost: number;
  avgBurnRate: number;
  avgMargin: number;
  clientCount: number;
}

interface RetainerDashboardClientProps {
  dashboard: Dashboard;
  trends: Trend[];
  currentYear: number;
  currentMonth: number;
}

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

function BurnRateIndicator({ rate }: { rate: number | null }) {
  if (rate === null) return <span className="text-gray-400">-</span>;

  const displayRate = Math.round(rate);

  if (rate >= 90 && rate <= 110) {
    return (
      <div className="flex items-center gap-1 text-green-600">
        <CheckCircle className="h-4 w-4" />
        <span className="font-medium">{displayRate}%</span>
      </div>
    );
  } else if (rate > 110) {
    return (
      <div className="flex items-center gap-1 text-red-600">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">{displayRate}%</span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center gap-1 text-yellow-600">
        <TrendingDown className="h-4 w-4" />
        <span className="font-medium">{displayRate}%</span>
      </div>
    );
  }
}

function MarginIndicator({ margin }: { margin: number | null }) {
  if (margin === null) return <span className="text-gray-400">-</span>;

  const displayMargin = Math.round(margin);
  const isHealthy = margin >= 30;

  return (
    <span className={cn("font-medium", isHealthy ? "text-green-600" : "text-orange-600")}>
      {displayMargin}%
    </span>
  );
}

function ClientRetainerCard({ period }: { period: RetainerPeriod }) {
  const planned = period.plannedDeliverables ?? 0;
  const actual = period.actualDeliverables;
  const progress = planned > 0 ? (actual / planned) * 100 : 0;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{period.client.name}</CardTitle>
            <p className="text-sm text-gray-500">{period.client.code}</p>
          </div>
          <Badge
            variant="outline"
            className={cn(
              period.status === "ACTIVE" && "bg-green-50 text-green-700 border-green-200",
              period.status === "PLANNED" && "bg-blue-50 text-blue-700 border-blue-200",
              period.status === "COMPLETED" && "bg-gray-50 text-gray-700 border-gray-200",
              period.status === "RECONCILED" && "bg-purple-50 text-purple-700 border-purple-200"
            )}
          >
            {period.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Deliverables Progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-500">Deliverables</span>
            <span className="font-medium">
              {actual} / {planned}
            </span>
          </div>
          <Progress value={Math.min(progress, 100)} className="h-2" />
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500">Burn Rate</p>
            <BurnRateIndicator rate={period.burnRate ? Number(period.burnRate) : null} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Margin</p>
            <MarginIndicator margin={period.marginPercent ? Number(period.marginPercent) : null} />
          </div>
          <div>
            <p className="text-xs text-gray-500">Hours Used</p>
            <p className="font-medium">
              {Number(period.actualHours).toFixed(1)}h
              {period.budgetHours && (
                <span className="text-gray-400 font-normal"> / {Number(period.budgetHours)}h</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Revenue</p>
            <p className="font-medium">
              {period.contractValue
                ? new Intl.NumberFormat("en-AE", {
                    style: "currency",
                    currency: "AED",
                    maximumFractionDigits: 0,
                  }).format(Number(period.contractValue))
                : "-"}
            </p>
          </div>
        </div>

        {/* Notes */}
        {period.notes && (
          <p className="text-xs text-gray-500 italic border-t pt-2">{period.notes}</p>
        )}
      </CardContent>
    </Card>
  );
}

export function RetainerDashboardClient({
  dashboard,
  trends,
  currentYear,
  currentMonth,
}: RetainerDashboardClientProps) {
  const { summary, periods, clientsWithoutPeriod } = dashboard;

  return (
    <div className="space-y-6">
      {/* Period Header */}
      <div className="flex items-center gap-2 text-gray-600">
        <Calendar className="h-5 w-5" />
        <span className="font-medium">
          {MONTH_NAMES[currentMonth - 1]} {currentYear}
        </span>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Deliverables</p>
                <p className="text-2xl font-bold">
                  {summary.totalActualDeliverables}
                  <span className="text-sm font-normal text-gray-400">
                    {" "}/ {summary.totalPlannedDeliverables}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Burn Rate</p>
                <p className="text-2xl font-bold">
                  {Math.round(summary.averageBurnRate)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Margin</p>
                <p className="text-2xl font-bold">
                  {Math.round(summary.averageMargin)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">
                  {Math.round(summary.totalActualHours)}
                  <span className="text-sm font-normal text-gray-400">
                    {" "}/ {Math.round(summary.totalPlannedHours)}
                  </span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Summary */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-wrap gap-6 justify-center">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="font-medium">{summary.clientsOnTrack}</span>
              <span className="text-gray-500">On Track</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-red-500" />
              <span className="font-medium">{summary.clientsOverBurn}</span>
              <span className="text-gray-500">Over Burn</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-yellow-500" />
              <span className="font-medium">{summary.clientsUnderBurn}</span>
              <span className="text-gray-500">Under Burn</span>
            </div>
            {clientsWithoutPeriod.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-gray-400" />
                <span className="font-medium">{clientsWithoutPeriod.length}</span>
                <span className="text-gray-500">No Period Set</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Client Cards */}
      {periods.length > 0 ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Client Retainers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {periods.map((period) => (
              <ClientRetainerCard key={period.id} period={period} />
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="py-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Retainer Periods</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              No retainer periods have been configured for {MONTH_NAMES[currentMonth - 1]} {currentYear}.
              Set up monthly retainer allocations to track deliverable burn rates.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Clients without periods */}
      {clientsWithoutPeriod.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-5 w-5" />
              Clients Without Retainer Period
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {clientsWithoutPeriod.map((client) => (
                <Badge key={client.id} variant="outline" className="bg-white">
                  {client.name} ({client.code})
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Trends */}
      {trends.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Monthly Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 font-medium text-gray-500">Month</th>
                    <th className="text-right py-2 font-medium text-gray-500">Deliverables</th>
                    <th className="text-right py-2 font-medium text-gray-500">Burn Rate</th>
                    <th className="text-right py-2 font-medium text-gray-500">Margin</th>
                    <th className="text-right py-2 font-medium text-gray-500">Revenue</th>
                    <th className="text-right py-2 font-medium text-gray-500">Clients</th>
                  </tr>
                </thead>
                <tbody>
                  {trends.map((trend) => (
                    <tr key={`${trend.year}-${trend.month}`} className="border-b last:border-0">
                      <td className="py-2">
                        {MONTH_NAMES[trend.month - 1].slice(0, 3)} {trend.year}
                      </td>
                      <td className="text-right py-2">
                        {trend.totalActual} / {trend.totalPlanned}
                      </td>
                      <td className="text-right py-2">
                        <BurnRateIndicator rate={trend.avgBurnRate} />
                      </td>
                      <td className="text-right py-2">
                        <MarginIndicator margin={trend.avgMargin} />
                      </td>
                      <td className="text-right py-2">
                        {new Intl.NumberFormat("en-AE", {
                          style: "currency",
                          currency: "AED",
                          maximumFractionDigits: 0,
                        }).format(trend.totalRevenue)}
                      </td>
                      <td className="text-right py-2">{trend.clientCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
