"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronRight,
  ChevronLeft,
  Plus,
  X,
  Zap,
  Target,
  ArrowRightLeft,
  FileOutput,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import type { SkillCategory, SkillInput, SkillOutput, SkillTrigger } from "../../types";

interface SkillWizardProps {
  onComplete: (skill: SkillDraft) => void;
  onCancel: () => void;
}

interface SkillDraft {
  slug: string;
  name: string;
  description: string;
  category: SkillCategory;
  triggers: SkillTrigger[];
  inputs: SkillInput[];
  outputs: SkillOutput[];
  dependsOn: string[];
  founderKnowledge: string;
  validationQuestions: string[];
}

const CATEGORIES: { value: SkillCategory; label: string; description: string }[] = [
  { value: "BRIEF_MANAGEMENT", label: "Brief Management", description: "Creating, reviewing, and managing client briefs" },
  { value: "RESOURCE_PLANNING", label: "Resource Planning", description: "Team capacity, assignments, and scheduling" },
  { value: "CLIENT_RELATIONS", label: "Client Relations", description: "Client communication and relationship management" },
  { value: "CONTENT_CREATION", label: "Content Creation", description: "Video, design, copy, and creative production" },
  { value: "QUALITY_ASSURANCE", label: "Quality Assurance", description: "Review, feedback, and approval workflows" },
  { value: "ANALYTICS", label: "Analytics", description: "Reporting, metrics, and performance analysis" },
  { value: "WORKFLOW", label: "Workflow", description: "Process automation and orchestration" },
  { value: "KNOWLEDGE", label: "Knowledge", description: "Documentation and institutional knowledge" },
];

const STEPS = [
  { id: "basics", title: "Basics", icon: Zap },
  { id: "triggers", title: "Triggers", icon: Target },
  { id: "io", title: "Inputs/Outputs", icon: ArrowRightLeft },
  { id: "validation", title: "Validation", icon: CheckCircle2 },
];

