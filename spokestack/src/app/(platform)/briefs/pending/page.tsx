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
import {
  ArrowLeft,
  MoreHorizontal,
  FileText,
  Video,
  Palette,
  PenTool,
  Megaphone,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
} from "lucide-react";

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

async function getPendingBriefs(): Promise<BriefWithRelations[]> {
  try {
    const briefs = await prisma.brief.findMany({
      where: {
        status: { in: ["SUBMITTED", "IN_REVIEW"] },
      },
      orderBy: [{ priority: "asc" }, { deadline: "asc" }],
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

export default async function PendingBriefsPage() {
  const briefs = await getPendingBriefs();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/briefs">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Pending Review</h1>
            <p className="text-muted-foreground">
              Briefs awaiting your review and approval
            </p>
          </div>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Clock className="h-3 w-3 mr-1" />
          {briefs.length} pending
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Brief</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Submitted By</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Deadline</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {briefs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 text-green-500" />
                      <p className="font-medium">All caught up!</p>
                      <p className="text-sm">No briefs pending review</p>
                    </div>
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
                        <span className="text-sm">{brief.createdBy?.name || "-"}</span>
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
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/briefs/${brief.id}`}>
                              <Eye className="h-3 w-3 mr-1" />
                              Review
                            </Link>
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                Request Changes
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild>
                                <Link href={`/briefs/${brief.id}`}>View Details</Link>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
