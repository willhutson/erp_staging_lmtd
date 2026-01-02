import { getStudioUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  FileText,
  BarChart2,
  Plus,
  ArrowRight,
  Send,
  Clock,
  CheckCircle,
  Users,
} from "lucide-react";
import { getSurveys, getTemplates } from "@/modules/survey/actions";

export const dynamic = "force-dynamic";

export default async function SurveysPage() {
  const user = await getStudioUser();

  // Check permissions
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(user.permissionLevel)) {
    redirect("/");
  }

  const [surveys, templates] = await Promise.all([
    getSurveys(),
    getTemplates(),
  ]);

  // Stats
  const activeSurveys = surveys.filter((s) => s.status === "ACTIVE").length;
  const totalResponses = surveys.reduce((sum, s) => sum + s.responseCount, 0);
  const publishedTemplates = templates.filter((t) => t.isPublished).length;

  // Recent surveys
  const recentSurveys = surveys.slice(0, 5);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Surveys & Forms</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage surveys, forms, and feedback collection
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/surveys/templates">
              <FileText className="h-4 w-4 mr-2" />
              Templates
            </Link>
          </Button>
          <Button asChild>
            <Link href="/surveys/new">
              <Plus className="h-4 w-4 mr-2" />
              New Survey
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Surveys
            </CardTitle>
            <Send className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeSurveys}</div>
            <p className="text-xs text-muted-foreground">Collecting responses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Responses
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResponses}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Templates
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              {publishedTemplates} published
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Draft Surveys
            </CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {surveys.filter((s) => s.status === "DRAFT").length}
            </div>
            <p className="text-xs text-muted-foreground">Ready to publish</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle>Active Surveys</CardTitle>
                <CardDescription>View and manage live surveys</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/surveys?status=ACTIVE">
                View Active
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <CardTitle>Templates</CardTitle>
                <CardDescription>Create and manage templates</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/surveys/templates">
                Browse Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                <BarChart2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle>Analytics</CardTitle>
                <CardDescription>View response analytics</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/surveys/analytics">
                View Analytics
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Surveys */}
      {recentSurveys.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Surveys</CardTitle>
              <CardDescription>Your latest surveys and responses</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/surveys/all">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSurveys.map((survey) => (
                <Link
                  key={survey.id}
                  href={`/surveys/${survey.id}`}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div>
                      <span className="font-medium">{survey.title}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-muted-foreground">
                          {survey.template.name}
                        </span>
                        {survey.targetClient && (
                          <Badge variant="outline" className="text-xs">
                            {survey.targetClient.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="font-medium">{survey.responseCount}</span>
                      <span className="text-muted-foreground text-sm"> responses</span>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        survey.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : survey.status === "DRAFT"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                      }
                    >
                      {survey.status}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {surveys.length === 0 && templates.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-1">Get started with surveys</h3>
            <p className="text-sm text-muted-foreground mb-4 text-center max-w-md">
              Create your first template or start from scratch to collect feedback from clients and team members.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/surveys/templates/new">
                  <FileText className="h-4 w-4 mr-2" />
                  Create Template
                </Link>
              </Button>
              <Button asChild>
                <Link href="/surveys/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Quick Survey
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
