import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getFormSubmission } from "@/modules/forms/actions/form-submission-actions";
import Link from "next/link";
import { ArrowLeft, FileText, Clock, CheckCircle, XCircle, AlertCircle, User, Calendar } from "lucide-react";
import { format } from "date-fns";
import { SubmissionActions } from "./SubmissionActions";
import type { FormTemplateConfig } from "@/modules/forms/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700", icon: <FileText className="w-4 h-4" /> },
  SUBMITTED: { label: "Pending Review", color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-4 h-4" /> },
  IN_REVIEW: { label: "In Review", color: "bg-blue-100 text-blue-700", icon: <AlertCircle className="w-4 h-4" /> },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700", icon: <CheckCircle className="w-4 h-4" /> },
  REJECTED: { label: "Rejected", color: "bg-red-100 text-red-700", icon: <XCircle className="w-4 h-4" /> },
  COMPLETED: { label: "Completed", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle className="w-4 h-4" /> },
  CANCELLED: { label: "Cancelled", color: "bg-gray-100 text-gray-500", icon: <XCircle className="w-4 h-4" /> },
};

export default async function SubmissionDetailPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const submission = await getFormSubmission(id);

  if (!submission) {
    notFound();
  }

  const status = statusConfig[submission.status] || statusConfig.DRAFT;
  const canReview = ["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel);
  const canTakeAction = canReview && ["SUBMITTED", "IN_REVIEW"].includes(submission.status);

  const config = submission.template.config as unknown as FormTemplateConfig;
  const formData = submission.data as Record<string, unknown>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/submissions"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {submission.title || "Untitled Submission"}
            </h1>
            <p className="text-gray-500 mt-1">{submission.template.name}</p>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${status.color}`}>
          {status.icon}
          {status.label}
        </span>
      </div>

      {/* Rejection reason banner */}
      {submission.status === "REJECTED" && submission.rejectionReason && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="font-medium text-red-800 mb-1">Rejection Reason</h3>
          <p className="text-red-700">{submission.rejectionReason}</p>
        </div>
      )}

      {/* Brief link if created */}
      {submission.brief && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
          <div>
            <h3 className="font-medium text-green-800">Brief Created</h3>
            <p className="text-green-700">{submission.brief.title}</p>
          </div>
          <Link
            href={`/briefs/${submission.brief.id}`}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            View Brief
          </Link>
        </div>
      )}

      {/* Metadata */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <User className="w-4 h-4" />
              Submitted By
            </div>
            <p className="font-medium text-gray-900">{submission.submittedBy.name}</p>
          </div>
          <div>
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
              <Calendar className="w-4 h-4" />
              Submitted
            </div>
            <p className="font-medium text-gray-900">
              {format(new Date(submission.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </div>
          {submission.reviewedBy && (
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <User className="w-4 h-4" />
                Reviewed By
              </div>
              <p className="font-medium text-gray-900">{submission.reviewedBy.name}</p>
            </div>
          )}
          {submission.reviewedAt && (
            <div>
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                Reviewed
              </div>
              <p className="font-medium text-gray-900">
                {format(new Date(submission.reviewedAt), "MMM d, yyyy 'at' h:mm a")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Form Data Display */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        <h2 className="text-lg font-semibold text-gray-900">Submission Details</h2>

        {config.sections.map((section) => (
          <div key={section.id} className="space-y-4">
            <h3 className="text-md font-medium text-gray-800 border-b pb-2">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.fields.map((field) => {
                const value = formData[field.id];
                let displayValue: string = "-";

                if (value !== undefined && value !== null && value !== "") {
                  if (Array.isArray(value)) {
                    displayValue = value.join(", ");
                  } else if (typeof value === "object") {
                    // Date range or other object
                    if ("start" in value && "end" in value) {
                      displayValue = `${value.start} to ${value.end}`;
                    } else {
                      displayValue = JSON.stringify(value);
                    }
                  } else {
                    displayValue = String(value);
                  }
                }

                return (
                  <div key={field.id} className={field.type === "textarea" ? "col-span-2" : ""}>
                    <label className="text-sm font-medium text-gray-500">
                      {field.label}
                    </label>
                    <p className="text-gray-900 mt-1 whitespace-pre-wrap">
                      {displayValue}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Review notes if any */}
      {submission.reviewNotes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="font-medium text-gray-900 mb-2">Review Notes</h3>
          <p className="text-gray-700">{submission.reviewNotes}</p>
        </div>
      )}

      {/* Actions */}
      {canTakeAction && (
        <SubmissionActions submissionId={submission.id} />
      )}
    </div>
  );
}
