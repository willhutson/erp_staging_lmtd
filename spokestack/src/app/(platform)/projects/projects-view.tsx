"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Users,
  FileText,
} from "lucide-react";

// Dummy project data
const DUMMY_PROJECTS = [
  { id: "1", name: "CCAD Q1 Retainer", code: "CCAD-RET-Q1", client: "CCAD", type: "RETAINER", status: "ACTIVE", budget: 120000, hoursUsed: 180, hoursTotal: 240, briefs: 8, startDate: "2025-01-01", endDate: "2025-03-31", team: ["SC", "MW", "LM"] },
  { id: "2", name: "DET Brand Refresh", code: "DET-PRJ-001", client: "DET", type: "PROJECT", status: "ACTIVE", budget: 85000, hoursUsed: 120, hoursTotal: 200, briefs: 12, startDate: "2025-01-15", endDate: "2025-02-28", team: ["AR", "JT", "OH"] },
  { id: "3", name: "ADEK Annual Campaign", code: "ADEK-PRJ-002", client: "ADEK", type: "PROJECT", status: "ACTIVE", budget: 250000, hoursUsed: 340, hoursTotal: 500, briefs: 24, startDate: "2024-12-01", endDate: "2025-06-30", team: ["SC", "LM", "FA", "MW"] },
  { id: "4", name: "ECD Product Launch", code: "ECD-PRJ-003", client: "ECD", type: "PROJECT", status: "ON_HOLD", budget: 150000, hoursUsed: 80, hoursTotal: 300, briefs: 6, startDate: "2025-02-01", endDate: "2025-04-30", team: ["JT", "AR"] },
  { id: "5", name: "CCAD Social Media", code: "CCAD-RET-SM", client: "CCAD", type: "RETAINER", status: "ACTIVE", budget: 45000, hoursUsed: 90, hoursTotal: 120, briefs: 15, startDate: "2025-01-01", endDate: "2025-03-31", team: ["FA", "MW"] },
  { id: "6", name: "New Client Pitch - TeleCo", code: "PITCH-TC-01", client: "TeleCo", type: "PITCH", status: "ACTIVE", budget: 0, hoursUsed: 40, hoursTotal: 60, briefs: 3, startDate: "2025-01-20", endDate: "2025-02-10", team: ["SC", "JT", "LM"] },
  { id: "7", name: "DET Q1 Retainer", code: "DET-RET-Q1", client: "DET", type: "RETAINER", status: "COMPLETED", budget: 90000, hoursUsed: 200, hoursTotal: 200, briefs: 18, startDate: "2024-10-01", endDate: "2024-12-31", team: ["AR", "OH", "MW"] },
  { id: "8", name: "Internal - Website Refresh", code: "INT-WEB-001", client: "Internal", type: "INTERNAL", status: "DRAFT", budget: 0, hoursUsed: 0, hoursTotal: 80, briefs: 0, startDate: "2025-02-15", endDate: "2025-03-15", team: ["AR"] },
];

const STATUSES = [
  { id: "DRAFT", label: "Draft", color: "bg-slate-500" },
  { id: "ACTIVE", label: "Active", color: "bg-emerald-500" },
  { id: "ON_HOLD", label: "On Hold", color: "bg-amber-500" },
  { id: "COMPLETED", label: "Completed", color: "bg-blue-500" },
];

const TYPES = [
  { id: "RETAINER", label: "Retainer", color: "border-emerald-500 text-emerald-600" },
  { id: "PROJECT", label: "Project", color: "border-blue-500 text-blue-600" },
  { id: "PITCH", label: "Pitch", color: "border-purple-500 text-purple-600" },
  { id: "INTERNAL", label: "Internal", color: "border-slate-500 text-slate-600" },
];

type ViewMode = "list" | "kanban" | "timeline";

function formatCurrency(value: number) {
  if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
  if (value === 0) return "-";
  return `$${value.toFixed(0)}`;
}

