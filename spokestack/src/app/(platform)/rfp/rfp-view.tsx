"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  List,
  LayoutGrid,
  GanttChart,
  Clock,
  DollarSign,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Trophy,
} from "lucide-react";

// Dummy RFP data
const DUMMY_RFPS = [
  { id: "1", name: "Dubai Tourism Campaign 2026", clientName: "Dubai Tourism", value: 850000, deadline: "2026-01-15", status: "ACTIVE", probability: "HIGH", tasks: 12, completedTasks: 4 },
  { id: "2", name: "Abu Dhabi Sports Council Rebrand", clientName: "ADSC", value: 420000, deadline: "2026-01-20", status: "VETTING", probability: "MEDIUM", tasks: 8, completedTasks: 0 },
  { id: "3", name: "Sharjah Museums Digital Experience", clientName: "Sharjah Museums", value: 680000, deadline: "2026-02-01", status: "AWAITING_REVIEW", probability: "HIGH", tasks: 15, completedTasks: 10 },
  { id: "4", name: "RAK Tourism Video Series", clientName: "RAK Tourism", value: 320000, deadline: "2026-01-25", status: "READY_TO_SUBMIT", probability: "MEDIUM", tasks: 6, completedTasks: 6 },
  { id: "5", name: "Ajman Media Hub Launch", clientName: "Ajman Media", value: 250000, deadline: "2026-02-10", status: "SUBMITTED", probability: "LOW", tasks: 10, completedTasks: 10 },
  { id: "6", name: "UAE Space Agency Documentary", clientName: "MBRSC", value: 1200000, deadline: "2026-01-30", status: "AWAITING_RESPONSE", probability: "HIGH", tasks: 20, completedTasks: 20 },
  { id: "7", name: "Emirates NBD Brand Campaign", clientName: "Emirates NBD", value: 550000, deadline: "2026-02-15", status: "ACTIVE", probability: "MEDIUM", tasks: 9, completedTasks: 2 },
  { id: "8", name: "Etisalat 5G Experience Center", clientName: "Etisalat", value: 780000, deadline: "2026-01-18", status: "VETTING", probability: "HIGH", tasks: 14, completedTasks: 0 },
];

const STATUSES = [
  { id: "VETTING", label: "Vetting", color: "bg-slate-500" },
  { id: "ACTIVE", label: "Active", color: "bg-blue-500" },
  { id: "AWAITING_REVIEW", label: "Review", color: "bg-purple-500" },
  { id: "READY_TO_SUBMIT", label: "Ready", color: "bg-amber-500" },
  { id: "SUBMITTED", label: "Submitted", color: "bg-cyan-500" },
  { id: "AWAITING_RESPONSE", label: "Awaiting", color: "bg-indigo-500" },
];

type ViewMode = "kanban" | "list" | "timeline";

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  return `$${value.toFixed(0)}`;
}

function getStatusBadge(status: string) {
  const statusConfig = STATUSES.find((s) => s.id === status);
  return <Badge className={statusConfig?.color}>{statusConfig?.label || status}</Badge>;
}

function getProbabilityBadge(probability: string) {
  switch (probability) {
    case "HIGH":
      return <Badge className="bg-green-500">High</Badge>;
    case "MEDIUM":
      return <Badge className="bg-amber-500">Medium</Badge>;
    case "LOW":
      return <Badge variant="outline">Low</Badge>;
    default:
      return null;
  }
}

export function RfpView() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={viewMode === "kanban" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("kanban")}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Pipeline
        </Button>
        <Button
          variant={viewMode === "list" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("list")}
          className="gap-2"
        >
          <List className="h-4 w-4" />
          List
        </Button>
        <Button
          variant={viewMode === "timeline" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("timeline")}
          className="gap-2"
        >
          <GanttChart className="h-4 w-4" />
          Timeline
        </Button>
      </div>

      {/* Views */}
      {viewMode === "kanban" && <KanbanView rfps={DUMMY_RFPS} />}
      {viewMode === "list" && <ListView rfps={DUMMY_RFPS} />}
      {viewMode === "timeline" && <TimelineView rfps={DUMMY_RFPS} />}
    </div>
  );
}

