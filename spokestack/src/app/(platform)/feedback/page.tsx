import { getStudioUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, MessageSquare, AlertTriangle, TrendingUp, ArrowRight } from "lucide-react";
import { getNPSStats } from "@/modules/nps/actions";
import { NPSScoreCard } from "@/modules/nps/components";

export const dynamic = "force-dynamic";

export default async function FeedbackPage() {
  const user = await getStudioUser();

  // Only leadership and above can view feedback
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(user.permissionLevel)) {
    redirect("/");
  }

  const currentYear = new Date().getFullYear();
  const stats = await getNPSStats(currentYear);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Client Health</h1>
        <p className="text-muted-foreground mt-1">
          Monitor client satisfaction and feedback
        </p>
      </div>

      {/* Navigation */}
      <div className="flex gap-2 border-b pb-4">
        <Button variant="default">Overview</Button>
        <Button variant="outline" asChild>
          <Link href="/feedback/nps">
            <Star className="h-4 w-4 mr-2" />
            NPS Surveys
          </Link>
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <NPSScoreCard
          score={stats.npsScore}
          label={`Overall NPS (${currentYear})`}
          size="lg"
        />

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Responses
            </CardTitle>
            <MessageSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Promoters
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.promoters}</div>
            <p className="text-xs text-muted-foreground">Score 9-10</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Detractors
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.detractors}</div>
            <p className="text-xs text-muted-foreground">Score 0-6</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/20">
                <Star className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <CardTitle>NPS Surveys</CardTitle>
                <CardDescription>
                  Create and manage quarterly NPS surveys
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/feedback/nps">
                View Surveys
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-dashed">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                <MessageSquare className="h-6 w-6 text-gray-500" />
              </div>
              <div>
                <CardTitle className="text-muted-foreground">Coming Soon</CardTitle>
                <CardDescription>
                  Client issue tracking and resolution
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled className="w-full">
              Issues & Complaints
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* NPS by Client */}
      {stats.byClient.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>NPS by Client</CardTitle>
            <CardDescription>Client satisfaction scores for {currentYear}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.byClient.map((item) => (
                <div key={item.client.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <span className="font-medium">{item.client.name}</span>
                    <span className="text-muted-foreground ml-2">({item.client.code})</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground">
                      {item.responses} responses
                    </span>
                    <span
                      className={`font-bold ${
                        item.npsScore >= 50
                          ? "text-green-600"
                          : item.npsScore >= 0
                            ? "text-yellow-600"
                            : "text-red-600"
                      }`}
                    >
                      {item.npsScore > 0 ? "+" : ""}{item.npsScore}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
