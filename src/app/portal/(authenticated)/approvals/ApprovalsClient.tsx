"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  FileText,
  Calendar,
  User,
  Loader2,
  Download,
  Eye,
} from "lucide-react";
import { format } from "date-fns";
import { submitApproval } from "./actions";
import type { Brief, File as FileType, SubmissionApproval } from "@prisma/client";

interface BriefWithFiles extends Brief {
  assignee: { id: string; name: string | null } | null;
  briefFiles: Array<{
    file: FileType;
  }>;
}

interface ApprovalItem extends SubmissionApproval {
  brief?: Brief & {
    assignee: { id: string; name: string | null } | null;
  };
}

interface Props {
  briefsForReview: BriefWithFiles[];
  approvalItems: ApprovalItem[];
  userId: string;
}

export function ApprovalsClient({
  briefsForReview,
  approvalItems,
  userId,
}: Props) {
  return (
    <div className="space-y-6">
      {/* Briefs awaiting review */}
      {briefsForReview.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Briefs Awaiting Your Review
          </h2>
          <div className="space-y-4">
            {briefsForReview.map((brief) => (
              <BriefReviewCard key={brief.id} brief={brief} userId={userId} />
            ))}
          </div>
        </div>
      )}

      {/* Specific approval requests */}
      {approvalItems.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Approval Requests
          </h2>
          <div className="space-y-4">
            {approvalItems.map((item) => (
              <ApprovalCard key={item.id} approval={item} userId={userId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function BriefReviewCard({
  brief,
  userId,
}: {
  brief: BriefWithFiles;
  userId: string;
}) {
  const router = useRouter();
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"approve" | "revisions" | null>(null);

  const deliverables = brief.briefFiles.map((bf) => bf.file);

  const handleSubmit = async (approved: boolean) => {
    setSubmitting(true);
    setAction(approved ? "approve" : "revisions");

    await submitApproval({
      briefId: brief.id,
      userId,
      approved,
      feedback,
      rating: approved ? rating : undefined,
    });

    router.refresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="text-xs font-medium text-gray-400 uppercase">
              {brief.type.replace("_", " ")}
            </span>
            <h3 className="font-semibold text-gray-900 mt-1">{brief.title}</h3>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {brief.assignee && (
                <span className="flex items-center gap-1">
                  <User className="w-4 h-4" />
                  {brief.assignee.name}
                </span>
              )}
              {brief.deadline && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Due {format(new Date(brief.deadline), "MMM d")}
                </span>
              )}
            </div>
          </div>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm font-medium rounded-full">
            Awaiting Review
          </span>
        </div>

        {/* Deliverables */}
        {deliverables.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Deliverables
            </p>
            <div className="flex flex-wrap gap-2">
              {deliverables.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg"
                >
                  <FileText className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  {file.cdnUrl && (
                    <div className="flex items-center gap-1 ml-2">
                      <a
                        href={file.cdnUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Eye className="w-4 h-4" />
                      </a>
                      <a
                        href={file.cdnUrl}
                        download
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Feedback form */}
        {showFeedback ? (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Share your feedback..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Satisfaction Rating
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-10 h-10 rounded-lg border-2 font-medium transition-colors ${
                      rating >= star
                        ? "border-[#52EDC7] bg-[#52EDC7]/10 text-[#1BA098]"
                        : "border-gray-200 text-gray-400"
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {submitting && action === "approve" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                Approve
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-500 text-white font-medium rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50"
              >
                {submitting && action === "revisions" ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )}
                Request Revisions
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                disabled={submitting}
                className="px-4 py-2.5 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => setShowFeedback(true)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              Review & Respond
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function ApprovalCard({
  approval,
  userId,
}: {
  approval: ApprovalItem;
  userId: string;
}) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);

  const handleAction = async (approved: boolean) => {
    setSubmitting(true);
    setAction(approved ? "approve" : "reject");

    await submitApproval({
      approvalId: approval.id,
      briefId: approval.briefId,
      userId,
      approved,
      feedback,
    });

    router.refresh();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <span className="text-xs font-medium text-gray-400 uppercase">
            {approval.submissionType}
          </span>
          <h3 className="font-semibold text-gray-900 mt-1">
            {approval.brief?.title || "Submission"}
          </h3>
        </div>
        <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
          Pending
        </span>
      </div>

      <div>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Add feedback (optional)..."
          rows={2}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent mb-3"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => handleAction(true)}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {submitting && action === "approve" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          Approve
        </button>
        <button
          onClick={() => handleAction(false)}
          disabled={submitting}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {submitting && action === "reject" ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          Reject
        </button>
      </div>
    </div>
  );
}
