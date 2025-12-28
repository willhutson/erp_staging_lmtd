"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
  FileText,
  Video,
  Palette,
  PenTool,
  Megaphone,
  List,
  LayoutGrid,
  GanttChart,
  Clock,
  User,
  Calendar,
} from "lucide-react";

// Dummy data for briefs
const DUMMY_BRIEFS = [
  { id: "1", title: "CCAD Summer Campaign Video", briefNumber: "BR-2025-001", type: "VIDEO_SHOOT", status: "SUBMITTED", priority: "HIGH", client: "CCAD", assignee: "Sarah Chen", deadline: "2025-12-30" },
  { id: "2", title: "DET Social Media Graphics Pack", briefNumber: "BR-2025-002", type: "DESIGN", status: "IN_PROGRESS", priority: "MEDIUM", client: "DET", assignee: "Marcus Williams", deadline: "2025-12-31" },
  { id: "3", title: "ADEK Annual Report Video Edit", briefNumber: "BR-2025-003", type: "VIDEO_EDIT", status: "IN_REVIEW", priority: "URGENT", client: "ADEK", assignee: "Leila Mahmoud", deadline: "2026-01-02" },
  { id: "4", title: "ECD Product Launch Copy", briefNumber: "BR-2025-004", type: "COPYWRITING_EN", status: "APPROVED", priority: "HIGH", client: "ECD", assignee: "James Taylor", deadline: "2026-01-05" },
  { id: "5", title: "CCAD Paid Media Campaign", briefNumber: "BR-2025-005", type: "PAID_MEDIA", status: "IN_PROGRESS", priority: "MEDIUM", client: "CCAD", assignee: "Fatima Al-Hassan", deadline: "2026-01-08" },
  { id: "6", title: "DET Brand Guidelines Update", briefNumber: "BR-2025-006", type: "DESIGN", status: "SUBMITTED", priority: "LOW", client: "DET", assignee: "Alex Rivera", deadline: "2026-01-10" },
  { id: "7", title: "ADEK Arabic Website Copy", briefNumber: "BR-2025-007", type: "COPYWRITING_AR", status: "IN_PROGRESS", priority: "HIGH", client: "ADEK", assignee: "Omar Hassan", deadline: "2026-01-03" },
  { id: "8", title: "ECD Event Video Coverage", briefNumber: "BR-2025-008", type: "VIDEO_SHOOT", status: "APPROVED", priority: "MEDIUM", client: "ECD", assignee: "Sarah Chen", deadline: "2026-01-12" },
  { id: "9", title: "CCAD Q1 Carousel Designs", briefNumber: "BR-2025-009", type: "DESIGN", status: "IN_REVIEW", priority: "MEDIUM", client: "CCAD", assignee: "Marcus Williams", deadline: "2026-01-15" },
  { id: "10", title: "DET Testimonial Video Edits", briefNumber: "BR-2025-010", type: "VIDEO_EDIT", status: "COMPLETED", priority: "LOW", client: "DET", assignee: "Leila Mahmoud", deadline: "2025-12-28" },
];

const BRIEF_TYPES = [
  { id: "VIDEO_SHOOT", label: "Video Shoot", icon: Video, color: "text-red-500", bg: "bg-red-500" },
  { id: "VIDEO_EDIT", label: "Video Edit", icon: Video, color: "text-orange-500", bg: "bg-orange-500" },
  { id: "DESIGN", label: "Design", icon: Palette, color: "text-purple-500", bg: "bg-purple-500" },
  { id: "COPYWRITING_EN", label: "Copy (EN)", icon: PenTool, color: "text-blue-500", bg: "bg-blue-500" },
  { id: "COPYWRITING_AR", label: "Copy (AR)", icon: PenTool, color: "text-cyan-500", bg: "bg-cyan-500" },
  { id: "PAID_MEDIA", label: "Paid Media", icon: Megaphone, color: "text-green-500", bg: "bg-green-500" },
];

const STATUSES = [
  { id: "SUBMITTED", label: "Submitted", color: "bg-blue-500" },
  { id: "APPROVED", label: "Approved", color: "bg-emerald-500" },
  { id: "IN_PROGRESS", label: "In Progress", color: "bg-amber-500" },
  { id: "IN_REVIEW", label: "In Review", color: "bg-purple-500" },
  { id: "COMPLETED", label: "Completed", color: "bg-green-500" },
];

type ViewMode = "list" | "kanban" | "gantt";

function getStatusBadge(status: string) {
  const statusConfig = STATUSES.find((s) => s.id === status);
  return <Badge className={statusConfig?.color}>{statusConfig?.label || status}</Badge>;
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case "URGENT":
      return <Badge variant="destructive">Urgent</Badge>;
    case "HIGH":
      return <Badge className="bg-orange-500">High</Badge>;
    case "MEDIUM":
      return <Badge variant="secondary">Medium</Badge>;
    case "LOW":
      return <Badge variant="outline">Low</Badge>;
    default:
      return null;
  }
}

export function BriefsView() {
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
          Kanban
        </Button>
        <Button
          variant={viewMode === "gantt" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("gantt")}
          className="gap-2"
        >
          <GanttChart className="h-4 w-4" />
          Timeline
        </Button>
      </div>

      {/* Views */}
      {viewMode === "list" && <ListView briefs={DUMMY_BRIEFS} />}
      {viewMode === "kanban" && <KanbanView briefs={DUMMY_BRIEFS} />}
      {viewMode === "gantt" && <GanttView briefs={DUMMY_BRIEFS} />}
    </div>
  );
}

