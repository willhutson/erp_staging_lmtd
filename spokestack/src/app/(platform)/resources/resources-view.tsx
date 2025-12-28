"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  List,
  LayoutGrid,
  GanttChart,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Calendar,
} from "lucide-react";

// Dummy team data
const DUMMY_TEAM = [
  { id: "1", name: "Sarah Chen", initials: "SC", role: "Creative Director", department: "Creative", capacity: 40, hoursLogged: 38, activeBriefs: 4, avatarUrl: null },
  { id: "2", name: "Marcus Williams", initials: "MW", role: "Senior Designer", department: "Creative", capacity: 40, hoursLogged: 42, activeBriefs: 6, avatarUrl: null },
  { id: "3", name: "Leila Mahmoud", initials: "LM", role: "Video Editor", department: "Production", capacity: 40, hoursLogged: 35, activeBriefs: 3, avatarUrl: null },
  { id: "4", name: "James Taylor", initials: "JT", role: "Copywriter", department: "Creative", capacity: 40, hoursLogged: 28, activeBriefs: 5, avatarUrl: null },
  { id: "5", name: "Fatima Al-Hassan", initials: "FA", role: "Paid Media Specialist", department: "Media", capacity: 40, hoursLogged: 36, activeBriefs: 4, avatarUrl: null },
  { id: "6", name: "Alex Rivera", initials: "AR", role: "Designer", department: "Creative", capacity: 40, hoursLogged: 32, activeBriefs: 4, avatarUrl: null },
  { id: "7", name: "Omar Hassan", initials: "OH", role: "Arabic Copywriter", department: "Creative", capacity: 40, hoursLogged: 18, activeBriefs: 2, avatarUrl: null },
  { id: "8", name: "Nina Patel", initials: "NP", role: "Project Manager", department: "Operations", capacity: 40, hoursLogged: 40, activeBriefs: 0, avatarUrl: null },
  { id: "9", name: "Tom Baker", initials: "TB", role: "Videographer", department: "Production", capacity: 40, hoursLogged: 44, activeBriefs: 3, avatarUrl: null },
  { id: "10", name: "Yuki Tanaka", initials: "YT", role: "Motion Designer", department: "Creative", capacity: 40, hoursLogged: 30, activeBriefs: 2, avatarUrl: null },
];

// Dummy briefs for timeline
const DUMMY_BRIEFS = [
  { id: "1", title: "CCAD Video Shoot", assignee: "Sarah Chen", type: "VIDEO_SHOOT", deadline: "2025-12-30", status: "IN_PROGRESS" },
  { id: "2", title: "DET Graphics Pack", assignee: "Marcus Williams", type: "DESIGN", deadline: "2025-12-31", status: "IN_PROGRESS" },
  { id: "3", title: "ADEK Video Edit", assignee: "Leila Mahmoud", type: "VIDEO_EDIT", deadline: "2026-01-02", status: "IN_REVIEW" },
  { id: "4", title: "ECD Launch Copy", assignee: "James Taylor", type: "COPYWRITING_EN", deadline: "2026-01-05", status: "APPROVED" },
  { id: "5", title: "CCAD Paid Media", assignee: "Fatima Al-Hassan", type: "PAID_MEDIA", deadline: "2026-01-08", status: "IN_PROGRESS" },
  { id: "6", title: "DET Brand Update", assignee: "Alex Rivera", type: "DESIGN", deadline: "2026-01-10", status: "SUBMITTED" },
  { id: "7", title: "ADEK Arabic Copy", assignee: "Omar Hassan", type: "COPYWRITING_AR", deadline: "2026-01-03", status: "IN_PROGRESS" },
  { id: "8", title: "ECD Event Video", assignee: "Sarah Chen", type: "VIDEO_SHOOT", deadline: "2026-01-12", status: "APPROVED" },
  { id: "9", title: "CCAD Carousel", assignee: "Marcus Williams", type: "DESIGN", deadline: "2026-01-15", status: "IN_REVIEW" },
  { id: "10", title: "DET Motion", assignee: "Yuki Tanaka", type: "DESIGN", deadline: "2026-01-08", status: "IN_PROGRESS" },
  { id: "11", title: "CCAD Reel", assignee: "Tom Baker", type: "VIDEO_SHOOT", deadline: "2026-01-04", status: "IN_PROGRESS" },
  { id: "12", title: "ADEK Doc Edit", assignee: "Leila Mahmoud", type: "VIDEO_EDIT", deadline: "2026-01-06", status: "APPROVED" },
];

const DEPARTMENTS = ["Creative", "Production", "Media", "Operations"];

type ViewMode = "capacity" | "kanban" | "timeline";

