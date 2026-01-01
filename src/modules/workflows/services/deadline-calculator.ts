import type { TaskTemplate, CalculatedTaskDates } from "../types";

/**
 * Calculate due dates for all tasks in a workflow based on the final deadline
 * Uses reverse-engineering from deadline (Gantt-style cascading)
 */
export function calculateTaskDates(
  taskTemplates: TaskTemplate[],
  deadline: Date | null
): Map<string, CalculatedTaskDates> {
  const results = new Map<string, CalculatedTaskDates>();

  // If no deadline, use 30 days from now as default
  const finalDeadline = deadline || addTime(new Date(), 30, "days");

  // Build dependency graph
  const dependencyGraph = buildDependencyGraph(taskTemplates);

  // Topological sort to process tasks in dependency order (reverse for deadline-based)
  const sortedTasks = topologicalSort(taskTemplates, dependencyGraph);

  // Process tasks in reverse order (from deadline backwards)
  const reversedTasks = [...sortedTasks].reverse();

  // First pass: calculate dates based on deadline offsets
  for (const task of reversedTasks) {
    let dueDate: Date;

    if (task.dueOffset.from === "deadline") {
      dueDate = subtractTime(finalDeadline, task.dueOffset.value, task.dueOffset.unit);
    } else if (task.dueOffset.from === "workflow_start") {
      dueDate = addTime(new Date(), task.dueOffset.value, task.dueOffset.unit);
    } else if (task.dueOffset.from === "previous_task") {
      // Find the task this depends on (first dependency)
      const depTaskId = task.dependsOn[0];
      const depResult = results.get(depTaskId);
      if (depResult) {
        dueDate = addTime(depResult.dueDate, task.dueOffset.value, task.dueOffset.unit);
      } else {
        // Fallback to deadline-based if dependency not found
        dueDate = subtractTime(finalDeadline, task.dueOffset.value, task.dueOffset.unit);
      }
    } else {
      dueDate = subtractTime(finalDeadline, task.dueOffset.value, task.dueOffset.unit);
    }

    // Ensure due date is not in the past
    if (dueDate < new Date()) {
      dueDate = addTime(new Date(), 1, "days");
    }

    // Check if task can start (no pending dependencies)
    const canStart = task.dependsOn.length === 0;

    results.set(task.id, {
      taskId: task.id,
      dueDate,
      canStart,
    });
  }

  // Second pass: adjust dates to respect dependencies
  // A task cannot be due before its dependencies
  for (const task of sortedTasks) {
    const result = results.get(task.id);
    if (!result) continue;

    for (const depId of task.dependsOn) {
      const depResult = results.get(depId);
      if (depResult && result.dueDate <= depResult.dueDate) {
        // Push this task's due date to after its dependency
        result.dueDate = addTime(depResult.dueDate, 1, "days");
      }
    }
  }

  return results;
}

/**
 * Recalculate dates when a task is delayed
 */
export function recalculateDatesForDelay(
  taskTemplates: TaskTemplate[],
  currentDates: Map<string, CalculatedTaskDates>,
  delayedTaskId: string,
  newDueDate: Date
): Map<string, CalculatedTaskDates> {
  const results = new Map(currentDates);

  // Update the delayed task
  const delayedResult = results.get(delayedTaskId);
  if (delayedResult) {
    delayedResult.dueDate = newDueDate;
  }

  // Find all tasks that depend on this one (directly or indirectly)
  const affectedTasks = findDependentTasks(taskTemplates, delayedTaskId);

  // Recalculate dates for affected tasks
  for (const task of affectedTasks) {
    const result = results.get(task.id);
    if (!result) continue;

    // Find the latest dependency due date
    let latestDepDate = new Date(0);
    for (const depId of task.dependsOn) {
      const depResult = results.get(depId);
      if (depResult && depResult.dueDate > latestDepDate) {
        latestDepDate = depResult.dueDate;
      }
    }

    // If current due date is before latest dependency, push it
    if (result.dueDate <= latestDepDate) {
      result.dueDate = addTime(latestDepDate, 1, "days");
    }
  }

  return results;
}

/**
 * Calculate the critical path (longest chain of dependencies)
 */
export function calculateCriticalPath(
  taskTemplates: TaskTemplate[],
  dates: Map<string, CalculatedTaskDates>
): string[] {
  // Find tasks with no dependents (end tasks)
  const allDependencies = new Set(taskTemplates.flatMap((t) => t.dependsOn));
  const endTasks = taskTemplates.filter((t) => !allDependencies.has(t.id));

  let longestPath: string[] = [];
  let longestDuration = 0;

  // DFS from each end task to find longest path
  for (const endTask of endTasks) {
    const { path, duration } = findLongestPath(taskTemplates, dates, endTask.id, new Set());
    if (duration > longestDuration) {
      longestDuration = duration;
      longestPath = path;
    }
  }

  return longestPath;
}

