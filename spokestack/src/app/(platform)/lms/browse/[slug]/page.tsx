import { getStudioUser } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  BookOpen,
  Clock,
  Star,
  Users,
  ArrowLeft,
  Play,
  FileText,
  CheckCircle,
  Circle,
  GraduationCap,
  Award,
  Target,
  Zap,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Mock course data for sandbox mode
const MOCK_COURSES: Record<string, {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDescription: string;
  category: string;
  skillLevel: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  thumbnailUrl: string | null;
  instructorName: string;
  instructorTitle: string;
  instructorBio: string;
  estimatedDuration: number;
  enrollmentCount: number;
  avgRating: number | null;
  ratingCount: number;
  learningOutcomes: string[];
  prerequisites: string[];
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
      isFree: boolean;
    }[];
  }[];
}> = {
  "social-media-fundamentals": {
    id: "course-1",
    slug: "social-media-fundamentals",
    title: "Social Media Fundamentals",
    description: "Master the basics of social media marketing across all major platforms.",
    longDescription: "This comprehensive course covers everything you need to know about social media marketing. From understanding platform algorithms to creating engaging content, you'll learn the strategies that drive real results. Perfect for beginners looking to build a solid foundation in social media marketing.",
    category: "Marketing",
    skillLevel: "Beginner",
    status: "PUBLISHED",
    thumbnailUrl: null,
    instructorName: "Sarah Chen",
    instructorTitle: "Social Media Director",
    instructorBio: "10+ years experience in social media marketing. Previously led social strategy at Fortune 500 companies.",
    estimatedDuration: 180,
    enrollmentCount: 245,
    avgRating: 4.8,
    ratingCount: 89,
    learningOutcomes: [
      "Understand the core principles of social media marketing",
      "Create engaging content for Instagram, TikTok, and LinkedIn",
      "Develop a content calendar and scheduling strategy",
      "Analyze metrics and optimize performance",
      "Build and engage with your community",
    ],
    prerequisites: [
      "No prior experience required",
      "Access to social media accounts for practice",
    ],
    modules: [
      {
        id: "mod-1",
        title: "Introduction to Social Media Marketing",
        order: 1,
        lessons: [
          { id: "les-1", title: "Welcome & Course Overview", type: "VIDEO", duration: 8, order: 1, isFree: true },
          { id: "les-2", title: "The Social Media Landscape", type: "VIDEO", duration: 15, order: 2, isFree: true },
          { id: "les-3", title: "Setting Your Goals", type: "TEXT", duration: 10, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-2",
        title: "Platform Deep Dives",
        order: 2,
        lessons: [
          { id: "les-4", title: "Instagram Strategy", type: "VIDEO", duration: 20, order: 1, isFree: false },
          { id: "les-5", title: "TikTok for Business", type: "VIDEO", duration: 18, order: 2, isFree: false },
          { id: "les-6", title: "LinkedIn B2B Marketing", type: "VIDEO", duration: 16, order: 3, isFree: false },
          { id: "les-7", title: "Platform Quiz", type: "QUIZ", duration: 10, order: 4, isFree: false },
        ],
      },
      {
        id: "mod-3",
        title: "Content Creation",
        order: 3,
        lessons: [
          { id: "les-8", title: "Content Pillars Framework", type: "VIDEO", duration: 14, order: 1, isFree: false },
          { id: "les-9", title: "Writing Captions That Convert", type: "VIDEO", duration: 12, order: 2, isFree: false },
          { id: "les-10", title: "Create Your Content Calendar", type: "ASSIGNMENT", duration: 30, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-4",
        title: "Analytics & Optimization",
        order: 4,
        lessons: [
          { id: "les-11", title: "Key Metrics to Track", type: "VIDEO", duration: 18, order: 1, isFree: false },
          { id: "les-12", title: "Reading Analytics Reports", type: "VIDEO", duration: 15, order: 2, isFree: false },
          { id: "les-13", title: "Final Assessment", type: "QUIZ", duration: 15, order: 3, isFree: false },
        ],
      },
    ],
  },
  "video-production-masterclass": {
    id: "course-2",
    slug: "video-production-masterclass",
    title: "Video Production Masterclass",
    description: "From concept to final cut - learn professional video production.",
    longDescription: "Take your video production skills to the next level with this comprehensive masterclass. Whether you're creating content for social media, corporate videos, or short films, you'll learn the professional techniques used by industry experts. Covers filming, lighting, audio, editing, and color grading.",
    category: "Production",
    skillLevel: "Intermediate",
    status: "PUBLISHED",
    thumbnailUrl: null,
    instructorName: "Marcus Rodriguez",
    instructorTitle: "Senior Video Producer",
    instructorBio: "Award-winning video producer with 15+ years experience. Worked on campaigns for Nike, Apple, and Netflix.",
    estimatedDuration: 480,
    enrollmentCount: 156,
    avgRating: 4.9,
    ratingCount: 67,
    learningOutcomes: [
      "Plan and storyboard professional video projects",
      "Master camera settings, composition, and movement",
      "Set up professional lighting for any environment",
      "Record and mix high-quality audio",
      "Edit videos in Adobe Premiere Pro",
      "Apply color correction and grading techniques",
    ],
    prerequisites: [
      "Basic understanding of video concepts",
      "Access to a camera (DSLR, mirrorless, or smartphone)",
      "Adobe Premiere Pro (free trial available)",
    ],
    modules: [
      {
        id: "mod-1",
        title: "Pre-Production Planning",
        order: 1,
        lessons: [
          { id: "les-1", title: "Course Introduction", type: "VIDEO", duration: 10, order: 1, isFree: true },
          { id: "les-2", title: "Concept Development", type: "VIDEO", duration: 20, order: 2, isFree: true },
          { id: "les-3", title: "Scripting & Storyboarding", type: "VIDEO", duration: 25, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-2",
        title: "Camera Fundamentals",
        order: 2,
        lessons: [
          { id: "les-4", title: "Camera Settings Deep Dive", type: "VIDEO", duration: 30, order: 1, isFree: false },
          { id: "les-5", title: "Composition Rules", type: "VIDEO", duration: 22, order: 2, isFree: false },
          { id: "les-6", title: "Camera Movement", type: "VIDEO", duration: 18, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-3",
        title: "Lighting Techniques",
        order: 3,
        lessons: [
          { id: "les-7", title: "Three-Point Lighting", type: "VIDEO", duration: 25, order: 1, isFree: false },
          { id: "les-8", title: "Natural Light", type: "VIDEO", duration: 20, order: 2, isFree: false },
          { id: "les-9", title: "Lighting Setup Assignment", type: "ASSIGNMENT", duration: 45, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-4",
        title: "Audio Recording",
        order: 4,
        lessons: [
          { id: "les-10", title: "Microphone Types", type: "VIDEO", duration: 22, order: 1, isFree: false },
          { id: "les-11", title: "Recording Techniques", type: "VIDEO", duration: 18, order: 2, isFree: false },
        ],
      },
      {
        id: "mod-5",
        title: "Editing in Premiere Pro",
        order: 5,
        lessons: [
          { id: "les-12", title: "Workspace Tour", type: "VIDEO", duration: 25, order: 1, isFree: false },
          { id: "les-13", title: "Cutting Techniques", type: "VIDEO", duration: 30, order: 2, isFree: false },
          { id: "les-14", title: "Transitions & Effects", type: "VIDEO", duration: 28, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-6",
        title: "Color & Final Delivery",
        order: 6,
        lessons: [
          { id: "les-15", title: "Color Correction", type: "VIDEO", duration: 35, order: 1, isFree: false },
          { id: "les-16", title: "Color Grading", type: "VIDEO", duration: 30, order: 2, isFree: false },
          { id: "les-17", title: "Export Settings", type: "VIDEO", duration: 15, order: 3, isFree: false },
          { id: "les-18", title: "Final Project", type: "ASSIGNMENT", duration: 120, order: 4, isFree: false },
        ],
      },
    ],
  },
  "brand-strategy-workshop": {
    id: "course-5",
    slug: "brand-strategy-workshop",
    title: "Brand Strategy Workshop",
    description: "Develop comprehensive brand strategies from positioning to visual identity.",
    longDescription: "Master the art and science of brand strategy. This workshop-style course takes you through the complete process of developing a brand from scratch or repositioning an existing one. Includes real-world case studies, hands-on exercises, and templates you can use immediately.",
    category: "Strategy",
    skillLevel: "Advanced",
    status: "PUBLISHED",
    thumbnailUrl: null,
    instructorName: "Alexandra Kim",
    instructorTitle: "Brand Strategy Director",
    instructorBio: "Former brand strategist at Interbrand and Landor. Has developed brand strategies for global Fortune 100 companies.",
    estimatedDuration: 300,
    enrollmentCount: 87,
    avgRating: 4.9,
    ratingCount: 34,
    learningOutcomes: [
      "Conduct comprehensive brand audits",
      "Define brand positioning and architecture",
      "Develop brand voice and messaging frameworks",
      "Create brand guidelines and governance documents",
      "Present brand strategy to stakeholders",
    ],
    prerequisites: [
      "3+ years marketing or design experience",
      "Familiarity with brand concepts",
      "Access to a brand project (real or practice)",
    ],
    modules: [
      {
        id: "mod-1",
        title: "Brand Foundations",
        order: 1,
        lessons: [
          { id: "les-1", title: "What Is Brand Strategy?", type: "VIDEO", duration: 15, order: 1, isFree: true },
          { id: "les-2", title: "The Strategy Process", type: "VIDEO", duration: 20, order: 2, isFree: true },
          { id: "les-3", title: "Brand Audit Framework", type: "TEXT", duration: 15, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-2",
        title: "Research & Discovery",
        order: 2,
        lessons: [
          { id: "les-4", title: "Competitive Analysis", type: "VIDEO", duration: 25, order: 1, isFree: false },
          { id: "les-5", title: "Audience Research Methods", type: "VIDEO", duration: 22, order: 2, isFree: false },
          { id: "les-6", title: "Research Synthesis", type: "ASSIGNMENT", duration: 45, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-3",
        title: "Positioning & Architecture",
        order: 3,
        lessons: [
          { id: "les-7", title: "Positioning Statements", type: "VIDEO", duration: 28, order: 1, isFree: false },
          { id: "les-8", title: "Brand Architecture Models", type: "VIDEO", duration: 24, order: 2, isFree: false },
          { id: "les-9", title: "Positioning Exercise", type: "ASSIGNMENT", duration: 40, order: 3, isFree: false },
        ],
      },
      {
        id: "mod-4",
        title: "Expression & Implementation",
        order: 4,
        lessons: [
          { id: "les-10", title: "Visual Identity Systems", type: "VIDEO", duration: 30, order: 1, isFree: false },
          { id: "les-11", title: "Brand Voice Development", type: "VIDEO", duration: 25, order: 2, isFree: false },
          { id: "les-12", title: "Brand Guidelines Creation", type: "VIDEO", duration: 28, order: 3, isFree: false },
          { id: "les-13", title: "Final Brand Strategy Deck", type: "ASSIGNMENT", duration: 90, order: 4, isFree: false },
        ],
      },
    ],
  },
};

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
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
      return <Target className="h-4 w-4" />;
    default:
      return <Circle className="h-4 w-4" />;
  }
}

export default async function CoursePreviewPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const user = await getStudioUser();
  const { slug } = await params;

  // Get course from mock data (sandbox mode)
  const course = MOCK_COURSES[slug];

  if (!course) {
    notFound();
  }

  const totalLessons = course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const freeLessons = course.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.isFree).length,
    0
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-primary/10 to-background">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Button variant="ghost" size="sm" asChild className="mb-4">
            <Link href="/lms/browse">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Catalog
            </Link>
          </Button>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Course Info */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge variant="outline">{course.skillLevel}</Badge>
                </div>
                <h1 className="text-3xl font-bold">{course.title}</h1>
                <p className="text-lg text-muted-foreground mt-2">
                  {course.description}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  <span className="font-medium">{course.avgRating}</span>
                  <span className="text-muted-foreground">
                    ({course.ratingCount} ratings)
                  </span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  {course.enrollmentCount} enrolled
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {formatDuration(course.estimatedDuration)}
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  {totalLessons} lessons
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{course.instructorName}</p>
                  <p className="text-sm text-muted-foreground">{course.instructorTitle}</p>
                </div>
              </div>
            </div>

            {/* Enrollment Card */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-4">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <Play className="h-12 w-12" />
                        <span className="text-sm">Preview available</span>
                      </div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" size="lg">
                    <Zap className="h-4 w-4 mr-2" />
                    Enroll Now
                  </Button>

                  {freeLessons > 0 && (
                    <p className="text-center text-sm text-muted-foreground">
                      {freeLessons} free lessons available
                    </p>
                  )}

                  <Separator />

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span>{course.modules.length} modules, {totalLessons} lessons</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{formatDuration(course.estimatedDuration)} total</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span>Certificate of completion</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-muted-foreground" />
                      <span>Hands-on assignments</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* About */}
        <Card>
          <CardHeader>
            <CardTitle>About This Course</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{course.longDescription}</p>
          </CardContent>
        </Card>

        {/* Learning Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>What You'll Learn</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-3 md:grid-cols-2">
              {course.learningOutcomes.map((outcome, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <span>{outcome}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Prerequisites */}
        <Card>
          <CardHeader>
            <CardTitle>Prerequisites</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {course.prerequisites.map((prereq, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                  <span>{prereq}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Course Curriculum */}
        <Card>
          <CardHeader>
            <CardTitle>Course Curriculum</CardTitle>
            <CardDescription>
              {course.modules.length} modules · {totalLessons} lessons · {formatDuration(course.estimatedDuration)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {course.modules.map((module) => (
              <div key={module.id} className="border rounded-lg">
                <div className="p-4 bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      <h4 className="font-medium">
                        Module {module.order}: {module.title}
                      </h4>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {module.lessons.length} lessons · {formatDuration(module.lessons.reduce((sum, l) => sum + l.duration, 0))}
                    </span>
                  </div>
                </div>
                <div className="divide-y">
                  {module.lessons.map((lesson) => (
                    <div
                      key={lesson.id}
                      className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-muted-foreground">
                          {getLessonIcon(lesson.type)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{lesson.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {lesson.type} · {lesson.duration} min
                          </p>
                        </div>
                      </div>
                      {lesson.isFree && (
                        <Badge variant="secondary" className="text-xs">
                          Free Preview
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Instructor */}
        <Card>
          <CardHeader>
            <CardTitle>Your Instructor</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                <GraduationCap className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">{course.instructorName}</h4>
                <p className="text-sm text-muted-foreground">{course.instructorTitle}</p>
                <p className="mt-2 text-sm">{course.instructorBio}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sandbox Notice */}
        <div className="text-center py-4 text-sm text-muted-foreground border-t">
          <Badge variant="outline" className="mb-2">Sandbox Mode</Badge>
          <p>Showing demo course data. Connect to database for live data.</p>
        </div>
      </div>
    </div>
  );
}
