import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { NPSResponseForm } from "@/modules/nps/components/NPSResponseForm";

interface PageProps {
  params: Promise<{ surveyId: string }>;
}

export default async function FeedbackPage({ params }: PageProps) {
  const { surveyId } = await params;

  const survey = await db.nPSSurvey.findUnique({
    where: { id: surveyId },
    include: {
      client: { select: { name: true } },
      sentTo: { select: { id: true, name: true } },
    },
  });

  if (!survey) {
    notFound();
  }

  if (survey.status === "COMPLETED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Already Submitted
          </h1>
          <p className="text-gray-600">
            Thank you! This survey has already been completed.
          </p>
        </div>
      </div>
    );
  }

  if (survey.status === "EXPIRED") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Survey Expired
          </h1>
          <p className="text-gray-600">
            This survey is no longer accepting responses.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="w-12 h-12 bg-[#52EDC7] rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-gray-900 font-bold">SS</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">
              How are we doing?
            </h1>
            <p className="text-gray-600 mt-2">
              {survey.sentTo
                ? `Hi ${survey.sentTo.name}, we'd love your feedback`
                : "We'd love your feedback"}
            </p>
          </div>

          <NPSResponseForm
            surveyId={surveyId}
            clientName="TeamLMTD"
            contactId={survey.sentTo?.id}
          />
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Powered by SpokeStack
        </p>
      </div>
    </div>
  );
}
