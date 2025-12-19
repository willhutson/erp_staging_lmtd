"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle,
  Circle,
  Clock,
  SkipForward,
  ChevronDown,
  ChevronRight,
  FileText,
  Key,
  Palette,
  MessageSquare,
  CreditCard,
  Rocket,
} from "lucide-react";
import type {
  ClientOnboarding,
  ClientOnboardingTask,
  OnboardingCategory,
  TaskStatus,
} from "@prisma/client";
import {
  updateOnboardingTaskStatus,
  initializeClientOnboarding,
} from "../actions/onboarding-actions";
import { cn } from "@/lib/utils";

type OnboardingWithTasks = ClientOnboarding & {
  tasks: ClientOnboardingTask[];
};

interface ClientOnboardingChecklistProps {
  clientId: string;
  onboarding: OnboardingWithTasks | null;
}

const categoryConfig: Record<
  OnboardingCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  CONTRACTS: {
    label: "Contracts",
    icon: <FileText className="w-4 h-4" />,
    color: "text-blue-600",
  },
  ACCESS: {
    label: "Access & Tools",
    icon: <Key className="w-4 h-4" />,
    color: "text-purple-600",
  },
  BRANDING: {
    label: "Branding",
    icon: <Palette className="w-4 h-4" />,
    color: "text-pink-600",
  },
  COMMUNICATIONS: {
    label: "Communications",
    icon: <MessageSquare className="w-4 h-4" />,
    color: "text-green-600",
  },
  BILLING: {
    label: "Billing",
    icon: <CreditCard className="w-4 h-4" />,
    color: "text-orange-600",
  },
  KICKOFF: {
    label: "Kickoff",
    icon: <Rocket className="w-4 h-4" />,
    color: "text-teal-600",
  },
};

const statusConfig: Record<
  TaskStatus,
  { icon: React.ReactNode; color: string }
> = {
  PENDING: {
    icon: <Circle className="w-5 h-5" />,
    color: "text-gray-400",
  },
  IN_PROGRESS: {
    icon: <Clock className="w-5 h-5" />,
    color: "text-blue-500",
  },
  COMPLETED: {
    icon: <CheckCircle className="w-5 h-5" />,
    color: "text-green-500",
  },
  SKIPPED: {
    icon: <SkipForward className="w-5 h-5" />,
    color: "text-gray-400",
  },
};

export function ClientOnboardingChecklist({
  clientId,
  onboarding,
}: ClientOnboardingChecklistProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(["CONTRACTS", "KICKOFF"])
  );

  const handleInitialize = () => {
    startTransition(async () => {
      await initializeClientOnboarding(clientId);
      router.refresh();
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    startTransition(async () => {
      await updateOnboardingTaskStatus(taskId, newStatus);
      router.refresh();
    });
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  if (!onboarding) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="text-center">
          <Rocket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Client Onboarding
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            Start the onboarding process to track setup tasks for this client.
          </p>
          <button
            onClick={handleInitialize}
            disabled={isPending}
            className="px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
          >
            {isPending ? "Starting..." : "Start Onboarding"}
          </button>
        </div>
      </div>
    );
  }

  // Group tasks by category
  const tasksByCategory = onboarding.tasks.reduce(
    (acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = [];
      }
      acc[task.category].push(task);
      return acc;
    },
    {} as Record<OnboardingCategory, ClientOnboardingTask[]>
  );

  const completedTasks = onboarding.tasks.filter(
    (t) => t.status === "COMPLETED" || t.status === "SKIPPED"
  );
  const progress = Math.round(
    (completedTasks.length / onboarding.tasks.length) * 100
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-900">Onboarding Progress</h2>
          <span
            className={cn(
              "px-2 py-1 text-xs font-medium rounded-full",
              onboarding.status === "COMPLETED"
                ? "bg-green-100 text-green-700"
                : onboarding.status === "IN_PROGRESS"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
            )}
          >
            {onboarding.status.replace(/_/g, " ")}
          </span>
        </div>

        <div className="relative">
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#52EDC7] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {completedTasks.length} of {onboarding.tasks.length} tasks complete
          </p>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {(Object.keys(categoryConfig) as OnboardingCategory[]).map(
          (category) => {
            const tasks = tasksByCategory[category] || [];
            if (tasks.length === 0) return null;

            const config = categoryConfig[category];
            const isExpanded = expandedCategories.has(category);
            const categoryComplete = tasks.every(
              (t) => t.status === "COMPLETED" || t.status === "SKIPPED"
            );

            return (
              <div key={category}>
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={config.color}>{config.icon}</span>
                    <span className="font-medium text-gray-900">
                      {config.label}
                    </span>
                    <span className="text-xs text-gray-400">
                      {tasks.filter((t) => t.status === "COMPLETED").length}/
                      {tasks.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {categoryComplete && (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    )}
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                </button>

                {isExpanded && (
                  <div className="px-4 pb-4 space-y-2">
                    {tasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onStatusChange={handleStatusChange}
                        isPending={isPending}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

function TaskItem({
  task,
  onStatusChange,
  isPending,
}: {
  task: ClientOnboardingTask;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  isPending: boolean;
}) {
  const config = statusConfig[task.status];

  const handleClick = () => {
    if (isPending) return;

    // Cycle through statuses: PENDING -> IN_PROGRESS -> COMPLETED
    const nextStatus: TaskStatus =
      task.status === "PENDING"
        ? "IN_PROGRESS"
        : task.status === "IN_PROGRESS"
          ? "COMPLETED"
          : task.status === "COMPLETED"
            ? "PENDING"
            : "PENDING";

    onStatusChange(task.id, nextStatus);
  };

  const handleSkip = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPending) return;
    onStatusChange(task.id, task.status === "SKIPPED" ? "PENDING" : "SKIPPED");
  };

  return (
    <div
      className={cn(
        "flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer group",
        task.status === "SKIPPED" && "opacity-50"
      )}
      onClick={handleClick}
    >
      <span className={config.color}>{config.icon}</span>
      <span
        className={cn(
          "flex-1 text-sm",
          task.status === "COMPLETED" || task.status === "SKIPPED"
            ? "text-gray-500 line-through"
            : "text-gray-900"
        )}
      >
        {task.title}
        {task.isRequired && (
          <span className="text-red-500 ml-1">*</span>
        )}
      </span>
      {!task.isRequired && (
        <button
          onClick={handleSkip}
          className="opacity-0 group-hover:opacity-100 text-xs text-gray-400 hover:text-gray-600 transition-opacity"
        >
          {task.status === "SKIPPED" ? "Undo" : "Skip"}
        </button>
      )}
    </div>
  );
}
