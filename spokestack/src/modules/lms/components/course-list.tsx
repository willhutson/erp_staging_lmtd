"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  BookOpen,
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Users,
  BarChart2,
  Play,
  Clock,
  Star,
  Archive,
} from "lucide-react";
import type { CourseListItem, CourseStatus, CourseVisibility } from "../types";
import { formatDistanceToNow } from "date-fns";

interface CourseListProps {
  courses: CourseListItem[];
  onCreateNew: () => void;
}

const STATUS_COLORS: Record<CourseStatus, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  REVIEW: "bg-yellow-100 text-yellow-700",
  PUBLISHED: "bg-green-100 text-green-700",
  ARCHIVED: "bg-gray-100 text-gray-500",
};

const STATUS_LABELS: Record<CourseStatus, string> = {
  DRAFT: "Draft",
  REVIEW: "In Review",
  PUBLISHED: "Published",
  ARCHIVED: "Archived",
};

const VISIBILITY_LABELS: Record<CourseVisibility, string> = {
  PUBLIC: "Public",
  PRIVATE: "Private",
  DEPARTMENT: "Department",
  CLIENT: "Client",
};

const SKILL_COLORS: Record<string, string> = {
  Beginner: "bg-green-100 text-green-700",
  Intermediate: "bg-blue-100 text-blue-700",
  Advanced: "bg-purple-100 text-purple-700",
};

export function CourseList({ courses, onCreateNew }: CourseListProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");

  const filteredCourses = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    if (statusFilter !== "all" && c.status !== statusFilter) {
      return false;
    }
    if (categoryFilter !== "all" && c.category !== categoryFilter) {
      return false;
    }
    return true;
  });

  // Get unique categories
  const categories = Array.from(
    new Set(courses.map((c) => c.category).filter(Boolean))
  ) as string[];

  // Stats
  const publishedCount = courses.filter((c) => c.status === "PUBLISHED").length;
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Courses</h2>
          <p className="text-sm text-muted-foreground">
            {publishedCount} published • {totalEnrollments} total enrollments
          </p>
        </div>
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {categories.length > 0 && (
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Empty State */}
      {filteredCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="font-medium text-lg mb-1">No courses found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {search || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Create your first course to start teaching"}
            </p>
            {!search && statusFilter === "all" && categoryFilter === "all" && (
              <Button onClick={onCreateNew}>
                <Plus className="h-4 w-4 mr-2" />
                Create Course
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Course Grid */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredCourses.map((course) => (
            <Card key={course.id} className="overflow-hidden hover:border-primary/50 transition-colors">
              {/* Thumbnail */}
              <div className="aspect-video bg-muted relative">
                {course.thumbnailUrl ? (
                  <Image
                    src={course.thumbnailUrl}
                    alt={course.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <BookOpen className="h-12 w-12 text-muted-foreground/50" />
                  </div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge
                    variant="secondary"
                    className={STATUS_COLORS[course.status]}
                  >
                    {STATUS_LABELS[course.status]}
                  </Badge>
                </div>
                {course.skillLevel && (
                  <Badge
                    variant="secondary"
                    className={`absolute top-2 right-2 ${SKILL_COLORS[course.skillLevel] || ""}`}
                  >
                    {course.skillLevel}
                  </Badge>
                )}
              </div>

              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/lms/courses/${course.id}`}
                      className="font-semibold hover:text-primary line-clamp-1"
                    >
                      {course.title}
                    </Link>
                    {course.category && (
                      <p className="text-xs text-muted-foreground">{course.category}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/lms/courses/${course.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Course
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/lms/courses/${course.id}/enrollments`}>
                          <Users className="h-4 w-4 mr-2" />
                          Manage Enrollments
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/lms/courses/${course.id}/analytics`}>
                          <BarChart2 className="h-4 w-4 mr-2" />
                          Analytics
                        </Link>
                      </DropdownMenuItem>
                      {course.status === "PUBLISHED" && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/lms/learn/${course.slug}`}>
                              <Play className="h-4 w-4 mr-2" />
                              Preview
                            </Link>
                          </DropdownMenuItem>
                        </>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm text-muted-foreground line-clamp-2 mb-4 min-h-[40px]">
                  {course.shortDescription || "No description"}
                </p>

                {/* Stats */}
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-3.5 w-3.5" />
                    {course.lessonCount} lessons
                  </span>
                  {course.estimatedDuration && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {Math.round(course.estimatedDuration / 60)}h
                    </span>
                  )}
                  {course.avgRating && (
                    <span className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      {course.avgRating.toFixed(1)}
                    </span>
                  )}
                </div>

                {/* Enrollment stats */}
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{course.enrollmentCount}</span>
                    <span className="text-muted-foreground">enrolled</span>
                  </span>
                  {course.enrollmentCount > 0 && (
                    <div className="flex items-center gap-2">
                      <Progress
                        value={(course.completionCount / course.enrollmentCount) * 100}
                        className="w-16 h-1.5"
                      />
                      <span className="text-xs text-muted-foreground">
                        {Math.round((course.completionCount / course.enrollmentCount) * 100)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
