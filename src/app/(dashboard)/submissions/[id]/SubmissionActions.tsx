"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { approveSubmission, rejectSubmission } from "@/modules/forms/actions/form-submission-actions";

interface SubmissionActionsProps {
  submissionId: string;
}

export function SubmissionActions({ submissionId }: SubmissionActionsProps) {
  const router = useRouter();
  const [isApproving, setIsApproving] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [approveNotes, setApproveNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);

    try {
      const result = await approveSubmission(submissionId, approveNotes || undefined);

      if (result.brief) {
        // Redirect to the created brief
        router.push(`/briefs/${result.brief.id}`);
      } else {
        router.push("/submissions");
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to approve");
      setIsApproving(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }

    setIsRejecting(true);
    setError(null);

    try {
      await rejectSubmission(submissionId, rejectReason);
      router.push("/submissions");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reject");
      setIsRejecting(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h3 className="font-semibold text-gray-900">Review Actions</h3>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Approval Notes (optional)
            </label>
            <textarea
              value={approveNotes}
              onChange={(e) => setApproveNotes(e.target.value)}
              placeholder="Add any notes for the submitter..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              rows={2}
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleApprove}
            disabled={isApproving || isRejecting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            <CheckCircle className="w-5 h-5" />
            {isApproving ? "Approving..." : "Approve"}
          </button>
          <button
            onClick={() => setShowRejectModal(true)}
            disabled={isApproving || isRejecting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            <XCircle className="w-5 h-5" />
            Reject
          </button>
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Reject Submission</h3>
            <p className="text-gray-600">
              Please provide a reason for rejecting this submission. This will be visible to the submitter.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectReason("");
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isRejecting || !rejectReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isRejecting ? "Rejecting..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
