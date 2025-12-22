"use client";

/**
 * Retainer Health Reports Client
 *
 * Interactive retainer usage and burndown visualization.
 */

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Download,
  Target,
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
  Calendar,
} from "lucide-react";
import type { RetainerHealth } from "@/modules/reporting/actions/analytics-actions";

interface RetainerReportsClientProps {
  health: RetainerHealth[];
  currentMonth: string;
}

function formatNumber(num: number, decimals = 0): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function formatHours(hours: number): string {
  return `${formatNumber(hours, 1)}h`;
}

function formatPercent(num: number): string {
  return `${formatNumber(num, 1)}%`;
}

function getStatusBadge(status: "healthy" | "warning" | "critical") {
  switch (status) {
    case "healthy":
      return (
        <Badge className="bg-green-100 text-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Healthy
        </Badge>
      );
    case "warning":
      return (
        <Badge className="bg-yellow-100 text-yellow-700">
          <AlertCircle className="w-3 h-3 mr-1" />
          Warning
        </Badge>
      );
    case "critical":
      return (
        <Badge className="bg-red-100 text-red-700">
          <AlertTriangle className="w-3 h-3 mr-1" />
          Critical
        </Badge>
      );
  }
}

function getTrendIcon(trend: "up" | "down" | "stable") {
  switch (trend) {
    case "up":
      return <TrendingUp className="w-4 h-4 text-red-500" />;
    case "down":
      return <TrendingDown className="w-4 h-4 text-green-500" />;
    case "stable":
      return <Minus className="w-4 h-4 text-gray-400" />;
  }
}

function getBurnRateColor(rate: number): string {
  if (rate > 100) return "text-red-600";
  if (rate > 80) return "text-yellow-600";
  return "text-green-600";
}

function getProgressColor(rate: number): string {
  if (rate > 100) return "[&>div]:bg-red-500";
  if (rate > 80) return "[&>div]:bg-yellow-500";
  return "[&>div]:bg-green-500";
}

