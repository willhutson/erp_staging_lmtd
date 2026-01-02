"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronRight,
  Wand2,
  Loader2,
  Save,
  Eye,
} from "lucide-react";

interface Lesson {
  id: string;
  title: string;
  type: "VIDEO" | "ARTICLE" | "DOCUMENT" | "QUIZ";
  duration?: number;
  content?: string;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  isExpanded: boolean;
}

export default function CourseBuilderPage() {
  const [courseTitle, setCourseTitle] = useState("");
  const [courseDescription, setCourseDescription] = useState("");
  const [modules, setModules] = useState<Module[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");

  const addModule = () => {
    const newModule: Module = {
      id: `module-${Date.now()}`,
      title: `Module ${modules.length + 1}`,
      description: "",
      lessons: [],
      isExpanded: true,
    };
    setModules([...modules, newModule]);
  };

  const addLesson = (moduleId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: [...m.lessons, {
            id: `lesson-${Date.now()}`,
            title: `Lesson ${m.lessons.length + 1}`,
            type: "VIDEO" as const,
          }],
        };
      }
      return m;
    }));
  };

  const toggleModule = (moduleId: string) => {
    setModules(modules.map(m =>
      m.id === moduleId ? { ...m, isExpanded: !m.isExpanded } : m
    ));
  };

  const deleteModule = (moduleId: string) => {
    setModules(modules.filter(m => m.id !== moduleId));
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
    setModules(modules.map(m => {
      if (m.id === moduleId) {
        return { ...m, lessons: m.lessons.filter(l => l.id !== lessonId) };
      }
      return m;
    }));
  };

  const generateWithAI = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);

    // Simulate AI generation - in production this would call an AI endpoint
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Demo: Generate a sample curriculum based on the prompt
    const generatedModules: Module[] = [
      {
        id: `module-${Date.now()}-1`,
        title: "Introduction & Fundamentals",
        description: `Getting started with ${aiPrompt}`,
        isExpanded: true,
        lessons: [
          { id: `lesson-${Date.now()}-1`, title: "Welcome & Course Overview", type: "VIDEO", duration: 5 },
          { id: `lesson-${Date.now()}-2`, title: "Key Concepts & Terminology", type: "ARTICLE" },
          { id: `lesson-${Date.now()}-3`, title: "Knowledge Check", type: "QUIZ" },
        ],
      },
      {
        id: `module-${Date.now()}-2`,
        title: "Core Skills & Techniques",
        description: "Building practical expertise",
        isExpanded: true,
        lessons: [
          { id: `lesson-${Date.now()}-4`, title: "Essential Techniques", type: "VIDEO", duration: 15 },
          { id: `lesson-${Date.now()}-5`, title: "Best Practices Guide", type: "DOCUMENT" },
          { id: `lesson-${Date.now()}-6`, title: "Hands-on Exercise", type: "ARTICLE" },
          { id: `lesson-${Date.now()}-7`, title: "Skills Assessment", type: "QUIZ" },
        ],
      },
      {
        id: `module-${Date.now()}-3`,
        title: "Advanced Topics",
        description: "Taking your skills to the next level",
        isExpanded: true,
        lessons: [
          { id: `lesson-${Date.now()}-8`, title: "Advanced Strategies", type: "VIDEO", duration: 20 },
          { id: `lesson-${Date.now()}-9`, title: "Case Studies", type: "ARTICLE" },
          { id: `lesson-${Date.now()}-10`, title: "Final Assessment", type: "QUIZ" },
        ],
      },
    ];

    setCourseTitle(`Mastering ${aiPrompt}`);
    setCourseDescription(`A comprehensive course covering all aspects of ${aiPrompt}, from fundamentals to advanced techniques.`);
    setModules(generatedModules);
    setIsGenerating(false);
  };

  const getLessonIcon = (type: Lesson["type"]) => {
    switch (type) {
      case "VIDEO": return <Video className="h-4 w-4" />;
      case "ARTICLE": return <FileText className="h-4 w-4" />;
      case "DOCUMENT": return <BookOpen className="h-4 w-4" />;
      case "QUIZ": return <HelpCircle className="h-4 w-4" />;
    }
  };

  const getLessonColor = (type: Lesson["type"]) => {
    switch (type) {
      case "VIDEO": return "bg-red-100 text-red-700";
      case "ARTICLE": return "bg-blue-100 text-blue-700";
      case "DOCUMENT": return "bg-amber-100 text-amber-700";
      case "QUIZ": return "bg-purple-100 text-purple-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Course Builder</h1>
          <p className="text-muted-foreground">
            Create courses with AI-powered curriculum generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Course
          </Button>
        </div>
      </div>

      {/* AI Generator */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Course Generator
          </CardTitle>
          <CardDescription>
            Describe what you want to teach and AI will generate a complete curriculum
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              placeholder="e.g., Social Media Marketing for Beginners, Advanced Excel Skills, Client Communication..."
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
                  Generate Curriculum
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        {/* Course Structure */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Course Title</Label>
                <Input
                  id="title"
                  placeholder="Enter course title"
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What will students learn?"
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                      <SelectItem value="soft-skills">Soft Skills</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Skill Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Curriculum</CardTitle>
              <Button onClick={addModule} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Module
              </Button>
            </CardHeader>
            <CardContent>
              {modules.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <BookOpen className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No modules yet</p>
                  <p className="text-sm">Add modules manually or use AI to generate a curriculum</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {modules.map((module, moduleIndex) => (
                    <div key={module.id} className="border rounded-lg">
                      {/* Module Header */}
                      <div
                        className="flex items-center gap-2 p-3 bg-muted/50 cursor-pointer hover:bg-muted"
                        onClick={() => toggleModule(module.id)}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {module.isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Badge variant="outline" className="text-xs">
                          Module {moduleIndex + 1}
                        </Badge>
                        <Input
                          value={module.title}
                          onChange={(e) => {
                            e.stopPropagation();
                            setModules(modules.map(m =>
                              m.id === module.id ? { ...m, title: e.target.value } : m
                            ));
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex-1 h-8 bg-transparent border-0 focus-visible:ring-1"
                        />
                        <span className="text-xs text-muted-foreground">
                          {module.lessons.length} lessons
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteModule(module.id);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Lessons */}
                      {module.isExpanded && (
                        <div className="p-3 space-y-2">
                          {module.lessons.map((lesson, lessonIndex) => (
                            <div
                              key={lesson.id}
                              className="flex items-center gap-2 p-2 rounded-md bg-background border"
                            >
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground w-6">
                                {moduleIndex + 1}.{lessonIndex + 1}
                              </span>
                              <Badge className={`text-xs ${getLessonColor(lesson.type)}`}>
                                {getLessonIcon(lesson.type)}
                              </Badge>
                              <Input
                                value={lesson.title}
                                onChange={(e) => {
                                  setModules(modules.map(m => {
                                    if (m.id === module.id) {
                                      return {
                                        ...m,
                                        lessons: m.lessons.map(l =>
                                          l.id === lesson.id ? { ...l, title: e.target.value } : l
                                        ),
                                      };
                                    }
                                    return m;
                                  }));
                                }}
                                className="flex-1 h-8"
                              />
                              <Select
                                value={lesson.type}
                                onValueChange={(value: Lesson["type"]) => {
                                  setModules(modules.map(m => {
                                    if (m.id === module.id) {
                                      return {
                                        ...m,
                                        lessons: m.lessons.map(l =>
                                          l.id === lesson.id ? { ...l, type: value } : l
                                        ),
                                      };
                                    }
                                    return m;
                                  }));
                                }}
                              >
                                <SelectTrigger className="w-28 h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="VIDEO">Video</SelectItem>
                                  <SelectItem value="ARTICLE">Article</SelectItem>
                                  <SelectItem value="DOCUMENT">Document</SelectItem>
                                  <SelectItem value="QUIZ">Quiz</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => deleteLesson(module.id, lesson.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => addLesson(module.id)}
                          >
                            <Plus className="mr-2 h-4 w-4" />
                            Add Lesson
                          </Button>
                        </div>
                      )}
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
              <CardTitle className="text-base">Course Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Modules</span>
                <span className="font-medium">{modules.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Lessons</span>
                <span className="font-medium">
                  {modules.reduce((sum, m) => sum + m.lessons.length, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Videos</span>
                <span className="font-medium">
                  {modules.reduce((sum, m) =>
                    sum + m.lessons.filter(l => l.type === "VIDEO").length, 0
                  )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quizzes</span>
                <span className="font-medium">
                  {modules.reduce((sum, m) =>
                    sum + m.lessons.filter(l => l.type === "QUIZ").length, 0
                  )}
                </span>
              </div>
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
                Generate quiz questions
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Wand2 className="mr-2 h-4 w-4" />
                Suggest lesson content
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start">
                <Wand2 className="mr-2 h-4 w-4" />
                Create learning objectives
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
