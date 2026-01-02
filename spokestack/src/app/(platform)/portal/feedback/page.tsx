import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, CheckCircle, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import prisma from "@/lib/prisma";
import { NPSResponseForm } from "@/modules/nps/components";

// Local type definition for NPS Survey (matches Prisma schema)
interface NPSSurveyType {
  id: string;
  organizationId: string;
  clientId: string;
  quarter: number;
  year: number;
  status: string;
  sentAt: Date | null;
  sentToId: string | null;
  reminderSentAt: Date | null;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
}

export const dynamic = "force-dynamic";

// TODO: Replace with actual portal auth when implemented
// For now, we use query params or mock data
interface PortalFeedbackPageProps {
  searchParams: Promise<{ clientId?: string; userId?: string }>;
}

export default async function PortalFeedbackPage({ searchParams }: PortalFeedbackPageProps) {
  const params = await searchParams;
  const clientId = params.clientId;
  const portalUserId = params.userId;

  // If no client context, show placeholder
  if (!clientId) {
    return (
      <div className="max-w-3xl mx-auto space-y-8 p-6">
        <div className="flex items-center gap-4">
          <Link
            href="/portal"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">Feedback</h1>
            <p className="text-muted-foreground mt-1">
              Help us improve by sharing your experience
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-center">
              You don't have any pending feedback surveys
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Get pending NPS surveys for this client
  const pendingSurveys = (await prisma.nPSSurvey.findMany({
    where: {
      clientId,
      status: "SENT",
    },
    orderBy: { sentAt: "desc" },
  })) as NPSSurveyType[];

  // Define type for completed responses
  interface CompletedResponse {
    id: string;
    surveyId: string;
    score: number;
    category: string;
    submittedAt: Date;
    survey: {
      id: string;
      quarter: number;
      year: number;
    };
  }

  // Get completed responses (if user ID provided)
  let completedResponses: CompletedResponse[] = [];
  let respondedSurveyIds: string[] = [];
  if (portalUserId) {
    const responses = await prisma.nPSResponse.findMany({
      where: {
        portalUserId,
      },
      include: {
        survey: true,
      },
      orderBy: { submittedAt: "desc" },
      take: 5,
    });
    completedResponses = responses as CompletedResponse[];
    respondedSurveyIds = responses.map((r: { surveyId: string }) => r.surveyId);
  }

  // Filter out already responded surveys
  const unresolvedSurveys = pendingSurveys.filter(
    (s) => !respondedSurveyIds.includes(s.id)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8 p-6">
      <div className="flex items-center gap-4">
        <Link
          href="/portal"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Feedback</h1>
          <p className="text-muted-foreground mt-1">
            Help us improve by sharing your experience
          </p>
        </div>
      </div>

      {/* Pending Surveys */}
      {unresolvedSurveys.length > 0 ? (
        <div className="space-y-6">
          {unresolvedSurveys.map((survey) => (
            <Card key={survey.id}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                    <Star className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-semibold">
                      Q{survey.quarter} {survey.year} Feedback Survey
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      We'd love to hear how we're doing
                    </p>
                  </div>
                </div>

                <NPSResponseForm
                  surveyId={survey.id}
                  portalUserId={portalUserId}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="w-12 h-12 text-green-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">All caught up!</h3>
            <p className="text-muted-foreground text-center">
              You don't have any pending feedback surveys
            </p>
          </CardContent>
        </Card>
      )}

      {/* Previous Responses */}
      {completedResponses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Previous Feedback</h2>
          <div className="space-y-3">
            {completedResponses.map((response) => (
              <Card key={response.id}>
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Q{response.survey.quarter} {response.survey.year}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Submitted {format(new Date(response.submittedAt), "MMM d, yyyy")}
                    </p>
                  </div>
                  <ScoreBadge score={response.score} category={response.category} />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score, category }: { score: number; category: string }) {
  let colorClass = "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400";

  if (category === "PROMOTER") {
    colorClass = "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400";
  } else if (category === "PASSIVE") {
    colorClass = "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400";
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold">{score}</span>
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
        {category}
      </span>
    </div>
  );
}
