export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Calendar,
} from "lucide-react";
import { ResourcesView } from "./resources-view";

async function getTeamCapacity() {
  try {
    // Get all active team members with their capacity
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        role: true,
        department: true,
        avatarUrl: true,
        weeklyCapacity: true,
      },
      orderBy: { name: "asc" },
    });

    // Get current week's time entries
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const timeEntries = await prisma.timeEntry.groupBy({
      by: ["userId"],
      where: {
        date: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      _sum: { hours: true },
    });

    // Get assigned briefs count
    const briefCounts = await prisma.brief.groupBy({
      by: ["assigneeId"],
      where: {
        status: { in: ["IN_PROGRESS", "APPROVED", "SUBMITTED"] },
        assigneeId: { not: null },
      },
      _count: true,
    });

    // Merge data
    return users.map((user) => {
      const timeEntry = timeEntries.find((t) => t.userId === user.id);
      const briefCount = briefCounts.find((b) => b.assigneeId === user.id);
      const hoursLogged = Number(timeEntry?._sum.hours || 0);
      const capacity = user.weeklyCapacity || 40;
      const utilization = capacity > 0 ? (hoursLogged / capacity) * 100 : 0;

      return {
        ...user,
        hoursLogged,
        capacity,
        utilization: Math.round(utilization),
        activeBriefs: briefCount?._count || 0,
      };
    });
  } catch {
    return [];
  }
}

async function getResourceStats() {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: { weeklyCapacity: true },
    });

    const totalCapacity = users.reduce((sum, u) => sum + (u.weeklyCapacity || 40), 0);

    // Get this week's logged hours
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const hoursResult = await prisma.timeEntry.aggregate({
      where: {
        date: {
          gte: startOfWeek,
          lt: endOfWeek,
        },
      },
      _sum: { hours: true },
    });

    const totalLogged = Number(hoursResult._sum.hours || 0);
    const avgUtilization = totalCapacity > 0 ? (totalLogged / totalCapacity) * 100 : 0;

    // Count overallocated (>100% utilization)
    const overallocated = users.filter((u) => {
      const capacity = u.weeklyCapacity || 40;
      return false; // Simplified - would need per-user calculation
    }).length;

    return {
      teamSize: users.length,
      totalCapacity,
      totalLogged: Math.round(totalLogged),
      avgUtilization: Math.round(avgUtilization),
      overallocated: 0, // Would need real calculation
    };
  } catch {
    return { teamSize: 0, totalCapacity: 0, totalLogged: 0, avgUtilization: 0, overallocated: 0 };
  }
}

function getUtilizationColor(utilization: number) {
  if (utilization >= 100) return "text-red-500";
  if (utilization >= 80) return "text-amber-500";
  if (utilization >= 50) return "text-emerald-500";
  return "text-blue-500";
}

function getUtilizationBadge(utilization: number) {
  if (utilization >= 100) {
    return (
      <Badge variant="destructive" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Over
      </Badge>
    );
  }
  if (utilization >= 80) {
    return (
      <Badge className="bg-amber-500 gap-1">
        <TrendingUp className="h-3 w-3" />
        High
      </Badge>
    );
  }
  if (utilization >= 50) {
    return (
      <Badge className="bg-emerald-500 gap-1">
        <CheckCircle2 className="h-3 w-3" />
        Good
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Clock className="h-3 w-3" />
      Low
    </Badge>
  );
}

export default async function ResourcesPage() {
  let team: Awaited<ReturnType<typeof getTeamCapacity>> = [];
  let stats = { teamSize: 0, totalCapacity: 0, totalLogged: 0, avgUtilization: 0, overallocated: 0 };

  try {
    [team, stats] = await Promise.all([getTeamCapacity(), getResourceStats()]);
  } catch {
    // Fallback to defaults
  }

  // Group by department
  const departments = team.reduce((acc, member) => {
    const dept = member.department || "Other";
    if (!acc[dept]) acc[dept] = [];
    acc[dept].push(member);
    return acc;
  }, {} as Record<string, typeof team>);

  const overallocatedMembers = team.filter((m) => m.utilization >= 100);
  const availableMembers = team.filter((m) => m.utilization < 50);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">
            Team capacity, utilization, and workload management
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.teamSize}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Weekly Capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{stats.totalCapacity}h</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Hours Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{stats.totalLogged}h</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Utilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className={`text-2xl font-bold ${getUtilizationColor(stats.avgUtilization)}`}>
                {stats.avgUtilization}%
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{availableMembers.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {overallocatedMembers.length > 0 && (
        <Card className="border-red-500/50 bg-red-50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              {overallocatedMembers.length} team member(s) over capacity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {overallocatedMembers.map((m) => (
                <Badge key={m.id} variant="outline" className="border-red-500 text-red-700 dark:text-red-400">
                  {m.name} ({m.utilization}%)
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resources View with Capacity/Workload/Timeline switcher */}
      <ResourcesView />
    </div>
  );
}