/**
 * Find longest path from a task to its root dependencies
 */
function findLongestPath(
  tasks: TaskTemplate[],
  dates: Map<string, CalculatedTaskDates>,
  taskId: string,
  visited: Set<string>
): { path: string[]; duration: number } {
  if (visited.has(taskId)) {
    return { path: [], duration: 0 };
  }

  visited.add(taskId);

  const task = tasks.find((t) => t.id === taskId);
  if (!task) {
    return { path: [], duration: 0 };
  }

  const taskDates = dates.get(taskId);
  const taskDuration = task.estimatedHours || 8; // Default 8 hours

  if (task.dependsOn.length === 0) {
    return { path: [taskId], duration: taskDuration };
  }

  let bestSubPath: string[] = [];
  let bestDuration = 0;

  for (const depId of task.dependsOn) {
    const { path, duration } = findLongestPath(tasks, dates, depId, new Set(visited));
    if (duration > bestDuration) {
      bestDuration = duration;
      bestSubPath = path;
    }
  }

  return {
    path: [...bestSubPath, taskId],
    duration: bestDuration + taskDuration,
  };
}

/**
 * Find all tasks that depend on a given task
 */
function findDependentTasks(tasks: TaskTemplate[], taskId: string): TaskTemplate[] {
  const result: TaskTemplate[] = [];
  const visited = new Set<string>();

  function findDependents(id: string) {
    for (const task of tasks) {
      if (task.dependsOn.includes(id) && !visited.has(task.id)) {
        visited.add(task.id);
        result.push(task);
        findDependents(task.id);
      }
    }
  }

  findDependents(taskId);
  return result;
}

/**
 * Build a dependency graph
 */
function buildDependencyGraph(tasks: TaskTemplate[]): Map<string, string[]> {
  const graph = new Map<string, string[]>();

  for (const task of tasks) {
    graph.set(task.id, task.dependsOn);
  }

  return graph;
}

/**
 * Topological sort of tasks based on dependencies
 */
function topologicalSort(
  tasks: TaskTemplate[],
  graph: Map<string, string[]>
): TaskTemplate[] {
  const visited = new Set<string>();
  const result: TaskTemplate[] = [];

  function visit(taskId: string) {
    if (visited.has(taskId)) return;
    visited.add(taskId);

    const deps = graph.get(taskId) || [];
    for (const depId of deps) {
      visit(depId);
    }

    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      result.push(task);
    }
  }

  for (const task of tasks) {
    visit(task.id);
  }

  return result;
}

/**
 * Add time to a date
 */
function addTime(date: Date, value: number, unit: "hours" | "days" | "weeks"): Date {
  const result = new Date(date);

  switch (unit) {
    case "hours":
      result.setHours(result.getHours() + value);
      break;
    case "days":
      result.setDate(result.getDate() + value);
      break;
    case "weeks":
      result.setDate(result.getDate() + value * 7);
      break;
  }

  return result;
}

/**
 * Subtract time from a date
 */
function subtractTime(date: Date, value: number, unit: "hours" | "days" | "weeks"): Date {
  return addTime(date, -value, unit);
}

/**
 * Calculate buffer days between tasks
 */
export function calculateBufferDays(
  tasks: TaskTemplate[],
  dates: Map<string, CalculatedTaskDates>
): Map<string, number> {
  const buffers = new Map<string, number>();

  for (const task of tasks) {
    const taskDate = dates.get(task.id);
    if (!taskDate) continue;

    // Find tasks that depend on this one
    const dependents = tasks.filter((t) => t.dependsOn.includes(task.id));

    if (dependents.length === 0) {
      // No dependents, buffer is days until deadline
      buffers.set(task.id, 0);
      continue;
    }

    // Find earliest dependent due date
    let earliestDependentDate = new Date(8640000000000000); // Max date
    for (const dep of dependents) {
      const depDate = dates.get(dep.id);
      if (depDate && depDate.dueDate < earliestDependentDate) {
        earliestDependentDate = depDate.dueDate;
      }
    }

    // Buffer is difference between this task's due date and earliest dependent
    const diffMs = earliestDependentDate.getTime() - taskDate.dueDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) - 1;
    buffers.set(task.id, Math.max(0, diffDays));
  }

  return buffers;
}
