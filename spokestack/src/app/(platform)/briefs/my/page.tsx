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
  Plus,
  User,
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

async function getMyBriefs(): Promise<BriefWithRelations[]> {
  try {
    // In production, filter by current user's ID from session
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

export default async function MyBriefsPage() {
  const briefs = await getMyBriefs();

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
            <h1 className="text-2xl font-bold tracking-tight">My Briefs</h1>
            <p className="text-muted-foreground">
              Briefs you've created
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            <User className="h-3 w-3 mr-1" />
            {briefs.length} briefs
          </Badge>
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
              {briefs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <FileText className="h-8 w-8" />
                      <p className="font-medium">No briefs yet</p>
                      <p className="text-sm">Create your first brief to get started</p>
                      <Button className="mt-2" asChild>
                        <Link href="/briefs">
                          <Plus className="mr-2 h-4 w-4" />
                          Create Brief
                        </Link>
                      </Button>
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
        </CardContent>
      </Card>
    </div>
  );
}
