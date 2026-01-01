import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { getFormConfig, briefTypeLabels } from "@/../config/forms";
import { ClientFeedbackForm } from "./ClientFeedbackForm";

interface PageProps {
  params: Promise<{ clientSlug: string; briefId: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function PortalBriefDetailPage({ params }: PageProps) {
  const { clientSlug, briefId } = await params;

  const brief = await db.brief.findUnique({
    where: { id: briefId },
    include: {
      client: true,
      assignee: true,
      attachments: true,
      comments: {
        include: {
          user: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!brief || brief.client.code.toLowerCase() !== clientSlug.toLowerCase()) {
    notFound();
  }

  const formConfig = getFormConfig(brief.type);
  const formData = brief.formData as Record<string, unknown>;

  const isReviewable = brief.status === "CLIENT_REVIEW";

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link
        href={`/portal/${clientSlug}`}
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to dashboard
      </Link>

      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 mb-1">
              {brief.title}
            </h1>
            <p className="text-gray-500">
              {brief.briefNumber} • {briefTypeLabels[brief.type]}
            </p>
          </div>
          <span
            className={`px-3 py-1 text-sm font-medium rounded-full ${
              brief.status === "CLIENT_REVIEW"
                ? "bg-yellow-100 text-yellow-700"
                : brief.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : brief.status === "REVISIONS"
                ? "bg-orange-100 text-orange-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {brief.status === "CLIENT_REVIEW"
              ? "Awaiting Your Review"
              : brief.status === "COMPLETED"
              ? "Approved"
              : brief.status === "REVISIONS"
              ? "In Revisions"
              : brief.status.replace(/_/g, " ")}
          </span>
        </div>

        {brief.assignee && (
          <p className="text-sm text-gray-500 mt-4">
            Assigned to: {brief.assignee.name}
          </p>
        )}
      </div>

      {/* Brief details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Project Details</h2>

        {formConfig.sections.map((section) => {
          const sectionFields = section.fields.filter((f) => {
            const value = formData[f.id];
            return value !== undefined && value !== null && value !== "";
          });

          if (sectionFields.length === 0) return null;

          return (
            <div key={section.id} className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
                {section.title}
              </h3>
              <dl className="space-y-3">
                {sectionFields.map((field) => {
                  const value = formData[field.id];
                  let displayValue: string;

                  if (Array.isArray(value)) {
                    displayValue = value.join(", ");
                  } else if (
                    typeof value === "object" &&
                    value !== null &&
                    "start" in value
                  ) {
                    const dateRange = value as { start: string; end: string };
                    displayValue = `${dateRange.start} to ${dateRange.end}`;
                  } else {
                    displayValue = String(value);
                  }

                  return (
                    <div key={field.id}>
                      <dt className="text-sm text-gray-500">{field.label}</dt>
                      <dd className="text-gray-900 mt-1 whitespace-pre-wrap">
                        {displayValue}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
          );
        })}
      </div>

      {/* Attachments */}
      {brief.attachments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Deliverables
          </h2>
          <div className="space-y-2">
            {brief.attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <span className="text-sm text-gray-900">
                  {attachment.fileName}
                </span>
                <span className="text-xs text-gray-500">
                  {(attachment.fileSize / 1024 / 1024).toFixed(1)} MB
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Client actions */}
      {isReviewable && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Feedback
          </h2>
          <ClientFeedbackForm briefId={brief.id} clientSlug={clientSlug} />
        </div>
      )}

      {/* Previous feedback */}
      {brief.comments.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Comments
          </h2>
          <div className="space-y-4">
            {brief.comments.map((comment) => (
              <div key={comment.id} className="border-l-2 border-gray-200 pl-4">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">
                    {comment.user.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {comment.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
