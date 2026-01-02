import { NextResponse } from "next/server";

// Sandbox API for Survey Responses
const MOCK_RESPONSES = [
  {
    id: "resp-1",
    surveyId: "survey-q4-feedback",
    surveyTitle: "Q4 2024 Client Feedback",
    respondentId: "contact-1",
    respondentName: "John Smith",
    respondentEmail: "john.smith@ccad.ae",
    respondentCompany: "CCAD",
    channel: "EMAIL",
    status: "COMPLETED",
    submittedAt: "2024-12-15T10:30:00Z",
    startedAt: "2024-12-15T10:25:00Z",
    completionTime: 300, // seconds
    answers: [
      { questionId: "q1", questionLabel: "Overall satisfaction", type: "RATING", value: 9 },
      { questionId: "q2", questionLabel: "How likely to recommend?", type: "NPS", value: 9 },
      { questionId: "q3", questionLabel: "Services used", type: "MULTIPLE_CHOICE", value: ["Video Production", "Social Media"] },
      { questionId: "q4", questionLabel: "What do we do best?", type: "TEXT", value: "Great creativity and attention to detail" },
      { questionId: "q5", questionLabel: "How can we improve?", type: "TEXT", value: "Faster turnaround times" },
    ],
    metadata: {
      ipAddress: "192.168.1.100",
      userAgent: "Mozilla/5.0",
      referrer: "email",
    },
  },
  {
    id: "resp-2",
    surveyId: "survey-q4-feedback",
    surveyTitle: "Q4 2024 Client Feedback",
    respondentId: "contact-2",
    respondentName: "Sarah Johnson",
    respondentEmail: "sarah.johnson@ccad.ae",
    respondentCompany: "CCAD",
    channel: "WEB_LINK",
    status: "COMPLETED",
    submittedAt: "2024-12-16T14:15:00Z",
    startedAt: "2024-12-16T14:10:00Z",
    completionTime: 280,
    answers: [
      { questionId: "q1", questionLabel: "Overall satisfaction", type: "RATING", value: 10 },
      { questionId: "q2", questionLabel: "How likely to recommend?", type: "NPS", value: 10 },
      { questionId: "q3", questionLabel: "Services used", type: "MULTIPLE_CHOICE", value: ["Content Strategy", "Design"] },
      { questionId: "q4", questionLabel: "What do we do best?", type: "TEXT", value: "Excellent strategic thinking" },
      { questionId: "q5", questionLabel: "How can we improve?", type: "TEXT", value: "" },
    ],
    metadata: {
      ipAddress: "192.168.1.101",
      userAgent: "Mozilla/5.0",
      referrer: "direct",
    },
  },
  {
    id: "resp-3",
    surveyId: "survey-employee-2024",
    surveyTitle: "2024 Employee Engagement Survey",
    respondentId: "user-anon-1",
    respondentName: "Anonymous",
    respondentEmail: null,
    respondentCompany: "LMTD",
    channel: "EMAIL",
    status: "COMPLETED",
    submittedAt: "2024-11-15T09:45:00Z",
    startedAt: "2024-11-15T09:30:00Z",
    completionTime: 900,
    answers: [
      { questionId: "q1", questionLabel: "I feel valued at work", type: "RATING", value: 8 },
      { questionId: "q2", questionLabel: "Tools I need", type: "RATING", value: 9 },
      { questionId: "q3", questionLabel: "Manager support", type: "RATING", value: 10 },
      { questionId: "q4", questionLabel: "Understanding contribution", type: "RATING", value: 8 },
      { questionId: "q5", questionLabel: "Improvement suggestions", type: "TEXT", value: "More team building activities" },
    ],
    metadata: {
      ipAddress: null,
      userAgent: "Mozilla/5.0",
      referrer: "email",
    },
  },
  {
    id: "resp-4",
    surveyId: "survey-q4-feedback",
    surveyTitle: "Q4 2024 Client Feedback",
    respondentId: "contact-3",
    respondentName: "Ahmed Hassan",
    respondentEmail: "ahmed.hassan@det.ae",
    respondentCompany: "DET",
    channel: "EMAIL",
    status: "PARTIAL",
    submittedAt: null,
    startedAt: "2024-12-20T11:00:00Z",
    completionTime: null,
    answers: [
      { questionId: "q1", questionLabel: "Overall satisfaction", type: "RATING", value: 8 },
      { questionId: "q2", questionLabel: "How likely to recommend?", type: "NPS", value: 8 },
    ],
    metadata: {
      ipAddress: "192.168.1.102",
      userAgent: "Mozilla/5.0",
      referrer: "email",
    },
  },
];

