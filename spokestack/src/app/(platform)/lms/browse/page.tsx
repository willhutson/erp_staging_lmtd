import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Clock,
  Star,
  Users,
  Search,
  Filter,
  ArrowLeft,
  GraduationCap,
  Play,
} from "lucide-react";

export const dynamic = "force-dynamic";

// Mock data for course catalog (sandbox mode)
const MOCK_COURSES = [
  {
    id: "course-1",
    slug: "social-media-fundamentals",
    title: "Social Media Fundamentals",
    description: "Master the basics of social media marketing across all major platforms. Learn content creation, scheduling, and engagement strategies.",
    category: "Marketing",
    skillLevel: "Beginner",
    thumbnailUrl: null,
    instructorName: "Sarah Chen",
    instructorAvatar: null,
    lessonCount: 12,
    moduleCount: 4,
    estimatedDuration: 180, // minutes
    enrollmentCount: 245,
    avgRating: 4.8,
    ratingCount: 89,
    tags: ["Social Media", "Marketing", "Content"],
    isFeatured: true,
    isNew: false,
  },
  {
    id: "course-2",
    slug: "video-production-masterclass",
    title: "Video Production Masterclass",
    description: "From concept to final cut - learn professional video production techniques including filming, editing, color grading, and sound design.",
    category: "Production",
    skillLevel: "Intermediate",
    thumbnailUrl: null,
    instructorName: "Marcus Rodriguez",
    instructorAvatar: null,
    lessonCount: 24,
    moduleCount: 6,
    estimatedDuration: 480,
    enrollmentCount: 156,
    avgRating: 4.9,
    ratingCount: 67,
    tags: ["Video", "Production", "Editing"],
    isFeatured: true,
    isNew: false,
  },
  {
    id: "course-3",
    slug: "client-communication",
    title: "Client Communication Excellence",
    description: "Build stronger client relationships through effective communication. Cover email etiquette, presentation skills, and conflict resolution.",
    category: "Professional Skills",
    skillLevel: "Beginner",
    thumbnailUrl: null,
    instructorName: "Emily Watson",
    instructorAvatar: null,
    lessonCount: 8,
    moduleCount: 3,
    estimatedDuration: 90,
    enrollmentCount: 312,
    avgRating: 4.6,
    ratingCount: 124,
    tags: ["Communication", "Client Relations", "Soft Skills"],
    isFeatured: false,
    isNew: true,
  },
  {
    id: "course-4",
    slug: "paid-media-advertising",
    title: "Paid Media & Advertising",
    description: "Deep dive into paid advertising across Meta, Google, TikTok, and LinkedIn. Learn campaign setup, optimization, and reporting.",
    category: "Marketing",
    skillLevel: "Intermediate",
    thumbnailUrl: null,
    instructorName: "David Park",
    instructorAvatar: null,
    lessonCount: 18,
    moduleCount: 5,
    estimatedDuration: 360,
    enrollmentCount: 198,
    avgRating: 4.7,
    ratingCount: 78,
    tags: ["Paid Media", "Advertising", "Meta", "Google"],
    isFeatured: false,
    isNew: false,
  },
  {
    id: "course-5",
    slug: "brand-strategy-workshop",
    title: "Brand Strategy Workshop",
    description: "Learn to develop comprehensive brand strategies from positioning to visual identity. Includes real-world case studies and exercises.",
    category: "Strategy",
    skillLevel: "Advanced",
    thumbnailUrl: null,
    instructorName: "Alexandra Kim",
    instructorAvatar: null,
    lessonCount: 15,
    moduleCount: 4,
    estimatedDuration: 300,
    enrollmentCount: 87,
    avgRating: 4.9,
    ratingCount: 34,
    tags: ["Branding", "Strategy", "Identity"],
    isFeatured: true,
    isNew: false,
  },
  {
    id: "course-6",
    slug: "analytics-data-insights",
    title: "Analytics & Data Insights",
    description: "Turn data into actionable insights. Master Google Analytics, social media analytics, and create compelling data visualizations.",
    category: "Analytics",
    skillLevel: "Intermediate",
    thumbnailUrl: null,
    instructorName: "James Liu",
    instructorAvatar: null,
    lessonCount: 14,
    moduleCount: 4,
    estimatedDuration: 240,
    enrollmentCount: 167,
    avgRating: 4.5,
    ratingCount: 56,
    tags: ["Analytics", "Data", "Reporting"],
    isFeatured: false,
    isNew: true,
  },
  {
    id: "course-7",
    slug: "copywriting-essentials",
    title: "Copywriting Essentials",
    description: "Write compelling copy that converts. From headlines to CTAs, learn the art and science of persuasive writing for digital channels.",
    category: "Creative",
    skillLevel: "Beginner",
    thumbnailUrl: null,
    instructorName: "Rachel Green",
    instructorAvatar: null,
    lessonCount: 10,
    moduleCount: 3,
    estimatedDuration: 150,
    enrollmentCount: 289,
    avgRating: 4.7,
    ratingCount: 112,
    tags: ["Copywriting", "Content", "Creative"],
    isFeatured: false,
    isNew: false,
  },
  {
    id: "course-8",
    slug: "project-management-agile",
    title: "Agile Project Management",
    description: "Master agile methodologies for creative projects. Learn Scrum, Kanban, and how to adapt agile for agency workflows.",
    category: "Professional Skills",
    skillLevel: "Intermediate",
    thumbnailUrl: null,
    instructorName: "Michael Torres",
    instructorAvatar: null,
    lessonCount: 12,
    moduleCount: 4,
    estimatedDuration: 200,
    enrollmentCount: 134,
    avgRating: 4.6,
    ratingCount: 45,
    tags: ["Project Management", "Agile", "Scrum"],
    isFeatured: false,
    isNew: false,
  },
];

