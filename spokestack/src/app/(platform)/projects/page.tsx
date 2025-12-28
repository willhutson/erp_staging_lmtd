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
import { Progress } from "@/components/ui/progress";
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
  FolderKanban,
  Clock,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

async function getProjects() {
  try {
    return prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        client: { select: { id: true, name: true, code: true } },
        _count: {
          select: { briefs: true, timeEntries: true },
        },
      },
    });
  } catch {
    return [];
  }
}

async function getProjectStats() {
  try {
    const [total, active, completed] = await Promise.all([
      prisma.project.count(),
      prisma.project.count({ where: { status: "ACTIVE" } }),
      prisma.project.count({ where: { status: "COMPLETED" } }),
    ]);

    const budgets = await prisma.project.aggregate({
      where: { status: "ACTIVE" },
      _sum: { budgetAmount: true, budgetHours: true },
    });

    return {
      total,
      active,
      completed,
      totalBudget: Number(budgets._sum.budgetAmount || 0),
      totalHours: budgets._sum.budgetHours || 0,
    };
  } catch {
    return { total: 0, active: 0, completed: 0, totalBudget: 0, totalHours: 0 };
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge className="bg-emerald-500">Active</Badge>;
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "ON_HOLD":
      return <Badge className="bg-amber-500">On Hold</Badge>;
    case "COMPLETED":
      return <Badge className="bg-blue-500">Completed</Badge>;
    case "CANCELLED":
      return <Badge variant="destructive">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getTypeBadge(type: string) {
  switch (type) {
    case "RETAINER":
      return <Badge variant="outline" className="border-emerald-500 text-emerald-600">Retainer</Badge>;
    case "PROJECT":
      return <Badge variant="outline" className="border-blue-500 text-blue-600">Project</Badge>;
    case "PITCH":
      return <Badge variant="outline" className="border-purple-500 text-purple-600">Pitch</Badge>;
    case "INTERNAL":
      return <Badge variant="outline" className="border-slate-500 text-slate-600">Internal</Badge>;
    default:
      return <Badge variant="outline">{type}</Badge>;
  }
}

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default async function ProjectsPage() {
  let projects: Awaited<ReturnType<typeof getProjects>> = [];
  let stats = { total: 0, active: 0, completed: 0, totalBudget: 0, totalHours: 0 };

  try {
    [projects, stats] = await Promise.all([getProjects(), getProjectStats()]);
  } catch {
    // Fallback to defaults
  }

  const activeProjects = projects.filter((p) => p.status === "ACTIVE");
  const completedProjects = projects.filter((p) => p.status === "COMPLETED");
  const draftProjects = projects.filter((p) => p.status === "DRAFT");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Track project budgets, timelines, and deliverables
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FolderKanban className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span className="text-2xl font-bold">{stats.active}</span>
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
              <CheckCircle2 className="h-5 w-5 text-purple-500" />
              <span className="text-2xl font-bold">{stats.completed}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Budget
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">{formatCurrency(stats.totalBudget)}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Budget Hours
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.totalHours}h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
                <TabsTrigger value="active">Active ({activeProjects.length})</TabsTrigger>
                <TabsTrigger value="completed">Completed ({completedProjects.length})</TabsTrigger>
                <TabsTrigger value="draft">Draft ({draftProjects.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <ProjectTable projects={projects} />
            </TabsContent>

            <TabsContent value="active" className="m-0">
              <ProjectTable projects={activeProjects} />
            </TabsContent>

            <TabsContent value="completed" className="m-0">
              <ProjectTable projects={completedProjects} />
            </TabsContent>

            <TabsContent value="draft" className="m-0">
              <ProjectTable projects={draftProjects} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function ProjectTable({ projects }: { projects: Awaited<ReturnType<typeof getProjects>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Project</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Budget</TableHead>
          <TableHead>Hours</TableHead>
          <TableHead>Briefs</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.length === 0 ? (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
              No projects found
            </TableCell>
          </TableRow>
        ) : (
          projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell>
                <div>
                  <Link
                    href={`/projects/${project.id}`}
                    className="font-medium hover:underline"
                  >
                    {project.name}
                  </Link>
                  {project.code && (
                    <p className="text-xs text-muted-foreground font-mono">
                      {project.code}
                    </p>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Link
                  href={`/clients/${project.clientId}`}
                  className="text-sm hover:underline"
                >
                  {project.client.name}
                </Link>
              </TableCell>
              <TableCell>{getTypeBadge(project.type)}</TableCell>
              <TableCell>
                {project.budgetAmount ? (
                  <span className="font-medium">
                    {formatCurrency(Number(project.budgetAmount))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {project.budgetHours ? (
                  <span className="text-sm">{project.budgetHours}h</span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{project._count.briefs}</span>
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
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}`}>View Details</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/projects/${project.id}/edit`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href={`/briefs?project=${project.id}`}>View Briefs</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/time?project=${project.id}`}>View Time</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