export function SkillWizard({ onComplete, onCancel }: SkillWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [draft, setDraft] = useState<SkillDraft>({
    slug: "",
    name: "",
    description: "",
    category: "WORKFLOW",
    triggers: [],
    inputs: [],
    outputs: [],
    dependsOn: [],
    founderKnowledge: "",
    validationQuestions: [],
  });

  // Temp states for adding items
  const [newInput, setNewInput] = useState<Partial<SkillInput>>({});
  const [newOutput, setNewOutput] = useState<Partial<SkillOutput>>({});
  const [newValidationQ, setNewValidationQ] = useState("");

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const updateDraft = (updates: Partial<SkillDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    updateDraft({ name, slug: generateSlug(name) });
  };

  const addInput = () => {
    if (newInput.name && newInput.type && newInput.description) {
      updateDraft({
        inputs: [
          ...draft.inputs,
          {
            name: newInput.name,
            type: newInput.type as SkillInput["type"],
            required: newInput.required ?? false,
            description: newInput.description,
          },
        ],
      });
      setNewInput({});
    }
  };

  const removeInput = (index: number) => {
    updateDraft({
      inputs: draft.inputs.filter((_, i) => i !== index),
    });
  };

  const addOutput = () => {
    if (newOutput.name && newOutput.type && newOutput.description) {
      updateDraft({
        outputs: [
          ...draft.outputs,
          {
            name: newOutput.name,
            type: newOutput.type as SkillOutput["type"],
            description: newOutput.description,
          },
        ],
      });
      setNewOutput({});
    }
  };

  const removeOutput = (index: number) => {
    updateDraft({
      outputs: draft.outputs.filter((_, i) => i !== index),
    });
  };

  const addValidationQuestion = () => {
    if (newValidationQ.trim()) {
      updateDraft({
        validationQuestions: [...draft.validationQuestions, newValidationQ.trim()],
      });
      setNewValidationQ("");
    }
  };

  const removeValidationQuestion = (index: number) => {
    updateDraft({
      validationQuestions: draft.validationQuestions.filter((_, i) => i !== index),
    });
  };

  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      onComplete(draft);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: // Basics
        return draft.name.trim() !== "" && draft.description.trim() !== "";
      case 1: // Triggers
        return true; // Triggers are optional
      case 2: // I/O
        return true; // Can be defined later
      case 3: // Validation
        return draft.founderKnowledge.trim() !== "" || draft.validationQuestions.length > 0;
      default:
        return true;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Skill Name</Label>
              <Input
                id="name"
                placeholder="e.g., Brief Validator, Resource Scanner"
                value={draft.name}
                onChange={(e) => handleNameChange(e.target.value)}
              />
              {draft.slug && (
                <p className="text-xs text-muted-foreground">
                  Slug: <code className="bg-muted px-1 rounded">{draft.slug}</code>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What does this skill do? When would you use it?"
                value={draft.description}
                onChange={(e) => updateDraft({ description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <div className="grid grid-cols-2 gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => updateDraft({ category: cat.value })}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      draft.category === cat.value
                        ? "border-[#52EDC7] bg-[#52EDC7]/10"
                        : "border-border hover:border-muted-foreground"
                    }`}
                  >
                    <p className="font-medium text-sm">{cat.label}</p>
                    <p className="text-xs text-muted-foreground">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>When should this skill trigger?</Label>
              <p className="text-sm text-muted-foreground">
                Define the events or conditions that invoke this skill
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { type: "MANUAL", label: "Manual", desc: "User explicitly runs it" },
                { type: "EVENT", label: "On Event", desc: "When something happens in the system" },
                { type: "SCHEDULE", label: "Scheduled", desc: "At specific times" },
                { type: "DEPENDENCY", label: "After Skill", desc: "When another skill completes" },
              ].map((trigger) => (
                <button
                  key={trigger.type}
                  type="button"
                  onClick={() => {
                    const exists = draft.triggers.some((t) => t.type === trigger.type);
                    if (exists) {
                      updateDraft({
                        triggers: draft.triggers.filter((t) => t.type !== trigger.type),
                      });
                    } else {
                      updateDraft({
                        triggers: [...draft.triggers, { type: trigger.type as SkillTrigger["type"] }],
                      });
                    }
                  }}
                  className={`p-4 rounded-lg border text-left transition-colors ${
                    draft.triggers.some((t) => t.type === trigger.type)
                      ? "border-[#52EDC7] bg-[#52EDC7]/10"
                      : "border-border hover:border-muted-foreground"
                  }`}
                >
                  <p className="font-medium">{trigger.label}</p>
                  <p className="text-sm text-muted-foreground">{trigger.desc}</p>
                </button>
              ))}
            </div>

            {draft.triggers.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Triggers</Label>
                <div className="flex flex-wrap gap-2">
                  {draft.triggers.map((t, i) => (
                    <Badge key={i} variant="secondary">
                      {t.type}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            {/* Inputs */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Inputs</Label>
                <p className="text-sm text-muted-foreground">
                  What information does this skill need?
                </p>
              </div>

              {draft.inputs.length > 0 && (
                <div className="space-y-2">
                  {draft.inputs.map((input, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Badge variant="outline">{input.type}</Badge>
                      <span className="font-medium text-sm">{input.name}</span>
                      {input.required && <Badge variant="destructive" className="text-xs">required</Badge>}
                      <span className="text-xs text-muted-foreground flex-1">{input.description}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeInput(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Name"
                  value={newInput.name || ""}
                  onChange={(e) => setNewInput((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  value={newInput.type || ""}
                  onValueChange={(v) => setNewInput((prev) => ({ ...prev, type: v as SkillInput["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="date">date</SelectItem>
                    <SelectItem value="object">object</SelectItem>
                    <SelectItem value="array">array</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Description"
                  value={newInput.description || ""}
                  onChange={(e) => setNewInput((prev) => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={addInput} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Outputs */}
            <div className="space-y-4">
              <div>
                <Label className="text-base">Outputs</Label>
                <p className="text-sm text-muted-foreground">
                  What does this skill produce?
                </p>
              </div>

              {draft.outputs.length > 0 && (
                <div className="space-y-2">
                  {draft.outputs.map((output, i) => (
                    <div key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <FileOutput className="h-4 w-4 text-[#52EDC7]" />
                      <Badge variant="outline">{output.type}</Badge>
                      <span className="font-medium text-sm">{output.name}</span>
                      <span className="text-xs text-muted-foreground flex-1">{output.description}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeOutput(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-4 gap-2">
                <Input
                  placeholder="Name"
                  value={newOutput.name || ""}
                  onChange={(e) => setNewOutput((prev) => ({ ...prev, name: e.target.value }))}
                />
                <Select
                  value={newOutput.type || ""}
                  onValueChange={(v) => setNewOutput((prev) => ({ ...prev, type: v as SkillOutput["type"] }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">string</SelectItem>
                    <SelectItem value="number">number</SelectItem>
                    <SelectItem value="boolean">boolean</SelectItem>
                    <SelectItem value="date">date</SelectItem>
                    <SelectItem value="object">object</SelectItem>
                    <SelectItem value="array">array</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Description"
                  value={newOutput.description || ""}
                  onChange={(e) => setNewOutput((prev) => ({ ...prev, description: e.target.value }))}
                />
                <Button onClick={addOutput} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="founderKnowledge">Founder Knowledge</Label>
              <p className="text-sm text-muted-foreground">
                What does 15 years of experience tell you about this?
              </p>
              <Textarea
                id="founderKnowledge"
                placeholder="The hard-won lessons, edge cases, and expertise that only comes from running world-class agencies..."
                value={draft.founderKnowledge}
                onChange={(e) => updateDraft({ founderKnowledge: e.target.value })}
                rows={5}
              />
            </div>

            <div className="space-y-4">
              <div>
                <Label>Validation Questions</Label>
                <p className="text-sm text-muted-foreground">
                  Questions to check if the skill output matches your expertise
                </p>
              </div>

              {draft.validationQuestions.length > 0 && (
                <ul className="space-y-2">
                  {draft.validationQuestions.map((q, i) => (
                    <li key={i} className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <Sparkles className="h-4 w-4 text-[#52EDC7]" />
                      <span className="text-sm flex-1">{q}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeValidationQuestion(i)}>
                        <X className="h-4 w-4" />
                      </Button>
                    </li>
                  ))}
                </ul>
              )}

              <div className="flex gap-2">
                <Input
                  placeholder="e.g., What would a junior miss here?"
                  value={newValidationQ}
                  onChange={(e) => setNewValidationQ(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addValidationQuestion()}
                />
                <Button onClick={addValidationQuestion} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className={`flex items-center gap-2 text-sm ${
                  i <= currentStep ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    i < currentStep
                      ? "bg-[#52EDC7] text-black"
                      : i === currentStep
                      ? "bg-[#52EDC7]/20 border-2 border-[#52EDC7]"
                      : "bg-muted"
                  }`}
                >
                  {i < currentStep ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep].title}</CardTitle>
          <CardDescription>
            {currentStep === 0 && "Define the basics of your new skill"}
            {currentStep === 1 && "Configure when this skill should run"}
            {currentStep === 2 && "Specify what goes in and what comes out"}
            {currentStep === 3 && "Embed your expertise for validation"}
          </CardDescription>
        </CardHeader>
        <CardContent>{renderStep()}</CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {currentStep === 0 ? (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            ) : (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
            )}
          </div>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
            className="bg-[#52EDC7] hover:bg-[#1BA098] text-black"
          >
            {currentStep === STEPS.length - 1 ? (
              <>
                Create Skill
                <Sparkles className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next
                <ChevronRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
