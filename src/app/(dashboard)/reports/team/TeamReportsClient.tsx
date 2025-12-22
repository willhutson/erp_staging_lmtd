"use client";

/**
 * Team Productivity Reports Client
 *
 * Interactive team productivity visualization with filtering.
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
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Search,
  Download,
  Users,
  Clock,
  Target,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";
import type { TeamProductivity } from "@/modules/reporting/actions/analytics-actions";

interface TeamReportsClientProps {
  productivity: TeamProductivity[];
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

function getUtilizationColor(rate: number): string {
  if (rate >= 90) return "text-red-600";
  if (rate >= 75) return "text-green-600";
  if (rate >= 50) return "text-yellow-600";
  return "text-gray-500";
}

function getUtilizationBg(rate: number): string {
  if (rate >= 90) return "bg-red-500";
  if (rate >= 75) return "bg-green-500";
  if (rate >= 50) return "bg-yellow-500";
  return "bg-gray-400";
}

function getLoadBadge(percentage: number) {
  if (percentage > 100) {
    return <Badge className="bg-red-100 text-red-700">Overloaded</Badge>;
  }
  if (percentage > 80) {
    return <Badge className="bg-yellow-100 text-yellow-700">High</Badge>;
  }
  if (percentage > 50) {
    return <Badge className="bg-green-100 text-green-700">Balanced</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-700">Available</Badge>;
}

export function TeamReportsClient({
  productivity,
  currentMonth,
}: TeamReportsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"utilization" | "hours" | "load">("utilization");

  // Get unique departments
  const departments = [...new Set(productivity.map((p) => p.department))].filter(Boolean);

  // Filter and sort
  const filteredProductivity = productivity
    .filter((p) => {
      const matchesSearch = p.userName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" || p.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "utilization":
          return b.utilizationRate - a.utilizationRate;
        case "hours":
          return b.totalHours - a.totalHours;
        case "load":
          return b.loadPercentage - a.loadPercentage;
        default:
          return 0;
      }
    });

  // Calculate totals
  const totals = filteredProductivity.reduce(
    (acc, p) => ({
      totalHours: acc.totalHours + p.totalHours,
      billableHours: acc.billableHours + p.billableHours,
      briefsCompleted: acc.briefsCompleted + p.briefsCompleted,
      capacity: acc.capacity + p.weeklyCapacity * 4, // Monthly
    }),
    { totalHours: 0, billableHours: 0, briefsCompleted: 0, capacity: 0 }
  );

  const avgUtilization = totals.capacity > 0 ? (totals.totalHours / totals.capacity) * 100 : 0;
  const overloadedCount = filteredProductivity.filter((p) => p.loadPercentage > 100).length;

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
            <h1 className="text-2xl font-bold">Team Productivity</h1>
            <p className="text-gray-600">Utilization metrics for {currentMonth}</p>
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
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Team Size</p>
                <p className="text-2xl font-bold">{filteredProductivity.length}</p>
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
                <p className="text-sm text-gray-500">Total Hours</p>
                <p className="text-2xl font-bold">{formatHours(totals.totalHours)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Avg Utilization</p>
                <p className={`text-2xl font-bold ${getUtilizationColor(avgUtilization)}`}>
                  {formatPercent(avgUtilization)}
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
                <p className="text-sm text-gray-500">Overloaded</p>
                <p className="text-2xl font-bold">{overloadedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Team Utilization Overview</CardTitle>
          <CardDescription>Visual representation of team capacity usage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredProductivity.slice(0, 10).map((person) => (
              <div key={person.userId} className="flex items-center gap-4">
                <div className="w-32 truncate">
                  <span className="text-sm font-medium">{person.userName}</span>
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${getUtilizationBg(person.utilizationRate)}`}
                      style={{ width: `${Math.min(100, person.utilizationRate)}%` }}
                    />
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className={`text-sm font-medium ${getUtilizationColor(person.utilizationRate)}`}>
                    {formatPercent(person.utilizationRate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search team members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="utilization">Highest Utilization</SelectItem>
                <SelectItem value="hours">Most Hours</SelectItem>
                <SelectItem value="load">Highest Load</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Team Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
          <CardDescription>
            Showing {filteredProductivity.length} team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Hours Logged</TableHead>
                <TableHead className="text-right">Utilization</TableHead>
                <TableHead className="text-right">Briefs Done</TableHead>
                <TableHead className="text-right">Current Load</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProductivity.map((person) => (
                <TableRow key={person.userId}>
                  <TableCell>
                    <Link
                      href={`/team/${person.userId}`}
                      className="font-medium hover:underline"
                    >
                      {person.userName}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{person.department || "—"}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-gray-600">{person.role || "—"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-medium">{formatHours(person.totalHours)}</span>
                      <span className="text-gray-400 text-sm ml-1">
                        / {formatHours(person.weeklyCapacity * 4)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className={`font-medium ${getUtilizationColor(person.utilizationRate)}`}>
                      {formatPercent(person.utilizationRate)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="text-green-600">{person.briefsCompleted}</span>
                    <span className="text-gray-400"> / </span>
                    <span>{person.briefsAssigned}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <span className="text-sm">{formatHours(person.currentLoad)}</span>
                      <div className="w-16">
                        <Progress
                          value={Math.min(100, person.loadPercentage)}
                          className={`h-2 ${
                            person.loadPercentage > 100
                              ? "[&>div]:bg-red-500"
                              : person.loadPercentage > 80
                              ? "[&>div]:bg-yellow-500"
                              : "[&>div]:bg-green-500"
                          }`}
                        />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getLoadBadge(person.loadPercentage)}
                  </TableCell>
                </TableRow>
              ))}
              {filteredProductivity.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No team members found matching your filters
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
