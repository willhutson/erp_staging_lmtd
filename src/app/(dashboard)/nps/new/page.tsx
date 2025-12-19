import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CreateSurveyForm } from "@/modules/nps/components/CreateSurveyForm";

export default async function NewSurveyPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don't have access to this page.</p>
      </div>
    );
  }

  const clients = await db.client.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
    },
    include: {
      contacts: {
        where: { isActive: true },
        orderBy: [{ isDecisionMaker: "desc" }, { name: "asc" }],
      },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/nps"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New NPS Survey</h1>
          <p className="text-gray-500 mt-1">Create a quarterly client survey</p>
        </div>
      </div>

      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <CreateSurveyForm clients={clients} />
        </div>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-medium text-blue-900 mb-2">About NPS Surveys</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Surveys are sent quarterly to track satisfaction over time</li>
            <li>• Target CEO/CFO level contacts for strategic feedback</li>
            <li>• NPS ranges from -100 (all detractors) to +100 (all promoters)</li>
            <li>• Scores: 0-6 Detractor, 7-8 Passive, 9-10 Promoter</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