// Analytics aggregation
const MOCK_ANALYTICS = {
  "survey-q4-feedback": {
    surveyId: "survey-q4-feedback",
    surveyTitle: "Q4 2024 Client Feedback",
    totalResponses: 47,
    completedResponses: 45,
    partialResponses: 2,
    avgCompletionTime: 285, // seconds
    completionRate: 95.7,
    npsScore: 72,
    npsBreakdown: {
      promoters: 32,
      passives: 10,
      detractors: 5,
    },
    avgSatisfaction: 8.6,
    responsesByDay: [
      { date: "2024-12-10", count: 5 },
      { date: "2024-12-11", count: 8 },
      { date: "2024-12-12", count: 12 },
      { date: "2024-12-13", count: 7 },
      { date: "2024-12-14", count: 6 },
      { date: "2024-12-15", count: 5 },
      { date: "2024-12-16", count: 4 },
    ],
    topServices: [
      { name: "Video Production", count: 28 },
      { name: "Social Media", count: 25 },
      { name: "Design", count: 22 },
      { name: "Content Strategy", count: 18 },
      { name: "Paid Media", count: 12 },
    ],
    sentimentAnalysis: {
      positive: 38,
      neutral: 6,
      negative: 3,
    },
    keyThemes: [
      { theme: "Creativity", mentions: 28, sentiment: "positive" },
      { theme: "Turnaround Time", mentions: 15, sentiment: "mixed" },
      { theme: "Communication", mentions: 12, sentiment: "positive" },
      { theme: "Value", mentions: 10, sentiment: "positive" },
    ],
  },
};

export async function GET(request: Request) {
  await new Promise((resolve) => setTimeout(resolve, 100));

  const { searchParams } = new URL(request.url);
  const surveyId = searchParams.get("surveyId");
  const includeAnalytics = searchParams.get("analytics") === "true";

  let filtered = [...MOCK_RESPONSES];

  if (surveyId) {
    filtered = filtered.filter((r) => r.surveyId === surveyId);
  }

  const response: Record<string, unknown> = {
    data: filtered,
    meta: {
      total: filtered.length,
      completed: filtered.filter((r) => r.status === "COMPLETED").length,
      partial: filtered.filter((r) => r.status === "PARTIAL").length,
      avgCompletionTime:
        filtered.filter((r) => r.completionTime).length > 0
          ? Math.round(
              filtered
                .filter((r) => r.completionTime)
                .reduce((sum, r) => sum + (r.completionTime || 0), 0) /
                filtered.filter((r) => r.completionTime).length
            )
          : 0,
    },
    sandbox: true,
  };

  if (includeAnalytics && surveyId && MOCK_ANALYTICS[surveyId as keyof typeof MOCK_ANALYTICS]) {
    response.analytics = MOCK_ANALYTICS[surveyId as keyof typeof MOCK_ANALYTICS];
  }

  return NextResponse.json(response);
}

export async function POST(request: Request) {
  const body = await request.json();

  const newResponse = {
    id: `resp-${Date.now()}`,
    surveyId: body.surveyId,
    surveyTitle: body.surveyTitle || "Survey",
    respondentId: body.respondentId || `anon-${Date.now()}`,
    respondentName: body.respondentName || "Anonymous",
    respondentEmail: body.respondentEmail || null,
    respondentCompany: body.respondentCompany || null,
    channel: body.channel || "WEB_LINK",
    status: "COMPLETED",
    submittedAt: new Date().toISOString(),
    startedAt: body.startedAt || new Date().toISOString(),
    completionTime: body.completionTime || 0,
    answers: body.answers || [],
    metadata: {
      ipAddress: "sandbox",
      userAgent: "sandbox",
      referrer: "sandbox",
    },
  };

  return NextResponse.json({
    data: newResponse,
    sandbox: true,
    message: "Response recorded (sandbox mode - not persisted)",
  });
}
