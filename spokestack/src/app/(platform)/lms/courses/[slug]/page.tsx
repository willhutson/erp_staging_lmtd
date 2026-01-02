import { getStudioUser } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  Star,
  Users,
  ArrowLeft,
  Edit,
  Settings,
  BarChart2,
  Play,
  FileText,
  CheckCircle,
  Circle,
  GraduationCap,
  Plus,
  Trash2,
  GripVertical,
  Eye,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Mock course data for sandbox mode
const MOCK_COURSES: Record<string, {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  skillLevel: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl: string | null;
  instructorName: string;
  estimatedDuration: number;
  enrollmentCount: number;
  completionCount: number;
  avgRating: number | null;
  ratingCount: number;
  modules: {
    id: string;
    title: string;
    order: number;
    lessons: {
      id: string;
      title: string;
      type: "VIDEO" | "TEXT" | "QUIZ" | "ASSIGNMENT";
      duration: number;
      order: number;
    }[];
  }[];
  createdAt: string;
  updatedAt: string;
}> = {
  "course-brand-guidelines": {
    id: "course-brand-guidelines",
    slug: "course-brand-guidelines",
    title: "Brand Guidelines Mastery",
    description: "Learn to create, implement, and maintain comprehensive brand guidelines that ensure consistency across all touchpoints.",
    category: "Strategy",
    skillLevel: "Intermediate",
    status: "PUBLISHED",
    thumbnailUrl: null,
    instructorName: "Alexandra Kim",
    estimatedDuration: 240,
    enrollmentCount: 67,
    completionCount: 45,
    avgRating: 4.8,
    ratingCount: 32,
    modules: [
      {
        id: "mod-1",
        title: "Introduction to Brand Guidelines",
        order: 1,
        lessons: [
          { id: "les-1", title: "What Are Brand Guidelines?", type: "VIDEO", duration: 12, order: 1 },
          { id: "les-2", title: "Why Guidelines Matter", type: "TEXT", duration: 8, order: 2 },
          { id: "les-3", title: "Module 1 Quiz", type: "QUIZ", duration: 10, order: 3 },
        ],
      },
      {
        id: "mod-2",
        title: "Visual Identity Elements",
        order: 2,
        lessons: [
          { id: "les-4", title: "Logo Usage & Clear Space", type: "VIDEO", duration: 15, order: 1 },
          { id: "les-5", title: "Color Palette Systems", type: "VIDEO", duration: 18, order: 2 },
          { id: "les-6", title: "Typography Guidelines", type: "VIDEO", duration: 14, order: 3 },
          { id: "les-7", title: "Create a Style Tile", type: "ASSIGNMENT", duration: 30, order: 4 },
        ],
      },
      {
        id: "mod-3",
        title: "Voice & Tone",
        order: 3,
        lessons: [
          { id: "les-8", title: "Defining Brand Voice", type: "VIDEO", duration: 16, order: 1 },
          { id: "les-9", title: "Tone Variations by Context", type: "TEXT", duration: 12, order: 2 },
          { id: "les-10", title: "Writing Samples Exercise", type: "ASSIGNMENT", duration: 25, order: 3 },
        ],
      },
      {
        id: "mod-4",
        title: "Implementation & Rollout",
        order: 4,
        lessons: [
          { id: "les-11", title: "Training Teams", type: "VIDEO", duration: 20, order: 1 },
          { id: "les-12", title: "Monitoring Compliance", type: "VIDEO", duration: 15, order: 2 },
          { id: "les-13", title: "Final Assessment", type: "QUIZ", duration: 20, order: 3 },
        ],
      },
    ],
    createdAt: "2024-11-15T10:00:00Z",
    updatedAt: "2025-01-02T08:30:00Z",
  },
  "course-video-production": {
    id: "course-video-production",
    slug: "course-video-production",
    title: "Video Production Masterclass",
    description: "From concept to final cut - learn professional video production techniques including filming, editing, color grading, and sound design.",
    category: "Production",
    skillLevel: "Intermediate",
    status: "PUBLISHED",
    thumbnailUrl: null,
    instructorName: "Marcus Rodriguez",
    estimatedDuration: 480,
    enrollmentCount: 156,
    completionCount: 89,
    avgRating: 4.9,
    ratingCount: 67,
    modules: [
      {
        id: "mod-1",
        title: "Pre-Production Planning",
        order: 1,
        lessons: [
          { id: "les-1", title: "Concept Development", type: "VIDEO", duration: 20, order: 1 },
          { id: "les-2", title: "Scripting & Storyboarding", type: "VIDEO", duration: 25, order: 2 },
          { id: "les-3", title: "Production Planning Checklist", type: "TEXT", duration: 10, order: 3 },
        ],
      },
      {
        id: "mod-2",
        title: "Camera & Lighting",
        order: 2,
        lessons: [
          { id: "les-4", title: "Camera Settings Deep Dive", type: "VIDEO", duration: 30, order: 1 },
          { id: "les-5", title: "Three-Point Lighting", type: "VIDEO", duration: 25, order: 2 },
          { id: "les-6", title: "Natural Light Techniques", type: "VIDEO", duration: 20, order: 3 },
          { id: "les-7", title: "Lighting Setup Exercise", type: "ASSIGNMENT", duration: 45, order: 4 },
        ],
      },
      {
        id: "mod-3",
        title: "Audio Recording",
        order: 3,
        lessons: [
          { id: "les-8", title: "Microphone Types & Placement", type: "VIDEO", duration: 22, order: 1 },
          { id: "les-9", title: "Recording Clean Audio", type: "VIDEO", duration: 18, order: 2 },
          { id: "les-10", title: "Audio Quiz", type: "QUIZ", duration: 10, order: 3 },
        ],
      },
      {
        id: "mod-4",
        title: "Editing Fundamentals",
        order: 4,
        lessons: [
          { id: "les-11", title: "Premiere Pro Workspace", type: "VIDEO", duration: 25, order: 1 },
          { id: "les-12", title: "Cutting Techniques", type: "VIDEO", duration: 30, order: 2 },
          { id: "les-13", title: "Transitions & Effects", type: "VIDEO", duration: 28, order: 3 },
        ],
      },
      {
        id: "mod-5",
        title: "Color & Sound",
        order: 5,
        lessons: [
          { id: "les-14", title: "Color Correction Basics", type: "VIDEO", duration: 35, order: 1 },
          { id: "les-15", title: "Color Grading for Mood", type: "VIDEO", duration: 30, order: 2 },
          { id: "les-16", title: "Audio Mixing & Mastering", type: "VIDEO", duration: 25, order: 3 },
        ],
      },
      {
        id: "mod-6",
        title: "Final Project",
        order: 6,
        lessons: [
          { id: "les-17", title: "Project Brief", type: "TEXT", duration: 10, order: 1 },
          { id: "les-18", title: "Create Your Short Film", type: "ASSIGNMENT", duration: 120, order: 2 },
          { id: "les-19", title: "Final Assessment", type: "QUIZ", duration: 20, order: 3 },
        ],
      },
    ],
    createdAt: "2024-10-01T10:00:00Z",
    updatedAt: "2025-01-01T14:00:00Z",
  },
  "course-analytics": {
    id: "course-analytics",
    slug: "course-analytics",
    title: "Analytics & Data Insights",
    description: "Turn data into actionable insights. Master Google Analytics, social media analytics, and create compelling data visualizations.",
    category: "Analytics",
    skillLevel: "Intermediate",
    status: "DRAFT",
    thumbnailUrl: null,
    instructorName: "James Liu",
    estimatedDuration: 240,
    enrollmentCount: 0,
    completionCount: 0,
    avgRating: null,
    ratingCount: 0,
    modules: [
      {
        id: "mod-1",
        title: "Analytics Fundamentals",
        order: 1,
        lessons: [
          { id: "les-1", title: "Why Analytics Matters", type: "VIDEO", duration: 15, order: 1 },
          { id: "les-2", title: "Key Metrics Overview", type: "TEXT", duration: 10, order: 2 },
        ],
      },
      {
        id: "mod-2",
        title: "Google Analytics 4",
        order: 2,
        lessons: [
          { id: "les-3", title: "GA4 Interface Tour", type: "VIDEO", duration: 20, order: 1 },
          { id: "les-4", title: "Setting Up Events", type: "VIDEO", duration: 25, order: 2 },
          { id: "les-5", title: "Creating Reports", type: "VIDEO", duration: 22, order: 3 },
        ],
      },
      {
        id: "mod-3",
        title: "Social Analytics",
        order: 3,
        lessons: [
          { id: "les-6", title: "Platform-Specific Metrics", type: "VIDEO", duration: 18, order: 1 },
          { id: "les-7", title: "Benchmarking Performance", type: "VIDEO", duration: 16, order: 2 },
        ],
      },
      {
        id: "mod-4",
        title: "Data Visualization",
        order: 4,
        lessons: [
          { id: "les-8", title: "Choosing the Right Charts", type: "VIDEO", duration: 20, order: 1 },
          { id: "les-9", title: "Building Dashboards", type: "VIDEO", duration: 25, order: 2 },
          { id: "les-10", title: "Create a Dashboard", type: "ASSIGNMENT", duration: 45, order: 3 },
        ],
      },
    ],
    createdAt: "2024-12-20T10:00:00Z",
    updatedAt: "2025-01-02T16:00:00Z",
  },
};

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function getLessonIcon(type: string) {
  switch (type) {
    case "VIDEO":
      return <Play className="h-4 w-4" />;
    case "TEXT":
      return <FileText className="h-4 w-4" />;
    case "QUIZ":
      return <CheckCircle className="h-4 w-4" />;
    case "ASSIGNMENT":
      return <Edit className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getStudioUser();
  const { slug } = await params;

  // Check admin access
  const isAdmin = ["ADMIN", "LEADERSHIP"].includes(user.permissionLevel);
  if (!isAdmin) {
    redirect("/lms");
  }

  // Get course from mock data (sandbox mode)
  const course = MOCK_COURSES[slug];

  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completionRate = course.enrollmentCount > 0
    ? Math.round((course.completionCount / course.enrollmentCount) * 100)
    : 0;

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/lms/courses">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{course.title}</h1>
              <Badge
                variant={course.status === "PUBLISHED" ? "default" : "secondary"}
                className={course.status === "PUBLISHED" ? "bg-green-500" : ""}
              >
                {course.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{course.description}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/lms/browse/${course.slug}`}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Link>
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Edit className="h-4 w-4 mr-2" />
            Edit Course
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Modules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.modules.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lessons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLessons}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(course.estimatedDuration)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Enrolled</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{course.enrollmentCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completionRate}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="content" className="space-y-4">
        <TabsList>
          <TabsTrigger value="content">Course Content</TabsTrigger>
          <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-4">
          {/* Modules */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Course Modules</h2>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Module
            </Button>
          </div>

          <div className="space-y-4">
            {course.modules.map((module) => (
              <Card key={module.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                      <div>
                        <CardTitle className="text-base">
                          Module {module.order}: {module.title}
                        </CardTitle>
                        <CardDescription>
                          {module.lessons.length} lessons · {formatDuration(module.lessons.reduce((sum, l) => sum + l.duration, 0))}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Add Lesson
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {module.lessons.map((lesson) => (
                      <div
                        key={lesson.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {getLessonIcon(lesson.type)}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{lesson.title}</p>
                            <p className="text-xs text-muted-foreground">
                              {lesson.type} · {lesson.duration}m
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="enrollments">
          <Card>
            <CardHeader>
              <CardTitle>Enrollments</CardTitle>
              <CardDescription>
                {course.enrollmentCount} total enrollments, {course.completionCount} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>Enrollment management coming soon</p>
                <p className="text-sm mt-1">View and manage learner enrollments</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Course Analytics</CardTitle>
              <CardDescription>
                Performance metrics and learner insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>Analytics dashboard coming soon</p>
                <p className="text-sm mt-1">Track completion rates, quiz scores, and engagement</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Course Settings</CardTitle>
              <CardDescription>
                Configure course visibility, access, and requirements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <p className="text-sm text-muted-foreground">{course.category}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Skill Level</label>
                  <p className="text-sm text-muted-foreground">{course.skillLevel}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Instructor</label>
                  <p className="text-sm text-muted-foreground">{course.instructorName}</p>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <p className="text-sm text-muted-foreground">{course.status}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sandbox Notice */}
      <div className="text-center py-4 text-sm text-muted-foreground border-t">
        <Badge variant="outline" className="mb-2">Sandbox Mode</Badge>
        <p>Showing demo course data. Connect to database for live data.</p>
      </div>
    </div>
  );
}
