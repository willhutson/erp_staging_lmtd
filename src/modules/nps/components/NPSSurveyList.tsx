"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Clock, XCircle } from "lucide-react";
import type { NPSSurvey, NPSResponse, SurveyStatus } from "@prisma/client";
import { sendNPSSurvey } from "../actions/nps-actions";
import { cn } from "@/lib/utils";

type SurveyWithRelations = NPSSurvey & {
  client: { id: string; name: string; code: string };
  sentTo: { id: string; name: string; email: string | null } | null;
  responses: NPSResponse[];
};

interface NPSSurveyListProps {
  surveys: SurveyWithRelations[];
}

const statusConfig: Record<SurveyStatus, { icon: React.ReactNode; color: string; bgColor: string }> = {
  DRAFT: {
    icon: <Clock className="w-4 h-4" />,
    color: "text-gray-600",
    bgColor: "bg-gray-100",
  },
  SENT: {
    icon: <Send className="w-4 h-4" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  COMPLETED: {
    icon: <CheckCircle className="w-4 h-4" />,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  EXPIRED: {
    icon: <XCircle className="w-4 h-4" />,
    color: "text-red-600",
    bgColor: "bg-red-100",
  },
};

const quarterLabels = ["Q1", "Q2", "Q3", "Q4"];

export function NPSSurveyList({ surveys }: NPSSurveyListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSend = (surveyId: string) => {
    startTransition(async () => {
      await sendNPSSurvey(surveyId);
      router.refresh();
    });
  };

  if (surveys.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 text-sm">
        No surveys found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {surveys.map((survey) => {
        const config = statusConfig[survey.status];
        const response = survey.responses[0];

        return (
          <div key={survey.id} className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {survey.client.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    {quarterLabels[survey.quarter - 1]} {survey.year}
                  </span>
                </div>

                {survey.sentTo && (
                  <p className="text-sm text-gray-500">
                    Sent to: {survey.sentTo.name}{survey.sentTo.email ? ` (${survey.sentTo.email})` : ""}
                  </p>
                )}

                {response && (
                  <div className="mt-2 p-2 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-lg font-bold",
                          response.category === "PROMOTER"
                            ? "text-green-600"
                            : response.category === "PASSIVE"
                              ? "text-yellow-600"
                              : "text-red-600"
                        )}
                      >
                        {response.score}
                      </span>
                      <span className="text-xs text-gray-500">
                        {response.category}
                      </span>
                    </div>
                    {response.whatWeDoWell && (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="text-gray-400">Doing well:</span>{" "}
                        {response.whatWeDoWell}
                      </p>
                    )}
                    {response.whatToImprove && (
                      <p className="text-sm text-gray-600">
                        <span className="text-gray-400">To improve:</span>{" "}
                        {response.whatToImprove}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full",
                    config.bgColor,
                    config.color
                  )}
                >
                  {config.icon}
                  {survey.status}
                </span>

                {survey.status === "DRAFT" && (
                  <button
                    onClick={() => handleSend(survey.id)}
                    disabled={isPending}
                    className="flex items-center gap-1 px-3 py-1 text-sm bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
