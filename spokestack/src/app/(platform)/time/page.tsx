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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  Clock,
  Play,
  Pause,
  Calendar,
  Timer,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";

async function getTimeStats() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());

    const [todayEntries, weekEntries, pendingApproval] = await Promise.all([
      prisma.timeEntry.aggregate({
        where: { date: { gte: today } },
        _sum: { hours: true },
      }),
      prisma.timeEntry.aggregate({
        where: { date: { gte: weekStart } },
        _sum: { hours: true },
      }),
      prisma.timeEntry.count({
        where: { isApproved: false },
      }),
    ]);

    return {
      todayHours: Number(todayEntries._sum.hours || 0),
      weekHours: Number(weekEntries._sum.hours || 0),
      pendingApproval,
    };
  } catch {
    return { todayHours: 0, weekHours: 0, pendingApproval: 0 };
  }
}

async function getRecentEntries() {
  try {
    return prisma.timeEntry.findMany({
      take: 20,
      orderBy: { date: "desc" },
      include: {
        user: { select: { name: true } },
        brief: { select: { title: true, briefNumber: true } },
        project: { select: { name: true } },
      },
    });
  } catch {
    return [];
  }
}

export default async function TimePage() {
  let stats = { todayHours: 0, weekHours: 0, pendingApproval: 0 };
  let entries: Awaited<ReturnType<typeof getRecentEntries>> = [];

  try {
    [stats, entries] = await Promise.all([getTimeStats(), getRecentEntries()]);
  } catch {
    // Fallback to defaults on error
  }

  const weeklyTarget = 40;
  const weeklyProgress = (stats.weekHours / weeklyTarget) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Time Tracking</h1>
          <p className="text-muted-foreground">
            Log your hours and track time across projects
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Timesheet
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Start Timer
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.todayHours.toFixed(1)}h</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{stats.weekHours.toFixed(1)}h</span>
                <span className="text-sm text-muted-foreground">/ {weeklyTarget}h</span>
              </div>
              <Progress value={Math.min(weeklyProgress, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Billable Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">82%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Approval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.pendingApproval}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Timer Card */}
      <Card className="border-primary/50 bg-primary/5">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Timer className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">No active timer</p>
                <p className="text-lg font-medium">Start tracking your time</p>
              </div>
            </div>
            <Button size="lg">
              <Play className="mr-2 h-5 w-5" />
              Start Timer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Time Entries */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="recent" className="w-full">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="recent">Recent Entries</TabsTrigger>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="pending">Pending Approval</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="recent" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Project / Brief</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead className="text-right">Hours</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No time entries yet. Start tracking your time.
                      </TableCell>
                    </TableRow>
                  ) : (
                    entries.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>
                          {new Date(entry.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {entry.description || "No description"}
                          </span>
                        </TableCell>
                        <TableCell>
                          {entry.brief ? (
                            <Link
                              href={`/briefs/${entry.briefId}`}
                              className="text-sm text-primary hover:underline"
                            >
                              {entry.brief.title}
                            </Link>
                          ) : entry.project ? (
                            <span className="text-sm">{entry.project.name}</span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{entry.user?.name}</span>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {Number(entry.hours).toFixed(1)}h
                        </TableCell>
                        <TableCell>
                          {entry.isApproved ? (
                            <Badge className="bg-green-500">
                              <CheckCircle2 className="mr-1 h-3 w-3" />
                              Approved
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Pending</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="today" className="m-0 p-8 text-center text-muted-foreground">
              No entries for today yet
            </TabsContent>

            <TabsContent value="week" className="m-0 p-8 text-center text-muted-foreground">
              View weekly timesheet
            </TabsContent>

            <TabsContent value="pending" className="m-0 p-8 text-center text-muted-foreground">
              No entries pending approval
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
