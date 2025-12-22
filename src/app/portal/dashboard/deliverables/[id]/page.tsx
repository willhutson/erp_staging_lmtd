import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
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
  User,
  Calendar,
} from "lucide-react";
import { DeliverableFeedbackForm } from "./DeliverableFeedbackForm";

export const dynamic = "force-dynamic";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  CLIENT_REVIEW: { label: "Awaiting Your Review", color: "bg-yellow-100 text-yellow-700", icon: <Eye className="h-4 w-4" /> },
  CLIENT_REVISION: { label: "Revision in Progress", color: "bg-orange-100 text-orange-700", icon: <AlertCircle className="h-4 w-4" /> },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="h-4 w-4" /> },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="h-4 w-4" /> },
};

const TYPE_ICONS: Record<string, React.ReactNode> = {
  VIDEO: <FileVideo className="h-6 w-6" />,
  IMAGE: <FileImage className="h-6 w-6" />,
  DOCUMENT: <FileText className="h-6 w-6" />,
  PRESENTATION: <Presentation className="h-6 w-6" />,
  DESIGN_FILE: <Palette className="h-6 w-6" />,
  COPY: <FileText className="h-6 w-6" />,
  REPORT: <FileText className="h-6 w-6" />,
  CODE: <FileCode className="h-6 w-6" />,
  AUDIO: <FileAudio className="h-6 w-6" />,
  OTHER: <File className="h-6 w-6" />,
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PortalDeliverableDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getPortalUser();

  if (!user) {
    redirect("/portal/auth");
  }

  // Get the deliverable
  const deliverable = await db.deliverable.findUnique({
    where: { id },
    include: {
      brief: {
        include: {
          client: { select: { id: true, name: true, code: true } },
          createdBy: { select: { id: true, name: true } },
        },
      },
      files: {
        orderBy: { order: "asc" },
      },
    },
  });

  // Check access
  if (!deliverable || deliverable.brief.clientId !== user.clientId) {
    notFound();
  }

  // Only show deliverables visible to client
  const visibleStatuses = ["CLIENT_REVIEW", "CLIENT_REVISION", "APPROVED", "DELIVERED"];
  if (!visibleStatuses.includes(deliverable.status)) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.CLIENT_REVIEW;
  const isAwaitingReview = deliverable.status === "CLIENT_REVIEW";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/portal/dashboard/deliverables">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Deliverables
          </Button>
        </Link>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gray-100 rounded-lg text-gray-600">
                {TYPE_ICONS[deliverable.type] || TYPE_ICONS.OTHER}
              </div>
              <div>
                <CardTitle className="text-xl">{deliverable.title}</CardTitle>
                <p className="text-gray-500 mt-1">
                  {deliverable.brief.title} &middot; Version {deliverable.version}
                </p>
              </div>
            </div>
            <Badge className={`${statusConfig.color} flex items-center gap-1`}>
              {statusConfig.icon}
              {statusConfig.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          {deliverable.description && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{deliverable.description}</p>
            </div>
          )}

          {/* Details */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Created by</p>
                <p className="text-sm font-medium">{deliverable.brief.createdBy?.name || "Unknown"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Submitted</p>
                <p className="text-sm font-medium">
                  {deliverable.submittedAt
                    ? new Date(deliverable.submittedAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <File className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <p className="text-sm font-medium">{deliverable.type.replace(/_/g, " ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Version</p>
                <p className="text-sm font-medium">v{deliverable.version}</p>
              </div>
            </div>
          </div>

          {/* Files */}
          {deliverable.files.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Attached Files</h3>
              <div className="space-y-2">
                {deliverable.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <File className="h-5 w-5 text-gray-400" />
                      <div>
                        <span className="text-sm font-medium">{file.role}</span>
                        {file.caption && (
                          <p className="text-xs text-gray-500">{file.caption}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previous Feedback (if any) */}
          {deliverable.clientFeedback && deliverable.status !== "CLIENT_REVIEW" && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-sm font-medium text-blue-700 mb-2">Your Previous Feedback</h3>
              <p className="text-blue-600 text-sm whitespace-pre-wrap">{deliverable.clientFeedback}</p>
            </div>
          )}

          {/* Internal Feedback (visible to client if approved) */}
          {deliverable.status === "APPROVED" && deliverable.internalFeedback && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-sm font-medium text-green-700 mb-2">Team Notes</h3>
              <p className="text-green-600 text-sm whitespace-pre-wrap">{deliverable.internalFeedback}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Form - Only show for CLIENT_REVIEW status */}
      {isAwaitingReview && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-700">
              <Eye className="h-5 w-5" />
              Review This Deliverable
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DeliverableFeedbackForm
              deliverableId={deliverable.id}
              deliverableTitle={deliverable.title}
            />
          </CardContent>
        </Card>
      )}

      {/* Status Message for non-reviewable states */}
      {deliverable.status === "CLIENT_REVISION" && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="py-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto text-orange-500 mb-3" />
            <p className="font-medium text-orange-700">Revision in Progress</p>
            <p className="text-sm text-orange-600 mt-1">
              The team is working on the changes you requested. You&apos;ll be notified when a new version is ready for review.
            </p>
          </CardContent>
        </Card>
      )}

      {deliverable.status === "APPROVED" && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-green-500 mb-3" />
            <p className="font-medium text-green-700">Approved</p>
            <p className="text-sm text-green-600 mt-1">
              You approved this deliverable on{" "}
              {deliverable.approvedAt
                ? new Date(deliverable.approvedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })
                : "a recent date"}
            </p>
          </CardContent>
        </Card>
      )}

      {deliverable.status === "DELIVERED" && (
        <Card className="border-emerald-200 bg-emerald-50">
          <CardContent className="py-6 text-center">
            <CheckCircle className="h-8 w-8 mx-auto text-emerald-500 mb-3" />
            <p className="font-medium text-emerald-700">Delivered</p>
            <p className="text-sm text-emerald-600 mt-1">
              This deliverable has been finalized and delivered.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
