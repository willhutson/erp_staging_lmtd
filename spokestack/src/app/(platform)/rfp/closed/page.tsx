export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Trophy, XCircle, ArrowLeft } from "lucide-react";

function getOutcomeBadge(outcome: string | null) {
  switch (outcome) {
    case "WON":
      return <Badge className="bg-green-500">Won</Badge>;
    case "LOST":
      return <Badge variant="destructive">Lost</Badge>;
    case "WITHDRAWN":
      return <Badge variant="outline">Withdrawn</Badge>;
    case "CANCELLED":
      return <Badge variant="secondary">Cancelled</Badge>;
    default:
      return <Badge variant="outline">{outcome || "Unknown"}</Badge>;
  }
}

async function getClosedRfps() {
  const result = await prisma.rFP.findMany({
    where: {
      outcome: { not: null },
    },
    orderBy: { updatedAt: "desc" },
  });
  return result;
}

type RfpItem = Awaited<ReturnType<typeof getClosedRfps>>[number];

async function getStats() {
  try {
    const [won, lost, withdrawn] = await Promise.all([
      prisma.rFP.count({ where: { outcome: "WON" } }),
      prisma.rFP.count({ where: { outcome: "LOST" } }),
      prisma.rFP.count({ where: { outcome: { in: ["WITHDRAWN", "CANCELLED"] } } }),
    ]);

    const wonValue = await prisma.rFP.aggregate({
      where: { outcome: "WON" },
      _sum: { estimatedValue: true },
    });

    const winRate = won + lost > 0 ? (won / (won + lost)) * 100 : 0;

    return {
      won,
      lost,
      withdrawn,
      winRate: Math.round(winRate),
      wonValue: Number(wonValue._sum.estimatedValue || 0),
    };
  } catch {
    return { won: 0, lost: 0, withdrawn: 0, winRate: 0, wonValue: 0 };
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

export default async function ClosedRfpPage() {
  let rfps: Awaited<ReturnType<typeof getClosedRfps>> = [];
  let stats = { won: 0, lost: 0, withdrawn: 0, winRate: 0, wonValue: 0 };

  try {
    [rfps, stats] = await Promise.all([getClosedRfps(), getStats()]);
  } catch {
    // Fallback to defaults
  }

  const wonRfps = rfps.filter((r: RfpItem) => r.outcome === "WON");
  const lostRfps = rfps.filter((r: RfpItem) => r.outcome === "LOST");
  const otherRfps = rfps.filter((r: RfpItem) => r.outcome !== "WON" && r.outcome !== "LOST");

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/rfp">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Won / Lost RFPs</h1>
          <p className="text-muted-foreground">
            Historical RFP outcomes and analysis
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Won</CardTitle>
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
            <CardTitle className="text-sm font-medium text-muted-foreground">Lost</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <span className="text-2xl font-bold">{stats.lost}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold">{stats.winRate}%</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Won Value</CardTitle>
          </CardHeader>
          <CardContent>
            <span className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.wonValue)}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Card>
        <CardContent className="p-0">
          <Tabs defaultValue="all">
            <div className="border-b px-4">
              <TabsList className="h-12">
                <TabsTrigger value="all">All ({rfps.length})</TabsTrigger>
                <TabsTrigger value="won">Won ({wonRfps.length})</TabsTrigger>
                <TabsTrigger value="lost">Lost ({lostRfps.length})</TabsTrigger>
                <TabsTrigger value="other">Other ({otherRfps.length})</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="m-0">
              <RfpTable rfps={rfps} />
            </TabsContent>

            <TabsContent value="won" className="m-0">
              <RfpTable rfps={wonRfps} />
            </TabsContent>

            <TabsContent value="lost" className="m-0">
              <RfpTable rfps={lostRfps} />
            </TabsContent>

            <TabsContent value="other" className="m-0">
              <RfpTable rfps={otherRfps} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function RfpTable({ rfps }: { rfps: Awaited<ReturnType<typeof getClosedRfps>> }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>RFP</TableHead>
          <TableHead>Client</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Outcome</TableHead>
          <TableHead>Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rfps.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
              No closed RFPs in this category
            </TableCell>
          </TableRow>
        ) : (
          rfps.map((rfp: RfpItem) => (
            <TableRow key={rfp.id}>
              <TableCell>
                <Link href={`/rfp/${rfp.id}`} className="font-medium hover:underline">
                  {rfp.name}
                </Link>
              </TableCell>
              <TableCell>{rfp.clientName}</TableCell>
              <TableCell>
                {rfp.estimatedValue ? (
                  <span className="font-medium">
                    {formatCurrency(Number(rfp.estimatedValue))}
                  </span>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>{getOutcomeBadge(rfp.outcome)}</TableCell>
              <TableCell className="text-muted-foreground">
                {rfp.updatedAt ? new Date(rfp.updatedAt).toLocaleDateString() : "-"}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
