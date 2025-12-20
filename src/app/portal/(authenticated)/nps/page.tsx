import { getPortalUser } from "@/lib/portal/auth";
import { db } from "@/lib/db";
import { NPSSurveyForm } from "./NPSSurveyForm";
import { CheckCircle, Star } from "lucide-react";
import { format } from "date-fns";
export default async function PortalNPSPage() {
  const user = await getPortalUser();

  if (!user) {
    return null;
  }

  // Get pending NPS surveys for this client
  const pendingSurveys = await db.nPSSurvey.findMany({
    where: {
      clientId: user.clientId,
      status: "SENT",
    },
    orderBy: { sentAt: "desc" },
  });

  // Get completed surveys (responses from this user)
  const completedResponses = await db.nPSResponse.findMany({
    where: {
      portalUserId: user.id,
    },
    include: {
      survey: true,
    },
    orderBy: { submittedAt: "desc" },
    take: 5,
  });

  // Check if user has already responded to pending surveys
  const respondedSurveyIds = completedResponses.map((r) => r.surveyId);
  const unresolvedSurveys = pendingSurveys.filter(
    (s) => !respondedSurveyIds.includes(s.id)
  );

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Feedback</h1>
        <p className="text-gray-500 mt-1">
          Help us improve by sharing your experience
        </p>
      </div>

      {/* Pending Surveys */}
      {unresolvedSurveys.length > 0 ? (
        <div className="space-y-6">
          {unresolvedSurveys.map((survey) => (
            <div
              key={survey.id}
              className="bg-white border border-gray-200 rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-[#52EDC7]/20 rounded-full flex items-center justify-center">
                  <Star className="w-5 h-5 text-[#1BA098]" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Q{survey.quarter} {survey.year} Feedback Survey
                  </h2>
                  <p className="text-sm text-gray-500">
                    We&apos;d love to hear how we&apos;re doing
                  </p>
                </div>
              </div>

              <NPSSurveyForm surveyId={survey.id} userId={user.id} />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
          <CheckCircle className="w-12 h-12 mx-auto text-green-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            All caught up!
          </h3>
          <p className="text-gray-500">
            You don&apos;t have any pending feedback surveys
          </p>
        </div>
      )}

      {/* Previous Responses */}
      {completedResponses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Your Previous Feedback
          </h2>
          <div className="space-y-3">
            {completedResponses.map((response) => (
              <div
                key={response.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    Q{response.survey.quarter} {response.survey.year}
                  </p>
                  <p className="text-sm text-gray-500">
                    Submitted{" "}
                    {format(new Date(response.submittedAt), "MMM d, yyyy")}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ScoreBadge score={response.score} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  let color = "bg-red-100 text-red-700";
  let label = "Detractor";

  if (score >= 9) {
    color = "bg-green-100 text-green-700";
    label = "Promoter";
  } else if (score >= 7) {
    color = "bg-yellow-100 text-yellow-700";
    label = "Passive";
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-2xl font-bold text-gray-900">{score}</span>
      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${color}`}>
        {label}
      </span>
    </div>
  );
}
