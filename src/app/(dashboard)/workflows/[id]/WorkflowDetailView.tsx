"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/ltd/patterns/page-shell";
import { LtdButton } from "@/components/ltd/primitives/ltd-button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { WorkflowDetail } from "@/modules/workflows/actions";
import { formatDate } from "@/lib/format/date";
import {
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Pause,
  ArrowRight,
  Calendar,
  User,
  FileText,
  Activity,
} from "lucide-react";

interface WorkflowDetailViewProps {
  workflow: WorkflowDetail;
}

export function WorkflowDetailView({ workflow }: WorkflowDetailViewProps) {
  const router = useRouter();

  const entityName =
    (workflow.triggerData?.name as string) ||
    (workflow.triggerData?.clientName as string) ||
    workflow.triggerEntityId;

  const completedTasks = workflow.tasks.filter((t) => t.status === "COMPLETED").length;
  const blockedTasks = workflow.tasks.filter((t) => t.status === "BLOCKED");
  const overdueTasks = workflow.tasks.filter(
    (t) => t.status !== "COMPLETED" && new Date(t.dueDate) < new Date()
  );

  const statusColors: Record<string, string> = {
    ACTIVE: "bg-ltd-success/10 text-ltd-success",
    PAUSED: "bg-ltd-warning/10 text-ltd-warning",
    BLOCKED: "bg-ltd-error/10 text-ltd-error",
    COMPLETED: "bg-ltd-info/10 text-ltd-info",
    CANCELLED: "bg-ltd-text-3/10 text-ltd-text-3",
  };

  return (
    <PageShell
      breadcrumbs={[
        { label: "Workflows", href: "/workflows" },
        { label: workflow.templateName },
      ]}
      title={`${workflow.templateName}`}
      actions={
        <div className="flex gap-2">
          {workflow.status === "ACTIVE" && (
            <LtdButton variant="outline">Pause Workflow</LtdButton>
          )}
          {workflow.status === "PAUSED" && (
            <LtdButton variant="outline">Resume Workflow</LtdButton>
          )}
          {workflow.status === "ACTIVE" && (
            <LtdButton variant="destructive">Cancel</LtdButton>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Status</p>
            <Badge className={statusColors[workflow.status]}>
              {workflow.status.toLowerCase()}
            </Badge>
          </Card>
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-ltd-primary">
                {workflow.progress}%
              </span>
              <span className="text-xs text-ltd-text-2">
                ({completedTasks}/{workflow.tasks.length})
              </span>
            </div>
          </Card>
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Entity</p>
            <p className="text-sm font-medium text-ltd-text-1">
              {workflow.triggerEntityType}
            </p>
            <p className="text-xs text-ltd-text-2 truncate">{entityName}</p>
          </Card>
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Started</p>
            <p className="text-sm font-medium text-ltd-text-1">
              {formatDate(workflow.startedAt, "short")}
            </p>
          </Card>
          <Card className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
            <p className="text-xs text-ltd-text-3 mb-1">Deadline</p>
            <p className="text-sm font-medium text-ltd-text-1">
              {workflow.deadline
                ? formatDate(workflow.deadline, "short")
                : "Not set"}
            </p>
          </Card>
        </div>

        {/* Alerts */}
        {blockedTasks.length > 0 && (
          <Card className="p-4 bg-ltd-error-bg border-2 border-ltd-error rounded-[var(--ltd-radius-lg)]">
            <h3 className="text-sm font-semibold text-ltd-text-1 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-ltd-error" />
              Blocked Tasks ({blockedTasks.length})
            </h3>
            <ul className="space-y-1">
              {blockedTasks.map((task) => (
                <li key={task.id} className="text-sm text-ltd-text-1">
                  <span className="font-medium">{task.name}</span>
                  {task.blockedReason && (
                    <span className="text-ltd-text-2">
                      : {task.blockedReason}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {overdueTasks.length > 0 && (
          <Card className="p-4 bg-ltd-warning-bg border-2 border-ltd-warning rounded-[var(--ltd-radius-lg)]">
            <h3 className="text-sm font-semibold text-ltd-text-1 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4 text-ltd-warning" />
              Overdue Tasks ({overdueTasks.length})
            </h3>
            <ul className="space-y-1">
              {overdueTasks.map((task) => (
                <li key={task.id} className="text-sm text-ltd-text-1">
                  <span className="font-medium">{task.name}</span>
                  <span className="text-ltd-text-2">
                    {" "}
                    - Due {formatDate(task.dueDate, "short")}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Tabs */}
        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-ltd-surface-1">
            <TabsTrigger value="tasks">
              <FileText className="h-4 w-4 mr-2" />
              Tasks ({workflow.tasks.length})
            </TabsTrigger>
            <TabsTrigger value="owner">
              <User className="h-4 w-4 mr-2" />
              Owner & Team
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="h-4 w-4 mr-2" />
              Activity Log
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tasks" className="mt-4">
            <div className="space-y-3">
              {workflow.tasks.map((task, index) => (
                <TaskCard key={task.id} task={task} index={index} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="owner" className="mt-4">
            <Card className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]">
              <h3 className="text-lg font-semibold text-ltd-text-1 mb-4">
                Workflow Owner
              </h3>
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={workflow.owner.avatarUrl || undefined} />
                  <AvatarFallback>
                    {workflow.owner.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-ltd-text-1">
                    {workflow.owner.name}
                  </p>
                  <p className="text-sm text-ltd-text-2">{workflow.owner.role}</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-ltd-text-1 mt-6 mb-4">
                Task Assignees
              </h3>
              <div className="space-y-3">
                {Array.from(
                  new Map(
                    workflow.tasks
                      .filter((t) => t.assignee)
                      .map((t) => [t.assignee!.id, t.assignee!])
                  ).values()
                ).map((assignee) => (
                  <div key={assignee.id} className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={assignee.avatarUrl || undefined} />
                      <AvatarFallback className="text-xs">
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium text-ltd-text-1">
                        {assignee.name}
                      </p>
                      <p className="text-xs text-ltd-text-2">
                        {
                          workflow.tasks.filter(
                            (t) => t.assignee?.id === assignee.id
                          ).length
                        }{" "}
                        tasks
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <div className="space-y-4">
              {workflow.activityLog.map((activity) => (
                <Card
                  key={activity.id}
                  className="p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-ltd-surface-1 rounded-full">
                        <Activity className="h-4 w-4 text-ltd-text-2" />
                      </div>
                      <div>
                        <p className="text-sm text-ltd-text-1">
                          <span className="font-medium">
                            {activity.actor?.name || "System"}
                          </span>{" "}
                          - {formatActivityType(activity.activityType)}
                        </p>
                        {activity.description && (
                          <p className="text-sm text-ltd-text-2 mt-1">
                            {activity.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-ltd-text-3">
                      {formatDate(activity.createdAt, "relative")}
                    </span>
                  </div>
                </Card>
              ))}
              {workflow.activityLog.length === 0 && (
                <Card className="p-8 bg-ltd-surface-overlay border-ltd-border-1 text-center">
                  <p className="text-ltd-text-2">No activity recorded yet</p>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageShell>
  );
}

function TaskCard({
  task,
  index,
}: {
  task: WorkflowDetail["tasks"][0];
  index: number;
}) {
  const statusIcons: Record<string, React.ReactNode> = {
    PENDING: <Circle className="h-5 w-5 text-ltd-text-3" />,
    IN_PROGRESS: <Clock className="h-5 w-5 text-ltd-info animate-pulse" />,
    COMPLETED: <CheckCircle2 className="h-5 w-5 text-ltd-success" />,
    BLOCKED: <Pause className="h-5 w-5 text-ltd-error" />,
    SKIPPED: <ArrowRight className="h-5 w-5 text-ltd-text-3" />,
  };

  const isOverdue =
    task.status !== "COMPLETED" && new Date(task.dueDate) < new Date();

  return (
    <Card
      className={`p-4 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)] ${
        task.status === "BLOCKED" ? "border-ltd-error" : ""
      } ${isOverdue ? "border-ltd-warning" : ""}`}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 pt-0.5">
          {statusIcons[task.status] || <Circle className="h-5 w-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-ltd-text-3 font-mono">
              #{index + 1}
            </span>
            <h4 className="text-sm font-medium text-ltd-text-1 truncate">
              {task.name}
            </h4>
            <Badge
              variant="outline"
              className={`text-xs ${
                task.status === "COMPLETED"
                  ? "border-ltd-success text-ltd-success"
                  : task.status === "IN_PROGRESS"
                    ? "border-ltd-info text-ltd-info"
                    : task.status === "BLOCKED"
                      ? "border-ltd-error text-ltd-error"
                      : "border-ltd-text-3 text-ltd-text-3"
              }`}
            >
              {task.status.toLowerCase().replace("_", " ")}
            </Badge>
          </div>

          {task.description && (
            <p className="text-xs text-ltd-text-2 mb-2">{task.description}</p>
          )}

          <div className="flex items-center gap-4 text-xs text-ltd-text-2">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {task.assignee?.name || task.assigneeRole}
            </div>
            <div
              className={`flex items-center gap-1 ${isOverdue ? "text-ltd-warning font-medium" : ""}`}
            >
              <Calendar className="h-3 w-3" />
              {formatDate(task.dueDate, "short")}
              {isOverdue && " (overdue)"}
            </div>
            {task.completedAt && (
              <div className="flex items-center gap-1 text-ltd-success">
                <CheckCircle2 className="h-3 w-3" />
                Completed {formatDate(task.completedAt, "relative")}
              </div>
            )}
          </div>

          {task.blockedReason && (
            <div className="mt-2 p-2 bg-ltd-error/10 rounded text-xs text-ltd-error">
              Blocked: {task.blockedReason}
            </div>
          )}

          {task.dependsOnIds.length > 0 && (
            <div className="mt-2 text-xs text-ltd-text-3">
              Depends on: {task.dependsOnIds.length} task
              {task.dependsOnIds.length > 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

function formatActivityType(type: string): string {
  const map: Record<string, string> = {
    WORKFLOW_STARTED: "started the workflow",
    WORKFLOW_COMPLETED: "completed the workflow",
    WORKFLOW_CANCELLED: "cancelled the workflow",
    WORKFLOW_PAUSED: "paused the workflow",
    WORKFLOW_RESUMED: "resumed the workflow",
    TASK_STARTED: "started a task",
    TASK_COMPLETED: "completed a task",
    TASK_BLOCKED: "blocked a task",
    TASK_REASSIGNED: "reassigned a task",
    TASK_DUE_DATE_CHANGED: "changed a task due date",
    NUDGE_SENT: "sent a reminder",
    NUDGE_ACKNOWLEDGED: "acknowledged a reminder",
    COMMENT_ADDED: "added a comment",
    DEADLINE_CHANGED: "changed the deadline",
  };
  return map[type] || type.toLowerCase().replace(/_/g, " ");
}
