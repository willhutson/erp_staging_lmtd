"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  GitBranch,
  LayoutTemplate,
  CheckSquare,
  Clock,
  PlayCircle,
  Pause,
  ArrowRight,
  Loader2,
  Zap,
  Settings,
} from "lucide-react";
import { toast } from "sonner";
import type { WorkflowDefinitionWithRelations, WorkflowTaskWithRelations } from "@/modules/workflow-builder/types";
import { createWorkflowDefinition } from "@/modules/workflow-builder/actions";

interface WorkflowBuilderClientProps {
  definitions: WorkflowDefinitionWithRelations[];
  myTasks: WorkflowTaskWithRelations[];
}

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  MANUAL: "Manual",
  ENTITY_CREATED: "Entity Created",
  ENTITY_UPDATED: "Entity Updated",
  SCHEDULED: "Scheduled",
  WEBHOOK: "Webhook",
  FORM_SUBMITTED: "Form Submitted",
};

const CATEGORY_OPTIONS = [
  "Approval",
  "Onboarding",
  "Creative",
  "Finance",
  "HR",
  "Operations",
  "Sales",
  "Other",
];

export function WorkflowBuilderClient({ definitions, myTasks }: WorkflowBuilderClientProps) {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const activeWorkflows = definitions.filter((d) => d.isActive);
  const pendingTasks = myTasks.filter((t) => t.status === "PENDING");

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error("Please enter a workflow name");
      return;
    }

    startTransition(async () => {
      try {
        const workflow = await createWorkflowDefinition({
          name: newName.trim(),
          description: newDescription.trim() || undefined,
          category: newCategory || undefined,
        });

        toast.success("Workflow created successfully!");
        setIsCreateDialogOpen(false);
        setNewName("");
        setNewDescription("");
        setNewCategory("");
        router.push(`/workflows/${workflow.id}`);
      } catch (error) {
        console.error("Failed to create workflow:", error);
        toast.error("Failed to create workflow. Please try again.");
      }
    });
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Workflow Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Build and manage approval workflows and process automation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/workflows/templates">
              <LayoutTemplate className="mr-2 h-4 w-4" />
              Templates
            </Link>
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Workflow</DialogTitle>
            <DialogDescription>
              Build a new approval or automation workflow
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                placeholder="e.g., Brief Approval Process"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe what this workflow does..."
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={isPending || !newName.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Workflows
            </CardTitle>
            <GitBranch className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWorkflows.length}</div>
            <p className="text-xs text-muted-foreground">
              Ready to run
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              My Pending Tasks
            </CardTitle>
            <CheckSquare className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting action
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Running Instances
            </CardTitle>
            <PlayCircle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {definitions.reduce((acc, d) => acc + (d._count?.runs || 0), 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Templates
            </CardTitle>
            <LayoutTemplate className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {definitions.filter((d) => d.isTemplate).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Reusable
            </p>
          </CardContent>
        </Card>
      </div>

      {/* My Pending Tasks */}
      {pendingTasks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              My Pending Tasks
            </CardTitle>
            <CardDescription>
              Workflow tasks awaiting your action
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div>
                    <p className="font-medium">{task.step.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {task.step.stepType === "APPROVAL" ? "Needs approval" : "Task to complete"}
                    </p>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/workflows/runs/${task.run?.id}`}>
                      Take Action
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
            {pendingTasks.length > 5 && (
              <Button variant="ghost" className="w-full mt-4" asChild>
                <Link href="/workflows/my">
                  View All ({pendingTasks.length}) Tasks
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Workflow Definitions List */}
      {definitions.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Workflows</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {definitions.map((workflow) => (
              <Link key={workflow.id} href={`/workflows/${workflow.id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: workflow.color || "#6366f1" }}
                        >
                          <GitBranch className="h-4 w-4 text-white" />
                        </div>
                        <CardTitle className="text-lg">{workflow.name}</CardTitle>
                      </div>
                      <Badge variant={workflow.isActive ? "default" : "secondary"}>
                        {workflow.isActive ? "Active" : "Draft"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-2">
                      {workflow.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span>{workflow._count?.steps || 0} steps</span>
                        <span>{workflow._count?.runs || 0} runs</span>
                      </div>
                      <Badge variant="outline">
                        {TRIGGER_TYPE_LABELS[workflow.triggerType] || workflow.triggerType}
                      </Badge>
                    </div>
                    {workflow.category && (
                      <Badge variant="secondary" className="mt-2">
                        {workflow.category}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center mb-4">
              <GitBranch className="w-8 h-8 text-indigo-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No workflows yet</h3>
            <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
              Create your first workflow to automate approvals and
              streamline your team&apos;s processes.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/workflows/templates">
                  Browse Templates
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Workflow
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Links */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-blue-500" />
              My Tasks
            </CardTitle>
            <CardDescription>
              View all workflow tasks assigned to you
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/workflows/my">View My Tasks</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-orange-500" />
              Running Workflows
            </CardTitle>
            <CardDescription>
              Monitor active workflow instances
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/workflows/runs">View Runs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LayoutTemplate className="h-5 w-5 text-purple-500" />
              Template Library
            </CardTitle>
            <CardDescription>
              Pre-built workflows for common processes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href="/workflows/templates">Browse Templates</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
