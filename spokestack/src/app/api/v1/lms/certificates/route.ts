import { NextResponse } from "next/server";

// Sandbox API for LMS Certificates
const MOCK_CERTIFICATES = [
  {
    id: "cert-sm-001",
    credentialId: "LMTD-SM-2024-001",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    courseId: "course-social-media",
    courseTitle: "Social Media Best Practices",
    courseCategory: "Marketing",
    instructorName: "Marcus Chen",
    issuedAt: "2024-11-20T16:45:00Z",
    expiresAt: null,
    score: 92,
    hoursCompleted: 1.5,
    skillsEarned: ["Instagram Marketing", "LinkedIn Strategy", "Content Creation", "Analytics"],
    verificationUrl: "/api/v1/lms/certificates/verify/LMTD-SM-2024-001",
    downloadUrl: "/api/v1/lms/certificates/LMTD-SM-2024-001/download",
    status: "VALID",
  },
  {
    id: "cert-pm-001",
    credentialId: "LMTD-PM-2024-003",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    courseId: "course-project-management",
    courseTitle: "Agency Project Management",
    courseCategory: "Leadership",
    instructorName: "Jennifer Walsh",
    issuedAt: "2024-10-15T11:30:00Z",
    expiresAt: "2026-10-15T11:30:00Z",
    score: 88,
    hoursCompleted: 2,
    skillsEarned: ["Agile Methodologies", "Resource Planning", "Client Communication", "Timeline Management"],
    verificationUrl: "/api/v1/lms/certificates/verify/LMTD-PM-2024-003",
    downloadUrl: "/api/v1/lms/certificates/LMTD-PM-2024-003/download",
    status: "VALID",
  },
  {
    id: "cert-cw-001",
    credentialId: "LMTD-CW-2024-007",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    courseId: "course-copywriting",
    courseTitle: "Copywriting Masterclass",
    courseCategory: "Marketing",
    instructorName: "Emily Carter",
    issuedAt: "2024-08-28T14:00:00Z",
    expiresAt: null,
    score: 95,
    hoursCompleted: 0.8,
    skillsEarned: ["Ad Copy", "Email Marketing", "Brand Voice", "SEO Writing"],
    verificationUrl: "/api/v1/lms/certificates/verify/LMTD-CW-2024-007",
    downloadUrl: "/api/v1/lms/certificates/LMTD-CW-2024-007/download",
    status: "VALID",
  },
  {
    id: "cert-gdpr-001",
    credentialId: "LMTD-GDPR-2024-012",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    courseId: "course-data-privacy",
    courseTitle: "Data Privacy & GDPR Compliance",
    courseCategory: "Compliance",
    instructorName: "Legal Team",
    issuedAt: "2024-06-15T09:00:00Z",
    expiresAt: "2025-06-15T09:00:00Z",
    score: 100,
    hoursCompleted: 0.5,
    skillsEarned: ["GDPR Fundamentals", "Data Handling", "Privacy by Design"],
    verificationUrl: "/api/v1/lms/certificates/verify/LMTD-GDPR-2024-012",
    downloadUrl: "/api/v1/lms/certificates/LMTD-GDPR-2024-012/download",
    status: "VALID",
  },
  {
    id: "cert-dt-001",
    credentialId: "LMTD-DT-2024-002",
    userId: "user-current",
    userName: "Current User",
    userEmail: "user@lmtd.ae",
    courseId: "course-design-thinking",
    courseTitle: "Design Thinking Workshop",
    courseCategory: "Innovation",
    instructorName: "Creative Director",
    issuedAt: "2024-04-22T15:00:00Z",
    expiresAt: null,
    score: 90,
    hoursCompleted: 3,
    skillsEarned: ["Empathy Mapping", "Ideation", "Prototyping", "User Testing"],
    verificationUrl: "/api/v1/lms/certificates/verify/LMTD-DT-2024-002",
    downloadUrl: "/api/v1/lms/certificates/LMTD-DT-2024-002/download",
    status: "VALID",
  },
  {
    id: "cert-bg-002",
    credentialId: "LMTD-BG-2024-002",
    userId: "user-2",
    userName: "Sarah Mitchell",
    userEmail: "sarah@lmtd.ae",
    courseId: "course-brand-guidelines",
    courseTitle: "LMTD Brand Guidelines",
    courseCategory: "Onboarding",
    instructorName: "Creative Director",
    issuedAt: "2024-02-15T11:00:00Z",
    expiresAt: null,
    score: 95,
    hoursCompleted: 0.75,
    skillsEarned: ["Brand Identity", "Visual Standards", "Communication Guidelines"],
    verificationUrl: "/api/v1/lms/certificates/verify/LMTD-BG-2024-002",
    downloadUrl: "/api/v1/lms/certificates/LMTD-BG-2024-002/download",
    status: "VALID",
  },
  {
    id: "cert-sm-002",
    credentialId: "LMTD-SM-2024-002",
    userId: "user-4",
    userName: "Emily Carter",
    userEmail: "emily@lmtd.ae",
    courseId: "course-social-media",
    courseTitle: "Social Media Best Practices",
    courseCategory: "Marketing",
    instructorName: "Marcus Chen",
    issuedAt: "2024-11-18T14:00:00Z",
    expiresAt: null,
    score: 88,
    hoursCompleted: 1.5,
    skillsEarned: ["Instagram Marketing", "LinkedIn Strategy", "Content Creation", "Analytics"],
    verificationUrl: "/api/v1/lms/certificates/verify/LMTD-SM-2024-002",
    downloadUrl: "/api/v1/lms/certificates/LMTD-SM-2024-002/download",
    status: "VALID",
  },
];

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");
  const courseId = searchParams.get("courseId");

  let filtered = [...MOCK_CERTIFICATES];

  if (userId) {
    filtered = filtered.filter((c) => c.userId === userId);
  }
  if (courseId) {
    filtered = filtered.filter((c) => c.courseId === courseId);
  }

  return NextResponse.json({
    data: filtered,
    meta: {
      total: filtered.length,
      valid: filtered.filter((c) => c.status === "VALID").length,
      expiringSoon: filtered.filter((c) => {
        if (!c.expiresAt) return false;
        const expiresDate = new Date(c.expiresAt);
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return expiresDate <= thirtyDaysFromNow && expiresDate > now;
      }).length,
      totalHoursCompleted: filtered.reduce((sum, c) => sum + c.hoursCompleted, 0),
      avgScore:
        filtered.length > 0
          ? Math.round(filtered.reduce((sum, c) => sum + c.score, 0) / filtered.length)
          : 0,
      byCategory: filtered.reduce(
        (acc, c) => {
          acc[c.courseCategory] = (acc[c.courseCategory] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      ),
    },
    sandbox: true,
  });
}
