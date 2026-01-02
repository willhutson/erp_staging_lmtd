"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Clock,
  CheckCircle2,
  PlayCircle,
  GraduationCap,
  Loader2,
  ArrowRight,
} from "lucide-react";

interface Enrollment {
  id: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string | null;
  progress: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
  enrolledAt: string;
  completedAt: string | null;
  lastAccessedAt: string | null;
}

// Placeholder data - will be replaced with actual API call
const MOCK_ENROLLMENTS: Enrollment[] = [
  {
    id: "1",
    courseId: "course-1",
    courseTitle: "LMTD Brand Guidelines",
    courseDescription: "Learn our brand identity, visual standards, and communication guidelines.",
    progress: 75,
    status: "IN_PROGRESS",
    enrolledAt: "2024-11-01T00:00:00Z",
    completedAt: null,
    lastAccessedAt: "2024-12-15T10:30:00Z",
  },
  {
    id: "2",
    courseId: "course-2",
    courseTitle: "Social Media Best Practices",
    courseDescription: "Master social media marketing strategies and content creation.",
    progress: 100,
    status: "COMPLETED",
    enrolledAt: "2024-10-15T00:00:00Z",
    completedAt: "2024-11-20T14:00:00Z",
    lastAccessedAt: "2024-11-20T14:00:00Z",
  },
  {
    id: "3",
    courseId: "course-3",
    courseTitle: "Effective Client Communication",
    courseDescription: "Build stronger client relationships through better communication.",
    progress: 0,
    status: "NOT_STARTED",
    enrolledAt: "2024-12-01T00:00:00Z",
    completedAt: null,
    lastAccessedAt: null,
  },
];

export default function MyLearningPage() {
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setEnrollments(MOCK_ENROLLMENTS);
      setLoading(false);
    }, 500);
  }, []);

  const inProgress = enrollments.filter((e) => e.status === "IN_PROGRESS");
  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const notStarted = enrollments.filter((e) => e.status === "NOT_STARTED");

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = (status: Enrollment["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge className="bg-green-500/10 text-green-600 border-green-200">Completed</Badge>;
      case "IN_PROGRESS":
        return <Badge className="bg-blue-500/10 text-blue-600 border-blue-200">In Progress</Badge>;
      default:
        return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getStatusIcon = (status: Enrollment["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case "IN_PROGRESS":
        return <PlayCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const EnrollmentCard = ({ enrollment }: { enrollment: Enrollment }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            {getStatusIcon(enrollment.status)}
            <div>
              <CardTitle className="text-lg">{enrollment.courseTitle}</CardTitle>
              <CardDescription className="mt-1">
                {enrollment.courseDescription}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge(enrollment.status)}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {enrollment.status !== "NOT_STARTED" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">{enrollment.progress}%</span>
              </div>
              <Progress value={enrollment.progress} className="h-2" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {enrollment.status === "COMPLETED" ? (
                <>Completed {formatDate(enrollment.completedAt!)}</>
              ) : enrollment.lastAccessedAt ? (
                <>Last accessed {formatDate(enrollment.lastAccessedAt)}</>
              ) : (
                <>Enrolled {formatDate(enrollment.enrolledAt)}</>
              )}
            </div>
            <Button asChild size="sm">
              <Link href={`/lms/courses/${enrollment.courseId}`}>
                {enrollment.status === "NOT_STARTED" ? "Start" : "Continue"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            My Learning
          </h1>
          <p className="text-muted-foreground mt-1">
            Track your course progress and continue learning
          </p>
        </div>
        <Button asChild>
          <Link href="/lms/courses">
            <BookOpen className="mr-2 h-4 w-4" />
            Browse Courses
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-blue-500/10">
                <PlayCircle className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgress.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-green-500/10">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completed.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-muted">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{notStarted.length}</p>
                <p className="text-sm text-muted-foreground">Not Started</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Tabs */}
      <Tabs defaultValue="in-progress" className="space-y-4">
        <TabsList>
          <TabsTrigger value="in-progress">
            In Progress ({inProgress.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completed.length})
          </TabsTrigger>
          <TabsTrigger value="not-started">
            Not Started ({notStarted.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress" className="space-y-4">
          {inProgress.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <PlayCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No courses in progress</p>
                <p className="text-muted-foreground mb-4">
                  Start a course to begin tracking your progress
                </p>
                <Button asChild>
                  <Link href="/lms/courses">Browse Courses</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            inProgress.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completed.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">No completed courses yet</p>
                <p className="text-muted-foreground">
                  Complete your first course to see it here
                </p>
              </CardContent>
            </Card>
          ) : (
            completed.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))
          )}
        </TabsContent>

        <TabsContent value="not-started" className="space-y-4">
          {notStarted.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground">
                  You&apos;ve started all your enrolled courses
                </p>
              </CardContent>
            </Card>
          ) : (
            notStarted.map((enrollment) => (
              <EnrollmentCard key={enrollment.id} enrollment={enrollment} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
