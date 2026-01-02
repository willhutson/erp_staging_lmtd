"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Plus,
  GripVertical,
  Trash2,
  ClipboardList,
  Vote,
  HelpCircle,
  Wand2,
  Loader2,
  Save,
  Eye,
  AlignLeft,
  ListOrdered,
  CheckSquare,
  Star,
  Gauge,
  ToggleLeft,
  Calendar,
  Upload,
  Type,
} from "lucide-react";

type QuestionType =
  | "SHORT_TEXT"
  | "LONG_TEXT"
  | "SINGLE_CHOICE"
  | "MULTIPLE_CHOICE"
  | "RATING_SCALE"
  | "NPS"
  | "STAR_RATING"
  | "YES_NO"
  | "DATE"
  | "FILE_UPLOAD";

type BuilderMode = "survey" | "poll" | "quiz";

interface Question {
  id: string;
  type: QuestionType;
  text: string;
  required: boolean;
  options?: string[];
  correctAnswer?: string | string[];
  points?: number;
}

const QUESTION_TYPES: { value: QuestionType; label: string; icon: React.ReactNode }[] = [
  { value: "SHORT_TEXT", label: "Short Text", icon: <Type className="h-4 w-4" /> },
  { value: "LONG_TEXT", label: "Long Text", icon: <AlignLeft className="h-4 w-4" /> },
  { value: "SINGLE_CHOICE", label: "Single Choice", icon: <ListOrdered className="h-4 w-4" /> },
  { value: "MULTIPLE_CHOICE", label: "Multiple Choice", icon: <CheckSquare className="h-4 w-4" /> },
  { value: "RATING_SCALE", label: "Rating Scale", icon: <Gauge className="h-4 w-4" /> },
  { value: "NPS", label: "NPS (0-10)", icon: <Gauge className="h-4 w-4" /> },
  { value: "STAR_RATING", label: "Star Rating", icon: <Star className="h-4 w-4" /> },
  { value: "YES_NO", label: "Yes/No", icon: <ToggleLeft className="h-4 w-4" /> },
  { value: "DATE", label: "Date", icon: <Calendar className="h-4 w-4" /> },
  { value: "FILE_UPLOAD", label: "File Upload", icon: <Upload className="h-4 w-4" /> },
];

