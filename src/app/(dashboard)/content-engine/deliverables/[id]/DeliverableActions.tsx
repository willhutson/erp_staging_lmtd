"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  ArrowRight
} from "lucide-react";
import {
  submitForInternalReview,
  completeInternalReview,
  submitToClient,
  recordClientFeedback,
  markAsDelivered,
} from "@/modules/content-engine/actions/deliverable-actions";

interface DeliverableActionsProps {
  deliverable: {
    id: string;
    status: string;
    title: string;
  };
  canReview: boolean;
}

export function DeliverableActions({ deliverable, canReview }: DeliverableActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewType, setReviewType] = useState<"internal" | "client" | null>(null);

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
      router.refresh();
    } catch (error) {
      console.error("Action failed:", error);
      alert(error instanceof Error ? error.message : "Action failed");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (decision: "APPROVE" | "REQUEST_REVISION") => {
    setLoading(true);
    try {
      if (reviewType === "internal") {
        await completeInternalReview(deliverable.id, {
          decision,
          feedback: feedback || undefined,
        });
      } else if (reviewType === "client") {
        await recordClientFeedback(deliverable.id, {
          decision,
          feedback: feedback || undefined,
        });
      }
      setShowReviewForm(false);
      setFeedback("");
      setReviewType(null);
      router.refresh();
    } catch (error) {
      console.error("Review failed:", error);
      alert(error instanceof Error ? error.message : "Review failed");
    } finally {
      setLoading(false);
    }
  };

  // Determine available actions based on status
  const renderActions = () => {
    switch (deliverable.status) {
      case "DRAFT":
      case "IN_PROGRESS":
      case "REVISION_NEEDED":
        return (
          <Button
            onClick={() => handleAction(() => submitForInternalReview(deliverable.id))}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit for Review
          </Button>
        );

      case "INTERNAL_REVIEW":
        if (!canReview) {
          return (
            <p className="text-sm text-gray-500">
              Waiting for team lead or above to review
            </p>
          );
        }
        return (
          <div className="space-y-4">
            {!showReviewForm ? (
              <Button
                onClick={() => {
                  setShowReviewForm(true);
                  setReviewType("internal");
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Review Deliverable
              </Button>
            ) : (
              <ReviewForm
                feedback={feedback}
                setFeedback={setFeedback}
                onApprove={() => handleReview("APPROVE")}
                onRequestRevision={() => handleReview("REQUEST_REVISION")}
                onCancel={() => {
                  setShowReviewForm(false);
                  setFeedback("");
                }}
                loading={loading}
                type="internal"
              />
            )}
          </div>
        );

      case "READY_FOR_CLIENT":
        return (
          <Button
            onClick={() => handleAction(() => submitToClient(deliverable.id))}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Send to Client
          </Button>
        );

      case "CLIENT_REVIEW":
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Waiting for client feedback. Record their response below:
            </p>
            {!showReviewForm ? (
              <Button
                onClick={() => {
                  setShowReviewForm(true);
                  setReviewType("client");
                }}
                className="bg-indigo-500 hover:bg-indigo-600 text-white"
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Record Client Feedback
              </Button>
            ) : (
              <ReviewForm
                feedback={feedback}
                setFeedback={setFeedback}
                onApprove={() => handleReview("APPROVE")}
                onRequestRevision={() => handleReview("REQUEST_REVISION")}
                onCancel={() => {
                  setShowReviewForm(false);
                  setFeedback("");
                }}
                loading={loading}
                type="client"
              />
            )}
          </div>
        );

      case "CLIENT_REVISION":
        return (
          <Button
            onClick={() => handleAction(() => submitForInternalReview(deliverable.id))}
            disabled={loading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Send className="h-4 w-4 mr-2" />
            Resubmit for Review
          </Button>
        );

      case "APPROVED":
        return (
          <Button
            onClick={() => handleAction(() => markAsDelivered(deliverable.id))}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark as Delivered
          </Button>
        );

      case "DELIVERED":
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Successfully Delivered</span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Actions</CardTitle>
      </CardHeader>
      <CardContent>{renderActions()}</CardContent>
    </Card>
  );
}

interface ReviewFormProps {
  feedback: string;
  setFeedback: (feedback: string) => void;
  onApprove: () => void;
  onRequestRevision: () => void;
  onCancel: () => void;
  loading: boolean;
  type: "internal" | "client";
}

function ReviewForm({
  feedback,
  setFeedback,
  onApprove,
  onRequestRevision,
  onCancel,
  loading,
  type,
}: ReviewFormProps) {
  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <div>
        <label className="text-sm font-medium text-gray-700">
          {type === "internal" ? "Review Notes" : "Client Feedback"}
        </label>
        <Textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder={
            type === "internal"
              ? "Add any feedback or notes about this deliverable..."
              : "Enter the client's feedback..."
          }
          rows={4}
          className="mt-1"
        />
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onApprove}
          disabled={loading}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <CheckCircle className="h-4 w-4 mr-2" />
          {type === "internal" ? "Approve" : "Client Approved"}
        </Button>
        <Button
          onClick={onRequestRevision}
          disabled={loading}
          variant="outline"
          className="border-orange-500 text-orange-500 hover:bg-orange-50"
        >
          <XCircle className="h-4 w-4 mr-2" />
          {type === "internal" ? "Request Revision" : "Revision Needed"}
        </Button>
        <Button onClick={onCancel} disabled={loading} variant="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );
}