function KanbanView({ rfps }: { rfps: typeof DUMMY_RFPS }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const statusRfps = rfps.filter((r) => r.status === status.id);
        const totalValue = statusRfps.reduce((sum, r) => sum + r.value, 0);
        return (
          <div key={status.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <h3 className="font-medium text-sm">{status.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{statusRfps.length}</Badge>
                {totalValue > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    {formatCurrency(totalValue)}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3 min-h-[400px] p-2 bg-muted/30 rounded-lg">
              {statusRfps.map((rfp) => (
                <Card
                  key={rfp.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="font-medium text-sm line-clamp-2">{rfp.name}</h4>
                      {getProbabilityBadge(rfp.probability)}
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{rfp.clientName}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Progress</span>
                        <span>{rfp.completedTasks}/{rfp.tasks} tasks</span>
                      </div>
                      <Progress value={(rfp.completedTasks / rfp.tasks) * 100} className="h-1.5" />
                    </div>

                    <div className="flex items-center justify-between pt-3 mt-3 border-t text-xs">
                      <span className="font-medium text-green-600">{formatCurrency(rfp.value)}</span>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {new Date(rfp.deadline).toLocaleDateString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {statusRfps.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No RFPs
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ListView({ rfps }: { rfps: typeof DUMMY_RFPS }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>RFP</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Probability</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rfps.map((rfp) => (
              <TableRow key={rfp.id}>
                <TableCell>
                  <Link href={`/rfp/${rfp.id}`} className="font-medium hover:underline">
                    {rfp.name}
                  </Link>
                </TableCell>
                <TableCell>{rfp.clientName}</TableCell>
                <TableCell>
                  <span className="font-medium text-green-600">{formatCurrency(rfp.value)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(rfp.completedTasks / rfp.tasks) * 100} className="h-2 w-16" />
                    <span className="text-xs text-muted-foreground">
                      {rfp.completedTasks}/{rfp.tasks}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-sm">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    {new Date(rfp.deadline).toLocaleDateString()}
                  </div>
                </TableCell>
                <TableCell>{getProbabilityBadge(rfp.probability)}</TableCell>
                <TableCell>{getStatusBadge(rfp.status)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>View Details</DropdownMenuItem>
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Trophy className="h-4 w-4 mr-2 text-green-500" />
                        Mark as Won
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">Mark as Lost</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function TimelineView({ rfps }: { rfps: typeof DUMMY_RFPS }) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);

  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  // Sort RFPs by deadline
  const sortedRfps = [...rfps].sort(
    (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  const getBarPosition = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const diffDays = Math.floor((deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, 41));
  };

  const getStatusColor = (status: string) => {
    const statusConfig = STATUSES.find((s) => s.id === status);
    return statusConfig?.color || "bg-slate-500";
  };

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[1200px]">
          {/* Header */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            <div className="w-64 flex-shrink-0 p-3 border-r font-medium text-sm">
              RFP
            </div>
            <div className="flex-1 flex">
              {days.map((day, i) => {
                const isToday = day.toDateString() === today.toDateString();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                const isMonthStart = day.getDate() === 1;
                return (
                  <div
                    key={i}
                    className={`flex-1 p-1 text-center text-[10px] border-r ${
                      isToday ? "bg-primary/10" : isWeekend ? "bg-muted/50" : ""
                    } ${isMonthStart ? "border-l-2 border-l-primary/50" : ""}`}
                  >
                    {(i === 0 || isMonthStart) && (
                      <div className="text-muted-foreground font-medium">
                        {day.toLocaleDateString("en", { month: "short" })}
                      </div>
                    )}
                    <div className={isToday ? "text-primary font-medium" : ""}>
                      {day.getDate()}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          {sortedRfps.map((rfp) => {
            const pos = getBarPosition(rfp.deadline);
            return (
              <div key={rfp.id} className="flex border-b hover:bg-muted/20">
                <div className="w-64 flex-shrink-0 p-3 border-r">
                  <div className="flex items-center justify-between">
                    <div className="truncate">
                      <Link href={`/rfp/${rfp.id}`} className="font-medium text-sm hover:underline truncate block">
                        {rfp.name}
                      </Link>
                      <p className="text-xs text-muted-foreground truncate">{rfp.clientName}</p>
                    </div>
                    <span className="text-xs font-medium text-green-600 flex-shrink-0 ml-2">
                      {formatCurrency(rfp.value)}
                    </span>
                  </div>
                </div>
                <div className="flex-1 relative h-14">
                  {/* Grid lines */}
                  <div className="absolute inset-0 flex">
                    {days.map((day, i) => {
                      const isToday = day.toDateString() === today.toDateString();
                      const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                      return (
                        <div
                          key={i}
                          className={`flex-1 border-r ${
                            isToday ? "bg-primary/5" : isWeekend ? "bg-muted/30" : ""
                          }`}
                        />
                      );
                    })}
                  </div>
                  {/* Deadline marker */}
                  <div
                    className={`absolute top-2 h-10 rounded-lg px-2 flex items-center gap-2 text-white text-xs ${getStatusColor(rfp.status)}`}
                    style={{
                      left: `${Math.max(0, (pos - 5) / 42) * 100}%`,
                      width: `${(6 / 42) * 100}%`,
                    }}
                  >
                    <Progress
                      value={(rfp.completedTasks / rfp.tasks) * 100}
                      className="h-1.5 flex-1 bg-white/30"
                    />
                    <span className="text-[10px]">{Math.round((rfp.completedTasks / rfp.tasks) * 100)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
