import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
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
  Eye,
  User,
  Calendar,
  ExternalLink
} from "lucide-react";
import { DeliverableActions } from "./DeliverableActions";

const STATUS_CONFIG: Record<string, { label: string; color: string; description: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", description: "Work in progress" },
  IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700", description: "Actively being worked on" },
  INTERNAL_REVIEW: { label: "Internal Review", color: "bg-yellow-100 text-yellow-700", description: "Waiting for team review" },
  REVISION_NEEDED: { label: "Revision Needed", color: "bg-orange-100 text-orange-700", description: "Changes requested by team" },
  READY_FOR_CLIENT: { label: "Ready for Client", color: "bg-purple-100 text-purple-700", description: "Approved internally, ready to send" },
  CLIENT_REVIEW: { label: "Client Review", color: "bg-indigo-100 text-indigo-700", description: "Waiting for client feedback" },
  CLIENT_REVISION: { label: "Client Revision", color: "bg-orange-100 text-orange-700", description: "Changes requested by client" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", description: "Client approved" },
  DELIVERED: { label: "Delivered", color: "bg-emerald-100 text-emerald-700", description: "Delivered to client" },
  ARCHIVED: { label: "Archived", color: "bg-gray-100 text-gray-500", description: "No longer active" },
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

export default async function DeliverableDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  const deliverable = await db.deliverable.findUnique({
    where: { id },
    include: {
      brief: {
        include: {
          client: true,
          assignee: { select: { id: true, name: true, email: true } },
        },
      },
      createdBy: { select: { id: true, name: true, email: true } },
      reviewedBy: { select: { id: true, name: true } },
    },
  });

  if (!deliverable || deliverable.organizationId !== session.user.organizationId) {
    notFound();
  }

  const statusConfig = STATUS_CONFIG[deliverable.status] || STATUS_CONFIG.DRAFT;
  const canReview = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/content-engine/deliverables">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-gray-100 rounded-lg text-gray-600">
              {TYPE_ICONS[deliverable.type] || TYPE_ICONS.OTHER}
            </span>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{deliverable.title}</h1>
              <p className="text-gray-500">
                {deliverable.brief.client.code} &middot; {deliverable.brief.title}
              </p>
            </div>
          </div>
        </div>
        <Badge className={`${statusConfig.color} text-sm px-3 py-1`}>
          {statusConfig.label}
        </Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {deliverable.description ? (
                <p className="text-gray-700 whitespace-pre-wrap">{deliverable.description}</p>
              ) : (
                <p className="text-gray-400 italic">No description provided</p>
              )}
            </CardContent>
          </Card>

          {/* Files */}
          <Card>
            <CardHeader>
              <CardTitle>Files</CardTitle>
              <CardDescription>Attached deliverable files</CardDescription>
            </CardHeader>
            <CardContent>
              {deliverable.fileUrls && (deliverable.fileUrls as string[]).length > 0 ? (
                <div className="space-y-2">
                  {(deliverable.fileUrls as string[]).map((url: string, index: number) => (
                    <a
                      key={index}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <File className="h-5 w-5 text-gray-400" />
                      <span className="flex-1 truncate text-sm">{url.split("/").pop() || url}</span>
                      <ExternalLink className="h-4 w-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 italic">No files attached</p>
              )}
            </CardContent>
          </Card>

          {/* Feedback */}
          {(deliverable.internalFeedback || deliverable.clientFeedback) && (
            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {deliverable.internalFeedback && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Internal Review</h4>
                    <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                      {deliverable.internalFeedback}
                    </p>
                    {deliverable.reviewedBy && (
                      <p className="text-xs text-gray-400 mt-2">
                        by {deliverable.reviewedBy.name} on{" "}
                        {deliverable.reviewedAt?.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                )}
                {deliverable.clientFeedback && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Client Feedback</h4>
                    <p className="text-gray-600 bg-blue-50 p-3 rounded-lg">
                      {deliverable.clientFeedback}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Revision Notes */}
          {deliverable.revisionNotes && (deliverable.revisionNotes as string[]).length > 0 && (
            <Card className="border-orange-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <AlertCircle className="h-5 w-5" />
                  Revision Notes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {(deliverable.revisionNotes as string[]).map((note: string, index: number) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      <span className="text-gray-700">{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Actions */}
          <DeliverableActions
            deliverable={{
              id: deliverable.id,
              status: deliverable.status,
              title: deliverable.title,
            }}
            canReview={canReview}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Badge className={`${statusConfig.color} w-full justify-center py-2`}>
                  {statusConfig.label}
                </Badge>
                <p className="text-sm text-gray-500 text-center">{statusConfig.description}</p>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Type</p>
                <p className="font-medium text-gray-900">{deliverable.type}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Version</p>
                <p className="font-medium text-gray-900">v{deliverable.version}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Created By</p>
                <div className="flex items-center gap-2 mt-1">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">{deliverable.createdBy.name}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Created</p>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-900">
                    {deliverable.createdAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Brief Info */}
          <Card>
            <CardHeader>
              <CardTitle>Related Brief</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link
                href={`/briefs/${deliverable.briefId}`}
                className="block p-3 rounded-lg border hover:border-[#52EDC7] transition-colors"
              >
                <p className="font-medium text-gray-900">{deliverable.brief.title}</p>
                <p className="text-sm text-gray-500">{deliverable.brief.client.name}</p>
              </Link>
              {deliverable.brief.assignee && (
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Assignee</p>
                  <p className="text-gray-900">{deliverable.brief.assignee.name}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {deliverable.deliveredAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Delivered: {deliverable.deliveredAt.toLocaleDateString()}</span>
                  </div>
                )}
                {deliverable.clientApprovedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Approved: {deliverable.clientApprovedAt.toLocaleDateString()}</span>
                  </div>
                )}
                {deliverable.sentToClientAt && (
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-purple-500" />
                    <span>Sent to client: {deliverable.sentToClientAt.toLocaleDateString()}</span>
                  </div>
                )}
                {deliverable.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-yellow-500" />
                    <span>Reviewed: {deliverable.reviewedAt.toLocaleDateString()}</span>
                  </div>
                )}
                {deliverable.submittedForReviewAt && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-500" />
                    <span>Submitted: {deliverable.submittedForReviewAt.toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock className="h-4 w-4" />
                  <span>Created: {deliverable.createdAt.toLocaleDateString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
