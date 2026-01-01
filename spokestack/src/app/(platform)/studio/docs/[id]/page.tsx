import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, FileText, Calendar, User, Building2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

const DOC_TYPE_LABELS: Record<string, string> = {
  DOCUMENT: "Document",
  SCRIPT: "Script",
  SOCIAL_COPY: "Social Copy",
  AD_COPY: "Ad Copy",
  BLOG_POST: "Blog Post",
  EMAIL: "Email",
  PROPOSAL: "Proposal",
  SOW: "Scope of Work",
};

const STATUS_LABELS: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  REVIEW: { label: "Review", variant: "outline" },
  APPROVED: { label: "Approved", variant: "default" },
  PUBLISHED: { label: "Published", variant: "default" },
};

export default async function DocumentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const user = await getStudioUser();

  const document = await db.studioDocument.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true } },
    },
  });

  if (!document) {
    notFound();
  }

  const typeLabel = DOC_TYPE_LABELS[document.type] || document.type;
  const statusConfig = STATUS_LABELS[document.status] || { label: document.status, variant: "outline" as const };

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <Link
          href="/studio/docs"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {document.title}
            </h1>
            <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {typeLabel}
            {document.client && ` • ${document.client.name}`}
          </p>
        </div>
      </div>

      {/* Meta Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <User className="w-4 h-4" />
            Created By
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {document.createdBy?.name || "Unknown"}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Calendar className="w-4 h-4" />
            Created
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(document.createdAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
            <Calendar className="w-4 h-4" />
            Last Updated
          </div>
          <p className="font-medium text-gray-900 dark:text-white">
            {new Date(document.updatedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>

        {document.client && (
          <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-1">
              <Building2 className="w-4 h-4" />
              Client
            </div>
            <p className="font-medium text-gray-900 dark:text-white">
              {document.client.name}
            </p>
          </div>
        )}
      </div>

      {/* Google Docs Link */}
      {document.googleDocId && (
        <div className="mb-8 p-4 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-blue-900 dark:text-blue-100">
                Synced with Google Docs
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Last synced: {document.lastSyncedAt
                  ? new Date(document.lastSyncedAt).toLocaleString()
                  : "Never"}
              </p>
            </div>
            <a
              href={`https://docs.google.com/document/d/${document.googleDocId}/edit`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Open in Google Docs
            </a>
          </div>
        </div>
      )}

      {/* Content Preview */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-gray-900 dark:text-white">Content</h2>
          {document.wordCount > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {document.wordCount} words
            </p>
          )}
        </div>
        <div className="p-6">
          {document.contentHtml ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: document.contentHtml }}
            />
          ) : (
            <p className="text-gray-500 dark:text-gray-400 italic">
              No content yet. {document.googleDocId
                ? "Content will appear after syncing from Google Docs."
                : "Create content in Google Docs after syncing."}
            </p>
          )}
        </div>
      </div>

      {/* Related Items */}
      {(document.project || document.brief) && (
        <div className="mt-8">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Related</h2>
          <div className="space-y-2">
            {document.project && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">Project: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {document.project.name}
                </span>
              </div>
            )}
            {document.brief && (
              <Link
                href={`/briefs/${document.brief.id}`}
                className="block p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
              >
                <span className="text-sm text-gray-500 dark:text-gray-400">Brief: </span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {document.brief.title}
                </span>
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
