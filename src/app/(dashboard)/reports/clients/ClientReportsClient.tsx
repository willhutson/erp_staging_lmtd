"use client";

/**
 * Client Reports Client Component
 *
 * Interactive client performance reports with filtering.
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
import { Input } from "@/components/ui/input";
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
import {
  ArrowLeft,
  Search,
  Download,
  FileText,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import type { ClientReport } from "@/modules/reporting/actions/analytics-actions";

interface ClientReportsClientProps {
  reports: ClientReport[];
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

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-green-100 text-green-700">Active</Badge>;
    case "AT_RISK":
      return <Badge className="bg-red-100 text-red-700">At Risk</Badge>;
    case "CHURNED":
      return <Badge className="bg-gray-100 text-gray-700">Churned</Badge>;
    case "ONBOARDING":
      return <Badge className="bg-blue-100 text-blue-700">Onboarding</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getBurnRateIndicator(burnRate: number) {
  if (burnRate > 100) {
    return (
      <span className="flex items-center text-red-600">
        <AlertTriangle className="w-4 h-4 mr-1" />
        {formatPercent(burnRate)}
      </span>
    );
  }
  if (burnRate > 80) {
    return (
      <span className="flex items-center text-yellow-600">
        <AlertCircle className="w-4 h-4 mr-1" />
        {formatPercent(burnRate)}
      </span>
    );
  }
  return (
    <span className="flex items-center text-green-600">
      <CheckCircle className="w-4 h-4 mr-1" />
      {formatPercent(burnRate)}
    </span>
  );
}

export function ClientReportsClient({
  reports,
  currentMonth,
}: ClientReportsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"hours" | "briefs" | "burnRate">("hours");

  // Filter and sort reports
  const filteredReports = reports
    .filter((report) => {
      const matchesSearch =
        report.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.clientCode.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || report.relationshipStatus === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "hours":
          return b.totalHours - a.totalHours;
        case "briefs":
          return b.totalBriefs - a.totalBriefs;
        case "burnRate":
          return b.burnRate - a.burnRate;
        default:
          return 0;
      }
    });

  // Calculate totals
  const totals = filteredReports.reduce(
    (acc, report) => ({
      totalHours: acc.totalHours + report.totalHours,
      totalBriefs: acc.totalBriefs + report.totalBriefs,
      completedBriefs: acc.completedBriefs + report.completedBriefs,
      totalPosts: acc.totalPosts + report.totalPosts,
      publishedPosts: acc.publishedPosts + report.publishedPosts,
    }),
    { totalHours: 0, totalBriefs: 0, completedBriefs: 0, totalPosts: 0, publishedPosts: 0 }
  );

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
            <h1 className="text-2xl font-bold">Client Reports</h1>
            <p className="text-gray-600">Performance metrics for {currentMonth}</p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">{formatHours(totals.totalHours)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Briefs</p>
                <p className="text-2xl font-bold">
                  {totals.completedBriefs}/{totals.totalBriefs}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Zap className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Content Published</p>
                <p className="text-2xl font-bold">
                  {totals.publishedPosts}/{totals.totalPosts}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">At Risk</p>
                <p className="text-2xl font-bold">
                  {reports.filter((r) => r.relationshipStatus === "AT_RISK").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search clients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="AT_RISK">At Risk</SelectItem>
                <SelectItem value="ONBOARDING">Onboarding</SelectItem>
                <SelectItem value="CHURNED">Churned</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hours">Most Hours</SelectItem>
                <SelectItem value="briefs">Most Briefs</SelectItem>
                <SelectItem value="burnRate">Highest Burn Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Client Table */}
      <Card>
        <CardHeader>
          <CardTitle>Client Performance</CardTitle>
          <CardDescription>
            Showing {filteredReports.length} of {reports.length} clients
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Briefs</TableHead>
                <TableHead className="text-right">Content</TableHead>
                <TableHead className="text-right">Retainer Burn</TableHead>
                <TableHead className="text-right">NPS</TableHead>
                <TableHead className="text-right">Issues</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow
                  key={report.clientId}
                  className="cursor-pointer hover:bg-gray-50"
                >
                  <TableCell>
                    <Link
                      href={`/clients/${report.clientId}`}
                      className="hover:underline"
                    >
                      <div className="font-medium">{report.clientName}</div>
                      <div className="text-sm text-gray-500">{report.clientCode}</div>
                    </Link>
                  </TableCell>
                  <TableCell>{getStatusBadge(report.relationshipStatus)}</TableCell>
                  <TableCell className="text-right">
                    {formatHours(report.totalHours)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">{report.completedBriefs}</span>
                    <span className="text-gray-400"> / </span>
                    <span>{report.totalBriefs}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-purple-600">{report.publishedPosts}</span>
                    <span className="text-gray-400"> / </span>
                    <span>{report.totalPosts}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {report.isRetainer ? (
                      getBurnRateIndicator(report.burnRate)
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.npsScore !== null ? (
                      <span
                        className={
                          report.npsScore >= 9
                            ? "text-green-600"
                            : report.npsScore >= 7
                            ? "text-gray-600"
                            : "text-red-600"
                        }
                      >
                        {report.npsScore}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {report.openIssues > 0 ? (
                      <span className="flex items-center justify-end text-red-600">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {report.openIssues}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredReports.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No clients found matching your filters
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
