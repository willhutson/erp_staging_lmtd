export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  FileText,
  Video,
  Palette,
  PenTool,
  Megaphone,
  Filter,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { BriefsView } from "./briefs-view";

// Brief interface for typing
interface BriefWithRelations {
  id: string;
  briefNumber: string | null;
  type: string;
  title: string;
  status: string;
  priority: string;
  deadline: Date | null;
  createdAt: Date;
  client: { name: string; code: string | null } | null;
  createdBy: { name: string } | null;
  assignee: { name: string } | null;
}

// Brief type configurations
const BRIEF_TYPES = [
  { id: "VIDEO_SHOOT", label: "Video Shoot", icon: Video, color: "text-red-500" },
  { id: "VIDEO_EDIT", label: "Video Edit", icon: Video, color: "text-orange-500" },
  { id: "DESIGN", label: "Design", icon: Palette, color: "text-purple-500" },
  { id: "COPYWRITING_EN", label: "Copy (EN)", icon: PenTool, color: "text-blue-500" },
  { id: "COPYWRITING_AR", label: "Copy (AR)", icon: PenTool, color: "text-cyan-500" },
  { id: "PAID_MEDIA", label: "Paid Media", icon: Megaphone, color: "text-green-500" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "SUBMITTED":
      return <Badge className="bg-blue-500">Submitted</Badge>;
    case "IN_PROGRESS":
      return <Badge className="bg-amber-500">In Progress</Badge>;
    case "IN_REVIEW":
      return <Badge className="bg-purple-500">In Review</Badge>;
    case "COMPLETED":
      return <Badge className="bg-green-500">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
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

async function getBriefs(): Promise<BriefWithRelations[]> {
  try {
    const briefs = await prisma.brief.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { name: true, code: true } },
        createdBy: { select: { name: true } },
        assignee: { select: { name: true } },
      },
    });
    return briefs as BriefWithRelations[];
  } catch {
    return [];
  }
}

async function getBriefStats() {
  try {
    const [total, inProgress, completed, overdue] = await Promise.all([
      prisma.brief.count(),
      prisma.brief.count({ where: { status: "IN_PROGRESS" } }),
      prisma.brief.count({ where: { status: "COMPLETED" } }),
      prisma.brief.count({
        where: {
          deadline: { lt: new Date() },
          status: { notIn: ["COMPLETED", "CANCELLED"] },
        },
      }),
    ]);
    return { total, inProgress, completed, overdue };
  } catch {
    return { total: 0, inProgress: 0, completed: 0, overdue: 0 };
  }
}

export default async function BriefsPage() {
  let briefs: BriefWithRelations[] = [];
  let stats = { total: 0, inProgress: 0, completed: 0, overdue: 0 };

  try {
    [briefs, stats] = await Promise.all([getBriefs(), getBriefStats()]);
  } catch {
    // Fallback to defaults on error
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Briefs</h1>
          <p className="text-muted-foreground">
            Manage project briefs and creative requests
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Brief
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {BRIEF_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <DropdownMenuItem key={type.id} asChild>
                    <Link href={`/briefs/new/${type.id.toLowerCase()}`}>
                      <Icon className={`mr-2 h-4 w-4 ${type.color}`} />
                      {type.label}
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Briefs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.inProgress}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold text-red-500">{stats.overdue}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Briefs View with List/Kanban/Gantt switcher */}
      <BriefsView />
    </div>
  );
}
