"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CheckCircle } from "lucide-react";
import { submitNPSResponse } from "./actions";

interface Props {
  surveyId: string;
  userId: string;
}

export function NPSSurveyForm({ surveyId, userId }: Props) {
  const router = useRouter();
  const [score, setScore] = useState<number | null>(null);
  const [whatWeDoWell, setWhatWeDoWell] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (score === null) {
      setError("Please select a score");
      return;
    }

    setSubmitting(true);
    setError("");

    const result = await submitNPSResponse({
      surveyId,
      userId,
      score,
      whatWeDoWell: whatWeDoWell.trim() || undefined,
      whatToImprove: whatToImprove.trim() || undefined,
      additionalNotes: additionalNotes.trim() || undefined,
    });

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        router.refresh();
      }, 2000);
    } else {
      setError(result.error || "Failed to submit feedback");
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-12 h-12 mx-auto text-green-500 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Thank you for your feedback!
        </h3>
        <p className="text-gray-500">
          Your response helps us improve our services
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* NPS Score */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          How likely are you to recommend us to a colleague or friend?
        </label>
        <div className="flex items-center justify-between gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => setScore(num)}
              className={`w-10 h-10 rounded-lg font-medium transition-all ${
                score === num
                  ? num >= 9
                    ? "bg-green-500 text-white ring-2 ring-green-300"
                    : num >= 7
                    ? "bg-yellow-500 text-white ring-2 ring-yellow-300"
                    : "bg-red-500 text-white ring-2 ring-red-300"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
      </div>

      {/* Feedback questions */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do we do well?
        </label>
        <textarea
          value={whatWeDoWell}
          onChange={(e) => setWhatWeDoWell(e.target.value)}
          placeholder="Tell us what you appreciate about working with us..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What could we improve?
        </label>
        <textarea
          value={whatToImprove}
          onChange={(e) => setWhatToImprove(e.target.value)}
          placeholder="Share any areas where we could do better..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Any other comments? (optional)
        </label>
        <textarea
          value={additionalNotes}
          onChange={(e) => setAdditionalNotes(e.target.value)}
          placeholder="Anything else you'd like to share..."
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting || score === null}
        className="w-full py-3 bg-[#52EDC7] text-gray-900 font-semibold rounded-lg hover:bg-[#3dd4b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
        Submit Feedback
      </button>
    </form>
  );
}
