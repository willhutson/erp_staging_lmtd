"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import {
  getExternalAnalytics,
  getRealTimeMetrics,
  getClientList,
} from "../actions";
import { MetricCard } from "./charts/MetricCard";
import { LineChart } from "./charts/LineChart";
import { PieChart } from "./charts/PieChart";

interface ExternalDashboardProps {
  organizationId: string;
  dateRange: { start: Date; end: Date };
}

interface RealTimeData {
  briefsInProgress: number;
  briefsInReview: number;
  briefsPendingApproval: number;
  activeTeamMembers: number;
  hoursLoggedToday: number;
  upcomingDeadlines: Array<{
    briefId: string;
    title: string;
    deadline: Date;
    assignee: string;
    daysUntil: number;
    isOverdue: boolean;
  }>;
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: Date;
  }>;
}

interface ClientOption {
  id: string;
  name: string;
}

interface ClientAnalytics {
  clientName: string;
  realTime: {
    activeBriefs: number;
    pendingApprovals: number;
    inReview: number;
    completedThisMonth: number;
    avgResponseTime: number;
  };
  periodComparison: {
    currentPeriod: {
      briefsCompleted: number;
      avgTurnaroundDays: number;
      onTimeDeliveryRate: number;
      totalHours: number;
    };
    changes: {
      briefsCompleted: number;
      turnaroundChange: number;
      onTimeChange: number;
      hoursChange: number;
    };
  };
  briefsByType: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    briefs: number;
    hours: number;
    onTimeRate: number;
  }>;
}

export function ExternalDashboard({
  organizationId,
  dateRange,
}: ExternalDashboardProps) {
  const [view, setView] = useState<"realtime" | "period">("realtime");
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [selectedClient, setSelectedClient] = useState<string>("all");
  const [realTimeData, setRealTimeData] = useState<RealTimeData | null>(null);
  const [clientAnalytics, setClientAnalytics] = useState<ClientAnalytics | null>(
    null
  );

  // Load clients
  useEffect(() => {
    async function loadClients() {
      const clientList = await getClientList(organizationId);
      setClients(clientList);
    }
    loadClients();
  }, [organizationId]);

  // Load data based on view
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        if (view === "realtime") {
          const data = await getRealTimeMetrics(
            organizationId,
            selectedClient !== "all" ? selectedClient : undefined
          );
          setRealTimeData(data);
        } else {
          if (selectedClient !== "all") {
            const data = await getExternalAnalytics(
              organizationId,
              selectedClient,
              dateRange
            );
            setClientAnalytics(data);
          }
        }
      } catch (error) {
        console.error("Failed to load external analytics:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [organizationId, view, selectedClient, dateRange]);

  // Auto-refresh real-time data every 30 seconds
  useEffect(() => {
    if (view !== "realtime") return;

    const interval = setInterval(async () => {
      const data = await getRealTimeMetrics(
        organizationId,
        selectedClient !== "all" ? selectedClient : undefined
      );
      setRealTimeData(data);
    }, 30000);

    return () => clearInterval(interval);
  }, [organizationId, view, selectedClient]);

  return (
    <div className="space-y-6">
      {/* View Toggle & Client Filter */}
      <div className="flex items-center justify-between">
        <Tabs value={view} onValueChange={(v) => setView(v as "realtime" | "period")}>
          <TabsList>
            <TabsTrigger value="realtime" className="gap-2">
              <Activity className="h-4 w-4" />
              Real-Time
            </TabsTrigger>
            <TabsTrigger value="period" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              Period Analysis
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Clients</SelectItem>
            {clients.map((client) => (
              <SelectItem key={client.id} value={client.id}>
                {client.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted/50" />
              <CardContent className="h-24 bg-muted/30" />
            </Card>
          ))}
        </div>
      ) : view === "realtime" ? (
        <RealTimeView data={realTimeData} />
      ) : selectedClient === "all" ? (
        <div className="flex items-center justify-center h-[400px] text-muted-foreground">
          Select a client to view period analysis
        </div>
      ) : (
        <PeriodAnalysisView data={clientAnalytics} />
      )}
    </div>
  );
}

function RealTimeView({ data }: { data: RealTimeData | null }) {
  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          title="In Progress"
          value={data.briefsInProgress}
          icon={<FileText className="h-4 w-4" />}
          variant="default"
        />
        <MetricCard
          title="In Review"
          value={data.briefsInReview}
          icon={<Clock className="h-4 w-4" />}
          variant="warning"
        />
        <MetricCard
          title="Pending Approval"
          value={data.briefsPendingApproval}
          icon={<AlertCircle className="h-4 w-4" />}
          variant="info"
        />
        <MetricCard
          title="Active Team"
          value={data.activeTeamMembers}
          icon={<Users className="h-4 w-4" />}
          variant="success"
        />
        <MetricCard
          title="Hours Today"
          value={data.hoursLoggedToday}
          icon={<Clock className="h-4 w-4" />}
          variant="default"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Upcoming Deadlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.upcomingDeadlines.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No upcoming deadlines
                </p>
              ) : (
                data.upcomingDeadlines.slice(0, 5).map((item) => (
                  <div
                    key={item.briefId}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{item.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.assignee}
                      </p>
                    </div>
                    <Badge
                      variant={
                        item.isOverdue
                          ? "destructive"
                          : item.daysUntil <= 1
                          ? "warning"
                          : "secondary"
                      }
                    >
                      {item.isOverdue
                        ? "Overdue"
                        : item.daysUntil === 0
                        ? "Today"
                        : `${item.daysUntil}d`}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground">No recent activity</p>
              ) : (
                data.recentActivity.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 py-2 border-b last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(item.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function PeriodAnalysisView({ data }: { data: ClientAnalytics | null }) {
  if (!data) return null;

  const { periodComparison, briefsByType, monthlyTrend } = data;

  return (
    <div className="space-y-6">
      {/* Period Comparison */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Briefs Completed"
          value={periodComparison.currentPeriod.briefsCompleted}
          change={periodComparison.changes.briefsCompleted}
          icon={<FileText className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Turnaround"
          value={`${periodComparison.currentPeriod.avgTurnaroundDays}d`}
          change={periodComparison.changes.turnaroundChange}
          invertChange
          icon={<Clock className="h-4 w-4" />}
        />
        <MetricCard
          title="On-Time Rate"
          value={`${periodComparison.currentPeriod.onTimeDeliveryRate}%`}
          change={periodComparison.changes.onTimeChange}
          icon={<TrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Hours"
          value={periodComparison.currentPeriod.totalHours}
          change={periodComparison.changes.hoursChange}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              data={monthlyTrend}
              xKey="month"
              lines={[
                { key: "briefs", color: "#52EDC7", label: "Briefs" },
                { key: "onTimeRate", color: "#1BA098", label: "On-Time %" },
              ]}
              height={250}
            />
          </CardContent>
        </Card>

        {/* Brief Types Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Brief Types</CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart
              data={briefsByType.map((item) => ({
                name: item.type.replace(/_/g, " "),
                value: item.count,
                percentage: item.percentage,
              }))}
              height={250}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