export function RetainerReportsClient({
  health,
  currentMonth,
}: RetainerReportsClientProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"burnRate" | "hours" | "overage">("burnRate");

  // Filter and sort
  const filteredHealth = health
    .filter((h) => statusFilter === "all" || h.status === statusFilter)
    .sort((a, b) => {
      switch (sortBy) {
        case "burnRate":
          return b.burnRate - a.burnRate;
        case "hours":
          return b.hoursUsed - a.hoursUsed;
        case "overage":
          return b.projectedOverage - a.projectedOverage;
        default:
          return 0;
      }
    });

  // Calculate totals
  const totals = filteredHealth.reduce(
    (acc, h) => ({
      allocation: acc.allocation + h.monthlyAllocation,
      used: acc.used + h.hoursUsed,
      overage: acc.overage + h.projectedOverage,
    }),
    { allocation: 0, used: 0, overage: 0 }
  );

  const avgBurnRate = totals.allocation > 0 ? (totals.used / totals.allocation) * 100 : 0;
  const criticalCount = health.filter((h) => h.status === "critical").length;
  const warningCount = health.filter((h) => h.status === "warning").length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/reports">
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Retainer Health</h1>
            <p className="text-gray-600">Usage and burndown for {currentMonth}</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Allocation</p>
                <p className="text-2xl font-bold">{formatHours(totals.allocation)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Clock className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Hours Used</p>
                <p className="text-2xl font-bold">{formatHours(totals.used)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${avgBurnRate > 80 ? "bg-yellow-100" : "bg-gray-100"}`}>
                <TrendingUp className={`w-5 h-5 ${avgBurnRate > 80 ? "text-yellow-600" : "text-gray-600"}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Burn Rate</p>
                <p className={`text-2xl font-bold ${getBurnRateColor(avgBurnRate)}`}>
                  {formatPercent(avgBurnRate)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${criticalCount > 0 ? "bg-red-100" : warningCount > 0 ? "bg-yellow-100" : "bg-green-100"}`}>
                <AlertTriangle className={`w-5 h-5 ${criticalCount > 0 ? "text-red-600" : warningCount > 0 ? "text-yellow-600" : "text-green-600"}`} />
              </div>
              <div>
                <p className="text-sm text-gray-500">At Risk</p>
                <p className="text-2xl font-bold">
                  {criticalCount + warningCount}
                  <span className="text-sm text-gray-400 ml-1">/ {health.length}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Burn Rate Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Retainer Burn Rate Overview</CardTitle>
          <CardDescription>Visual representation of usage across all retainers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredHealth.map((retainer) => (
              <div key={retainer.clientId} className="flex items-center gap-4">
                <div className="w-32 truncate">
                  <Link
                    href={`/clients/${retainer.clientId}`}
                    className="text-sm font-medium hover:underline"
                  >
                    {retainer.clientName}
                  </Link>
                </div>
                <div className="flex-1">
                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute h-full rounded-full transition-all ${
                        retainer.status === "critical"
                          ? "bg-red-500"
                          : retainer.status === "warning"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{ width: `${Math.min(100, retainer.burnRate)}%` }}
                    />
                    {retainer.burnRate > 100 && (
                      <div
                        className="absolute h-full bg-red-700 opacity-50"
                        style={{
                          left: "100%",
                          width: `${Math.min(50, retainer.burnRate - 100)}%`,
                        }}
                      />
                    )}
                    {/* Target line at 80% */}
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-gray-400"
                      style={{ left: "80%" }}
                    />
                  </div>
                </div>
                <div className="w-20 text-right">
                  <span className={`text-sm font-medium ${getBurnRateColor(retainer.burnRate)}`}>
                    {formatPercent(retainer.burnRate)}
                  </span>
                </div>
                <div className="w-20">
                  {getStatusBadge(retainer.status)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span>Healthy (&lt;80%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Warning (80-100%)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span>Critical (&gt;100%)</span>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <div className="w-0.5 h-4 bg-gray-400" />
              <span>80% target</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="healthy">Healthy</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="burnRate">Highest Burn Rate</SelectItem>
                <SelectItem value="hours">Most Hours Used</SelectItem>
                <SelectItem value="overage">Highest Overage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Retainer Details</CardTitle>
          <CardDescription>
            Showing {filteredHealth.length} retainer clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead className="text-right">Allocation</TableHead>
                <TableHead className="text-right">Used</TableHead>
                <TableHead className="text-right">Remaining</TableHead>
                <TableHead className="text-right">Burn Rate</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead className="text-right">Days Left</TableHead>
                <TableHead className="text-right">Projected Overage</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHealth.map((retainer) => (
                <TableRow key={retainer.clientId}>
                  <TableCell>
                    <Link
                      href={`/clients/${retainer.clientId}`}
                      className="hover:underline"
                    >
                      <div className="font-medium">{retainer.clientName}</div>
                      <div className="text-sm text-gray-500">{retainer.clientCode}</div>
                    </Link>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatHours(retainer.monthlyAllocation)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={getBurnRateColor(retainer.burnRate)}>
                      {formatHours(retainer.hoursUsed)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={
                        retainer.hoursRemaining < 0
                          ? "text-red-600"
                          : retainer.hoursRemaining < retainer.monthlyAllocation * 0.2
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {formatHours(retainer.hoursRemaining)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className={`font-medium ${getBurnRateColor(retainer.burnRate)}`}>
                        {formatPercent(retainer.burnRate)}
                      </span>
                      <Progress
                        value={Math.min(100, retainer.burnRate)}
                        className={`w-16 h-2 ${getProgressColor(retainer.burnRate)}`}
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(retainer.usageTrend)}
                      <span className="text-sm text-gray-500">
                        vs {formatHours(retainer.previousMonthUsage)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {retainer.daysRemaining}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {retainer.projectedOverage > 0 ? (
                      <span className="text-red-600 font-medium">
                        +{formatHours(retainer.projectedOverage)}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(retainer.status)}</TableCell>
                </TableRow>
              ))}
              {filteredHealth.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                    No retainer clients found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Scope Changes Summary */}
      {health.some((h) => h.scopeChanges > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Scope Changes This Month</CardTitle>
            <CardDescription>Additional work outside original retainer scope</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {health
                .filter((h) => h.scopeChanges > 0 || h.additionalHours > 0)
                .map((retainer) => (
                  <div
                    key={retainer.clientId}
                    className="p-4 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{retainer.clientName}</span>
                      <Badge variant="outline">{retainer.scopeChanges} changes</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Additional hours: <span className="font-medium">+{formatHours(retainer.additionalHours)}</span>
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
