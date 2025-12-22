import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Plus, TrendingUp, Users, ThumbsUp, ThumbsDown } from "lucide-react";
import Link from "next/link";
import { NPSScoreCard } from "@/modules/nps/components/NPSScoreCard";
import { NPSSurveyList } from "@/modules/nps/components/NPSSurveyList";
import { getNPSStats, type NPSStatsResult } from "@/modules/nps/actions/nps-actions";

// Type for client stats
type ClientStat = NPSStatsResult["byClient"][number];

export default async function NPSPage() {
  const session = await auth();

  if (!session?.user) {
    return null;
  }

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">You don&apos;t have access to this page.</p>
      </div>
    );
  }

  const currentYear = new Date().getFullYear();
  const stats = await getNPSStats(session.user.organizationId, currentYear);
  const previousYearStats = await getNPSStats(session.user.organizationId, currentYear - 1);

  const surveys = await db.nPSSurvey.findMany({
    where: { organizationId: session.user.organizationId },
    include: {
      client: { select: { id: true, name: true, code: true } },
      sentTo: { select: { id: true, name: true, email: true } },
      responses: true,
    },
    orderBy: [{ year: "desc" }, { quarter: "desc" }],
    take: 20,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Client NPS</h1>
          <p className="text-gray-500 mt-1">
            Track client satisfaction and feedback
          </p>
        </div>
        <Link
          href="/nps/new"
          className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Survey
        </Link>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <NPSScoreCard
          score={stats.npsScore}
          previousScore={previousYearStats.total > 0 ? previousYearStats.npsScore : null}
          label="Overall NPS"
          size="lg"
        />
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Users className="w-4 h-4" />
            <span className="text-sm">Responses</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-400 mt-1">{currentYear}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-green-600 mb-1">
            <ThumbsUp className="w-4 h-4" />
            <span className="text-sm">Promoters</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.promoters}</p>
          <p className="text-xs text-gray-400 mt-1">Score 9-10</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-yellow-600 mb-1">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Passives</span>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{stats.passives}</p>
          <p className="text-xs text-gray-400 mt-1">Score 7-8</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-red-600 mb-1">
            <ThumbsDown className="w-4 h-4" />
            <span className="text-sm">Detractors</span>
          </div>
          <p className="text-2xl font-bold text-red-600">{stats.detractors}</p>
          <p className="text-xs text-gray-400 mt-1">Score 0-6</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Surveys */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Recent Surveys</h2>
            </div>
            <NPSSurveyList surveys={surveys} />
          </div>
        </div>

        {/* NPS by Client */}
        <div className="space-y-6">
          {/* Quarterly Trend */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">Quarterly Trend</h2>
            <div className="space-y-3">
              {stats.byQuarter.map((q) => (
                <div key={q.quarter} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Q{q.quarter}</span>
                  <div className="flex items-center gap-2">
                    {q.npsScore !== null ? (
                      <>
                        <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#52EDC7]"
                            style={{
                              width: `${Math.max(0, Math.min(100, (q.npsScore + 100) / 2))}%`,
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium w-8 text-right">
                          {q.npsScore > 0 ? "+" : ""}{q.npsScore}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">No data</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By Client */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-semibold text-gray-900 mb-4">By Client</h2>
            {stats.byClient.length > 0 ? (
              <div className="space-y-3">
                {stats.byClient.map((item: ClientStat) => (
                  <div key={item.client.id} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.client.code}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-sm font-medium ${
                          item.npsScore >= 50
                            ? "text-green-600"
                            : item.npsScore >= 0
                              ? "text-yellow-600"
                              : "text-red-600"
                        }`}
                      >
                        {item.npsScore > 0 ? "+" : ""}{item.npsScore}
                      </span>
                      <span className="text-xs text-gray-400">
                        ({item.responses})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No responses yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
