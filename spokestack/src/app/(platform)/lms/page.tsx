import { getStudioUser } from "@/lib/auth";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  GraduationCap,
  Users,
  Trophy,
  Plus,
  ArrowRight,
  Clock,
  Play,
  BarChart2,
  Star,
  AlertCircle,
} from "lucide-react";
import { getCourses, getMyEnrollments } from "@/modules/lms/actions";

export const dynamic = "force-dynamic";

// Types
type CourseListItem = Awaited<ReturnType<typeof getCourses>>[number];
type EnrollmentListItem = Awaited<ReturnType<typeof getMyEnrollments>>[number];

export default async function LMSPage() {
  const user = await getStudioUser();

  // Fetch with error handling for when LMS tables don't exist yet
  let courses: CourseListItem[] = [];
  let myEnrollments: EnrollmentListItem[] = [];
  let hasError = false;

  try {
    [courses, myEnrollments] = await Promise.all([
      getCourses(),
      getMyEnrollments(),
    ]);
  } catch (error) {
    console.error("LMS data fetch error:", error);
    hasError = true;
  }

  const isAdmin = ["ADMIN", "LEADERSHIP"].includes(user.permissionLevel);
  const publishedCourses = courses.filter((c) => c.status === "PUBLISHED");
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const totalCompletions = courses.reduce((sum, c) => sum + c.completionCount, 0);

  // My learning
  const inProgress = myEnrollments.filter((e) =>
    ["ENROLLED", "IN_PROGRESS"].includes(e.status)
  );
  const completed = myEnrollments.filter((e) => e.status === "COMPLETED");

  // Show setup message if LMS tables don't exist
  if (hasError) {
    return (
      <div className="p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Learning Center</h1>
            <p className="text-muted-foreground mt-1">
              Courses, training, and professional development
            </p>
          </div>
        </div>
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertCircle className="h-5 w-5" />
              LMS Module Setup Required
            </CardTitle>
            <CardDescription className="text-amber-600 dark:text-amber-500">
              The Learning Management System tables need to be created in the database.
              Please run database migrations to enable this module.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Contact your administrator to run: <code className="bg-muted px-2 py-1 rounded">npx prisma db push</code>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Learning Center</h1>
          <p className="text-muted-foreground mt-1">
            Courses, training, and professional development
          </p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/lms/courses">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Courses
              </Link>
            </Button>
            <Button asChild>
              <Link href="/lms/courses/new">
                <Plus className="h-4 w-4 mr-2" />
                New Course
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Admin Stats */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Published Courses
              </CardTitle>
              <BookOpen className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{publishedCourses.length}</div>
              <p className="text-xs text-muted-foreground">
                {courses.length - publishedCourses.length} drafts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Enrollments
              </CardTitle>
              <Users className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEnrollments}</div>
              <p className="text-xs text-muted-foreground">Across all courses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completions
              </CardTitle>
              <Trophy className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{totalCompletions}</div>
              <p className="text-xs text-muted-foreground">
                {totalEnrollments > 0
                  ? `${Math.round((totalCompletions / totalEnrollments) * 100)}% completion rate`
                  : "No enrollments yet"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Avg Rating
              </CardTitle>
              <Star className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {courses.filter((c) => c.avgRating).length > 0
                  ? (
                      courses
                        .filter((c) => c.avgRating)
                        .reduce((sum, c) => sum + (c.avgRating || 0), 0) /
                      courses.filter((c) => c.avgRating).length
                    ).toFixed(1)
                  : "—"}
              </div>
              <p className="text-xs text-muted-foreground">Course satisfaction</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* My Learning */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Continue Learning */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Continue Learning
              </CardTitle>
              <CardDescription>Pick up where you left off</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/lms/my-learning">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {inProgress.length > 0 ? (
              <div className="space-y-4">
                {inProgress.slice(0, 3).map((enrollment) => (
                  <Link
                    key={enrollment.id}
                    href={`/lms/learn/${enrollment.course.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                  >
                    <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      {enrollment.course.thumbnailUrl ? (
                        <img
                          src={enrollment.course.thumbnailUrl}
                          alt={enrollment.course.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{enrollment.course.title}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Progress value={enrollment.progressPercent} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground">
                          {enrollment.progressPercent}%
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {enrollment.lessonsCompleted}/{enrollment.totalLessons} lessons
                      </p>
                    </div>
                    <Button size="sm">
                      Continue
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Button>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <GraduationCap className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>No courses in progress</p>
                <Button variant="outline" className="mt-3" asChild>
                  <Link href="/lms/browse">Browse Courses</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              My Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">In Progress</span>
              </div>
              <Badge variant="secondary">{inProgress.length}</Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">Completed</span>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                {completed.length}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-500" />
                <span className="text-sm">Certificates</span>
              </div>
              <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                {completed.filter((e) => e.hasPassed).length}
              </Badge>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/lms/certificates">
                View Certificates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Browse Courses */}
      {publishedCourses.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Available Courses</CardTitle>
              <CardDescription>Explore and enroll in new courses</CardDescription>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/lms/browse">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {publishedCourses.slice(0, 6).map((course) => (
                <Link
                  key={course.id}
                  href={`/lms/browse/${course.slug}`}
                  className="group block border rounded-lg overflow-hidden hover:border-primary transition-colors"
                >
                  <div className="aspect-video bg-muted relative">
                    {course.thumbnailUrl ? (
                      <img
                        src={course.thumbnailUrl}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                      </div>
                    )}
                    {course.skillLevel && (
                      <Badge
                        variant="secondary"
                        className="absolute top-2 right-2 text-xs"
                      >
                        {course.skillLevel}
                      </Badge>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium line-clamp-1 group-hover:text-primary">
                      {course.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {course.lessonCount} lessons
                      </span>
                      {course.estimatedDuration && (
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {Math.round(course.estimatedDuration / 60)}h
                        </span>
                      )}
                      {course.avgRating && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-400" />
                          {course.avgRating.toFixed(1)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Admin Quick Links */}
      {isAdmin && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/20">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Course Management</CardTitle>
                  <CardDescription>Create and edit courses</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/lms/courses">
                  Manage Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/20">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle>Enrollments</CardTitle>
                  <CardDescription>Manage learner enrollments</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/lms/enrollments">
                  View Enrollments
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/20">
                  <BarChart2 className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Analytics</CardTitle>
                  <CardDescription>Learning analytics & reports</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/lms/analytics">
                  View Analytics
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
