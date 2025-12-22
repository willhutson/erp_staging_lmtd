"use client";

/**
 * Reports Dashboard Client
 *
 * Interactive executive dashboard with KPI cards and navigation.
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Clock,
  Users,
  Building2,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  BarChart3,
  PieChart,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle,
  Calendar,
} from "lucide-react";
import type { ExecutiveKPIs } from "@/modules/reporting/actions/analytics-actions";

interface ReportsDashboardClientProps {
  kpis: ExecutiveKPIs;
  previousKpis: ExecutiveKPIs;
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

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

function TrendIndicator({
  current,
  previous,
  inverse = false,
}: {
  current: number;
  previous: number;
  inverse?: boolean;
}) {
  const change = calculateChange(current, previous);
  const isPositive = inverse ? change < 0 : change > 0;
  const isNeutral = Math.abs(change) < 1;

  if (isNeutral) {
    return (
      <span className="flex items-center text-gray-500 text-sm">
        <Minus className="w-4 h-4 mr-1" />
        No change
      </span>
    );
  }

  return (
    <span
      className={`flex items-center text-sm ${
        isPositive ? "text-green-600" : "text-red-600"
      }`}
    >
      {change > 0 ? (
        <TrendingUp className="w-4 h-4 mr-1" />
      ) : (
        <TrendingDown className="w-4 h-4 mr-1" />
      )}
      {formatPercent(Math.abs(change))} vs last month
    </span>
  );
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  current,
  previous,
  inverse = false,
  href,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  current: number;
  previous: number;
  inverse?: boolean;
  href?: string;
}) {
  const content = (
    <Card className={href ? "hover:shadow-md transition-shadow cursor-pointer" : ""}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">
          {title}
        </CardTitle>
        <Icon className="w-5 h-5 text-gray-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        <div className="mt-2">
          <TrendIndicator current={current} previous={previous} inverse={inverse} />
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export function ReportsDashboardClient({
  kpis,
  previousKpis,
  currentMonth,
}: ReportsDashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Reports Dashboard</h1>
          <p className="text-gray-600">Executive overview for {currentMonth}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/reports/export">
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Reports
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Link href="/reports/clients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Building2 className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium">Client Reports</p>
                  <p className="text-sm text-gray-500">Performance by client</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/team">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-green-500">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-green-500" />
                <div>
                  <p className="font-medium">Team Productivity</p>
                  <p className="text-sm text-gray-500">Utilization & output</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/content">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-purple-500">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Zap className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="font-medium">Content Metrics</p>
                  <p className="text-sm text-gray-500">Posts & engagement</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>

        <Link href="/reports/retainers">
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-orange-500">
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Target className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="font-medium">Retainer Health</p>
                  <p className="text-sm text-gray-500">Usage & burndown</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Main KPIs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="briefs">Briefs</TabsTrigger>
          <TabsTrigger value="time">Time</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Briefs"
              value={formatNumber(kpis.totalBriefs)}
              subtitle={`${formatNumber(kpis.completedBriefs)} completed`}
              icon={FileText}
              current={kpis.totalBriefs}
              previous={previousKpis.totalBriefs}
              href="/reports/briefs"
            />
            <KPICard
              title="Hours Logged"
              value={formatHours(kpis.totalHoursLogged)}
              subtitle={`${formatHours(kpis.billableHours)} billable`}
              icon={Clock}
              current={kpis.totalHoursLogged}
              previous={previousKpis.totalHoursLogged}
              href="/reports/time"
            />
            <KPICard
              title="Active Clients"
              value={formatNumber(kpis.activeClients)}
              subtitle={kpis.atRiskClients > 0 ? `${kpis.atRiskClients} at risk` : "All healthy"}
              icon={Building2}
              current={kpis.activeClients}
              previous={previousKpis.activeClients}
              href="/reports/clients"
            />
            <KPICard
              title="Posts Published"
              value={formatNumber(kpis.postsPublished)}
              subtitle={`${formatNumber(kpis.postsScheduled)} scheduled`}
              icon={Zap}
              current={kpis.postsPublished}
              previous={previousKpis.postsPublished}
              href="/reports/content"
            />
          </div>

          {/* Secondary KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Brief Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {formatPercent(kpis.briefCompletionRate)}
                  </span>
                  <TrendIndicator
                    current={kpis.briefCompletionRate}
                    previous={previousKpis.briefCompletionRate}
                  />
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#52EDC7] rounded-full transition-all"
                    style={{ width: `${Math.min(100, kpis.briefCompletionRate)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Team Utilization
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {formatPercent(kpis.utilizationRate)}
                  </span>
                  <TrendIndicator
                    current={kpis.utilizationRate}
                    previous={previousKpis.utilizationRate}
                  />
                </div>
                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      kpis.utilizationRate > 90
                        ? "bg-red-500"
                        : kpis.utilizationRate > 75
                        ? "bg-[#52EDC7]"
                        : "bg-yellow-500"
                    }`}
                    style={{ width: `${Math.min(100, kpis.utilizationRate)}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Avg NPS Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-end gap-2">
                  <span className="text-3xl font-bold">
                    {kpis.avgNpsScore > 0 ? formatNumber(kpis.avgNpsScore, 1) : "—"}
                  </span>
                  {kpis.avgNpsScore > 0 && (
                    <TrendIndicator
                      current={kpis.avgNpsScore}
                      previous={previousKpis.avgNpsScore}
                    />
                  )}
                </div>
                {kpis.avgNpsScore > 0 && (
                  <div className="mt-3 flex items-center gap-2">
                    {kpis.avgNpsScore >= 9 ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-green-600">Promoters</span>
                      </>
                    ) : kpis.avgNpsScore >= 7 ? (
                      <>
                        <Minus className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Passives</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm text-red-600">Detractors</span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="briefs" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Briefs"
              value={formatNumber(kpis.totalBriefs)}
              icon={FileText}
              current={kpis.totalBriefs}
              previous={previousKpis.totalBriefs}
            />
            <KPICard
              title="Completed"
              value={formatNumber(kpis.completedBriefs)}
              icon={CheckCircle}
              current={kpis.completedBriefs}
              previous={previousKpis.completedBriefs}
            />
            <KPICard
              title="In Progress"
              value={formatNumber(kpis.inProgressBriefs)}
              icon={Clock}
              current={kpis.inProgressBriefs}
              previous={previousKpis.inProgressBriefs}
            />
            <KPICard
              title="Avg Duration"
              value={`${formatNumber(kpis.avgBriefDuration, 1)} days`}
              icon={Calendar}
              current={kpis.avgBriefDuration}
              previous={previousKpis.avgBriefDuration}
              inverse
            />
          </div>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Brief Completion Rate</CardTitle>
              <CardDescription>Percentage of briefs completed this month</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#52EDC7] rounded-full transition-all"
                      style={{ width: `${Math.min(100, kpis.briefCompletionRate)}%` }}
                    />
                  </div>
                </div>
                <span className="text-xl font-bold w-20 text-right">
                  {formatPercent(kpis.briefCompletionRate)}
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="time" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Total Hours"
              value={formatHours(kpis.totalHoursLogged)}
              icon={Clock}
              current={kpis.totalHoursLogged}
              previous={previousKpis.totalHoursLogged}
            />
            <KPICard
              title="Billable Hours"
              value={formatHours(kpis.billableHours)}
              icon={Target}
              current={kpis.billableHours}
              previous={previousKpis.billableHours}
            />
            <KPICard
              title="Utilization Rate"
              value={formatPercent(kpis.utilizationRate)}
              icon={PieChart}
              current={kpis.utilizationRate}
              previous={previousKpis.utilizationRate}
            />
            <KPICard
              title="Billable %"
              value={formatPercent(kpis.totalHoursLogged > 0 ? (kpis.billableHours / kpis.totalHoursLogged) * 100 : 0)}
              icon={BarChart3}
              current={kpis.billableHours / Math.max(kpis.totalHoursLogged, 1) * 100}
              previous={previousKpis.billableHours / Math.max(previousKpis.totalHoursLogged, 1) * 100}
            />
          </div>
        </TabsContent>

        <TabsContent value="content" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              title="Posts Published"
              value={formatNumber(kpis.postsPublished)}
              icon={Zap}
              current={kpis.postsPublished}
              previous={previousKpis.postsPublished}
            />
            <KPICard
              title="Posts Scheduled"
              value={formatNumber(kpis.postsScheduled)}
              icon={Calendar}
              current={kpis.postsScheduled}
              previous={previousKpis.postsScheduled}
            />
            <KPICard
              title="Avg Approval Time"
              value={`${formatNumber(kpis.avgApprovalTime, 1)}h`}
              icon={Clock}
              current={kpis.avgApprovalTime}
              previous={previousKpis.avgApprovalTime}
              inverse
            />
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Content Pipeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Published</span>
                  <span className="font-semibold">{kpis.postsPublished}</span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-500">Scheduled</span>
                  <span className="font-semibold">{kpis.postsScheduled}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Alerts Section */}
      {kpis.atRiskClients > 0 && (
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div className="flex-1">
              <p className="font-medium">
                {kpis.atRiskClients} client{kpis.atRiskClients > 1 ? "s" : ""} flagged as at-risk
              </p>
              <p className="text-sm text-gray-500">
                Review client health reports for details
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/reports/clients?filter=at-risk">
                View Details
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
