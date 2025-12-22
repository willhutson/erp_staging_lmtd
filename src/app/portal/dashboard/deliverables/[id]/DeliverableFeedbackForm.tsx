"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";
import { submitDeliverableFeedback } from "./actions";

interface DeliverableFeedbackFormProps {
  deliverableId: string;
  deliverableTitle: string;
}

export function DeliverableFeedbackForm({
  deliverableId,
}: DeliverableFeedbackFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleApprove = () => {
    setError(null);
    startTransition(async () => {
      try {
        await submitDeliverableFeedback(deliverableId, "approve", feedback);
        router.push("/portal/dashboard/deliverables");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit feedback");
      }
    });
  };

  const handleRequestRevisions = () => {
    if (!feedback.trim()) {
      setError("Please provide feedback explaining the revisions needed.");
      return;
    }

    setError(null);
    startTransition(async () => {
      try {
        await submitDeliverableFeedback(deliverableId, "revisions", feedback);
        router.push("/portal/dashboard/deliverables");
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit feedback");
      }
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Feedback
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Share any feedback, approval notes, or describe the changes you need..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
          disabled={isPending}
        />
        <p className="text-xs text-gray-500 mt-1">
          Feedback is required when requesting revisions
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleRequestRevisions}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <XCircle className="w-5 h-5" />
          )}
          Request Revisions
        </button>
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <CheckCircle className="w-5 h-5" />
          )}
          Approve
        </button>
      </div>
    </div>
  );
}
