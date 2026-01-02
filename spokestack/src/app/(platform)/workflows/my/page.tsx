import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  CheckSquare,
  Clock,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  FileQuestion,
  Bell,
} from "lucide-react";
import { getMyWorkflowTasks, getWorkflowRuns } from "@/modules/workflow-builder/actions";
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

const STEP_TYPE_ICONS: Record<string, React.ElementType> = {
  TASK: CheckSquare,
  APPROVAL: FileQuestion,
  NOTIFICATION: Bell,
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
  IN_PROGRESS: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  ESCALATED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

export default async function MyWorkflowTasksPage() {
  try {
    const user = await getStudioUser();

    const tasks = await getMyWorkflowTasks();

    // Group tasks by status
    const pendingTasks = tasks.filter((t) => t.status === "PENDING");
    const inProgressTasks = tasks.filter((t) => t.status === "IN_PROGRESS");

    // Tasks due soon (within 24 hours)
    const now = new Date();
    const dayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const urgentTasks = tasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) <= dayFromNow
    );

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
            <h1 className="text-2xl font-bold">My Workflow Tasks</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Tasks awaiting your action across all workflows
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Tasks
              </CardTitle>
              <CheckSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
              <GitBranch className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inProgressTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Due Soon
              </CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{urgentTasks.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Task List */}
        {tasks.length > 0 ? (
          <div className="space-y-6">
            {/* Urgent Tasks */}
            {urgentTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 text-red-600 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Due Soon ({urgentTasks.length})
                </h2>
                <div className="grid gap-3">
                  {urgentTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}

            {/* Pending Tasks */}
            {pendingTasks.filter(t => !urgentTasks.includes(t)).length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  Pending ({pendingTasks.filter(t => !urgentTasks.includes(t)).length})
                </h2>
                <div className="grid gap-3">
                  {pendingTasks
                    .filter(t => !urgentTasks.includes(t))
                    .map((task) => (
                      <TaskCard key={task.id} task={task} />
                    ))}
                </div>
              </div>
            )}

            {/* In Progress Tasks */}
            {inProgressTasks.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <GitBranch className="h-5 w-5 text-blue-500" />
                  In Progress ({inProgressTasks.length})
                </h2>
                <div className="grid gap-3">
                  {inProgressTasks.map((task) => (
                    <TaskCard key={task.id} task={task} />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center mb-4">
                <CheckSquare className="w-8 h-8 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">All caught up!</h3>
              <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                You don&apos;t have any workflow tasks assigned to you right now.
              </p>
              <Button asChild>
                <Link href="/workflows">
                  View All Workflows
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  } catch (error) {
    console.error("My Tasks page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <PageError message={message} />;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function TaskCard({ task }: { task: any }) {
  const Icon = STEP_TYPE_ICONS[task.step?.stepType] || CheckSquare;
  const runId = task.run?.id;

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-muted">
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium truncate">{task.step?.name || "Task"}</h3>
                <Badge className={STATUS_COLORS[task.status] || STATUS_COLORS.PENDING}>
                  {task.status}
                </Badge>
              </div>
              {task.step?.stepType === "APPROVAL" && (
                <p className="text-sm text-muted-foreground mb-2">
                  Approval required
                </p>
              )}
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {task.dueDate && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    Due {formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}
                  </span>
                )}
              </div>
            </div>
          </div>
          {runId && (
            <Button asChild variant="default" size="sm">
              <Link href={`/workflows/runs/${runId}`}>
                {task.step?.stepType === "APPROVAL" ? "Review" : "Complete"}
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
