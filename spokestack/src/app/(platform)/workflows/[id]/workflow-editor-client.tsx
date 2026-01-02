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
import { Switch } from "@/components/ui/switch";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowLeft,
  Plus,
  MoreHorizontal,
  GitBranch,
  CheckSquare,
  FileQuestion,
  Bell,
  Clock,
  Zap,
  Settings,
  PlayCircle,
  Trash2,
  GripVertical,
  ArrowRight,
  Loader2,
  Edit,
  Copy,
} from "lucide-react";
import { toast } from "sonner";
import type { WorkflowDefinitionWithRelations } from "@/modules/workflow-builder/types";
import { createWorkflowStep, updateWorkflowDefinition, startWorkflow } from "@/modules/workflow-builder/actions";

interface WorkflowEditorClientProps {
  workflow: WorkflowDefinitionWithRelations;
}

const STEP_TYPE_CONFIG: Record<string, { icon: React.ElementType; label: string; color: string; bgColor: string }> = {
  TASK: { icon: CheckSquare, label: "Task", color: "text-blue-500", bgColor: "bg-blue-100 dark:bg-blue-900/20" },
  APPROVAL: { icon: FileQuestion, label: "Approval", color: "text-green-500", bgColor: "bg-green-100 dark:bg-green-900/20" },
  FORM_INPUT: { icon: Edit, label: "Form Input", color: "text-purple-500", bgColor: "bg-purple-100 dark:bg-purple-900/20" },
  CONDITION: { icon: GitBranch, label: "Condition", color: "text-orange-500", bgColor: "bg-orange-100 dark:bg-orange-900/20" },
  NOTIFICATION: { icon: Bell, label: "Notification", color: "text-pink-500", bgColor: "bg-pink-100 dark:bg-pink-900/20" },
  WEBHOOK: { icon: Zap, label: "Webhook", color: "text-yellow-500", bgColor: "bg-yellow-100 dark:bg-yellow-900/20" },
  DELAY: { icon: Clock, label: "Delay", color: "text-gray-500", bgColor: "bg-gray-100 dark:bg-gray-900/20" },
};

const ASSIGNEE_TYPE_LABELS: Record<string, string> = {
  SPECIFIC_USER: "Specific User",
  BY_ROLE: "By Role",
  BY_DEPARTMENT: "By Department",
  FROM_TRIGGER: "From Trigger Entity",
  ROUND_ROBIN: "Round Robin",
  PREVIOUS_ACTOR: "Previous Step Actor",
};

const TRIGGER_TYPE_LABELS: Record<string, string> = {
  MANUAL: "Manual Start",
  ENTITY_CREATED: "When Entity Created",
  ENTITY_UPDATED: "When Entity Updated",
  SCHEDULED: "On Schedule",
  WEBHOOK: "Via Webhook",
  FORM_SUBMITTED: "When Form Submitted",
};