const CATEGORIES = [
  { name: "All", count: 8 },
  { name: "Marketing", count: 2 },
  { name: "Production", count: 1 },
  { name: "Professional Skills", count: 2 },
  { name: "Strategy", count: 1 },
  { name: "Analytics", count: 1 },
  { name: "Creative", count: 1 },
];

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export default async function BrowseCoursesPage() {
  const user = await getStudioUser();

  const featuredCourses = MOCK_COURSES.filter((c) => c.isFeatured);
  const newCourses = MOCK_COURSES.filter((c) => c.isNew);

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/lms">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground mt-1">
            Browse and enroll in courses to develop your skills
          </p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map((category) => (
          <Badge
            key={category.name}
            variant={category.name === "All" ? "default" : "outline"}
            className="cursor-pointer hover:bg-primary/10"
          >
            {category.name}
            <span className="ml-1 text-xs opacity-70">({category.count})</span>
          </Badge>
        ))}
      </div>

      {/* Featured Courses */}
      {featuredCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Featured Courses
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} course={course} featured />
            ))}
          </div>
        </div>
      )}

      {/* New Courses */}
      {newCourses.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-500" />
            New Courses
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {newCourses.map((course) => (
              <CourseCard key={course.id} course={course} isNew />
            ))}
          </div>
        </div>
      )}

      {/* All Courses */}
      <div>
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          All Courses
        </h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MOCK_COURSES.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>

      {/* Sandbox Notice */}
      <div className="text-center py-4 text-sm text-muted-foreground border-t">
        <Badge variant="outline" className="mb-2">Sandbox Mode</Badge>
        <p>Showing demo course catalog. Connect to database for live data.</p>
      </div>
    </div>
  );
}

function CourseCard({
  course,
  featured,
  isNew,
}: {
  course: typeof MOCK_COURSES[0];
  featured?: boolean;
  isNew?: boolean;
}) {
  return (
    <Link
      href={`/lms/browse/${course.slug}`}
      className="group block border rounded-lg overflow-hidden hover:border-primary hover:shadow-md transition-all"
    >
      <div className="aspect-video bg-muted relative">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookOpen className="h-10 w-10 text-primary/40" />
          </div>
        )}
        <div className="absolute top-2 left-2 flex gap-1">
          {featured && (
            <Badge className="bg-yellow-500 text-white text-xs">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-green-500 text-white text-xs">New</Badge>
          )}
        </div>
        <Badge
          variant="secondary"
          className="absolute top-2 right-2 text-xs"
        >
          {course.skillLevel}
        </Badge>
        <div className="absolute bottom-2 left-2">
          <Badge variant="secondary" className="text-xs bg-background/80">
            {course.category}
          </Badge>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
          {course.description}
        </p>

        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <GraduationCap className="h-3 w-3" />
            {course.instructorName}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3 w-3" />
              {course.lessonCount} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(course.estimatedDuration)}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
            <span className="text-xs font-medium">{course.avgRating}</span>
            <span className="text-xs text-muted-foreground">({course.ratingCount})</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <Users className="h-3 w-3 text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            {course.enrollmentCount} enrolled
          </span>
        </div>
      </div>
    </Link>
  );
}
