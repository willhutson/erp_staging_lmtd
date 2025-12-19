"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitNPSResponse } from "../actions/nps-actions";
import { cn } from "@/lib/utils";

interface NPSResponseFormProps {
  surveyId: string;
  clientName: string;
  contactId?: string;
}

export function NPSResponseForm({
  surveyId,
  clientName,
  contactId,
}: NPSResponseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [score, setScore] = useState<number | null>(null);
  const [whatWeDoWell, setWhatWeDoWell] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (score === null) {
      setError("Please select a score");
      return;
    }

    startTransition(async () => {
      try {
        await submitNPSResponse({
          surveyId,
          score,
          whatWeDoWell: whatWeDoWell || undefined,
          whatToImprove: whatToImprove || undefined,
          additionalNotes: additionalNotes || undefined,
          contactId,
        });
        setSubmitted(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit feedback");
      }
    });
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h2>
        <p className="text-gray-600">
          Your feedback has been submitted successfully.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* NPS Score */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-2">
          How likely are you to recommend {clientName} to a friend or colleague?
        </label>
        <p className="text-sm text-gray-500 mb-4">0 = Not at all likely, 10 = Extremely likely</p>
        <div className="flex gap-2 flex-wrap">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setScore(n)}
              className={cn(
                "w-12 h-12 rounded-lg font-medium transition-all",
                score === n
                  ? n >= 9
                    ? "bg-green-500 text-white"
                    : n >= 7
                      ? "bg-yellow-500 text-white"
                      : "bg-red-500 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
          <span>Not likely</span>
          <span>Extremely likely</span>
        </div>
      </div>

      {/* What do we do well? */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-2">
          What do we do well?
        </label>
        <textarea
          value={whatWeDoWell}
          onChange={(e) => setWhatWeDoWell(e.target.value)}
          rows={3}
          placeholder="Tell us what you appreciate about working with us..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
        />
      </div>

      {/* What can we improve? */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-2">
          What could we improve?
        </label>
        <textarea
          value={whatToImprove}
          onChange={(e) => setWhatToImprove(e.target.value)}
          rows={3}
          placeholder="Tell us how we can serve you better..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
        />
      </div>

      {/* Additional notes */}
      <div>
        <label className="block text-lg font-medium text-gray-900 mb-2">
          Any additional feedback?
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          rows={3}
          placeholder="Anything else you'd like to share..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={isPending || score === null}
        className="w-full py-3 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50 text-lg"
      >
        {isPending ? "Submitting..." : "Submit Feedback"}
      </button>
    </form>
  );
}
