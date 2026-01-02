"use server";

import { prisma } from "@/lib/prisma";
import { getStudioUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { CourseStatus, CourseVisibility, EnrollmentStatus, LessonType } from "@prisma/client";
import type {
  CourseListItem,
  CourseDetail,
  EnrollmentListItem,
  LearnerProgress,
  CreateCourseInput,
  CreateModuleInput,
  CreateLessonInput,
  LessonContent,
} from "./types";

// ============================================
// COURSE ACTIONS
// ============================================

export async function getCourses(filters?: {
  status?: CourseStatus;
  visibility?: CourseVisibility;
  category?: string;
  search?: string;
}): Promise<CourseListItem[]> {
  const user = await getStudioUser();

  const courses = await prisma.lMSCourse.findMany({
    where: {
      organizationId: user.organizationId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.visibility && { visibility: filters.visibility }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      createdBy: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
      modules: {
        include: {
          _count: {
            select: { lessons: true },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return courses.map((c) => ({
    id: c.id,
    title: c.title,
    slug: c.slug,
    shortDescription: c.shortDescription,
    thumbnailUrl: c.thumbnailUrl,
    category: c.category,
    skillLevel: c.skillLevel,
    status: c.status,
    visibility: c.visibility,
    estimatedDuration: c.estimatedDuration,
    enrollmentCount: c.enrollmentCount,
    completionCount: c.completionCount,
    avgRating: c.avgRating ? Number(c.avgRating) : null,
    moduleCount: c.modules.length,
    lessonCount: c.modules.reduce((sum, m) => sum + m._count.lessons, 0),
    createdAt: c.createdAt,
    createdBy: c.createdBy,
  }));
}

export async function getCourse(id: string): Promise<CourseDetail | null> {
  const user = await getStudioUser();

  const course = await prisma.lMSCourse.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      modules: {
        orderBy: { sortOrder: "asc" },
        include: {
          lessons: {
            orderBy: { sortOrder: "asc" },
            include: {
              assessment: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!course) return null;

  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    description: course.description,
    shortDescription: course.shortDescription,
    thumbnailUrl: course.thumbnailUrl,
    trailerUrl: course.trailerUrl,
    category: course.category,
    tags: course.tags,
    skillLevel: course.skillLevel,
    status: course.status,
    visibility: course.visibility,
    estimatedDuration: course.estimatedDuration,
    timeLimit: course.timeLimit,
    hasCertificate: course.hasCertificate,
    passingScore: course.passingScore,
    requiredCompletionPercent: course.requiredCompletionPercent,
    allowSkipLessons: course.allowSkipLessons,
    enrollmentCount: course.enrollmentCount,
    completionCount: course.completionCount,
    avgRating: course.avgRating ? Number(course.avgRating) : null,
    publishedAt: course.publishedAt,
    createdAt: course.createdAt,
    createdBy: course.createdBy,
    modules: course.modules.map((m) => ({
      id: m.id,
      title: m.title,
      description: m.description,
      sortOrder: m.sortOrder,
      isRequired: m.isRequired,
      lessons: m.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        description: l.description,
        type: l.type,
        duration: l.duration,
        sortOrder: l.sortOrder,
        isRequired: l.isRequired,
        hasAssessment: !!l.assessment,
      })),
    })),
  };
}

export async function createCourse(input: CreateCourseInput) {
  const user = await getStudioUser();

  // Generate slug
  const baseSlug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Check for duplicate
  const existing = await prisma.lMSCourse.findFirst({
    where: {
      organizationId: user.organizationId,
      slug: baseSlug,
    },
  });

  const slug = existing ? `${baseSlug}-${Date.now()}` : baseSlug;

  const course = await prisma.lMSCourse.create({
    data: {
      organizationId: user.organizationId,
      title: input.title,
      slug,
      description: input.description,
      shortDescription: input.shortDescription,
      category: input.category,
      tags: input.tags || [],
      skillLevel: input.skillLevel,
      visibility: input.visibility || "PUBLIC",
      estimatedDuration: input.estimatedDuration,
      hasCertificate: input.hasCertificate || false,
      createdById: user.id,
    },
  });

  revalidatePath("/lms/courses");

  return course;
}

export async function updateCourse(
  id: string,
  data: Partial<CreateCourseInput> & { status?: CourseStatus }
) {
  const user = await getStudioUser();

  const updateData: Record<string, unknown> = { ...data };

  if (data.status === "PUBLISHED") {
    updateData.publishedById = user.id;
    updateData.publishedAt = new Date();
  }

  await prisma.lMSCourse.update({
    where: {
      id,
      organizationId: user.organizationId,
    },
    data: updateData,
  });

  revalidatePath("/lms/courses");
  revalidatePath(`/lms/courses/${id}`);
}

// ============================================
// MODULE ACTIONS
// ============================================

export async function createModule(input: CreateModuleInput) {
  const user = await getStudioUser();

  // Verify course belongs to org
  const course = await prisma.lMSCourse.findFirst({
    where: {
      id: input.courseId,
      organizationId: user.organizationId,
    },
    include: {
      modules: {
        select: { sortOrder: true },
        orderBy: { sortOrder: "desc" },
        take: 1,
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const nextOrder = course.modules[0]?.sortOrder ?? 0;

  const module = await prisma.lMSModule.create({
    data: {
      courseId: input.courseId,
      title: input.title,
      description: input.description,
      sortOrder: input.sortOrder ?? nextOrder + 1,
      isRequired: input.isRequired ?? true,
    },
  });

  revalidatePath(`/lms/courses/${input.courseId}`);

  return module;
}

export async function updateModule(
  id: string,
  data: Partial<Omit<CreateModuleInput, "courseId">>
) {
  const module = await prisma.lMSModule.update({
    where: { id },
    data,
    select: { courseId: true },
  });

  revalidatePath(`/lms/courses/${module.courseId}`);
}

export async function deleteModule(id: string) {
  const module = await prisma.lMSModule.delete({
    where: { id },
    select: { courseId: true },
  });

  revalidatePath(`/lms/courses/${module.courseId}`);
}

// ============================================
// LESSON ACTIONS
// ============================================

export async function createLesson(input: CreateLessonInput) {
  const user = await getStudioUser();

  // Verify module exists and belongs to user's org
  const module = await prisma.lMSModule.findFirst({
    where: { id: input.moduleId },
    include: {
      course: true,
      lessons: {
        select: { sortOrder: true },
        orderBy: { sortOrder: "desc" },
        take: 1,
      },
    },
  });

  if (!module?.course || module.course.organizationId !== user.organizationId) {
    throw new Error("Module not found");
  }

  const nextOrder = module.lessons[0]?.sortOrder ?? 0;

  const lesson = await prisma.lMSLesson.create({
    data: {
      moduleId: input.moduleId,
      title: input.title,
      description: input.description,
      type: input.type,
      content: input.content as unknown as object,
      duration: input.duration,
      sortOrder: input.sortOrder ?? nextOrder + 1,
      isRequired: input.isRequired ?? true,
      minimumTimeSpent: input.minimumTimeSpent,
      resources: input.resources as unknown as object || [],
    },
  });

  revalidatePath(`/lms/courses/${module.course.id}`);

  return lesson;
}

export async function updateLesson(
  id: string,
  data: Partial<Omit<CreateLessonInput, "moduleId">>
) {
  const lesson = await prisma.lMSLesson.findFirst({
    where: { id },
    include: {
      module: {
        include: { course: true },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  await prisma.lMSLesson.update({
    where: { id },
    data: {
      ...data,
      content: data.content as unknown as object,
      resources: data.resources as unknown as object,
    },
  });

  revalidatePath(`/lms/courses/${lesson.module.course.id}`);
}

export async function deleteLesson(id: string) {
  const lesson = await prisma.lMSLesson.findFirst({
    where: { id },
    include: {
      module: {
        include: { course: true },
      },
    },
  });

  if (!lesson) {
    throw new Error("Lesson not found");
  }

  await prisma.lMSLesson.delete({ where: { id } });

  revalidatePath(`/lms/courses/${lesson.module.course.id}`);
}

// ============================================
// ENROLLMENT ACTIONS
// ============================================

export async function getEnrollments(filters?: {
  courseId?: string;
  userId?: string;
  status?: EnrollmentStatus;
}): Promise<EnrollmentListItem[]> {
  const user = await getStudioUser();

  const enrollments = await prisma.lMSEnrollment.findMany({
    where: {
      course: {
        organizationId: user.organizationId,
      },
      ...(filters?.courseId && { courseId: filters.courseId }),
      ...(filters?.userId && { userId: filters.userId }),
      ...(filters?.status && { status: filters.status }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
          department: true,
        },
      },
      course: {
        select: {
          id: true,
          title: true,
          thumbnailUrl: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
  });

  return enrollments.map((e) => ({
    id: e.id,
    status: e.status,
    progressPercent: e.progressPercent,
    lessonsCompleted: e.lessonsCompleted,
    totalLessons: e.totalLessons,
    totalTimeSpent: e.totalTimeSpent,
    enrolledAt: e.enrolledAt,
    startedAt: e.startedAt,
    completedAt: e.completedAt,
    lastAccessedAt: e.lastAccessedAt,
    finalScore: e.finalScore,
    hasPassed: e.hasPassed,
    user: e.user,
    course: e.course,
  }));
}

export async function enrollUsers(input: {
  courseId: string;
  userIds: string[];
  expiresAt?: Date;
}) {
  const user = await getStudioUser();

  // Verify course
  const course = await prisma.lMSCourse.findFirst({
    where: {
      id: input.courseId,
      organizationId: user.organizationId,
    },
    include: {
      modules: {
        include: {
          _count: { select: { lessons: true } },
        },
      },
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const totalLessons = course.modules.reduce(
    (sum, m) => sum + m._count.lessons,
    0
  );

  // Create enrollments
  const enrollments = await prisma.lMSEnrollment.createMany({
    data: input.userIds.map((userId) => ({
      courseId: input.courseId,
      userId,
      totalLessons,
      expiresAt: input.expiresAt,
      enrolledById: user.id,
    })),
    skipDuplicates: true,
  });

  // Update enrollment count
  await prisma.lMSCourse.update({
    where: { id: input.courseId },
    data: {
      enrollmentCount: { increment: enrollments.count },
    },
  });

  revalidatePath(`/lms/courses/${input.courseId}`);
  revalidatePath("/lms/enrollments");

  return enrollments;
}

export async function getMyEnrollments(): Promise<EnrollmentListItem[]> {
  const user = await getStudioUser();

  return getEnrollments({ userId: user.id });
}

export async function getMyProgress(enrollmentId: string): Promise<LearnerProgress | null> {
  const user = await getStudioUser();

  const enrollment = await prisma.lMSEnrollment.findFirst({
    where: {
      id: enrollmentId,
      userId: user.id,
    },
    include: {
      lessonProgress: {
        where: { isCompleted: true },
        select: { lessonId: true },
      },
      assessmentAttempts: {
        where: { isPassing: true },
        select: {
          assessmentId: true,
          scorePercent: true,
        },
      },
      course: {
        include: {
          modules: {
            orderBy: { sortOrder: "asc" },
            include: {
              lessons: {
                orderBy: { sortOrder: "asc" },
                select: { id: true, duration: true },
              },
            },
          },
        },
      },
    },
  });

  if (!enrollment) return null;

  // Find current position
  const completedLessonIds = new Set(
    enrollment.lessonProgress.map((p) => p.lessonId)
  );

  let currentModule: string | null = null;
  let currentLesson: string | null = null;

  for (const module of enrollment.course.modules) {
    for (const lesson of module.lessons) {
      if (!completedLessonIds.has(lesson.id)) {
        currentModule = module.id;
        currentLesson = lesson.id;
        break;
      }
    }
    if (currentLesson) break;
  }

  // Calculate remaining time
  let remainingDuration = 0;
  let foundCurrent = false;
  for (const module of enrollment.course.modules) {
    for (const lesson of module.lessons) {
      if (lesson.id === currentLesson) foundCurrent = true;
      if (foundCurrent && lesson.duration) {
        remainingDuration += lesson.duration;
      }
    }
  }

  return {
    enrollmentId: enrollment.id,
    courseId: enrollment.courseId,
    progressPercent: enrollment.progressPercent,
    lessonsCompleted: enrollment.lessonsCompleted,
    totalLessons: enrollment.totalLessons,
    currentModule,
    currentLesson,
    completedLessons: Array.from(completedLessonIds),
    assessmentScores: enrollment.assessmentAttempts.map((a) => ({
      assessmentId: a.assessmentId,
      score: Number(a.scorePercent),
      passed: true,
    })),
    totalTimeSpent: enrollment.totalTimeSpent,
    lastAccessedAt: enrollment.lastAccessedAt,
    estimatedTimeRemaining: remainingDuration,
  };
}

export async function updateLessonProgress(input: {
  enrollmentId: string;
  lessonId: string;
  isCompleted: boolean;
  timeSpent?: number;
  progressData?: Record<string, unknown>;
}) {
  const user = await getStudioUser();

  // Verify enrollment belongs to user
  const enrollment = await prisma.lMSEnrollment.findFirst({
    where: {
      id: input.enrollmentId,
      userId: user.id,
    },
  });

  if (!enrollment) {
    throw new Error("Enrollment not found");
  }

  // Upsert progress
  const progress = await prisma.lMSLessonProgress.upsert({
    where: {
      enrollmentId_lessonId: {
        enrollmentId: input.enrollmentId,
        lessonId: input.lessonId,
      },
    },
    create: {
      enrollmentId: input.enrollmentId,
      lessonId: input.lessonId,
      isCompleted: input.isCompleted,
      completedAt: input.isCompleted ? new Date() : null,
      timeSpent: input.timeSpent || 0,
      progressData: (input.progressData || {}) as object,
      lastAccessedAt: new Date(),
    },
    update: {
      isCompleted: input.isCompleted,
      completedAt: input.isCompleted ? new Date() : undefined,
      timeSpent: input.timeSpent
        ? { increment: input.timeSpent }
        : undefined,
      progressData: input.progressData as object | undefined,
      lastAccessedAt: new Date(),
    },
  });

  // Update enrollment progress if lesson completed
  if (input.isCompleted) {
    const completedCount = await prisma.lMSLessonProgress.count({
      where: {
        enrollmentId: input.enrollmentId,
        isCompleted: true,
      },
    });

    const progressPercent = Math.round(
      (completedCount / enrollment.totalLessons) * 100
    );

    await prisma.lMSEnrollment.update({
      where: { id: input.enrollmentId },
      data: {
        lessonsCompleted: completedCount,
        progressPercent,
        status: progressPercent === 100 ? "COMPLETED" : "IN_PROGRESS",
        completedAt: progressPercent === 100 ? new Date() : null,
        lastAccessedAt: new Date(),
        totalTimeSpent: { increment: input.timeSpent || 0 },
      },
    });

    // Update course completion count if just completed
    if (progressPercent === 100) {
      await prisma.lMSCourse.update({
        where: { id: enrollment.courseId },
        data: {
          completionCount: { increment: 1 },
        },
      });
    }
  } else {
    // Just update last accessed
    await prisma.lMSEnrollment.update({
      where: { id: input.enrollmentId },
      data: {
        lastAccessedAt: new Date(),
        totalTimeSpent: { increment: input.timeSpent || 0 },
        status: enrollment.status === "ENROLLED" ? "IN_PROGRESS" : enrollment.status,
        startedAt: enrollment.startedAt || new Date(),
      },
    });
  }

  revalidatePath(`/lms/learn/${enrollment.courseId}`);

  return progress;
}

// ============================================
// ANALYTICS ACTIONS
// ============================================

export async function getCourseAnalytics(courseId: string) {
  const user = await getStudioUser();

  const course = await prisma.lMSCourse.findFirst({
    where: {
      id: courseId,
      organizationId: user.organizationId,
    },
  });

  if (!course) {
    throw new Error("Course not found");
  }

  const enrollments = await prisma.lMSEnrollment.findMany({
    where: { courseId },
    select: {
      status: true,
      progressPercent: true,
      totalTimeSpent: true,
      finalScore: true,
      hasPassed: true,
      enrolledAt: true,
      completedAt: true,
      user: {
        select: { department: true },
      },
    },
  });

  const completed = enrollments.filter((e) => e.status === "COMPLETED");
  const withScores = completed.filter((e) => e.finalScore !== null);

  // Department breakdown
  const deptCounts: Record<string, number> = {};
  enrollments.forEach((e) => {
    const dept = e.user.department || "Unknown";
    deptCounts[dept] = (deptCounts[dept] || 0) + 1;
  });

  return {
    courseId,
    totalEnrollments: enrollments.length,
    activeEnrollments: enrollments.filter((e) =>
      ["ENROLLED", "IN_PROGRESS"].includes(e.status)
    ).length,
    completions: completed.length,
    completionRate:
      enrollments.length > 0
        ? Math.round((completed.length / enrollments.length) * 100)
        : 0,
    avgTimeToComplete:
      completed.length > 0
        ? Math.round(
            completed.reduce((sum, e) => sum + e.totalTimeSpent, 0) /
              completed.length
          )
        : 0,
    avgScore:
      withScores.length > 0
        ? Math.round(
            withScores.reduce((sum, e) => sum + (e.finalScore || 0), 0) /
              withScores.length
          )
        : null,
    passRate:
      completed.length > 0
        ? Math.round(
            (completed.filter((e) => e.hasPassed).length / completed.length) *
              100
          )
        : null,
    enrollmentsByDepartment: Object.entries(deptCounts).map(([dept, count]) => ({
      department: dept,
      count,
    })),
  };
}