function getUtilization(hoursLogged: number, capacity: number) {
  return capacity > 0 ? Math.round((hoursLogged / capacity) * 100) : 0;
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

export function ResourcesView() {
  const [viewMode, setViewMode] = useState<ViewMode>("kanban");

  return (
    <div className="space-y-4">
      {/* View Switcher */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-lg w-fit">
        <Button
          variant={viewMode === "capacity" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("capacity")}
          className="gap-2"
        >
          <Users className="h-4 w-4" />
          Capacity
        </Button>
        <Button
          variant={viewMode === "kanban" ? "secondary" : "ghost"}
          size="sm"
          onClick={() => setViewMode("kanban")}
          className="gap-2"
        >
          <LayoutGrid className="h-4 w-4" />
          Workload
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
      {viewMode === "capacity" && <CapacityView team={DUMMY_TEAM} />}
      {viewMode === "kanban" && <WorkloadKanban team={DUMMY_TEAM} briefs={DUMMY_BRIEFS} />}
      {viewMode === "timeline" && <TimelineView team={DUMMY_TEAM} briefs={DUMMY_BRIEFS} />}
    </div>
  );
}

function CapacityView({ team }: { team: typeof DUMMY_TEAM }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {team.map((member) => {
        const utilization = getUtilization(member.hoursLogged, member.capacity);
        return (
          <Card key={member.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <Link href={`/team/${member.id}`} className="font-medium hover:underline truncate">
                      {member.name}
                    </Link>
                    {getUtilizationBadge(utilization)}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                </div>
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-muted-foreground">Utilization</span>
                    <span className={`font-medium ${getUtilizationColor(utilization)}`}>
                      {utilization}%
                    </span>
                  </div>
                  <Progress
                    value={Math.min(utilization, 100)}
                    className={`h-2 ${utilization > 100 ? "[&>div]:bg-red-500" : ""}`}
                  />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Hours</span>
                  <span>
                    <span className="font-medium">{member.hoursLogged}h</span>
                    <span className="text-muted-foreground"> / {member.capacity}h</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Active Briefs</span>
                  <Badge variant="secondary">{member.activeBriefs}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function WorkloadKanban({ team, briefs }: { team: typeof DUMMY_TEAM; briefs: typeof DUMMY_BRIEFS }) {
  // Group by utilization level
  const overloaded = team.filter((m) => getUtilization(m.hoursLogged, m.capacity) >= 100);
  const high = team.filter((m) => {
    const u = getUtilization(m.hoursLogged, m.capacity);
    return u >= 80 && u < 100;
  });
  const balanced = team.filter((m) => {
    const u = getUtilization(m.hoursLogged, m.capacity);
    return u >= 50 && u < 80;
  });
  const available = team.filter((m) => getUtilization(m.hoursLogged, m.capacity) < 50);

  const columns = [
    { id: "available", label: "Available", color: "bg-blue-500", members: available },
    { id: "balanced", label: "Balanced", color: "bg-emerald-500", members: balanced },
    { id: "high", label: "High Load", color: "bg-amber-500", members: high },
    { id: "overloaded", label: "Overloaded", color: "bg-red-500", members: overloaded },
  ];

  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div key={column.id} className="flex-shrink-0 w-72">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-medium text-sm">{column.label}</h3>
            </div>
            <Badge variant="secondary">{column.members.length}</Badge>
          </div>
          <div className="space-y-3 min-h-[400px] p-2 bg-muted/30 rounded-lg">
            {column.members.map((member) => {
              const utilization = getUtilization(member.hoursLogged, member.capacity);
              const memberBriefs = briefs.filter((b) => b.assignee === member.name);
              return (
                <Card key={member.id} className="cursor-pointer hover:border-primary/50 transition-colors">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary/10">
                          {member.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{member.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                      </div>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">Utilization</span>
                        <span className={`font-medium ${getUtilizationColor(utilization)}`}>
                          {utilization}%
                        </span>
                      </div>
                      <Progress value={Math.min(utilization, 100)} className="h-1.5" />
                    </div>

                    {memberBriefs.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t">
                        <p className="text-xs text-muted-foreground">Active briefs:</p>
                        {memberBriefs.slice(0, 3).map((brief) => (
                          <div key={brief.id} className="text-xs truncate flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                            {brief.title}
                          </div>
                        ))}
                        {memberBriefs.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{memberBriefs.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
            {column.members.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No team members
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function TimelineView({ team, briefs }: { team: typeof DUMMY_TEAM; briefs: typeof DUMMY_BRIEFS }) {
  const today = new Date();
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - 3);

  const days = Array.from({ length: 21 }, (_, i) => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    return date;
  });

  const getBarPosition = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const diffDays = Math.floor((deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(diffDays, 20));
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "VIDEO_SHOOT": return "bg-red-500";
      case "VIDEO_EDIT": return "bg-orange-500";
      case "DESIGN": return "bg-purple-500";
      case "COPYWRITING_EN": return "bg-blue-500";
      case "COPYWRITING_AR": return "bg-cyan-500";
      case "PAID_MEDIA": return "bg-green-500";
      default: return "bg-slate-500";
    }
  };

  // Filter team members who have briefs
  const activeTeam = team.filter((m) => briefs.some((b) => b.assignee === m.name));

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
                    <div className="text-muted-foreground">
                      {day.toLocaleDateString("en", { weekday: "short" })}
                    </div>
                    <div className={isToday ? "text-primary" : ""}>{day.getDate()}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rows */}
          {activeTeam.map((member) => {
            const memberBriefs = briefs.filter((b) => b.assignee === member.name);
            return (
              <div key={member.id} className="flex border-b hover:bg-muted/20">
                <div className="w-48 flex-shrink-0 p-3 border-r">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-[10px] bg-primary/10">
                        {member.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="truncate">
                      <span className="text-sm font-medium">{member.name}</span>
                      <p className="text-xs text-muted-foreground truncate">{member.role}</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1 relative min-h-[60px]">
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
                  {memberBriefs.map((brief, idx) => {
                    const pos = getBarPosition(brief.deadline);
                    return (
                      <div
                        key={brief.id}
                        className={`absolute h-5 rounded-full px-2 flex items-center text-white text-[10px] cursor-pointer hover:opacity-80 ${getTypeColor(brief.type)}`}
                        style={{
                          left: `${Math.max(0, (pos - 3) / 21) * 100}%`,
                          top: `${6 + idx * 14}px`,
                          width: "100px",
                          maxWidth: `${((21 - pos + 3) / 21) * 100}%`,
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
