"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  Target,
  AlertTriangle,
  CheckCircle2,
  MessageCircle,
  Save,
  Sparkles
} from "lucide-react";

interface CaptureQuestion {
  id: string;
  question: string;
  followUp?: string;
  capturesAs: "trigger" | "input" | "output" | "edge_case" | "validation" | "context";
  hint?: string;
}

interface CapturedKnowledge {
  questionId: string;
  response: string;
  capturedAs: CaptureQuestion["capturesAs"];
  extractedItems?: string[];
}

interface KnowledgeCaptureProps {
  skillName: string;
  scenario?: string;
  onComplete?: (knowledge: CapturedKnowledge[]) => void;
}

// Interview questions designed to extract agency expertise
const CAPTURE_QUESTIONS: CaptureQuestion[] = [
  {
    id: "scenario",
    question: "Walk me through a real situation where you'd use this skill.",
    followUp: "Be specific - what happened, who was involved, what did you decide?",
    capturesAs: "context",
    hint: "Think of a specific client, project, or crisis moment",
  },
  {
    id: "trigger",
    question: "What signals tell you it's time to take this action?",
    followUp: "What would you see in Slack, email, or a meeting that would make you say 'we need to do this now'?",
    capturesAs: "trigger",
    hint: "e.g., 'Client asks for a rush job', 'Deadline moves up', 'Team member calls in sick'",
  },
  {
    id: "first_check",
    question: "What's the FIRST thing you check or ask before proceeding?",
    followUp: "What information do you absolutely need before you can make a decision?",
    capturesAs: "input",
    hint: "What would stop you in your tracks if you didn't have it?",
  },
  {
    id: "junior_mistake",
    question: "What mistake would a junior team member make here?",
    followUp: "What do they forget to check? What assumption would burn them?",
    capturesAs: "edge_case",
    hint: "Think of times you've had to fix or redo work because of missed steps",
  },
  {
    id: "disney_lesson",
    question: "What did scaling Disney's social team teach you about this?",
    followUp: "What works differently at scale vs. a smaller agency?",
    capturesAs: "validation",
    hint: "The hard-won lessons that only come from operating at that level",
  },
  {
    id: "success_criteria",
    question: "How do you know when this is done RIGHT vs. just done?",
    followUp: "What separates 'good enough' from 'this is world-class'?",
    capturesAs: "output",
    hint: "Think quality, client reaction, team satisfaction, business impact",
  },
  {
    id: "client_red_flag",
    question: "What client behavior makes this harder or changes your approach?",
    followUp: "Delayed approvals? Unclear POC? Payment issues? Scope creep?",
    capturesAs: "edge_case",
    hint: "The 'oh no, not this again' moments",
  },
  {
    id: "time_pressure",
    question: "How does your approach change under time pressure?",
    followUp: "What do you skip? What do you NEVER skip? What's the minimum viable version?",
    capturesAs: "validation",
    hint: "The Friday 4pm 'we need this Monday' scenario",
  },
];

export function KnowledgeCapture({ skillName, scenario, onComplete }: KnowledgeCaptureProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [capturedKnowledge, setCapturedKnowledge] = useState<CapturedKnowledge[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = CAPTURE_QUESTIONS[currentIndex];
  const progress = ((currentIndex + 1) / CAPTURE_QUESTIONS.length) * 100;

  const handleResponseChange = (value: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQuestion.id]: value,
    }));
  };

  const handleNext = () => {
    // Capture the current response
    const currentResponse = responses[currentQuestion.id] || "";
    if (currentResponse.trim()) {
      setCapturedKnowledge((prev) => {
        const existing = prev.find((k) => k.questionId === currentQuestion.id);
        if (existing) {
          return prev.map((k) =>
            k.questionId === currentQuestion.id
              ? { ...k, response: currentResponse }
              : k
          );
        }
        return [
          ...prev,
          {
            questionId: currentQuestion.id,
            response: currentResponse,
            capturedAs: currentQuestion.capturesAs,
          },
        ];
      });
    }

    if (currentIndex < CAPTURE_QUESTIONS.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsComplete(true);
      onComplete?.(capturedKnowledge);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const getCaptureIcon = (type: CaptureQuestion["capturesAs"]) => {
    switch (type) {
      case "trigger":
        return <Target className="h-4 w-4" />;
      case "input":
        return <MessageCircle className="h-4 w-4" />;
      case "output":
        return <CheckCircle2 className="h-4 w-4" />;
      case "edge_case":
        return <AlertTriangle className="h-4 w-4" />;
      case "validation":
        return <Lightbulb className="h-4 w-4" />;
      default:
        return <Sparkles className="h-4 w-4" />;
    }
  };

  if (isComplete) {
    return (
      <Card className="border-[#52EDC7]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-[#52EDC7]" />
            Knowledge Captured
          </CardTitle>
          <CardDescription>
            Your expertise for &ldquo;{skillName}&rdquo; has been recorded
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
              {capturedKnowledge.map((knowledge) => {
                const question = CAPTURE_QUESTIONS.find((q) => q.id === knowledge.questionId);
                return (
                  <div key={knowledge.questionId} className="border-b pb-4 last:border-0">
                    <div className="flex items-center gap-2 mb-2">
                      {getCaptureIcon(knowledge.capturedAs)}
                      <Badge variant="outline">{knowledge.capturedAs}</Badge>
                    </div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {question?.question}
                    </p>
                    <p className="text-sm">{knowledge.response}</p>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setIsComplete(false)}>
            Review Responses
          </Button>
          <Button className="bg-[#52EDC7] hover:bg-[#1BA098] text-black">
            <Save className="mr-2 h-4 w-4" />
            Save to Skill
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Knowledge Capture: {skillName}</span>
          <span className="font-medium">
            {currentIndex + 1} of {CAPTURE_QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Scenario Context */}
      {scenario && currentIndex === 0 && (
        <Card className="bg-muted/50">
          <CardContent className="pt-4">
            <p className="text-sm">
              <span className="font-medium">Scenario:</span> {scenario}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Question */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            {getCaptureIcon(currentQuestion.capturesAs)}
            <Badge variant="secondary">{currentQuestion.capturesAs.replace("_", " ")}</Badge>
          </div>
          <CardTitle className="text-xl">{currentQuestion.question}</CardTitle>
          {currentQuestion.followUp && (
            <CardDescription className="text-base mt-2">
              {currentQuestion.followUp}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={responses[currentQuestion.id] || ""}
            onChange={(e) => handleResponseChange(e.target.value)}
            placeholder="Share your experience..."
            className="min-h-[150px] text-base"
          />

          {currentQuestion.hint && (
            <div className="flex items-start gap-2 text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <Lightbulb className="h-4 w-4 mt-0.5 text-yellow-500" />
              <span>{currentQuestion.hint}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            className="bg-[#52EDC7] hover:bg-[#1BA098] text-black"
          >
            {currentIndex === CAPTURE_QUESTIONS.length - 1 ? (
              <>
                Complete
                <CheckCircle2 className="ml-2 h-4 w-4" />
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

      {/* Captured So Far */}
      {capturedKnowledge.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Captured So Far
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {capturedKnowledge.map((k) => (
                <Badge key={k.questionId} variant="outline" className="text-xs">
                  {getCaptureIcon(k.capturedAs)}
                  <span className="ml-1">{k.capturedAs}</span>
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
