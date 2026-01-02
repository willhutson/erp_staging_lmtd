"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send, CheckCircle, Clock, XCircle, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { sendNPSSurvey, sendReminder } from "../actions";
import type { NPSSurveyWithRelations, SurveyStatus } from "../types";

interface NPSSurveyListProps {
  surveys: NPSSurveyWithRelations[];
}

const statusConfig: Record<SurveyStatus, { icon: React.ReactNode; variant: "secondary" | "default" | "destructive" | "outline" }> = {
  DRAFT: {
    icon: <Clock className="w-3 h-3" />,
    variant: "secondary",
  },
  SENT: {
    icon: <Send className="w-3 h-3" />,
    variant: "default",
  },
  COMPLETED: {
    icon: <CheckCircle className="w-3 h-3" />,
    variant: "outline",
  },
  EXPIRED: {
    icon: <XCircle className="w-3 h-3" />,
    variant: "destructive",
  },
};

const quarterLabels = ["Q1", "Q2", "Q3", "Q4"];

export function NPSSurveyList({ surveys }: NPSSurveyListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleSend = (surveyId: string) => {
    startTransition(async () => {
      try {
        await sendNPSSurvey(surveyId);
        toast.success("Survey sent successfully");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send survey");
      }
    });
  };

  const handleReminder = (surveyId: string) => {
    startTransition(async () => {
      try {
        await sendReminder(surveyId);
        toast.success("Reminder sent");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to send reminder");
      }
    });
  };

  if (surveys.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm">
        No surveys found
      </div>
    );
  }

  return (
    <div className="divide-y">
      {surveys.map((survey) => {
        const config = statusConfig[survey.status];
        const response = survey.responses[0];

        return (
          <div key={survey.id} className="p-4 hover:bg-muted/50 transition-colors">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium truncate">
                    {survey.client.name}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {quarterLabels[survey.quarter - 1]} {survey.year}
                  </span>
                </div>

                {survey.sentTo && (
                  <p className="text-sm text-muted-foreground">
                    Sent to: {survey.sentTo.name}
                    {survey.sentTo.email ? ` (${survey.sentTo.email})` : ""}
                  </p>
                )}

                {response && (
                  <div className="mt-2 p-3 bg-muted rounded-lg">
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
                      <Badge
                        variant={
                          response.category === "PROMOTER"
                            ? "default"
                            : response.category === "PASSIVE"
                              ? "secondary"
                              : "destructive"
                        }
                        className="text-xs"
                      >
                        {response.category}
                      </Badge>
                    </div>
                    {response.whatWeDoWell && (
                      <p className="text-sm text-muted-foreground mt-2">
                        <span className="text-xs uppercase tracking-wider">Doing well:</span>{" "}
                        {response.whatWeDoWell}
                      </p>
                    )}
                    {response.whatToImprove && (
                      <p className="text-sm text-muted-foreground">
                        <span className="text-xs uppercase tracking-wider">To improve:</span>{" "}
                        {response.whatToImprove}
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={config.variant} className="gap-1">
                  {config.icon}
                  {survey.status}
                </Badge>

                {survey.status === "DRAFT" && (
                  <Button
                    onClick={() => handleSend(survey.id)}
                    disabled={isPending}
                    size="sm"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Send
                  </Button>
                )}

                {survey.status === "SENT" && (
                  <Button
                    onClick={() => handleReminder(survey.id)}
                    disabled={isPending}
                    variant="outline"
                    size="sm"
                  >
                    <Mail className="w-4 h-4 mr-1" />
                    Remind
                  </Button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
