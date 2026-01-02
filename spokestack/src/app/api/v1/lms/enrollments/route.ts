import { NextResponse } from "next/server";

// Sandbox API for LMS Enrollments
const MOCK_ENROLLMENTS = [
  {
    id: "enroll-1",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    userDepartment: "Creative",
    courseId: "course-brand-guidelines",
    courseTitle: "LMTD Brand Guidelines",
    courseCategory: "Onboarding",
    status: "IN_PROGRESS",
    progress: 75,
    lessonsCompleted: 3,
    totalLessons: 4,
    timeSpent: 38, // minutes
    lastAccessedAt: "2024-12-28T14:30:00Z",
    enrolledAt: "2024-11-01T09:00:00Z",
    completedAt: null,
    dueDate: "2024-12-31T23:59:59Z",
    score: null,
    hasPassed: false,
    certificateId: null,
  },
  {
    id: "enroll-2",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    userDepartment: "Creative",
    courseId: "course-social-media",
    courseTitle: "Social Media Best Practices",
    courseCategory: "Marketing",
    status: "COMPLETED",
    progress: 100,
    lessonsCompleted: 4,
    totalLessons: 4,
    timeSpent: 95,
    lastAccessedAt: "2024-11-20T16:45:00Z",
    enrolledAt: "2024-10-15T10:00:00Z",
    completedAt: "2024-11-20T16:45:00Z",
    dueDate: null,
    score: 92,
    hasPassed: true,
    certificateId: "cert-sm-001",
  },
  {
    id: "enroll-3",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    userDepartment: "Creative",
    courseId: "course-video-production",
    courseTitle: "Video Production Essentials",
    courseCategory: "Technical Skills",
    status: "IN_PROGRESS",
    progress: 40,
    lessonsCompleted: 8,
    totalLessons: 20,
    timeSpent: 72,
    lastAccessedAt: "2024-12-27T09:15:00Z",
    enrolledAt: "2024-11-15T11:00:00Z",
    completedAt: null,
    dueDate: "2025-02-28T23:59:59Z",
    score: null,
    hasPassed: false,
    certificateId: null,
  },
  {
    id: "enroll-4",
    userId: "user-2",
    userName: "Sarah Mitchell",
    userEmail: "sarah@lmtd.ae",
    userDepartment: "Creative",
    courseId: "course-brand-guidelines",
    courseTitle: "LMTD Brand Guidelines",
    courseCategory: "Onboarding",
    status: "COMPLETED",
    progress: 100,
    lessonsCompleted: 4,
    totalLessons: 4,
    timeSpent: 42,
    lastAccessedAt: "2024-02-15T11:00:00Z",
    enrolledAt: "2024-01-20T09:00:00Z",
    completedAt: "2024-02-15T11:00:00Z",
    dueDate: null,
    score: 95,
    hasPassed: true,
    certificateId: "cert-bg-002",
  },
  {
    id: "enroll-5",
    userId: "user-3",
    userName: "Marcus Chen",
    userEmail: "marcus@lmtd.ae",
    userDepartment: "Marketing",
    courseId: "course-project-management",
    courseTitle: "Agency Project Management",
    courseCategory: "Leadership",
    status: "IN_PROGRESS",
    progress: 60,
    lessonsCompleted: 9,
    totalLessons: 15,
    timeSpent: 85,
    lastAccessedAt: "2024-12-26T10:30:00Z",
    enrolledAt: "2024-10-01T09:00:00Z",
    completedAt: null,
    dueDate: "2025-01-15T23:59:59Z",
    score: null,
    hasPassed: false,
    certificateId: null,
  },
  {
    id: "enroll-6",
    userId: "user-4",
    userName: "Emily Carter",
    userEmail: "emily@lmtd.ae",
    userDepartment: "Content",
    courseId: "course-social-media",
    courseTitle: "Social Media Best Practices",
    courseCategory: "Marketing",
    status: "COMPLETED",
    progress: 100,
    lessonsCompleted: 4,
    totalLessons: 4,
    timeSpent: 88,
    lastAccessedAt: "2024-11-18T14:00:00Z",
    enrolledAt: "2024-10-20T10:00:00Z",
    completedAt: "2024-11-18T14:00:00Z",
    dueDate: null,
    score: 88,
    hasPassed: true,
    certificateId: "cert-sm-002",
  },
  {
    id: "enroll-7",
    userId: "user-5",
    userName: "David Park",
    userEmail: "david@lmtd.ae",
    userDepartment: "Video",
    courseId: "course-brand-guidelines",
    courseTitle: "LMTD Brand Guidelines",
    courseCategory: "Onboarding",
    status: "NOT_STARTED",
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: 4,
    timeSpent: 0,
    lastAccessedAt: null,
    enrolledAt: "2024-12-20T09:00:00Z",
    completedAt: null,
    dueDate: "2025-01-20T23:59:59Z",
    score: null,
    hasPassed: false,
    certificateId: null,
  },
];

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");
  const status = searchParams.get("status");

  let filtered = [...MOCK_ENROLLMENTS];

  if (userId) {
    filtered = filtered.filter((e) => e.userId === userId);
  }
  if (courseId) {
    filtered = filtered.filter((e) => e.courseId === courseId);
  }
  if (status) {
    filtered = filtered.filter((e) => e.status === status);
  }

  return NextResponse.json({
    data: filtered,
    meta: {
      total: filtered.length,
      byStatus: {
        NOT_STARTED: filtered.filter((e) => e.status === "NOT_STARTED").length,
        IN_PROGRESS: filtered.filter((e) => e.status === "IN_PROGRESS").length,
        COMPLETED: filtered.filter((e) => e.status === "COMPLETED").length,
      },
      avgProgress:
        filtered.length > 0
          ? Math.round(filtered.reduce((sum, e) => sum + e.progress, 0) / filtered.length)
          : 0,
      totalTimeSpent: filtered.reduce((sum, e) => sum + e.timeSpent, 0),
    },
    sandbox: true,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  const newEnrollment = {
    id: `enroll-${Date.now()}`,
    userId: body.userId || "sandbox-user",
    userName: body.userName || "Sandbox User",
    userEmail: body.userEmail || "sandbox@lmtd.ae",
    userDepartment: body.userDepartment || "General",
    courseId: body.courseId,
    courseTitle: body.courseTitle || "Sample Course",
    courseCategory: body.courseCategory || "General",
    status: "NOT_STARTED",
    progress: 0,
    lessonsCompleted: 0,
    totalLessons: body.totalLessons || 0,
    timeSpent: 0,
    lastAccessedAt: null,
    enrolledAt: new Date().toISOString(),
    completedAt: null,
    dueDate: body.dueDate || null,
    score: null,
    hasPassed: false,
    certificateId: null,
  };

  return NextResponse.json({
    data: newEnrollment,
    sandbox: true,
    message: "Enrollment created (sandbox mode - not persisted)",
  });
}
