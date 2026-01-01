"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageShell } from "@/components/ltd/patterns/page-shell";
import { LtdButton } from "@/components/ltd/primitives/ltd-button";
import { LtdSelect } from "@/components/ltd/primitives/ltd-select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { WorkflowListItem } from "@/modules/workflows/actions";
import { formatDate } from "@/lib/format/date";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Pause,
  XCircle,
  ArrowRight,
  Users,
  Calendar,
} from "lucide-react";

interface WorkflowsViewProps {
  initialWorkflows: WorkflowListItem[];
}

type StatusFilter = "all" | "ACTIVE" | "PAUSED" | "COMPLETED" | "CANCELLED" | "BLOCKED";

export function WorkflowsView({ initialWorkflows }: WorkflowsViewProps) {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const filteredWorkflows = initialWorkflows.filter((wf) => {
    if (statusFilter !== "all" && wf.status !== statusFilter) return false;
    return true;
  });

  const statusCounts = {
    all: initialWorkflows.length,
    ACTIVE: initialWorkflows.filter((w) => w.status === "ACTIVE").length,
    PAUSED: initialWorkflows.filter((w) => w.status === "PAUSED").length,
    COMPLETED: initialWorkflows.filter((w) => w.status === "COMPLETED").length,
    BLOCKED: initialWorkflows.filter((w) => w.status === "BLOCKED").length,
    CANCELLED: initialWorkflows.filter((w) => w.status === "CANCELLED").length,
  };

  return (
    <PageShell
      breadcrumbs={[{ label: "Workflows" }]}
      title="Workflow Instances"
      actions={
        <LtdButton onClick={() => router.push("/admin/builder?type=WORKFLOW")}>
          Create Template
        </LtdButton>
      }
    >
      <div className="space-y-6">
        {/* Status Cards */}
        <div className="grid grid-cols-5 gap-4">
          <StatusCard
            label="Active"
            count={statusCounts.ACTIVE}
            icon={<Play className="h-4 w-4" />}
            active={statusFilter === "ACTIVE"}
            onClick={() => setStatusFilter(statusFilter === "ACTIVE" ? "all" : "ACTIVE")}
            color="success"
          />
          <StatusCard
            label="Blocked"
            count={statusCounts.BLOCKED}
            icon={<AlertTriangle className="h-4 w-4" />}
            active={statusFilter === "BLOCKED"}
            onClick={() => setStatusFilter(statusFilter === "BLOCKED" ? "all" : "BLOCKED")}
            color="error"
          />
          <StatusCard
            label="Paused"
            count={statusCounts.PAUSED}
            icon={<Pause className="h-4 w-4" />}
            active={statusFilter === "PAUSED"}
            onClick={() => setStatusFilter(statusFilter === "PAUSED" ? "all" : "PAUSED")}
            color="warning"
          />
          <StatusCard
            label="Completed"
            count={statusCounts.COMPLETED}
            icon={<CheckCircle2 className="h-4 w-4" />}
            active={statusFilter === "COMPLETED"}
            onClick={() => setStatusFilter(statusFilter === "COMPLETED" ? "all" : "COMPLETED")}
            color="info"
          />
          <StatusCard
            label="Cancelled"
            count={statusCounts.CANCELLED}
            icon={<XCircle className="h-4 w-4" />}
            active={statusFilter === "CANCELLED"}
            onClick={() => setStatusFilter(statusFilter === "CANCELLED" ? "all" : "CANCELLED")}
            color="muted"
          />
        </div>

        {/* Workflow Cards */}
        <div className="grid gap-4">
          {filteredWorkflows.length === 0 ? (
            <EmptyState />
          ) : (
            filteredWorkflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onClick={() => router.push(`/workflows/${workflow.id}`)}
              />
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}

function StatusCard({
  label,
  count,
  icon,
  active,
  onClick,
  color,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  color: "success" | "error" | "warning" | "info" | "muted";
}) {
  const colorClasses = {
    success: "bg-ltd-success/10 text-ltd-success border-ltd-success",
    error: "bg-ltd-error/10 text-ltd-error border-ltd-error",
    warning: "bg-ltd-warning/10 text-ltd-warning border-ltd-warning",
    info: "bg-ltd-info/10 text-ltd-info border-ltd-info",
    muted: "bg-ltd-surface-1 text-ltd-text-3 border-ltd-border-2",
  };

  return (
    <Card
      className={`p-4 cursor-pointer transition-all border-2 ${
        active ? colorClasses[color] : "bg-ltd-surface-overlay border-ltd-border-1 hover:border-ltd-border-2"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-xl font-bold">{count}</span>
      </div>
    </Card>
  );
}

function WorkflowCard({
  workflow,
  onClick,
}: {
  workflow: WorkflowListItem;
  onClick: () => void;
}) {
  const statusColors: Record<string, string> = {
    ACTIVE: "bg-ltd-success/10 text-ltd-success",
    PAUSED: "bg-ltd-warning/10 text-ltd-warning",
    BLOCKED: "bg-ltd-error/10 text-ltd-error",
    COMPLETED: "bg-ltd-info/10 text-ltd-info",
    CANCELLED: "bg-ltd-text-3/10 text-ltd-text-3",
  };

  const entityName =
    workflow.triggerData?.name ||
    workflow.triggerData?.clientName ||
    workflow.triggerEntityId;

  return (
    <Card
      className="p-6 bg-ltd-surface-overlay border-ltd-border-1 rounded-[var(--ltd-radius-lg)] hover:border-ltd-border-2 transition-colors cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-lg font-semibold text-ltd-text-1">
              {workflow.templateName}
            </h3>
            <Badge className={statusColors[workflow.status]}>
              {workflow.status.toLowerCase()}
            </Badge>
          </div>
          <p className="text-sm text-ltd-text-2">
            {workflow.triggerEntityType}: {entityName}
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-ltd-primary">
            {workflow.progress}%
          </div>
          <div className="text-xs text-ltd-text-3">complete</div>
        </div>
      </div>

      {/* Task Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-ltd-text-2">
            Tasks: {workflow.taskCounts.completed}/{workflow.taskCounts.total}
          </span>
          <div className="flex items-center gap-3">
            {workflow.taskCounts.overdue > 0 && (
              <span className="flex items-center gap-1 text-ltd-error">
                <AlertTriangle className="h-3 w-3" />
                {workflow.taskCounts.overdue} overdue
              </span>
            )}
            {workflow.taskCounts.blocked > 0 && (
              <span className="flex items-center gap-1 text-ltd-warning">
                <Pause className="h-3 w-3" />
                {workflow.taskCounts.blocked} blocked
              </span>
            )}
          </div>
        </div>
        <div className="h-2 bg-ltd-surface-1 rounded-full overflow-hidden">
          <div
            className="h-full bg-ltd-primary transition-all"
            style={{ width: `${workflow.progress}%` }}
          />
        </div>
      </div>

      {/* Next Task */}
      {workflow.nextTask && (
        <div className="mb-4 p-3 bg-ltd-surface-1 rounded-[var(--ltd-radius-md)]">
          <div className="flex items-center gap-2 text-xs text-ltd-text-3 mb-1">
            <ArrowRight className="h-3 w-3" />
            Next Task
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-ltd-text-1">
                {workflow.nextTask.name}
              </p>
              <p className="text-xs text-ltd-text-2">
                {workflow.nextTask.assignee?.name || "Unassigned"}
              </p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1 text-xs text-ltd-text-2">
                <Calendar className="h-3 w-3" />
                {formatDate(workflow.nextTask.dueDate, "short")}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={workflow.owner.avatarUrl || undefined} />
              <AvatarFallback className="text-xs">
                {workflow.owner.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-ltd-text-2">{workflow.owner.name}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 text-ltd-text-3">
          <Clock className="h-3 w-3" />
          Started {formatDate(workflow.startedAt, "relative")}
          {workflow.deadline && (
            <>
              <span>•</span>
              Due {formatDate(workflow.deadline, "short")}
            </>
          )}
        </div>
      </div>
    </Card>
  );
}

function EmptyState() {
  return (
    <Card className="p-12 bg-ltd-surface-overlay border-ltd-border-1 text-center">
      <div className="flex flex-col items-center gap-4">
        <div className="p-4 bg-ltd-surface-1 rounded-full">
          <Users className="h-8 w-8 text-ltd-text-3" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-1">
            No workflow instances yet
          </h3>
          <p className="text-sm text-ltd-text-2 max-w-sm mx-auto">
            Workflows are automatically created when triggers fire (e.g., RFP created,
            Brief submitted). Create a workflow template to get started.
          </p>
        </div>
        <LtdButton onClick={() => (window.location.href = "/admin/builder?type=WORKFLOW")}>
          Create Workflow Template
        </LtdButton>
      </div>
    </Card>
  );
}
