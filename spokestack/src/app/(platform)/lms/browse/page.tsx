import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BookOpen, Clock, Users, Star, Search, Play, Filter } from "lucide-react";

// Force dynamic rendering
export const dynamic = "force-dynamic";

// Demo course catalog
const COURSES = [
  {
    id: "1",
    title: "Client Communication Mastery",
    description: "Learn effective strategies for managing client relationships and expectations.",
    category: "Professional Skills",
    duration: "2h 30m",
    lessons: 12,
    enrollments: 34,
    rating: 4.8,
    instructor: "CJ Ocampo",
    level: "Beginner",
    featured: true,
  },
  {
    id: "2",
    title: "Advanced Motion Graphics in After Effects",
    description: "Take your motion design skills to the next level with advanced techniques.",
    category: "Creative",
    duration: "4h 15m",
    lessons: 18,
    enrollments: 22,
    rating: 4.9,
    instructor: "Ted Vicencio",
    level: "Advanced",
    featured: true,
  },
  {
    id: "3",
    title: "Arabic Copywriting Fundamentals",
    description: "Essential techniques for writing compelling Arabic marketing copy.",
    category: "Copy",
    duration: "3h 00m",
    lessons: 15,
    enrollments: 18,
    rating: 4.7,
    instructor: "Nadia Al-Farsi",
    level: "Intermediate",
    featured: false,
  },
  {
    id: "4",
    title: "Brand Strategy Workshop",
    description: "Develop comprehensive brand strategies for clients from discovery to execution.",
    category: "Strategy",
    duration: "5h 00m",
    lessons: 20,
    enrollments: 41,
    rating: 4.9,
    instructor: "Will Hutson",
    level: "All Levels",
    featured: true,
  },
  {
    id: "5",
    title: "Video Production Essentials",
    description: "From pre-production to post, learn the complete video production workflow.",
    category: "Video",
    duration: "6h 30m",
    lessons: 24,
    enrollments: 29,
    rating: 4.6,
    instructor: "Matthew Reynolds",
    level: "Beginner",
    featured: false,
  },
  {
    id: "6",
    title: "Social Media Analytics Deep Dive",
    description: "Master the art of measuring and reporting social media performance.",
    category: "Analytics",
    duration: "2h 00m",
    lessons: 10,
    enrollments: 45,
    rating: 4.5,
    instructor: "Salma Hassan",
    level: "Intermediate",
    featured: false,
  },
];

const CATEGORIES = ["All", "Professional Skills", "Creative", "Copy", "Strategy", "Video", "Analytics"];

const levelColors = {
  "Beginner": "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  "Intermediate": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  "Advanced": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  "All Levels": "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400",
};

export default function LMSBrowsePage() {
  const totalCourses = COURSES.length;
  const totalEnrollments = COURSES.reduce((sum, c) => sum + c.enrollments, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Course Catalog</h1>
          <p className="text-muted-foreground">Browse and enroll in courses to develop your skills</p>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search courses..." className="pl-9" />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </Button>
      </div>

      {/* Categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {CATEGORIES.map((category) => (
          <Button
            key={category}
            variant={category === "All" ? "default" : "outline"}
            size="sm"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <BookOpen className="h-4 w-4" />
              <span className="text-sm">Available Courses</span>
            </div>
            <div className="text-3xl font-bold">{totalCourses}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Users className="h-4 w-4" />
              <span className="text-sm">Total Enrollments</span>
            </div>
            <div className="text-3xl font-bold">{totalEnrollments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Star className="h-4 w-4 text-amber-500" />
              <span className="text-sm">Avg. Rating</span>
            </div>
            <div className="text-3xl font-bold">4.7</div>
          </CardContent>
        </Card>
      </div>

      {/* Featured Courses */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Featured Courses</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {COURSES.filter(c => c.featured).map((course) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
              <div className="h-32 bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center relative">
                <BookOpen className="h-12 w-12 text-primary/50" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <Button size="sm" variant="secondary">
                    <Play className="h-4 w-4 mr-1" />
                    Preview
                  </Button>
                </div>
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="secondary">{course.category}</Badge>
                  <Badge className={levelColors[course.level as keyof typeof levelColors]}>
                    {course.level}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {course.duration}
                  </span>
                  <span>{course.lessons} lessons</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                    {course.rating}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">by {course.instructor}</span>
                  <Button size="sm">Enroll</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Courses */}
      <div>
        <h2 className="text-lg font-semibold mb-4">All Courses</h2>
        <div className="space-y-4">
          {COURSES.map((course) => (
            <Card key={course.id} className="hover:shadow-md transition-shadow">
              <CardContent className="py-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center shrink-0">
                    <BookOpen className="h-6 w-6 text-primary/70" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{course.title}</h3>
                      <Badge variant="secondary" className="text-xs">{course.category}</Badge>
                      <Badge className={`text-xs ${levelColors[course.level as keyof typeof levelColors]}`}>
                        {course.level}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{course.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {course.duration}
                      </span>
                      <span>{course.lessons} lessons</span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {course.enrollments} enrolled
                      </span>
                      <span className="flex items-center gap-1">
                        <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                        {course.rating}
                      </span>
                      <span>by {course.instructor}</span>
                    </div>
                  </div>
                  <Button>Enroll</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
