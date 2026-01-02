import { NextResponse } from "next/server";

// Sandbox API for Forms - returns mock data for development/testing
const MOCK_SURVEYS = [
  {
    id: "survey-q4-feedback",
    title: "Q4 2024 Client Feedback",
    slug: "q4-2024-client-feedback",
    templateId: "tmpl-client-sat",
    templateName: "Client Satisfaction Survey",
    status: "ACTIVE",
    responseCount: 47,
    targetResponseCount: 100,
    channels: ["WEB_LINK", "EMAIL"],
    startsAt: "2024-10-01T00:00:00Z",
    endsAt: "2024-12-31T23:59:59Z",
    createdAt: "2024-09-25T10:00:00Z",
    createdBy: { id: "user-1", name: "Will Hutchinson" },
    targetClient: { id: "client-ccad", name: "CCAD", code: "CCAD" },
    lastResponseAt: "2024-12-28T15:30:00Z",
  },
  {
    id: "survey-employee-2024",
    title: "2024 Employee Engagement Survey",
    slug: "employee-engagement-2024",
    templateId: "tmpl-employee-eng",
    templateName: "Employee Engagement",
    status: "CLOSED",
    responseCount: 42,
    targetResponseCount: 46,
    channels: ["EMAIL", "SLACK"],
    startsAt: "2024-11-01T00:00:00Z",
    endsAt: "2024-11-30T23:59:59Z",
    createdAt: "2024-10-28T09:00:00Z",
    createdBy: { id: "user-2", name: "Afaq Ahmed" },
    targetClient: null,
    lastResponseAt: "2024-11-29T18:45:00Z",
  },
  {
    id: "survey-meeting-poll",
    title: "Team Meeting Time Poll",
    slug: "team-meeting-poll-jan",
    templateId: "tmpl-quick-poll",
    templateName: "Quick Poll",
    status: "DRAFT",
    responseCount: 0,
    targetResponseCount: null,
    channels: ["WEB_LINK"],
    startsAt: null,
    endsAt: null,
    createdAt: "2024-12-28T11:00:00Z",
    createdBy: { id: "user-3", name: "CJ Caruncho" },
    targetClient: null,
    lastResponseAt: null,
  },
  {
    id: "survey-det-q3",
    title: "DET Q3 Project Feedback",
    slug: "det-project-feedback-q3",
    templateId: "tmpl-project-feedback",
    templateName: "Project Feedback",
    status: "COMPLETED",
    responseCount: 12,
    targetResponseCount: 15,
    channels: ["EMAIL"],
    startsAt: "2024-07-01T00:00:00Z",
    endsAt: "2024-09-30T23:59:59Z",
    createdAt: "2024-06-28T14:00:00Z",
    createdBy: { id: "user-1", name: "Will Hutchinson" },
    targetClient: { id: "client-det", name: "Dubai Economy & Tourism", code: "DET" },
    lastResponseAt: "2024-09-28T12:15:00Z",
  },
  {
    id: "survey-onboarding",
    title: "New Hire Onboarding Feedback",
    slug: "onboarding-feedback",
    templateId: "tmpl-onboarding",
    templateName: "Onboarding Experience",
    status: "ACTIVE",
    responseCount: 8,
    targetResponseCount: null,
    channels: ["EMAIL"],
    startsAt: "2024-01-01T00:00:00Z",
    endsAt: null, // Ongoing
    createdAt: "2024-01-01T09:00:00Z",
    createdBy: { id: "user-4", name: "HR Team" },
    targetClient: null,
    lastResponseAt: "2024-12-20T10:00:00Z",
  },
];

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  return NextResponse.json({
    data: MOCK_SURVEYS,
    meta: {
      total: MOCK_SURVEYS.length,
      active: MOCK_SURVEYS.filter((s) => s.status === "ACTIVE").length,
      totalResponses: MOCK_SURVEYS.reduce((sum, s) => sum + s.responseCount, 0),
    },
    sandbox: true,
  });
}

export async function POST(request: Request) {
  const body = await request.json();

  // Mock creation - return created survey
  const newSurvey = {
    id: `survey-${Date.now()}`,
    title: body.title || "New Survey",
    slug: body.slug || `survey-${Date.now()}`,
    templateId: body.templateId,
    status: "DRAFT",
    responseCount: 0,
    targetResponseCount: body.targetResponseCount || null,
    channels: body.channels || ["WEB_LINK"],
    startsAt: body.startsAt || null,
    endsAt: body.endsAt || null,
    createdAt: new Date().toISOString(),
    createdBy: { id: "sandbox-user", name: "Sandbox User" },
    targetClient: body.targetClientId ? { id: body.targetClientId, name: "Sample Client" } : null,
    lastResponseAt: null,
  };

  return NextResponse.json({
    data: newSurvey,
    sandbox: true,
    message: "Survey created (sandbox mode - not persisted)",
  });
}
