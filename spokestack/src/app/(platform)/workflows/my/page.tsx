import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FolderKanban,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

function PageError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-amber-100 dark:bg-amber-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-amber-600 dark:text-amber-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Unable to Load</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
      </div>
    </div>
  );
}

export default async function MyWorkflowsPage() {
  try {
    const user = await getStudioUser();

    // Try to fetch user's workflows - gracefully handle if table doesn't exist
    let myWorkflows: Array<{
      id: string;
      name: string;
      status: string;
      dueDate: Date | null;
      priority: string;
    }> = [];

    try {
      // In a real implementation, this would fetch from a WorkflowInstance table
      // For now, we show an empty state
      const templates = await db.builderTemplate.findMany({
        where: {
          organizationId: user.organizationId,
          templateType: "WORKFLOW",
          createdById: user.id,
        },
        take: 20,
        orderBy: { updatedAt: "desc" },
      });

      myWorkflows = templates.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        dueDate: null,
        priority: "NORMAL",
      }));
    } catch {
      // Table doesn't exist yet
      myWorkflows = [];
    }

    const inProgress = myWorkflows.filter((w) => w.status === "PUBLISHED" || w.status === "APPROVED");
    const pending = myWorkflows.filter((w) => w.status === "PENDING_APPROVAL");
    const completed = myWorkflows.filter((w) => w.status === "ARCHIVED");

    return (
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            href="/workflows"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">My Workflows</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Track and manage workflows assigned to you
            </p>
          </div>
        </div>

        {/* Status Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgress.length}</div>
              <p className="text-xs text-muted-foreground">Active tasks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Review
              </CardTitle>
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pending.length}</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completed.length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Workflows List */}
        {myWorkflows.length > 0 ? (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Active Workflows</h2>
            <div className="grid gap-4">
              {myWorkflows.map((workflow) => (
                <Card key={workflow.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <Badge
                        variant={
                          workflow.status === "PUBLISHED"
                            ? "default"
                            : workflow.status === "PENDING_APPROVAL"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {workflow.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-4 text-sm">
                      {workflow.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Due {new Date(workflow.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center mb-4">
                <FolderKanban className="w-8 h-8 text-blue-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No workflows assigned</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                When workflows are assigned to you, they&apos;ll appear here.
                Check the templates to create a new workflow.
              </p>
              <Button asChild>
                <Link href="/workflows/templates">
                  Browse Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("My workflows page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <PageError message={message} />;
  }
}