export function WorkflowEditorClient({ workflow }: WorkflowEditorClientProps) {
  const router = useRouter();
  const [isAddStepOpen, setIsAddStepOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Add step form state
  const [stepName, setStepName] = useState("");
  const [stepDescription, setStepDescription] = useState("");
  const [stepType, setStepType] = useState("TASK");
  const [assigneeType, setAssigneeType] = useState("SPECIFIC_USER");

  // Settings form state
  const [workflowName, setWorkflowName] = useState(workflow.name);
  const [workflowDescription, setWorkflowDescription] = useState(workflow.description || "");
  const [isActive, setIsActive] = useState(workflow.isActive);

  const handleAddStep = async () => {
    if (!stepName.trim()) {
      toast.error("Please enter a step name");
      return;
    }

    startTransition(async () => {
      try {
        await createWorkflowStep({
          definitionId: workflow.id,
          name: stepName.trim(),
          description: stepDescription.trim() || undefined,
          stepType: stepType as any,
          assigneeType: assigneeType as any,
        });

        toast.success("Step added successfully!");
        setIsAddStepOpen(false);
        setStepName("");
        setStepDescription("");
        setStepType("TASK");
        router.refresh();
      } catch (error) {
        console.error("Failed to add step:", error);
        toast.error("Failed to add step. Please try again.");
      }
    });
  };

  const handleSaveSettings = async () => {
    startTransition(async () => {
      try {
        await updateWorkflowDefinition(workflow.id, {
          name: workflowName.trim(),
          description: workflowDescription.trim() || undefined,
          isActive,
        });

        toast.success("Workflow updated!");
        setIsSettingsOpen(false);
        router.refresh();
      } catch (error) {
        console.error("Failed to update workflow:", error);
        toast.error("Failed to update workflow. Please try again.");
      }
    });
  };

  const handleStartWorkflow = async () => {
    if (!workflow.steps || workflow.steps.length === 0) {
      toast.error("Add at least one step before running the workflow");
      return;
    }

    startTransition(async () => {
      try {
        const run = await startWorkflow({
          definitionId: workflow.id,
        });

        toast.success("Workflow started!");
        router.push(`/workflows/runs/${run.id}`);
      } catch (error) {
        console.error("Failed to start workflow:", error);
        toast.error("Failed to start workflow. Please try again.");
      }
    });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <div className="flex items-center gap-4">
          <Link
            href="/workflows"
            className="p-2 rounded-lg hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: workflow.color || "#6366f1" }}
            >
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{workflow.name}</h1>
                <Badge variant={workflow.isActive ? "default" : "secondary"}>
                  {workflow.isActive ? "Active" : "Draft"}
                </Badge>
              </div>
              {workflow.description && (
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">
            {TRIGGER_TYPE_LABELS[workflow.triggerType] || workflow.triggerType}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartWorkflow}
            disabled={isPending || !workflow.steps?.length}
          >
            <PlayCircle className="mr-2 h-4 w-4" />
            Run Workflow
          </Button>
          <Button variant="outline" size="icon" onClick={() => setIsSettingsOpen(true)}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Trigger Info */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Trigger
                </CardTitle>
                <Button variant="ghost" size="sm">
                  Configure
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{TRIGGER_TYPE_LABELS[workflow.triggerType]}</p>
                  <p className="text-sm text-muted-foreground">
                    {workflow.triggerType === "MANUAL"
                      ? "This workflow is started manually"
                      : workflow.triggerEntity
                      ? `Triggered by ${workflow.triggerEntity}`
                      : "Configure trigger settings"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Workflow Steps</h2>
              <Button onClick={() => setIsAddStepOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Step
              </Button>
            </div>

            {workflow.steps && workflow.steps.length > 0 ? (
              <div className="space-y-3">
                {workflow.steps.map((step, index) => {
                  const config = STEP_TYPE_CONFIG[step.stepType] || STEP_TYPE_CONFIG.TASK;
                  const Icon = config.icon;

                  return (
                    <div key={step.id} className="flex items-start gap-4">
                      {/* Step Number & Connector */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                          {index + 1}
                        </div>
                        {index < workflow.steps!.length - 1 && (
                          <div className="w-0.5 h-12 bg-border mt-2" />
                        )}
                      </div>

                      {/* Step Card */}
                      <Card className="flex-1">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className={`p-2 rounded-lg ${config.bgColor}`}>
                                <Icon className={`h-4 w-4 ${config.color}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h3 className="font-medium">{step.name}</h3>
                                  <Badge variant="outline" className="text-xs">
                                    {config.label}
                                  </Badge>
                                </div>
                                {step.description && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    {step.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                  <span>
                                    Assigned: {ASSIGNEE_TYPE_LABELS[step.assigneeType] || step.assigneeType}
                                  </span>
                                  {step.slaHours && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {step.slaHours}h SLA
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="mr-2 h-4 w-4" />
                                  Edit Step
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Copy className="mr-2 h-4 w-4" />
                                  Duplicate
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <GitBranch className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No steps yet</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md mb-6">
                    Add steps to define what happens in this workflow.
                    Each step can be a task, approval, notification, or more.
                  </p>
                  <Button onClick={() => setIsAddStepOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add First Step
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Add Step Button at bottom */}
            {workflow.steps && workflow.steps.length > 0 && (
              <div className="flex items-start gap-4">
                <div className="w-8" /> {/* Spacer for alignment */}
                <Button
                  variant="outline"
                  className="w-full border-dashed"
                  onClick={() => setIsAddStepOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Another Step
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Step Dialog */}
      <Dialog open={isAddStepOpen} onOpenChange={setIsAddStepOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add Workflow Step</DialogTitle>
            <DialogDescription>
              Define what happens at this step in the workflow
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="step-name">Step Name</Label>
              <Input
                id="step-name"
                placeholder="e.g., Manager Approval"
                value={stepName}
                onChange={(e) => setStepName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="step-type">Step Type</Label>
              <Select value={stepType} onValueChange={setStepType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select step type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(STEP_TYPE_CONFIG).map(([value, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={value} value={value}>
                        <div className="flex items-center gap-2">
                          <Icon className={`h-4 w-4 ${config.color}`} />
                          {config.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="assignee-type">Assignment</Label>
              <Select value={assigneeType} onValueChange={setAssigneeType}>
                <SelectTrigger>
                  <SelectValue placeholder="Who should handle this step?" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ASSIGNEE_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="step-description">Description (optional)</Label>
              <Textarea
                id="step-description"
                placeholder="Instructions for this step..."
                value={stepDescription}
                onChange={(e) => setStepDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddStepOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddStep} disabled={isPending || !stepName.trim()}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Step
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Workflow Settings</DialogTitle>
            <DialogDescription>
              Configure workflow properties and behavior
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="workflow-name">Workflow Name</Label>
              <Input
                id="workflow-name"
                value={workflowName}
                onChange={(e) => setWorkflowName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                value={workflowDescription}
                onChange={(e) => setWorkflowDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Active</Label>
                <p className="text-sm text-muted-foreground">
                  Allow this workflow to be triggered
                </p>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveSettings} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
