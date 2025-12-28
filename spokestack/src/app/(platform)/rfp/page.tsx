export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Target,
  Trophy,
  XCircle,
  DollarSign,
  TrendingUp,
} from "lucide-react";
import { RfpView } from "./rfp-view";

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
  const result = await prisma.rFP.findMany({
    take: 50,
    orderBy: { deadline: "asc" },
    include: {
      _count: { select: { subitems: true } },
    },
  });
  return result;
}

type RfpItem = Awaited<ReturnType<typeof getRfps>>[number];

function formatCurrency(value: number) {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

export default async function RfpPage() {
  let stats = { total: 0, active: 0, won: 0, lost: 0, winRate: 0, pipelineValue: 0 };
  let rfps: Awaited<ReturnType<typeof getRfps>> = [];

  try {
    [stats, rfps] = await Promise.all([getRfpStats(), getRfps()]);
  } catch {
    // Fallback to defaults on error
  }

  // Separate by status for pipeline
  const pipeline = {
    vetting: rfps.filter((r: RfpItem) => r.status === "VETTING"),
    active: rfps.filter((r: RfpItem) => r.status === "ACTIVE"),
    awaitingReview: rfps.filter((r: RfpItem) => r.status === "AWAITING_REVIEW"),
    readyToSubmit: rfps.filter((r: RfpItem) => r.status === "READY_TO_SUBMIT"),
    submitted: rfps.filter((r: RfpItem) => ["SUBMITTED", "AWAITING_RESPONSE"].includes(r.status)),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">RFP Pipeline</h1>
        <p className="text-muted-foreground">
          Track and manage request for proposals
        </p>
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

      {/* RFP View with Pipeline/List/Timeline switcher */}
      <RfpView />
    </div>
  );
}
