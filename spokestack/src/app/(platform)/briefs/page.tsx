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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Plus,
  MoreHorizontal,
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

async function getBriefs() {
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
    return briefs;
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
  let briefs: Awaited<ReturnType<typeof getBriefs>> = [];
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

      {/* Briefs Table */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="my">My Briefs</TabsTrigger>
                <TabsTrigger value="assigned">Assigned to Me</TabsTrigger>
                <TabsTrigger value="pending">Pending Review</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
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
                  {briefs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No briefs yet. Create your first brief to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    briefs.map((brief) => {
                      const typeConfig = BRIEF_TYPES.find((t) => t.id === brief.type);
                      const TypeIcon = typeConfig?.icon || FileText;

                      return (
                        <TableRow key={brief.id}>
                          <TableCell>
                            <div>
                              <Link
                                href={`/briefs/${brief.id}`}
                                className="font-medium hover:underline"
                              >
                                {brief.title}
                              </Link>
                              <p className="text-xs text-muted-foreground">
                                {brief.briefNumber}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <TypeIcon className={`h-4 w-4 ${typeConfig?.color}`} />
                              <span className="text-sm">{typeConfig?.label || brief.type}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{brief.client?.name || "-"}</span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{brief.assignee?.name || "Unassigned"}</span>
                          </TableCell>
                          <TableCell>{getPriorityBadge(brief.priority)}</TableCell>
                          <TableCell>
                            {brief.deadline ? (
                              <span className="text-sm">
                                {new Date(brief.deadline).toLocaleDateString()}
                              </span>
                            ) : (
                              <span className="text-muted-foreground text-sm">-</span>
                            )}
                          </TableCell>
                          <TableCell>{getStatusBadge(brief.status)}</TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                  <Link href={`/briefs/${brief.id}`}>View Details</Link>
                                </DropdownMenuItem>
                                <DropdownMenuItem asChild>
                                  <Link href={`/briefs/${brief.id}/edit`}>Edit</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  Cancel Brief
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="my" className="m-0 p-8 text-center text-muted-foreground">
              Select a user to see their created briefs
            </TabsContent>

            <TabsContent value="assigned" className="m-0 p-8 text-center text-muted-foreground">
              Select a user to see assigned briefs
            </TabsContent>

            <TabsContent value="pending" className="m-0 p-8 text-center text-muted-foreground">
              No briefs pending review
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
