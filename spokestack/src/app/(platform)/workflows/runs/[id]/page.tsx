import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  CheckSquare,
  FileQuestion,
  Bell,
  GitBranch,
  User,
} from "lucide-react";
import { getWorkflowRun } from "@/modules/workflow-builder/actions";
import { format, formatDistanceToNow } from "date-fns";

export const dynamic = "force-dynamic";

interface WorkflowRunDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; bgColor: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  PENDING: {
    icon: Clock,
    color: "text-yellow-600",
    bgColor: "bg-yellow-100 dark:bg-yellow-900/20",
    badgeVariant: "outline",
  },
  IN_PROGRESS: {
    icon: Play,
    color: "text-blue-600",
    bgColor: "bg-blue-100 dark:bg-blue-900/20",
    badgeVariant: "secondary",
  },
  COMPLETED: {
    icon: CheckCircle,
    color: "text-green-600",
    bgColor: "bg-green-100 dark:bg-green-900/20",
    badgeVariant: "default",
  },
  ESCALATED: {
    icon: AlertTriangle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    badgeVariant: "destructive",
  },
  FAILED: {
    icon: XCircle,
    color: "text-red-600",
    bgColor: "bg-red-100 dark:bg-red-900/20",
    badgeVariant: "destructive",
  },
  CANCELLED: {
    icon: XCircle,
    color: "text-gray-600",
    bgColor: "bg-gray-100 dark:bg-gray-800",
    badgeVariant: "outline",
  },
};

const STEP_TYPE_ICONS: Record<string, React.ElementType> = {
  TASK: CheckSquare,
  APPROVAL: FileQuestion,
  NOTIFICATION: Bell,
};

export default async function WorkflowRunDetailPage({ params }: WorkflowRunDetailPageProps) {
  const { id } = await params;
  const run = await getWorkflowRun(id);

  if (!run) {
    notFound();
  }

  const runConfig = STATUS_CONFIG[run.status] || STATUS_CONFIG.PENDING;
  const RunStatusIcon = runConfig.icon;

  // Calculate progress
  const totalTasks = run.tasks?.length || 0;
  const completedTasks = run.tasks?.filter((t) => t.status === "COMPLETED").length || 0;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/workflows/runs"
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold">{run.definition?.name || "Workflow Run"}</h1>
              <Badge variant={runConfig.badgeVariant}>
                <RunStatusIcon className="h-3 w-3 mr-1" />
                {run.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Started {formatDistanceToNow(new Date(run.startedAt || run.createdAt), { addSuffix: true })}
              {run.startedBy && ` by ${run.startedBy.name}`}
            </p>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercent}%</div>
            <div className="w-full h-2 bg-muted rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTasks}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {format(new Date(run.startedAt || run.createdAt), "MMM d, yyyy h:mm a")}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Tasks Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              {run.tasks && run.tasks.length > 0 ? (
                <div className="space-y-4">
                  {run.tasks.map((task, index) => {
                    const taskConfig = STATUS_CONFIG[task.status] || STATUS_CONFIG.PENDING;
                    const TaskStatusIcon = taskConfig.icon;
                    const StepIcon = STEP_TYPE_ICONS[task.step?.stepType || "TASK"] || CheckSquare;

                    return (
                      <div
                        key={task.id}
                        className="flex gap-4 relative"
                      >
                        {/* Timeline connector */}
                        {run.tasks && index < run.tasks.length - 1 && (
                          <div className="absolute left-5 top-10 w-0.5 h-full bg-muted -z-10" />
                        )}

                        {/* Status icon */}
                        <div className={`shrink-0 w-10 h-10 rounded-full ${taskConfig.bgColor} flex items-center justify-center`}>
                          <TaskStatusIcon className={`h-5 w-5 ${taskConfig.color}`} />
                        </div>

                        {/* Task content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-2">
                                <StepIcon className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-medium">{task.step?.name || "Task"}</h4>
                                <Badge variant={taskConfig.badgeVariant} className="text-xs">
                                  {task.status}
                                </Badge>
                              </div>

                              {task.assignee && (
                                <div className="flex items-center gap-2 mt-2">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={task.assignee.avatarUrl || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {task.assignee.name?.charAt(0) || "U"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-muted-foreground">
                                    {task.assignee.name}
                                  </span>
                                </div>
                              )}

                              {task.decision && (
                                <Badge
                                  variant={task.decision === "APPROVED" ? "default" : "destructive"}
                                  className="mt-2"
                                >
                                  {task.decision}
                                </Badge>
                              )}

                              {task.decisionNote && (
                                <p className="text-sm text-muted-foreground mt-2 bg-muted p-2 rounded-lg">
                                  {task.decisionNote}
                                </p>
                              )}
                            </div>

                            <div className="text-right text-xs text-muted-foreground">
                              {task.completedAt ? (
                                <div>
                                  Completed<br />
                                  {format(new Date(task.completedAt), "MMM d, h:mm a")}
                                </div>
                              ) : task.dueDate ? (
                                <div>
                                  Due<br />
                                  {format(new Date(task.dueDate), "MMM d, h:mm a")}
                                </div>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No tasks created yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Run Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Run Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Workflow</p>
                <Link
                  href={`/workflows/${run.definitionId}`}
                  className="text-sm font-medium hover:underline flex items-center gap-2"
                >
                  <GitBranch className="h-4 w-4" />
                  {run.definition?.name}
                </Link>
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Started By</p>
                {run.startedBy ? (
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={run.startedBy.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {run.startedBy.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm">{run.startedBy.name}</span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">System</span>
                )}
              </div>

              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Status</p>
                <Badge variant={runConfig.badgeVariant}>
                  <RunStatusIcon className="h-3 w-3 mr-1" />
                  {run.status}
                </Badge>
              </div>

              {run.completedAt && (
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Completed</p>
                  <p className="text-sm">{format(new Date(run.completedAt), "MMM d, yyyy h:mm a")}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Activity Log */}
          {run.history && run.history.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {run.history.slice(0, 5).map((entry) => (
                    <div key={entry.id} className="text-sm">
                      <p className="font-medium">{entry.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(entry.performedAt), { addSuffix: true })}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
