import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  GitBranch,
} from "lucide-react";
import { getWorkflowRuns } from "@/modules/workflow-builder/actions";
import { formatDistanceToNow } from "date-fns";

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

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  PENDING: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
  },
  IN_PROGRESS: {
    icon: Play,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
  },
  COMPLETED: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
  },
  FAILED: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-900/20",
  },
};

export default async function WorkflowRunsPage() {
  try {
    const user = await getStudioUser();
    const runs = await getWorkflowRuns();

    // Group runs by status
    const activeRuns = runs.filter((r) => r.status === "IN_PROGRESS");
    const completedRuns = runs.filter((r) => r.status === "COMPLETED");
    const failedRuns = runs.filter((r) => ["FAILED", "CANCELLED"].includes(r.status));

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
            <h1 className="text-2xl font-bold">Workflow Runs</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Monitor active and completed workflow executions
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Runs
              </CardTitle>
              <GitBranch className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{runs.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active
              </CardTitle>
              <Play className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{activeRuns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{completedRuns.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Failed
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{failedRuns.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Runs List */}
        {runs.length > 0 ? (
          <div className="space-y-6">
            {/* Active Runs */}
            {activeRuns.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Play className="h-5 w-5 text-blue-500" />
                  Active ({activeRuns.length})
                </h2>
                <div className="grid gap-3">
                  {activeRuns.map((run) => (
                    <RunCard key={run.id} run={run} />
                  ))}
                </div>
              </div>
            )}

            {/* Completed Runs */}
            {completedRuns.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Completed ({completedRuns.length})
                </h2>
                <div className="grid gap-3">
                  {completedRuns.slice(0, 10).map((run) => (
                    <RunCard key={run.id} run={run} />
                  ))}
                </div>
              </div>
            )}

            {/* Failed Runs */}
            {failedRuns.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2 text-red-600">
                  <XCircle className="h-5 w-5" />
                  Failed ({failedRuns.length})
                </h2>
                <div className="grid gap-3">
                  {failedRuns.map((run) => (
                    <RunCard key={run.id} run={run} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <GitBranch className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No workflow runs yet</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                Workflow runs will appear here when you start executing workflows.
              </p>
              <Button asChild>
                <Link href="/workflows">
                  View Workflows
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("Workflow runs page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <PageError message={message} />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function RunCard({ run }: { run: any }) {
  const config = STATUS_CONFIG[run.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = config.icon;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-lg ${config.bgColor}`}>
              <StatusIcon className={`h-4 w-4 ${config.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">
                  {run.definition?.name || "Workflow Run"}
                </h3>
                <Badge
                  variant={run.status === "COMPLETED" ? "default" : run.status === "IN_PROGRESS" ? "secondary" : "destructive"}
                >
                  {run.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  Started {formatDistanceToNow(new Date(run.startedAt || run.createdAt), { addSuffix: true })}
                </span>
                {run.startedBy && (
                  <span>by {run.startedBy.name}</span>
                )}
                {run._count?.tasks > 0 && (
                  <span>{run._count.tasks} tasks</span>
                )}
              </div>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link href={`/workflows/runs/${run.id}`}>
              View
              <ArrowRight className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
