"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle } from "lucide-react";
import { submitClientFeedback } from "./actions";

interface ClientFeedbackFormProps {
  briefId: string;
  clientSlug: string;
}

export function ClientFeedbackForm({
  briefId,
  clientSlug,
}: ClientFeedbackFormProps) {
  const router = useRouter();
  const [feedback, setFeedback] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleApprove = () => {
    startTransition(async () => {
      await submitClientFeedback(briefId, "approve", feedback);
      router.push(`/portal/${clientSlug}`);
      router.refresh();
    });
  };

  const handleRequestRevisions = () => {
    if (!feedback.trim()) {
      alert("Please provide feedback for the revisions.");
      return;
    }

    startTransition(async () => {
      await submitClientFeedback(briefId, "revisions", feedback);
      router.push(`/portal/${clientSlug}`);
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Feedback or comments
        </label>
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          rows={4}
          placeholder="Share any feedback, changes needed, or approval notes..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={handleRequestRevisions}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-orange-200 text-orange-700 rounded-lg hover:bg-orange-50 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-5 h-5" />
          Request Revisions
        </button>
        <button
          onClick={handleApprove}
          disabled={isPending}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-5 h-5" />
          Approve
        </button>
      </div>
    </div>
  );
}
