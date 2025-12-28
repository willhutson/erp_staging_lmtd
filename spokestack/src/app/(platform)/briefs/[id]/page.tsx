export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Calendar,
  Building2,
  Clock,
  User,
  FileText,
  Video,
  Palette,
  PenTool,
  Megaphone,
} from "lucide-react";

interface PageProps {
  params: Promise<{ id: string }>;
}

const BRIEF_TYPE_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  VIDEO_SHOOT: { label: "Video Shoot", icon: Video, color: "text-red-500" },
  VIDEO_EDIT: { label: "Video Edit", icon: Video, color: "text-orange-500" },
  DESIGN: { label: "Design", icon: Palette, color: "text-purple-500" },
  COPYWRITING_EN: { label: "Copy (EN)", icon: PenTool, color: "text-blue-500" },
  COPYWRITING_AR: { label: "Copy (AR)", icon: PenTool, color: "text-cyan-500" },
  PAID_MEDIA: { label: "Paid Media", icon: Megaphone, color: "text-green-500" },
  RFP: { label: "RFP", icon: FileText, color: "text-amber-500" },
};

function getStatusBadge(status: string) {
  switch (status) {
    case "DRAFT":
      return <Badge variant="secondary">Draft</Badge>;
    case "SUBMITTED":
      return <Badge className="bg-blue-500">Submitted</Badge>;
    case "APPROVED":
      return <Badge className="bg-indigo-500">Approved</Badge>;
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

function getInitials(name: string | null): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

async function getBrief(id: string) {
  try {
    const brief = await prisma.brief.findUnique({
      where: { id },
      include: {
        client: { select: { id: true, name: true, code: true, logoUrl: true } },
        project: { select: { id: true, name: true, code: true } },
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true, role: true } },
        timeEntries: {
          select: { hours: true, isBillable: true },
        },
      },
    });
    return brief;
  } catch {
    return null;
  }
}

export default async function BriefDetailPage({ params }: PageProps) {
  const { id } = await params;
  const brief = await getBrief(id);

  if (!brief) {
    notFound();
  }

  const typeConfig = BRIEF_TYPE_CONFIG[brief.type] || {
    label: brief.type,
    icon: FileText,
    color: "text-gray-500",
  };
  const TypeIcon = typeConfig.icon;

  // Calculate time stats
  const totalHours = brief.timeEntries.reduce(
    (sum, e) => sum + Number(e.hours || 0),
    0
  );
  const billableHours = brief.timeEntries
    .filter((e) => e.isBillable)
    .reduce((sum, e) => sum + Number(e.hours || 0), 0);

  const formData = (brief.formData || {}) as Record<string, unknown>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/briefs">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <TypeIcon className={`h-5 w-5 ${typeConfig.color}`} />
              <h1 className="text-2xl font-bold">{brief.title}</h1>
              {getStatusBadge(brief.status)}
              {getPriorityBadge(brief.priority)}
            </div>
            <p className="text-muted-foreground">
              {brief.briefNumber} • {typeConfig.label}
              {brief.project && ` • ${brief.project.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Meta Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{brief.client?.name || "No client"}</p>
            {brief.client?.code && (
              <p className="text-sm text-muted-foreground">{brief.client.code}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <User className="h-4 w-4" />
              Assignee
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brief.assignee ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={brief.assignee.avatarUrl || undefined} />
                  <AvatarFallback>{getInitials(brief.assignee.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{brief.assignee.name}</p>
                  {brief.assignee.role && (
                    <p className="text-xs text-muted-foreground">{brief.assignee.role}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Unassigned</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Deadline
            </CardTitle>
          </CardHeader>
          <CardContent>
            {brief.deadline ? (
              <p className="font-medium">
                {new Date(brief.deadline).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            ) : (
              <p className="text-muted-foreground">Not set</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">{totalHours.toFixed(1)}h</p>
            {brief.estimatedHours && (
              <p className="text-xs text-muted-foreground">
                of {brief.estimatedHours}h estimated
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description */}
      {brief.description && (
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap">{brief.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Form Data - Dynamic Fields */}
      {Object.keys(formData).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Brief Details</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(formData).map(([key, value]) => {
                if (value === undefined || value === null || value === "") return null;

                // Skip certain internal fields
                if (["clientId", "assigneeId", "projectId"].includes(key)) return null;

                let displayValue: string;
                if (Array.isArray(value)) {
                  displayValue = value.join(", ");
                } else if (typeof value === "object" && value !== null) {
                  displayValue = JSON.stringify(value);
                } else {
                  displayValue = String(value);
                }

                // Format the key to be more readable
                const label = key
                  .replace(/([A-Z])/g, " $1")
                  .replace(/^./, (str) => str.toUpperCase())
                  .trim();

                return (
                  <div key={key}>
                    <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
                    <dd className="mt-1 whitespace-pre-wrap">{displayValue}</dd>
                  </div>
                );
              })}
            </dl>
          </CardContent>
        </Card>
      )}

      {/* Time Summary */}
      {brief.timeEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Time Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{totalHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{billableHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground">Billable</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{brief.timeEntries.length}</p>
                <p className="text-sm text-muted-foreground">Entries</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Created Info */}
      <div className="text-sm text-muted-foreground flex items-center gap-2">
        <span>Created by {brief.createdBy?.name || "Unknown"}</span>
        <span>•</span>
        <span>
          {new Date(brief.createdAt).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