function ListView({ briefs }: { briefs: typeof DUMMY_BRIEFS }) {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brief</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {briefs.map((brief) => {
              const typeConfig = BRIEF_TYPES.find((t) => t.id === brief.type);
              const TypeIcon = typeConfig?.icon || FileText;
              return (
                <TableRow key={brief.id}>
                  <TableCell>
                    <div>
                      <Link href={`/briefs/${brief.id}`} className="font-medium hover:underline">
                        {brief.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">{brief.briefNumber}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TypeIcon className={`h-4 w-4 ${typeConfig?.color}`} />
                      <span className="text-sm">{typeConfig?.label}</span>
                    </div>
                  </TableCell>
                  <TableCell>{brief.client}</TableCell>
                  <TableCell>{brief.assignee}</TableCell>
                  <TableCell>{getPriorityBadge(brief.priority)}</TableCell>
                  <TableCell>{new Date(brief.deadline).toLocaleDateString()}</TableCell>
                  <TableCell>{getStatusBadge(brief.status)}</TableCell>
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
                        <DropdownMenuItem className="text-destructive">Cancel Brief</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function KanbanView({ briefs }: { briefs: typeof DUMMY_BRIEFS }) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {STATUSES.map((status) => {
        const statusBriefs = briefs.filter((b) => b.status === status.id);
        return (
          <div key={status.id} className="flex-shrink-0 w-72">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${status.color}`} />
                <h3 className="font-medium text-sm">{status.label}</h3>
              </div>
              <Badge variant="secondary">{statusBriefs.length}</Badge>
            </div>
            <div className="space-y-3 min-h-[400px] p-2 bg-muted/30 rounded-lg">
              {statusBriefs.map((brief) => {
                const typeConfig = BRIEF_TYPES.find((t) => t.id === brief.type);
                const TypeIcon = typeConfig?.icon || FileText;
                return (
                  <Card
                    key={brief.id}
                    className="cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className={`p-1.5 rounded ${typeConfig?.bg}/10`}>
                          <TypeIcon className={`h-4 w-4 ${typeConfig?.color}`} />
                        </div>
                        {getPriorityBadge(brief.priority)}
                      </div>
                      <h4 className="font-medium text-sm line-clamp-2 mb-2">
                        {brief.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                        <Badge variant="outline" className="text-xs">
                          {brief.client}
                        </Badge>
                        <span>{brief.briefNumber}</span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          {new Date(brief.deadline).toLocaleDateString()}
                        </div>
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-[10px] bg-primary/10">
                            {brief.assignee.split(" ").map((n) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {statusBriefs.length === 0 && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No briefs
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function GanttView({ briefs }: { briefs: typeof DUMMY_BRIEFS }) {
  // Generate 21 days starting from 7 days ago
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 7);

  const days = Array.from({ length: 21 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  // Group briefs by assignee
  const assignees = [...new Set(briefs.map((b) => b.assignee))];

  const getBarPosition = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const diffDays = Math.floor((deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, 20));
  };

  return (
    <Card>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[900px]">
          {/* Header */}
          <div className="flex border-b sticky top-0 bg-background z-10">
            <div className="w-48 flex-shrink-0 p-3 border-r font-medium text-sm">
              Team Member
            </div>
            <div className="flex-1 flex">
              {days.map((day, i) => {
                const isToday = day.toDateString() === today.toDateString();
                const isWeekend = day.getDay() === 0 || day.getDay() === 6;
                return (
                  <div
                    key={i}
                    className={`flex-1 p-2 text-center text-xs border-r ${
                      isToday ? "bg-primary/10 font-medium" : isWeekend ? "bg-muted/50" : ""
                    }`}
                  >
                    <div className="text-muted-foreground">{day.toLocaleDateString("en", { weekday: "short" })}</div>
                    <div className={isToday ? "text-primary" : ""}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          {assignees.map((assignee) => {
            const assigneeBriefs = briefs.filter((b) => b.assignee === assignee);
            return (
              <div key={assignee} className="flex border-b hover:bg-muted/20">
                <div className="w-48 flex-shrink-0 p-3 border-r">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/10">
                        {assignee.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium truncate">{assignee}</span>
                  </div>
                </div>
                <div className="flex-1 relative h-16">
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
                  {/* Briefs */}
                  {assigneeBriefs.map((brief, idx) => {
                    const pos = getBarPosition(brief.deadline);
                    const typeConfig = BRIEF_TYPES.find((t) => t.id === brief.type);
                    return (
                      <div
                        key={brief.id}
                        className={`absolute h-6 rounded-full px-2 flex items-center gap-1 text-white text-xs cursor-pointer hover:opacity-80 ${typeConfig?.bg}`}
                        style={{
                          left: `${(pos / 21) * 100}%`,
                          top: `${8 + idx * 10}px`,
                          width: "120px",
                          maxWidth: `${((21 - pos) / 21) * 100}%`,
                        }}
                        title={brief.title}
                      >
                        <span className="truncate">{brief.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
