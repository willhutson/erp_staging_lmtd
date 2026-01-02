import { getStudioUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Star } from "lucide-react";
import { getNPSStats, getNPSSurveys } from "@/modules/nps/actions";
import { NPSScoreCard, NPSSurveyList, CreateSurveyDialog } from "@/modules/nps/components";

export const dynamic = "force-dynamic";

export default async function NPSSurveysPage() {
  const user = await getStudioUser();

  // Only leadership and above can view NPS
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(user.permissionLevel)) {
    redirect("/feedback");
  }

  const currentYear = new Date().getFullYear();
  const [stats, previousYearStats, surveys, clients] = await Promise.all([
    getNPSStats(currentYear),
    getNPSStats(currentYear - 1),
    getNPSSurveys(),
    prisma.client.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/feedback"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">NPS Surveys</h1>
            <p className="text-muted-foreground mt-1">
              Track client satisfaction with Net Promoter Score
            </p>
          </div>
        </div>
        <CreateSurveyDialog clients={clients} />
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b pb-4">
        <Button variant="outline" asChild>
          <Link href="/feedback">Overview</Link>
        </Button>
        <Button variant="default">
          <Star className="h-4 w-4 mr-2" />
          NPS Surveys
        </Button>
      </div>

      {/* Score Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <NPSScoreCard
          score={stats.npsScore}
          previousScore={previousYearStats.total > 0 ? previousYearStats.npsScore : null}
          label="Overall NPS"
          size="lg"
        />

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Responses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">{currentYear}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600">
              Promoters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.promoters}</div>
            <p className="text-xs text-muted-foreground">Score 9-10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600">
              Passives
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.passives}</div>
            <p className="text-xs text-muted-foreground">Score 7-8</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Detractors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.detractors}</div>
            <p className="text-xs text-muted-foreground">Score 0-6</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Surveys */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Surveys</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <NPSSurveyList surveys={surveys} />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Stats */}
        <div className="space-y-6">
          {/* Quarterly Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quarterly Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.byQuarter.map((q) => (
                  <div key={q.quarter} className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Q{q.quarter}</span>
                    <div className="flex items-center gap-2">
                      {q.npsScore !== null ? (
                        <>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${Math.max(0, Math.min(100, (q.npsScore + 100) / 2))}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium w-10 text-right">
                            {q.npsScore > 0 ? "+" : ""}{q.npsScore}
                          </span>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">No data</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Client */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">By Client</CardTitle>
            </CardHeader>
            <CardContent>
              {stats.byClient.length > 0 ? (
                <div className="space-y-3">
                  {stats.byClient.map((item) => (
                    <div key={item.client.id} className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground truncate">
                        {item.client.code}
                      </span>
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
                        <span className="text-xs text-muted-foreground">
                          ({item.responses})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No responses yet</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