export default function SurveyBuilderPage() {
  const [mode, setMode] = useState<BuilderMode>("survey");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const getModeConfig = () => {
    switch (mode) {
      case "survey":
        return {
          title: "Survey Builder",
          description: "Create surveys to collect feedback and insights",
          icon: <ClipboardList className="h-5 w-5" />,
          color: "text-emerald-600",
          aiPlaceholder: "e.g., Customer satisfaction after project delivery, Employee engagement survey...",
        };
      case "poll":
        return {
          title: "Poll Builder",
          description: "Create quick polls for fast decision-making",
          icon: <Vote className="h-5 w-5" />,
          color: "text-blue-600",
          aiPlaceholder: "e.g., Best time for team meetings, Preferred project management tool...",
        };
      case "quiz":
        return {
          title: "Quiz Builder",
          description: "Create quizzes to test knowledge and skills",
          icon: <HelpCircle className="h-5 w-5" />,
          color: "text-purple-600",
          aiPlaceholder: "e.g., Brand guidelines knowledge check, Onboarding quiz for new hires...",
        };
    }
  };

  const config = getModeConfig();

  const addQuestion = (type: QuestionType = "SHORT_TEXT") => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      text: "",
      required: true,
      options: type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE"
        ? ["Option 1", "Option 2", "Option 3"]
        : undefined,
      points: mode === "quiz" ? 10 : undefined,
    };
    setQuestions([...questions, newQuestion]);
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, ...updates } : q
    ));
  };

  const deleteQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: [...q.options, `Option ${q.options.length + 1}`] };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, index: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[index] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const deleteOption = (questionId: string, index: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: q.options.filter((_, i) => i !== index) };
      }
      return q;
    }));
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    let generatedQuestions: Question[] = [];

    if (mode === "survey") {
      generatedQuestions = [
        {
          id: `q-${Date.now()}-1`,
          type: "RATING_SCALE",
          text: "How satisfied are you with our service overall?",
          required: true,
        },
        {
          id: `q-${Date.now()}-2`,
          type: "SINGLE_CHOICE",
          text: "How likely are you to recommend us to a colleague?",
          required: true,
          options: ["Very likely", "Likely", "Neutral", "Unlikely", "Very unlikely"],
        },
        {
          id: `q-${Date.now()}-3`,
          type: "MULTIPLE_CHOICE",
          text: "Which aspects of our service did you find most valuable?",
          required: false,
          options: ["Quality of work", "Communication", "Timeliness", "Creativity", "Value for money"],
        },
        {
          id: `q-${Date.now()}-4`,
          type: "LONG_TEXT",
          text: "What could we improve to serve you better?",
          required: false,
        },
        {
          id: `q-${Date.now()}-5`,
          type: "NPS",
          text: "On a scale of 0-10, how likely are you to recommend us?",
          required: true,
        },
      ];
      setTitle(`${aiPrompt} Survey`);
      setDescription(`Gather feedback about ${aiPrompt.toLowerCase()}`);
    } else if (mode === "poll") {
      generatedQuestions = [
        {
          id: `q-${Date.now()}-1`,
          type: "SINGLE_CHOICE",
          text: `What is your preference for ${aiPrompt.toLowerCase()}?`,
          required: true,
          options: ["Option A", "Option B", "Option C", "No preference"],
        },
      ];
      setTitle(`${aiPrompt} Poll`);
      setDescription(`Quick poll to gather team preferences`);
    } else if (mode === "quiz") {
      generatedQuestions = [
        {
          id: `q-${Date.now()}-1`,
          type: "SINGLE_CHOICE",
          text: `What is the primary purpose of ${aiPrompt.toLowerCase()}?`,
          required: true,
          options: ["Answer A", "Answer B (Correct)", "Answer C", "Answer D"],
          correctAnswer: "Answer B (Correct)",
          points: 10,
        },
        {
          id: `q-${Date.now()}-2`,
          type: "MULTIPLE_CHOICE",
          text: "Which of the following are best practices? (Select all that apply)",
          required: true,
          options: ["Practice 1 (Correct)", "Practice 2 (Correct)", "Practice 3", "Practice 4 (Correct)"],
          correctAnswer: ["Practice 1 (Correct)", "Practice 2 (Correct)", "Practice 4 (Correct)"],
          points: 15,
        },
        {
          id: `q-${Date.now()}-3`,
          type: "YES_NO",
          text: "True or False: This is a key concept.",
          required: true,
          correctAnswer: "Yes",
          points: 5,
        },
      ];
      setTitle(`${aiPrompt} Quiz`);
      setDescription(`Test your knowledge of ${aiPrompt.toLowerCase()}`);
    }

    setQuestions(generatedQuestions);
    setIsGenerating(false);
  };

  const getQuestionIcon = (type: QuestionType) => {
    const found = QUESTION_TYPES.find(qt => qt.value === type);
    return found?.icon || <Type className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <span className={config.color}>{config.icon}</span>
            {config.title}
          </h1>
          <p className="text-muted-foreground">{config.description}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </Button>
        </div>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as BuilderMode)}>
        <TabsList>
          <TabsTrigger value="survey" className="gap-2">
            <ClipboardList className="h-4 w-4" />
            Survey
          </TabsTrigger>
          <TabsTrigger value="poll" className="gap-2">
            <Vote className="h-4 w-4" />
            Poll
          </TabsTrigger>
          <TabsTrigger value="quiz" className="gap-2">
            <HelpCircle className="h-4 w-4" />
            Quiz
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* AI Generator */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI {mode.charAt(0).toUpperCase() + mode.slice(1)} Generator
          </CardTitle>
          <CardDescription>
            Describe your {mode} topic and AI will generate questions for you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder={config.aiPlaceholder}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              className="flex-1"
            />
            <Button onClick={generateWithAI} disabled={isGenerating || !aiPrompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate Questions
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Questions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{mode.charAt(0).toUpperCase() + mode.slice(1)} Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder={`Enter ${mode} title`}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the purpose of this survey"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Questions</CardTitle>
              <Select onValueChange={(v) => addQuestion(v as QuestionType)}>
                <SelectTrigger className="w-40">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Question
                </SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((qt) => (
                    <SelectItem key={qt.value} value={qt.value}>
                      <div className="flex items-center gap-2">
                        {qt.icon}
                        {qt.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ClipboardList className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No questions yet</p>
                  <p className="text-sm">Add questions manually or use AI to generate them</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {questions.map((question, index) => (
                    <div key={question.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-5 w-5 text-muted-foreground mt-2" />
                        <Badge variant="outline" className="mt-1">Q{index + 1}</Badge>
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                              {getQuestionIcon(question.type)}
                            </span>
                            <Input
                              value={question.text}
                              onChange={(e) => updateQuestion(question.id, { text: e.target.value })}
                              placeholder="Enter your question"
                              className="flex-1"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteQuestion(question.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Options for choice questions */}
                          {(question.type === "SINGLE_CHOICE" || question.type === "MULTIPLE_CHOICE") && question.options && (
                            <div className="pl-6 space-y-2">
                              {question.options.map((option, optIndex) => (
                                <div key={optIndex} className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground w-4">
                                    {question.type === "SINGLE_CHOICE" ? "○" : "☐"}
                                  </span>
                                  <Input
                                    value={option}
                                    onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                                    className="flex-1 h-8"
                                  />
                                  {mode === "quiz" && (
                                    <Button
                                      variant={question.correctAnswer === option ||
                                        (Array.isArray(question.correctAnswer) && question.correctAnswer.includes(option))
                                        ? "default" : "outline"}
                                      size="sm"
                                      className="h-8 text-xs"
                                      onClick={() => {
                                        if (question.type === "SINGLE_CHOICE") {
                                          updateQuestion(question.id, { correctAnswer: option });
                                        } else {
                                          const current = (question.correctAnswer as string[]) || [];
                                          const updated = current.includes(option)
                                            ? current.filter(a => a !== option)
                                            : [...current, option];
                                          updateQuestion(question.id, { correctAnswer: updated });
                                        }
                                      }}
                                    >
                                      Correct
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => deleteOption(question.id, optIndex)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => addOption(question.id)}
                              >
                                <Plus className="mr-2 h-3 w-3" />
                                Add Option
                              </Button>
                            </div>
                          )}

                          <div className="flex items-center gap-4 pl-6">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={question.required}
                                onCheckedChange={(checked) =>
                                  updateQuestion(question.id, { required: checked })
                                }
                              />
                              <Label className="text-sm">Required</Label>
                            </div>
                            {mode === "quiz" && (
                              <div className="flex items-center gap-2">
                                <Label className="text-sm">Points:</Label>
                                <Input
                                  type="number"
                                  value={question.points || 0}
                                  onChange={(e) =>
                                    updateQuestion(question.id, { points: parseInt(e.target.value) || 0 })
                                  }
                                  className="w-20 h-8"
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Questions</span>
                <span className="font-medium">{questions.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required</span>
                <span className="font-medium">
                  {questions.filter(q => q.required).length}
                </span>
              </div>
              {mode === "quiz" && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Points</span>
                  <span className="font-medium">
                    {questions.reduce((sum, q) => sum + (q.points || 0), 0)}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Wand2 className="mr-2 h-4 w-4" />
                Improve question wording
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Wand2 className="mr-2 h-4 w-4" />
                Add follow-up questions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Wand2 className="mr-2 h-4 w-4" />
                Suggest answer options
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm">Show progress bar</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Allow back navigation</Label>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-sm">Shuffle questions</Label>
                <Switch />
              </div>
              {mode === "quiz" && (
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Show correct answers</Label>
                  <Switch defaultChecked />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
