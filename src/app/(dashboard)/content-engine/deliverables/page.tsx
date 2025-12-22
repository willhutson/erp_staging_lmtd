import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  FileVideo,
  FileImage,
  FileText,
  Presentation,
  Palette,
  FileCode,
  FileAudio,
  File,
  Clock,
  CheckCircle,
  AlertCircle,
  Send,
  Eye
} from "lucide-react";

// Inferred type
type DeliverableWithRelations = Awaited<ReturnType<typeof db.deliverable.findMany<{
  include: {
    brief: { include: { client: { select: { id: true; name: true; code: true } } } };
    createdBy: { select: { id: true; name: true } };
  }
}>>>[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: <File className="h-3 w-3" /> },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", icon: <Clock className="h-3 w-3" /> },
  INTERNAL_REVIEW: { label: "Internal Review", color: "bg-yellow-100 text-yellow-700", icon: <Eye className="h-3 w-3" /> },
  REVISION_NEEDED: { label: "Revision Needed", color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="h-3 w-3" /> },
  READY_FOR_CLIENT: { label: "Ready for Client", color: "bg-purple-100 text-purple-700", icon: <Send className="h-3 w-3" /> },
  CLIENT_REVIEW: { label: "Client Review", color: "bg-indigo-100 text-indigo-700", icon: <Eye className="h-3 w-3" /> },
  CLIENT_REVISION: { label: "Client Revision", color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="h-3 w-3" /> },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="h-3 w-3" /> },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-500", icon: <File className="h-3 w-3" /> },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  VIDEO: <FileVideo className="h-5 w-5" />,
  IMAGE: <FileImage className="h-5 w-5" />,
  DOCUMENT: <FileText className="h-5 w-5" />,
  PRESENTATION: <Presentation className="h-5 w-5" />,
  DESIGN_FILE: <Palette className="h-5 w-5" />,
  COPY: <FileText className="h-5 w-5" />,
  REPORT: <FileText className="h-5 w-5" />,
  CODE: <FileCode className="h-5 w-5" />,
  AUDIO: <FileAudio className="h-5 w-5" />,
  OTHER: <File className="h-5 w-5" />,
};

export default async function DeliverablesPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const deliverables = await db.deliverable.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      brief: {
        include: {
          client: { select: { id: true, name: true, code: true } },
        },
      },
      createdBy: { select: { id: true, name: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  // Group by status for summary
  const statusCounts = deliverables.reduce(
    (acc: Record<string, number>, d: DeliverableWithRelations) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const needsAttention = deliverables.filter((d: DeliverableWithRelations) =>
    ["INTERNAL_REVIEW", "REVISION_NEEDED", "CLIENT_REVISION"].includes(d.status)
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content-engine">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Deliverables</h1>
            <p className="text-gray-500 mt-1">
              Track and manage work outputs
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{deliverables.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              In Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {(statusCounts["INTERNAL_REVIEW"] || 0) + (statusCounts["CLIENT_REVIEW"] || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Needs Revision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {(statusCounts["REVISION_NEEDED"] || 0) + (statusCounts["CLIENT_REVISION"] || 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Delivered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {statusCounts["DELIVERED"] || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Needs Attention */}
      {needsAttention.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Needs Attention ({needsAttention.length})
            </CardTitle>
            <CardDescription className="text-orange-600">
              Deliverables requiring review or revision
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {needsAttention.slice(0, 5).map((d: DeliverableWithRelations) => {
                const statusConfig = STATUS_CONFIG[d.status] || STATUS_CONFIG.DRAFT;
                return (
                  <Link
                    key={d.id}
                    href={`/content-engine/deliverables/${d.id}`}
                    className="flex items-center justify-between p-3 bg-white rounded-lg hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-gray-400">
                        {TYPE_ICONS[d.type] || TYPE_ICONS.OTHER}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{d.title}</p>
                        <p className="text-sm text-gray-500">
                          {d.brief.client.code} &middot; {d.brief.title}
                        </p>
                      </div>
                    </div>
                    <Badge className={statusConfig.color}>
                      {statusConfig.icon}
                      <span className="ml-1">{statusConfig.label}</span>
                    </Badge>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle>All Deliverables</CardTitle>
        </CardHeader>
        <CardContent>
          {deliverables.length === 0 ? (
            <div className="text-center py-12">
              <File className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No deliverables yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Deliverables will appear here when created from briefs
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {deliverables.map((d: DeliverableWithRelations) => {
                const statusConfig = STATUS_CONFIG[d.status] || STATUS_CONFIG.DRAFT;
                return (
                  <Link
                    key={d.id}
                    href={`/content-engine/deliverables/${d.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:border-[#52EDC7] hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="p-2 bg-gray-100 rounded-lg text-gray-600">
                        {TYPE_ICONS[d.type] || TYPE_ICONS.OTHER}
                      </span>
                      <div>
                        <p className="font-medium text-gray-900">{d.title}</p>
                        <p className="text-sm text-gray-500">
                          {d.brief.client.code} &middot; {d.brief.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          by {d.createdBy.name} &middot; v{d.version}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <Badge className={statusConfig.color}>
                        {statusConfig.icon}
                        <span className="ml-1">{statusConfig.label}</span>
                      </Badge>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
