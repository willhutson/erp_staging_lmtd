"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Users,
  Clock,
  CheckCircle,
  TrendingUp,
} from "lucide-react";
import { getInternalAnalytics } from "../actions";
import { MetricCard } from "./charts/MetricCard";
import { BarChart } from "./charts/BarChart";
import { HeatmapChart } from "./charts/HeatmapChart";
import { LineChart } from "./charts/LineChart";
import type { MetricResult } from "@/lib/analytics/internal";

interface InternalDashboardProps {
  organizationId: string;
  dateRange: { start: Date; end: Date };
}

type OverviewMetrics = Record<string, MetricResult>;

interface TeamMember {
  userId: string;
  name: string;
  department: string;
  briefsCompleted: number;
  briefsInProgress: number;
  hoursLogged: number;
  utilizationRate: number;
  avgTurnaroundDays: number;
  onTimeRate: number;
}

interface DepartmentMetric {
  [key: string]: string | number;
  department: string;
  teamSize: number;
  briefsCompleted: number;
  totalHours: number;
  avgUtilization: number;
  briefsPerMember: number;
}

interface ThroughputData {
  [key: string]: string | number;
  date: string;
  created: number;
  completed: number;
}

interface HeatmapData {
  userId: string;
  name: string;
  data: Array<{ date: string; hours: number; capacity: number }>;
}

export function InternalDashboard({
  organizationId,
  dateRange,
}: InternalDashboardProps) {
  const [loading, setLoading] = useState(true);
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [teamPerformance, setTeamPerformance] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<DepartmentMetric[]>([]);
  const [throughput, setThroughput] = useState<ThroughputData[]>([]);
  const [heatmap, setHeatmap] = useState<HeatmapData[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const data = await getInternalAnalytics(organizationId, dateRange);
        setOverview(data.overview);
        setTeamPerformance(data.teamPerformance);
        setDepartments(data.departments);
        setThroughput(data.throughput);
        setHeatmap(data.heatmap);
      } catch (error) {
        console.error("Failed to load analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [organizationId, dateRange]);

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-20 bg-muted/50" />
            <CardContent className="h-32 bg-muted/30" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <MetricCard
          title="Total Briefs"
          value={overview?.totalBriefs?.value || 0}
          change={overview?.totalBriefs?.change || 0}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <MetricCard
          title="Completed"
          value={overview?.completedBriefs?.value || 0}
          change={overview?.completedBriefs?.change || 0}
          icon={<CheckCircle className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Turnaround"
          value={`${overview?.avgTurnaround?.value || 0}d`}
          change={overview?.avgTurnaround?.change || 0}
          invertChange
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="Utilization"
          value={`${overview?.utilizationRate?.value || 0}%`}
          change={overview?.utilizationRate?.change || 0}
          icon={<Users className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Hours"
          value={overview?.totalHours?.value || 0}
          change={overview?.totalHours?.change || 0}
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="On-Time Rate"
          value={`${overview?.onTimeRate?.value || 0}%`}
          change={overview?.onTimeRate?.change || 0}
          icon={<TrendingUp className="h-4 w-4" />}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Brief Throughput</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={throughput}
              xKey="date"
              lines={[
                { key: "created", color: "#52EDC7", label: "Created" },
                { key: "completed", color: "#1BA098", label: "Completed" },
              ]}
              height={250}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Department Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart
              data={departments}
              xKey="department"
              bars={[
                { key: "briefsCompleted", color: "#52EDC7", label: "Briefs" },
                { key: "totalHours", color: "#1BA098", label: "Hours" },
              ]}
              height={250}
            />
          </CardContent>
        </Card>
      </div>

      {/* Team Capacity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle>Team Capacity Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <HeatmapChart data={heatmap} height={300} />
        </CardContent>
      </Card>

      {/* Team Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-3 text-left font-medium">Team Member</th>
                  <th className="py-3 text-left font-medium">Department</th>
                  <th className="py-3 text-right font-medium">Briefs</th>
                  <th className="py-3 text-right font-medium">Hours</th>
                  <th className="py-3 text-right font-medium">Utilization</th>
                  <th className="py-3 text-right font-medium">On-Time</th>
                </tr>
              </thead>
              <tbody>
                {teamPerformance.slice(0, 10).map((member) => (
                  <tr key={member.userId} className="border-b last:border-0">
                    <td className="py-3 font-medium">{member.name}</td>
                    <td className="py-3 text-muted-foreground">
                      {member.department}
                    </td>
                    <td className="py-3 text-right">{member.briefsCompleted}</td>
                    <td className="py-3 text-right">{member.hoursLogged}h</td>
                    <td className="py-3 text-right">
                      <span
                        className={
                          member.utilizationRate > 90
                            ? "text-red-500"
                            : member.utilizationRate > 70
                            ? "text-yellow-500"
                            : "text-green-500"
                        }
                      >
                        {member.utilizationRate}%
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className={
                          member.onTimeRate >= 90
                            ? "text-green-500"
                            : member.onTimeRate >= 70
                            ? "text-yellow-500"
                            : "text-red-500"
                        }
                      >
                        {member.onTimeRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
