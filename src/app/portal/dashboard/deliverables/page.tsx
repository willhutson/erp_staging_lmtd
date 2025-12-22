import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  FileVideo,
  FileImage,
  Presentation,
  Palette,
  FileCode,
  FileAudio,
  File,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Inferred type
type DeliverableWithBrief = Awaited<ReturnType<typeof db.deliverable.findMany<{
  include: {
    brief: { include: { client: { select: { id: true; name: true; code: true } } } };
  }
}>>>[number];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CLIENT_REVIEW: { label: "Awaiting Your Review", color: "bg-yellow-100 text-yellow-700", icon: <Eye className="h-3 w-3" /> },
  CLIENT_REVISION: { label: "Revision in Progress", color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="h-3 w-3" /> },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-3 w-3" /> },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="h-3 w-3" /> },
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

export default async function PortalDeliverablesPage() {
  const user = await getPortalUser();

  if (!user) {
    return null;
  }

  // Get deliverables visible to client (CLIENT_REVIEW, CLIENT_REVISION, APPROVED, DELIVERED)
  const deliverables = await db.deliverable.findMany({
    where: {
      brief: {
        clientId: user.clientId,
      },
      status: {
        in: ["CLIENT_REVIEW", "CLIENT_REVISION", "APPROVED", "DELIVERED"],
      },
    },
    include: {
      brief: {
        include: {
          client: { select: { id: true, name: true, code: true } },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  // Group by status
  const needsReview = deliverables.filter((d: DeliverableWithBrief) => d.status === "CLIENT_REVIEW");
  const inRevision = deliverables.filter((d: DeliverableWithBrief) => d.status === "CLIENT_REVISION");
  const completed = deliverables.filter((d: DeliverableWithBrief) =>
    ["APPROVED", "DELIVERED"].includes(d.status)
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Deliverables</h1>
        <p className="text-gray-500 mt-1">
          Review and approve work from your team
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <Eye className="h-4 w-4 text-yellow-500" />
              Needs Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              {needsReview.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              In Revision
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              {inRevision.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {completed.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Needs Review */}
      {needsReview.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Eye className="h-5 w-5" />
              Awaiting Your Review ({needsReview.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {needsReview.map((d: DeliverableWithBrief) => (
                <DeliverableCard key={d.id} deliverable={d} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Revision */}
      {inRevision.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-500" />
              Being Revised ({inRevision.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {inRevision.map((d: DeliverableWithBrief) => (
                <DeliverableCard key={d.id} deliverable={d} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed */}
      {completed.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Completed ({completed.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {completed.map((d: DeliverableWithBrief) => (
                <DeliverableCard key={d.id} deliverable={d} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {deliverables.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <File className="h-12 w-12 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">No deliverables yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Deliverables will appear here when your team submits work for review
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function DeliverableCard({ deliverable }: { deliverable: DeliverableWithBrief }) {
  const statusConfig = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.CLIENT_REVIEW;

  return (
    <Link
      href={`/portal/dashboard/deliverables/${deliverable.id}`}
      className="flex items-center justify-between p-4 bg-white rounded-lg border hover:border-[#52EDC7] hover:shadow-sm transition-all"
    >
      <div className="flex items-center gap-4">
        <span className="p-2 bg-gray-100 rounded-lg text-gray-600">
          {TYPE_ICONS[deliverable.type] || TYPE_ICONS.OTHER}
        </span>
        <div>
          <p className="font-medium text-gray-900">{deliverable.title}</p>
          <p className="text-sm text-gray-500">
            {deliverable.brief.title} &middot; v{deliverable.version}
          </p>
        </div>
      </div>
      <Badge className={statusConfig.color}>
        {statusConfig.icon}
        <span className="ml-1">{statusConfig.label}</span>
      </Badge>
    </Link>
  );
}
