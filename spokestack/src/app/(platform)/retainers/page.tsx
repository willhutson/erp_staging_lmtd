export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Repeat,
  TrendingUp,
  TrendingDown,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

async function getRetainerPeriods() {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  const result = await prisma.retainerPeriod.findMany({
    where: {
      year: currentYear,
      month: currentMonth,
    },
    orderBy: { client: { name: "asc" } },
    include: {
      client: {
        select: { id: true, name: true, code: true, logoUrl: true },
      },
    },
  });
  return result;
}

type RetainerPeriodItem = Awaited<ReturnType<typeof getRetainerPeriods>>[number];

async function getRetainerStats() {
  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    const periods = await prisma.retainerPeriod.findMany({
      where: { year: currentYear, month: currentMonth },
    });

    const totalBudgetHours = periods.reduce((sum, p) => sum + Number(p.budgetHours || 0), 0);
    const totalActualHours = periods.reduce((sum, p) => sum + Number(p.actualHours || 0), 0);
    const totalContractValue = periods.reduce((sum, p) => sum + Number(p.contractValue || 0), 0);
    const avgBurnRate = periods.length > 0
      ? periods.reduce((sum, p) => sum + Number(p.burnRate || 0), 0) / periods.length
      : 0;

    return {
      activeRetainers: periods.length,
      totalBudgetHours,
      totalActualHours,
      totalContractValue,
      avgBurnRate: Math.round(avgBurnRate),
    };
  } catch {
    return {
      activeRetainers: 0,
      totalBudgetHours: 0,
      totalActualHours: 0,
      totalContractValue: 0,
      avgBurnRate: 0,
    };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-emerald-500">Active</Badge>;
    case "PLANNED":
      return <Badge variant="secondary">Planned</Badge>;
    case "COMPLETED":
      return <Badge className="bg-blue-500">Completed</Badge>;
    case "RECONCILED":
      return <Badge variant="outline">Reconciled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getBurnRateIndicator(burnRate: number) {
  if (burnRate >= 90) {
    return (
      <div className="flex items-center gap-1 text-red-500">
        <AlertTriangle className="h-4 w-4" />
        <span className="font-medium">{burnRate}%</span>
      </div>
    );
  }
  if (burnRate >= 70) {
    return (
      <div className="flex items-center gap-1 text-amber-500">
        <TrendingUp className="h-4 w-4" />
        <span className="font-medium">{burnRate}%</span>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 text-emerald-500">
      <CheckCircle2 className="h-4 w-4" />
      <span className="font-medium">{burnRate}%</span>
    </div>
  );
}

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default async function RetainersPage() {
  let periods: Awaited<ReturnType<typeof getRetainerPeriods>> = [];
  let stats = {
    activeRetainers: 0,
    totalBudgetHours: 0,
    totalActualHours: 0,
    totalContractValue: 0,
    avgBurnRate: 0,
  };

  try {
    [periods, stats] = await Promise.all([getRetainerPeriods(), getRetainerStats()]);
  } catch {
    // Fallback to defaults
  }

  const currentDate = new Date();
  const currentMonth = MONTHS[currentDate.getMonth()];
  const currentYear = currentDate.getFullYear();

  const overBudget = periods.filter((p: RetainerPeriodItem) => Number(p.burnRate || 0) >= 90);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Retainers</h1>
          <p className="text-muted-foreground">
            Track monthly deliverables, hours, and margins for retainer clients
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select defaultValue={`${currentDate.getMonth() + 1}`}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Month" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((month, idx) => (
                <SelectItem key={month} value={`${idx + 1}`}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select defaultValue={`${currentYear}`}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={`${currentYear - 1}`}>{currentYear - 1}</SelectItem>
              <SelectItem value={`${currentYear}`}>{currentYear}</SelectItem>
              <SelectItem value={`${currentYear + 1}`}>{currentYear + 1}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Retainers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Repeat className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{stats.activeRetainers}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.totalBudgetHours}h</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hours Used
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{Math.round(stats.totalActualHours)}h</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Contract Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{formatCurrency(stats.totalContractValue)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Burn Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getBurnRateIndicator(stats.avgBurnRate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overBudget.length > 0 && (
        <Card className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              {overBudget.length} retainer(s) at or above 90% burn rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {overBudget.map((p: RetainerPeriodItem) => (
                <Badge key={p.id} variant="outline" className="border-amber-500 text-amber-700 dark:text-amber-400">
                  {p.client.name} ({Math.round(Number(p.burnRate))}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Retainer Table */}
      <Card>
        <CardHeader>
          <CardTitle>{currentMonth} {currentYear} Retainers</CardTitle>
          <CardDescription>
            Monthly retainer tracking and burn analysis
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Budget Hours</TableHead>
                <TableHead>Used</TableHead>
                <TableHead>Burn Rate</TableHead>
                <TableHead>Deliverables</TableHead>
                <TableHead>Margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No retainer periods for {currentMonth} {currentYear}
                  </TableCell>
                </TableRow>
              ) : (
                periods.map((period: RetainerPeriodItem) => {
                  const budgetHours = Number(period.budgetHours || 0);
                  const actualHours = Number(period.actualHours || 0);
                  const burnRate = Number(period.burnRate || 0);
                  const margin = Number(period.marginPercent || 0);

                  return (
                    <TableRow key={period.id}>
                      <TableCell>
                        <Link
                          href={`/retainers/${period.clientId}/${period.year}/${period.month}`}
                          className="font-medium hover:underline"
                        >
                          {period.client.name}
                        </Link>
                        <p className="text-xs text-muted-foreground font-mono">
                          {period.client.code}
                        </p>
                      </TableCell>
                      <TableCell>{getStatusBadge(period.status)}</TableCell>
                      <TableCell>
                        <span className="font-medium">{budgetHours}h</span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <span className="text-sm">{Math.round(actualHours)}h</span>
                          <Progress value={(actualHours / budgetHours) * 100} className="h-1.5 w-20" />
                        </div>
                      </TableCell>
                      <TableCell>{getBurnRateIndicator(Math.round(burnRate))}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <span className="font-medium">{period.actualDeliverables || 0}</span>
                          <span className="text-muted-foreground"> / {period.plannedDeliverables || 0}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${margin >= 20 ? "text-green-600" : margin >= 0 ? "text-amber-600" : "text-red-600"}`}>
                          {margin.toFixed(1)}%
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
