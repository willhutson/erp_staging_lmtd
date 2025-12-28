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
import { Progress } from "@/components/ui/progress";
import {
  Plus,
  MoreHorizontal,
  FileText,
  Target,
  Trophy,
  XCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

function getStatusBadge(status: string) {
  switch (status) {
    case "VETTING":
      return <Badge variant="secondary">Vetting</Badge>;
    case "ACTIVE":
      return <Badge className="bg-blue-500">Active</Badge>;
    case "AWAITING_REVIEW":
      return <Badge className="bg-purple-500">Awaiting Review</Badge>;
    case "READY_TO_SUBMIT":
      return <Badge className="bg-amber-500">Ready to Submit</Badge>;
    case "SUBMITTED":
      return <Badge className="bg-cyan-500">Submitted</Badge>;
    case "AWAITING_RESPONSE":
      return <Badge className="bg-indigo-500">Awaiting Response</Badge>;
    case "WON":
      return <Badge className="bg-green-500">Won</Badge>;
    case "LOST":
      return <Badge variant="destructive">Lost</Badge>;
    case "ABANDONED":
      return <Badge variant="outline">Abandoned</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}

function getProbabilityBadge(probability: string | null) {
  if (!probability) return null;
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

async function getRfpStats() {
  try {
    const [total, active, won, lost] = await Promise.all([
      prisma.rFP.count(),
      prisma.rFP.count({
        where: { status: { in: ["ACTIVE", "AWAITING_REVIEW", "READY_TO_SUBMIT", "SUBMITTED"] } },
      }),
      prisma.rFP.count({ where: { outcome: "WON" } }),
      prisma.rFP.count({ where: { outcome: "LOST" } }),
    ]);

    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    // Estimate pipeline value
    const activeRfps = await prisma.rFP.aggregate({
      where: { status: { in: ["ACTIVE", "AWAITING_REVIEW", "READY_TO_SUBMIT", "SUBMITTED", "AWAITING_RESPONSE"] } },
      _sum: { estimatedValue: true },
    });

    return {
      total,
      active,
      won,
      lost,
      winRate: Math.round(winRate),
      pipelineValue: Number(activeRfps._sum.estimatedValue || 0),
    };
  } catch {
    return { total: 0, active: 0, won: 0, lost: 0, winRate: 0, pipelineValue: 0 };
  }
}

async function getRfps() {
  try {
    return prisma.rFP.findMany({
      take: 50,
      orderBy: { deadline: "asc" },
      include: {
        _count: { select: { subitems: true } },
      },
    });
  } catch {
    return [];
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

export default async function RfpPage() {
  const [stats, rfps] = await Promise.all([getRfpStats(), getRfps()]);

  // Separate by status for pipeline
  const pipeline = {
    vetting: rfps.filter((r) => r.status === "VETTING"),
    active: rfps.filter((r) => r.status === "ACTIVE"),
    awaitingReview: rfps.filter((r) => r.status === "AWAITING_REVIEW"),
    readyToSubmit: rfps.filter((r) => r.status === "READY_TO_SUBMIT"),
    submitted: rfps.filter((r) => ["SUBMITTED", "AWAITING_RESPONSE"].includes(r.status)),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">RFP Pipeline</h1>
          <p className="text-muted-foreground">
            Track and manage request for proposals
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New RFP
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active RFPs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <span className="text-2xl font-bold">{stats.active}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pipeline Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <span className="text-2xl font-bold">
                {formatCurrency(stats.pipelineValue)}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Win Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{stats.winRate}%</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Won
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <span className="text-2xl font-bold">{stats.won}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lost
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.lost}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline Board */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline</CardTitle>
          <CardDescription>RFPs organized by stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-5">
            {Object.entries({
              "Vetting": pipeline.vetting,
              "Active": pipeline.active,
              "Review": pipeline.awaitingReview,
              "Ready": pipeline.readyToSubmit,
              "Submitted": pipeline.submitted,
            }).map(([stage, stageRfps]) => (
              <div key={stage} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{stage}</h4>
                  <Badge variant="secondary">{stageRfps.length}</Badge>
                </div>
                <div className="space-y-2 min-h-[200px]">
                  {stageRfps.slice(0, 5).map((rfp) => (
                    <Link key={rfp.id} href={`/rfp/${rfp.id}`}>
                      <Card className="hover:border-primary/50 transition-colors cursor-pointer">
                        <CardContent className="p-3">
                          <p className="text-sm font-medium line-clamp-1">{rfp.name}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {rfp.clientName}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            {rfp.estimatedValue ? (
                              <span className="text-xs font-medium text-green-600">
                                {formatCurrency(Number(rfp.estimatedValue))}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                            {rfp.deadline && (
                              <span className="text-xs text-muted-foreground">
                                {new Date(rfp.deadline).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                          {getProbabilityBadge(rfp.winProbability)}
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                  {stageRfps.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      No RFPs
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* All RFPs Table */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all" className="w-full">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all">All RFPs</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="submitted">Submitted</TabsTrigger>
                <TabsTrigger value="closed">Closed</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>RFP</TableHead>
                    <TableHead>Client</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Deadline</TableHead>
                    <TableHead>Probability</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rfps.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No RFPs yet. Create your first RFP to start tracking.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rfps.map((rfp) => (
                      <TableRow key={rfp.id}>
                        <TableCell>
                          <div>
                            <Link
                              href={`/rfp/${rfp.id}`}
                              className="font-medium hover:underline"
                            >
                              {rfp.name}
                            </Link>
                            {rfp._count.subitems > 0 && (
                              <p className="text-xs text-muted-foreground">
                                {rfp._count.subitems} tasks
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{rfp.clientName}</span>
                        </TableCell>
                        <TableCell>
                          {rfp.estimatedValue ? (
                            <span className="text-sm font-medium">
                              {formatCurrency(Number(rfp.estimatedValue))}
                            </span>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {rfp.deadline ? (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm">
                                {new Date(rfp.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{getProbabilityBadge(rfp.winProbability)}</TableCell>
                        <TableCell>{getStatusBadge(rfp.status)}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/rfp/${rfp.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/rfp/${rfp.id}/edit`}>Edit</Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>Mark as Won</DropdownMenuItem>
                              <DropdownMenuItem>Mark as Lost</DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                Abandon
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>

            <TabsContent value="active" className="m-0 p-8 text-center text-muted-foreground">
              Filter by active RFPs
            </TabsContent>

            <TabsContent value="submitted" className="m-0 p-8 text-center text-muted-foreground">
              Filter by submitted RFPs
            </TabsContent>

            <TabsContent value="closed" className="m-0 p-8 text-center text-muted-foreground">
              Filter by closed RFPs
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