function getStatusBadge(status: string) {
  const statusConfig = STATUSES.find((s) => s.id === status);
  return <Badge className={statusConfig?.color}>{statusConfig?.label || status}</Badge>;
}

function getTypeBadge(type: string) {
  const typeConfig = TYPES.find((t) => t.id === type);
  return (
    <Badge variant="outline" className={typeConfig?.color}>
      {typeConfig?.label || type}
    </Badge>
  );
}

export function ProjectsView() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
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
          variant={viewMode === "kanban" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("kanban")}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Board
        </Button>
        <Button
          variant={viewMode === "timeline" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("timeline")}
          className="gap-2"
        >
          <GanttChart className="h-4 w-4" />
          Gantt
        </Button>
      </div>

      {/* Views */}
      {viewMode === "list" && <ListView projects={DUMMY_PROJECTS} />}
      {viewMode === "kanban" && <KanbanView projects={DUMMY_PROJECTS} />}
      {viewMode === "timeline" && <GanttView projects={DUMMY_PROJECTS} />}
    </div>
  );
}

function ListView({ projects }: { projects: typeof DUMMY_PROJECTS }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Hours</TableHead>
              <TableHead>Briefs</TableHead>
              <TableHead>Team</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div>
                    <Link href={`/projects/${project.id}`} className="font-medium hover:underline">
                      {project.name}
                    </Link>
                    <p className="text-xs text-muted-foreground font-mono">{project.code}</p>
                  </div>
                </TableCell>
                <TableCell>{project.client}</TableCell>
                <TableCell>{getTypeBadge(project.type)}</TableCell>
                <TableCell>
                  <span className="font-medium">{formatCurrency(project.budget)}</span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={(project.hoursUsed / project.hoursTotal) * 100} className="h-2 w-16" />
                    <span className="text-xs text-muted-foreground">
                      {project.hoursUsed}/{project.hoursTotal}h
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{project.briefs}</Badge>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-1">
                    {project.team.slice(0, 3).map((initials) => (
                      <Avatar key={initials} className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-[10px] bg-primary/10">{initials}</AvatarFallback>
                      </Avatar>
                    ))}
                    {project.team.length > 3 && (
                      <Avatar className="h-6 w-6 border-2 border-background">
                        <AvatarFallback className="text-[10px] bg-muted">+{project.team.length - 3}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
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
                      <DropdownMenuItem>View Briefs</DropdownMenuItem>
                      <DropdownMenuItem>View Time</DropdownMenuItem>
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

function KanbanView({ projects }: { projects: typeof DUMMY_PROJECTS }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const statusProjects = projects.filter((p) => p.status === status.id);
        const totalBudget = statusProjects.reduce((sum, p) => sum + p.budget, 0);
        return (
          <div key={status.id} className="flex-shrink-0 w-80">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <h3 className="font-medium text-sm">{status.label}</h3>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{statusProjects.length}</Badge>
                {totalBudget > 0 && (
                  <span className="text-xs text-green-600 font-medium">
                    {formatCurrency(totalBudget)}
                  </span>
                )}
              </div>
            </div>
            <div className="space-y-3 min-h-[400px] p-2 bg-muted/30 rounded-lg">
              {statusProjects.map((project) => {
                const hoursPercent = (project.hoursUsed / project.hoursTotal) * 100;
                return (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        {getTypeBadge(project.type)}
                        {project.budget > 0 && (
                          <span className="text-xs font-medium text-green-600">
                            {formatCurrency(project.budget)}
                          </span>
                        )}
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2 mb-1">{project.name}</h4>
                      <p className="text-xs text-muted-foreground mb-3">{project.client}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Hours
                          </span>
                          <span className={hoursPercent > 90 ? "text-red-500" : ""}>
                            {project.hoursUsed}/{project.hoursTotal}h
                          </span>
                        </div>
                        <Progress
                          value={Math.min(hoursPercent, 100)}
                          className={`h-1.5 ${hoursPercent > 100 ? "[&>div]:bg-red-500" : ""}`}
                        />
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {project.briefs} briefs
                        </div>
                        <div className="flex -space-x-1">
                          {project.team.slice(0, 3).map((initials) => (
                            <Avatar key={initials} className="h-5 w-5 border border-background">
                              <AvatarFallback className="text-[8px] bg-primary/10">{initials}</AvatarFallback>
                            </Avatar>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {statusProjects.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No projects
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GanttView({ projects }: { projects: typeof DUMMY_PROJECTS }) {
  const today = new Date();

  // Find the date range
  const allDates = projects.flatMap((p) => [new Date(p.startDate), new Date(p.endDate)]);
  const minDate = new Date(Math.min(...allDates.map((d) => d.getTime())));
  const maxDate = new Date(Math.max(...allDates.map((d) => d.getTime())));

  // Start from 1 week before min date
  const startDate = new Date(minDate);
  startDate.setDate(startDate.getDate() - 7);

  // Generate months
  const months: { date: Date; days: number }[] = [];
  const current = new Date(startDate);
  while (current <= maxDate) {
    const monthStart = new Date(current.getFullYear(), current.getMonth(), 1);
    const monthEnd = new Date(current.getFullYear(), current.getMonth() + 1, 0);
    const daysInMonth = monthEnd.getDate();
    months.push({ date: monthStart, days: daysInMonth });
    current.setMonth(current.getMonth() + 1);
  }

  const totalDays = Math.ceil((maxDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 14;

  const getBarPosition = (date: string) => {
    const d = new Date(date);
    const diffDays = Math.ceil((d.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return (diffDays / totalDays) * 100;
  };

  const getBarWidth = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    const diffDays = Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    return (diffDays / totalDays) * 100;
  };

  const getStatusColor = (status: string) => {
    const statusConfig = STATUSES.find((s) => s.id === status);
    return statusConfig?.color || "bg-slate-500";
  };

  // Sort projects by start date
  const sortedProjects = [...projects].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Header */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            <div className="w-56 flex-shrink-0 p-3 border-r font-medium text-sm">
              Project
            </div>
            <div className="flex-1 flex">
              {months.map((month, i) => (
                <div
                  key={i}
                  className="border-r px-2 py-1 text-center"
                  style={{ width: `${(month.days / totalDays) * 100}%` }}
                >
                  <div className="text-sm font-medium">
                    {month.date.toLocaleDateString("en", { month: "short", year: "2-digit" })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Rows */}
          {sortedProjects.map((project) => (
            <div key={project.id} className="flex border-b hover:bg-muted/20">
              <div className="w-56 flex-shrink-0 p-3 border-r">
                <div className="flex items-center justify-between">
                  <div className="truncate">
                    <Link href={`/projects/${project.id}`} className="font-medium text-sm hover:underline">
                      {project.name}
                    </Link>
                    <p className="text-xs text-muted-foreground">{project.client}</p>
                  </div>
                  {getTypeBadge(project.type)}
                </div>
              </div>
              <div className="flex-1 relative h-14">
                {/* Today marker */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-primary z-10"
                  style={{ left: `${getBarPosition(today.toISOString())}%` }}
                />
                {/* Project bar */}
                <div
                  className={`absolute top-3 h-8 rounded-md flex items-center px-2 text-white text-xs ${getStatusColor(project.status)}`}
                  style={{
                    left: `${getBarPosition(project.startDate)}%`,
                    width: `${getBarWidth(project.startDate, project.endDate)}%`,
                    minWidth: "60px",
                  }}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Progress
                      value={(project.hoursUsed / project.hoursTotal) * 100}
                      className="h-1.5 flex-1 bg-white/30"
                    />
                    <span className="text-[10px] whitespace-nowrap">
                      {Math.round((project.hoursUsed / project.hoursTotal) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
