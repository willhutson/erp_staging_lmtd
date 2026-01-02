"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { submitNPSResponse } from "../actions";

interface NPSResponseFormProps {
  surveyId: string;
  portalUserId?: string;
  contactId?: string;
  onSuccess?: () => void;
}

export function NPSResponseForm({
  surveyId,
  portalUserId,
  contactId,
  onSuccess
}: NPSResponseFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [score, setScore] = useState<number | null>(null);
  const [whatWeDoWell, setWhatWeDoWell] = useState("");
  const [whatToImprove, setWhatToImprove] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");

  const handleSubmit = () => {
    if (score === null) {
      toast.error("Please select a score");
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
          portalUserId,
          contactId,
        });
        toast.success("Thank you for your feedback!");
        onSuccess?.();
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to submit response");
      }
    });
  };

  const getScoreLabel = (s: number) => {
    if (s >= 9) return "Promoter";
    if (s >= 7) return "Passive";
    return "Detractor";
  };

  const getScoreColor = (s: number) => {
    if (s >= 9) return "bg-green-500 border-green-600 text-white";
    if (s >= 7) return "bg-yellow-500 border-yellow-600 text-white";
    return "bg-red-500 border-red-600 text-white";
  };

  return (
    <div className="space-y-6">
      {/* Score Selection */}
      <div className="space-y-3">
        <Label className="text-base">
          How likely are you to recommend us to a friend or colleague?
        </Label>
        <div className="flex justify-between items-center gap-1">
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
            <button
              key={n}
              onClick={() => setScore(n)}
              className={cn(
                "w-10 h-10 rounded-lg border-2 font-semibold transition-all",
                score === n
                  ? getScoreColor(n)
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              )}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
        {score !== null && (
          <p className={cn(
            "text-sm font-medium text-center py-2 rounded-lg",
            score >= 9 ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" :
            score >= 7 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400" :
            "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
          )}>
            {getScoreLabel(score)}
          </p>
        )}
      </div>

      {/* Feedback Questions */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatWeDoWell">What are we doing well?</Label>
          <Textarea
            id="whatWeDoWell"
            placeholder="Tell us what you appreciate about working with us..."
            value={whatWeDoWell}
            onChange={(e) => setWhatWeDoWell(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="whatToImprove">What could we improve?</Label>
          <Textarea
            id="whatToImprove"
            placeholder="Share any areas where we could do better..."
            value={whatToImprove}
            onChange={(e) => setWhatToImprove(e.target.value)}
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="additionalNotes">Anything else you'd like to share?</Label>
          <Textarea
            id="additionalNotes"
            placeholder="Any additional comments or suggestions..."
            value={additionalNotes}
            onChange={(e) => setAdditionalNotes(e.target.value)}
            rows={2}
          />
        </div>
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isPending || score === null}
        className="w-full"
        size="lg"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Star className="w-4 h-4 mr-2" />
        )}
        Submit Feedback
      </Button>
    </div>
  );
}
