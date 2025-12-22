"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SkillPlayground, KnowledgeCapture, SkillWizard } from "@/modules/content-engine/components/sandbox";
import type { Skill } from "@/modules/content-engine/types";
import { Zap, Brain, Plus, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock skills for demo (replace with real data fetch)
const DEMO_SKILLS: Skill[] = [
  {
    id: "1",
    slug: "brief-creator",
    name: "Brief Creator",
    description: "Transforms client requests into actionable, complete briefs with proper structure and validation",
    category: "BRIEF_MANAGEMENT",
    status: "ACTIVE",
    triggers: [{ type: "MANUAL" }, { type: "EVENT", eventType: "client.request.received" }],
    inputs: [
      { name: "clientRequest", type: "string", required: true, description: "Raw client request or email" },
      { name: "clientId", type: "string", required: true, description: "Client identifier" },
      { name: "briefType", type: "string", required: false, description: "Type hint (VIDEO_SHOOT, DESIGN, etc.)" },
    ],
    outputs: [
      { name: "brief", type: "object", description: "Structured brief with all required fields" },
      { name: "missingInfo", type: "array", description: "List of information still needed from client" },
      { name: "suggestedTimeline", type: "object", description: "Recommended dates based on scope" },
    ],
    dependsOn: [],
    founderKnowledge: "Complete brief = actionable deliverables + timelines + comparable past work",
    validationQuestions: [
      "Does this brief include comparable past work as reference?",
      "Would a junior know exactly what to deliver?",
      "Is the timeline realistic for this scope?",
    ],
    invocationCount: 47,
    successRate: 94,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: "2",
    slug: "resource-scanner",
    name: "Resource Scanner",
    description: "Analyzes team capacity and recommends optimal resource allocation",
    category: "RESOURCE_PLANNING",
    status: "ACTIVE",
    triggers: [{ type: "MANUAL" }, { type: "SCHEDULE" }],
    inputs: [
      { name: "briefId", type: "string", required: false, description: "Specific brief to staff" },
      { name: "skillsNeeded", type: "array", required: false, description: "Required skills for assignment" },
      { name: "deadline", type: "date", required: false, description: "When work must be complete" },
    ],
    outputs: [
      { name: "recommendations", type: "array", description: "Ranked list of team members" },
      { name: "capacityMap", type: "object", description: "Team utilization overview" },
      { name: "conflicts", type: "array", description: "Scheduling conflicts to resolve" },
    ],
    dependsOn: [],
    founderKnowledge: "80% utilization is real capacity. Right person = speed + client knowledge + discipline.",
    validationQuestions: [
      "Does this account for client relationship history?",
      "Are we respecting the 80% capacity threshold?",
      "Would this person actually be available?",
    ],
    invocationCount: 23,
    successRate: 87,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

type ViewMode = "list" | "playground" | "capture" | "wizard";

export default function SandboxPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

  const handleSkillSelect = (slug: string) => {
    const skill = DEMO_SKILLS.find((s) => s.slug === slug);
    if (skill) {
      setSelectedSkill(skill);
      setViewMode("playground");
    }
  };

  const handleNewSkill = () => {
    setViewMode("wizard");
  };

  const handleCapture = (skill: Skill) => {
    setSelectedSkill(skill);
    setViewMode("capture");
  };

  const handleBack = () => {
    setViewMode("list");
    setSelectedSkill(null);
  };

  const handleWizardComplete = (draft: Parameters<typeof SkillWizard>[0] extends { onComplete: (s: infer T) => void } ? T : never) => {
    console.log("New skill draft:", draft);
    // TODO: Call createSkill action
    setViewMode("list");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {viewMode !== "list" && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {viewMode === "list" && "Skill Sandbox"}
              {viewMode === "playground" && `Testing: ${selectedSkill?.name}`}
              {viewMode === "capture" && `Knowledge Capture: ${selectedSkill?.name}`}
              {viewMode === "wizard" && "Create New Skill"}
            </h1>
            <p className="text-gray-500 mt-1">
              {viewMode === "list" && "Test, develop, and validate AI skills"}
              {viewMode === "playground" && "Run tests and validate outputs"}
              {viewMode === "capture" && "Record your expertise for this skill"}
              {viewMode === "wizard" && "Define a new skill step by step"}
            </p>
          </div>
        </div>
        {viewMode === "list" && (
          <Button
            onClick={handleNewSkill}
            className="bg-[#52EDC7] hover:bg-[#1BA098] text-black"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Skill
          </Button>
        )}
      </div>

      {/* Main Content */}
      {viewMode === "list" && (
        <div className="space-y-6">
          {/* Skill Selector */}
          <Card>
            <CardHeader>
              <CardTitle>Select a Skill to Test</CardTitle>
              <CardDescription>
                Choose an existing skill or create a new one
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleSkillSelect}>
                <SelectTrigger className="w-full md:w-[400px]">
                  <SelectValue placeholder="Choose a skill..." />
                </SelectTrigger>
                <SelectContent>
                  {DEMO_SKILLS.map((skill) => (
                    <SelectItem key={skill.slug} value={skill.slug}>
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-[#52EDC7]" />
                        {skill.name}
                        <Badge variant="outline" className="ml-2">
                          {skill.category.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Available Skills */}
          <div className="grid gap-4 md:grid-cols-2">
            {DEMO_SKILLS.map((skill) => (
              <Card key={skill.id} className="hover:border-[#52EDC7] transition-colors">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Zap className="h-4 w-4 text-[#52EDC7]" />
                        {skill.name}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {skill.description}
                      </CardDescription>
                    </div>
                    <Badge variant={skill.status === "ACTIVE" ? "default" : "secondary"}>
                      {skill.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge variant="outline">{skill.category.replace(/_/g, " ")}</Badge>
                    <Badge variant="outline">{skill.invocationCount} runs</Badge>
                    <Badge variant="outline">{skill.successRate}% success</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSkillSelect(skill.slug)}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Test
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCapture(skill)}
                    >
                      <Brain className="h-4 w-4 mr-1" />
                      Capture Knowledge
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {viewMode === "playground" && selectedSkill && (
        <SkillPlayground skill={selectedSkill} />
      )}

      {viewMode === "capture" && selectedSkill && (
        <KnowledgeCapture
          skillSlug={selectedSkill.slug}
          skillName={selectedSkill.name}
          onComplete={(knowledge) => {
            console.log("Captured knowledge:", knowledge);
            handleBack();
          }}
        />
      )}

      {viewMode === "wizard" && (
        <SkillWizard
          onComplete={handleWizardComplete}
          onCancel={handleBack}
        />
      )}
    </div>
  );
}
