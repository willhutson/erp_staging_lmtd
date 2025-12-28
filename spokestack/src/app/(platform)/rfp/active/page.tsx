export const dynamic = "force-dynamic";

import Link from "next/link";
import prisma from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { Plus, MoreHorizontal, Clock, ArrowLeft } from "lucide-react";

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

async function getActiveRfps() {
  try {
    return prisma.rFP.findMany({
      where: {
        status: {
          in: ["VETTING", "ACTIVE", "AWAITING_REVIEW", "READY_TO_SUBMIT", "SUBMITTED", "AWAITING_RESPONSE"],
        },
      },
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

export default async function ActiveRfpPage() {
  let rfps: Awaited<ReturnType<typeof getActiveRfps>> = [];

  try {
    rfps = await getActiveRfps();
  } catch {
    // Fallback to empty
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/rfp">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Active RFPs</h1>
            <p className="text-muted-foreground">
              RFPs currently in progress
            </p>
          </div>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New RFP
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
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
                    No active RFPs. All clear!
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
        </CardContent>
      </Card>
    </div>
  );
}
