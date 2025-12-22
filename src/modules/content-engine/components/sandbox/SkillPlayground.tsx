"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Zap,
  FileText,
  MessageSquare
} from "lucide-react";
import type { Skill, SandboxTestResult } from "../../types";

interface SkillPlaygroundProps {
  skill: Skill;
  onTestComplete?: (result: SandboxTestResult) => void;
}

export function SkillPlayground({ skill, onTestComplete }: SkillPlaygroundProps) {
  const [inputValues, setInputValues] = useState<Record<string, string>>({});
  const [testResult, setTestResult] = useState<SandboxTestResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [founderNotes, setFounderNotes] = useState("");

  const handleInputChange = (name: string, value: string) => {
    setInputValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleRunTest = async () => {
    setIsRunning(true);
    setTestResult(null);

    try {
      // Parse input values based on their types
      const parsedInputs: Record<string, unknown> = {};
      for (const input of skill.inputs) {
        const rawValue = inputValues[input.name];
        if (rawValue === undefined || rawValue === "") {
          if (input.required) {
            throw new Error(`Required input "${input.name}" is missing`);
          }
          continue;
        }

        switch (input.type) {
          case "number":
            parsedInputs[input.name] = parseFloat(rawValue);
            break;
          case "boolean":
            parsedInputs[input.name] = rawValue === "true";
            break;
          case "object":
          case "array":
            parsedInputs[input.name] = JSON.parse(rawValue);
            break;
          default:
            parsedInputs[input.name] = rawValue;
        }
      }

      // Simulate skill execution (in production, this calls the actual skill)
      const startTime = Date.now();

      // TODO: Replace with actual skill invocation API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const durationMs = Date.now() - startTime;

      const result: SandboxTestResult = {
        success: true,
        output: {
          _simulatedOutput: true,
          message: `Skill "${skill.name}" would process these inputs`,
          inputs: parsedInputs,
          timestamp: new Date().toISOString(),
        },
        durationMs,
        tokensUsed: {
          input: Math.floor(JSON.stringify(parsedInputs).length / 4),
          output: 150,
        },
      };

      setTestResult(result);
      onTestComplete?.(result);
    } catch (error) {
      const result: SandboxTestResult = {
        success: false,
        output: null,
        error: error instanceof Error ? error.message : "Unknown error",
        durationMs: 0,
        tokensUsed: { input: 0, output: 0 },
      };
      setTestResult(result);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setInputValues({});
    setTestResult(null);
    setFounderNotes("");
  };

  const handleFounderApproval = (approved: boolean) => {
    if (testResult) {
      setTestResult({
        ...testResult,
        founderValidation: {
          approved,
          notes: founderNotes,
        },
      });
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Left Panel: Skill Info & Inputs */}
      <div className="space-y-6">
        {/* Skill Header */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-[#52EDC7]" />
                  {skill.name}
                </CardTitle>
                <CardDescription className="mt-1">{skill.description}</CardDescription>
              </div>
              <Badge variant={skill.status === "ACTIVE" ? "default" : "secondary"}>
                {skill.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{skill.category}</Badge>
              {skill.dependsOn.map((dep) => (
                <Badge key={dep} variant="outline" className="text-muted-foreground">
                  → {dep}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Input Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Test Inputs</CardTitle>
            <CardDescription>
              Enter values to test the skill with
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {skill.inputs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                This skill has no defined inputs yet.
              </p>
            ) : (
              skill.inputs.map((input) => (
                <div key={input.name} className="space-y-2">
                  <Label htmlFor={input.name}>
                    {input.name}
                    {input.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  {input.type === "object" || input.type === "array" ? (
                    <Textarea
                      id={input.name}
                      placeholder={`Enter ${input.type} as JSON...`}
                      value={inputValues[input.name] ?? ""}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                      className="font-mono text-sm"
                      rows={4}
                    />
                  ) : (
                    <Input
                      id={input.name}
                      type={input.type === "number" ? "number" : "text"}
                      placeholder={input.description}
                      value={inputValues[input.name] ?? ""}
                      onChange={(e) => handleInputChange(input.name, e.target.value)}
                    />
                  )}
                  <p className="text-xs text-muted-foreground">{input.description}</p>
                </div>
              ))
            )}

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleRunTest}
                disabled={isRunning}
                className="bg-[#52EDC7] hover:bg-[#1BA098] text-black"
              >
                {isRunning ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Running...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Run Test
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Panel: Results & Validation */}
      <div className="space-y-6">
        <Tabs defaultValue="output">
          <TabsList className="w-full">
            <TabsTrigger value="output" className="flex-1">
              <FileText className="mr-2 h-4 w-4" />
              Output
            </TabsTrigger>
            <TabsTrigger value="validation" className="flex-1">
              <MessageSquare className="mr-2 h-4 w-4" />
              Validation
            </TabsTrigger>
          </TabsList>

          <TabsContent value="output">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  Test Result
                  {testResult && (
                    testResult.success ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500" />
                    )
                  )}
                </CardTitle>
                {testResult && (
                  <CardDescription>
                    Duration: {testResult.durationMs}ms |
                    Tokens: {testResult.tokensUsed.input} in / {testResult.tokensUsed.output} out
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent>
                {!testResult ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Run a test to see results
                  </div>
                ) : testResult.error ? (
                  <div className="rounded-md bg-red-50 p-4 text-red-700">
                    <p className="font-medium">Error:</p>
                    <p className="mt-1">{testResult.error}</p>
                  </div>
                ) : (
                  <ScrollArea className="h-[300px]">
                    <pre className="text-sm font-mono whitespace-pre-wrap bg-muted p-4 rounded-md">
                      {JSON.stringify(testResult.output, null, 2)}
                    </pre>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="validation">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Founder Validation</CardTitle>
                <CardDescription>
                  Validate that this skill output matches your expertise
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {skill.validationQuestions && skill.validationQuestions.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-medium">Check-in Questions:</p>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {skill.validationQuestions.map((q, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-[#52EDC7]">•</span>
                          {q}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="founder-notes">Your Notes</Label>
                  <Textarea
                    id="founder-notes"
                    placeholder="What would you do differently? What's missing? What mistake would a junior make here?"
                    value={founderNotes}
                    onChange={(e) => setFounderNotes(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFounderApproval(true)}
                    disabled={!testResult}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Approve Output
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleFounderApproval(false)}
                    disabled={!testResult}
                  >
                    <XCircle className="mr-2 h-4 w-4" />
                    Needs Work
                  </Button>
                </div>

                {testResult?.founderValidation && (
                  <div className={`rounded-md p-4 mt-4 ${
                    testResult.founderValidation.approved
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}>
                    <p className="font-medium">
                      {testResult.founderValidation.approved ? "✓ Approved" : "⚠ Needs Improvement"}
                    </p>
                    {testResult.founderValidation.notes && (
                      <p className="mt-1 text-sm">{testResult.founderValidation.notes}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Expected Outputs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Expected Outputs</CardTitle>
          </CardHeader>
          <CardContent>
            {skill.outputs.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No outputs defined yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {skill.outputs.map((output) => (
                  <li key={output.name} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-0.5">{output.type}</Badge>
                    <div>
                      <p className="font-medium text-sm">{output.name}</p>
                      <p className="text-xs text-muted-foreground">{output.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
