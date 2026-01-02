"use server";

import { getStudioUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import type { NPSCategory } from "@prisma/client";
import type {
  NPSSurveyWithRelations,
  NPSStatsResult,
  CreateNPSSurveyInput,
  SubmitNPSResponseInput,
  NPSSurveyFilters,
} from "./types";

function calculateNPSCategory(score: number): NPSCategory {
  if (score >= 9) return "PROMOTER";
  if (score >= 7) return "PASSIVE";
  return "DETRACTOR";
}

// ============================================
// Survey CRUD Actions
// ============================================

export async function getNPSSurveys(filters?: NPSSurveyFilters): Promise<NPSSurveyWithRelations[]> {
  const user = await getStudioUser();

  const surveys = await prisma.nPSSurvey.findMany({
    where: {
      organizationId: user.organizationId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.year && { year: filters.year }),
      ...(filters?.clientId && { clientId: filters.clientId }),
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
      sentTo: { select: { id: true, name: true, email: true } },
      responses: true,
    },
    orderBy: [{ year: "desc" }, { quarter: "desc" }],
  });

  return surveys as NPSSurveyWithRelations[];
}

export async function getNPSSurvey(id: string): Promise<NPSSurveyWithRelations | null> {
  const user = await getStudioUser();

  const survey = await prisma.nPSSurvey.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
      sentTo: { select: { id: true, name: true, email: true } },
      responses: true,
    },
  });

  return survey as NPSSurveyWithRelations | null;
}

export async function createNPSSurvey(input: CreateNPSSurveyInput): Promise<NPSSurveyWithRelations> {
  const user = await getStudioUser();

  // Check permission - only ADMIN/LEADERSHIP can create surveys
  if (!["ADMIN", "LEADERSHIP"].includes(user.permissionLevel)) {
    throw new Error("Only admins and leadership can create NPS surveys");
  }

  // Check if survey already exists for this client/quarter/year
  const existing = await prisma.nPSSurvey.findFirst({
    where: {
      organizationId: user.organizationId,
      clientId: input.clientId,
      quarter: input.quarter,
      year: input.year,
    },
  });

  if (existing) {
    throw new Error(`Survey already exists for Q${input.quarter} ${input.year}`);
  }

  const survey = await prisma.nPSSurvey.create({
    data: {
      organizationId: user.organizationId,
      clientId: input.clientId,
      quarter: input.quarter,
      year: input.year,
      sentToId: input.sentToId,
      createdById: user.id,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
      sentTo: { select: { id: true, name: true, email: true } },
      responses: true,
    },
  });

  revalidatePath("/feedback/nps");
  return survey as NPSSurveyWithRelations;
}

export async function sendNPSSurvey(surveyId: string) {
  const user = await getStudioUser();

  const survey = await prisma.nPSSurvey.findFirst({
    where: {
      id: surveyId,
      organizationId: user.organizationId,
    },
  });

  if (!survey) {
    throw new Error("Survey not found");
  }

  if (survey.status !== "DRAFT") {
    throw new Error("Survey has already been sent");
  }

  const updated = await prisma.nPSSurvey.update({
    where: { id: surveyId },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });

  // TODO: Send email notification to client contact
  // This would integrate with the email/notification system

  revalidatePath("/feedback/nps");
  return updated;
}

export async function sendReminder(surveyId: string) {
  const user = await getStudioUser();

  const survey = await prisma.nPSSurvey.findFirst({
    where: {
      id: surveyId,
      organizationId: user.organizationId,
      status: "SENT",
    },
  });

  if (!survey) {
    throw new Error("Survey not found or not in sent status");
  }

  const updated = await prisma.nPSSurvey.update({
    where: { id: surveyId },
    data: {
      reminderSentAt: new Date(),
    },
  });

  // TODO: Send reminder email

  revalidatePath("/feedback/nps");
  return updated;
}

// ============================================
// Response Actions
// ============================================

export async function submitNPSResponse(input: SubmitNPSResponseInput) {
  const survey = await prisma.nPSSurvey.findUnique({
    where: { id: input.surveyId },
  });

  if (!survey) {
    throw new Error("Survey not found");
  }

  if (survey.status === "COMPLETED") {
    throw new Error("Survey has already been completed");
  }

  if (survey.status === "EXPIRED") {
    throw new Error("Survey has expired");
  }

  if (input.score < 0 || input.score > 10) {
    throw new Error("Score must be between 0 and 10");
  }

  const response = await prisma.nPSResponse.create({
    data: {
      surveyId: input.surveyId,
      contactId: input.contactId,
      portalUserId: input.portalUserId,
      score: input.score,
      category: calculateNPSCategory(input.score),
      whatWeDoWell: input.whatWeDoWell,
      whatToImprove: input.whatToImprove,
      additionalNotes: input.additionalNotes,
    },
  });

  // Update survey status to completed
  await prisma.nPSSurvey.update({
    where: { id: input.surveyId },
    data: { status: "COMPLETED" },
  });

  revalidatePath("/feedback/nps");
  return response;
}

// ============================================
// Stats & Analytics Actions
// ============================================

export async function getNPSStats(year?: number): Promise<NPSStatsResult> {
  const user = await getStudioUser();
  const currentYear = year ?? new Date().getFullYear();

  const responses = await prisma.nPSResponse.findMany({
    where: {
      survey: {
        organizationId: user.organizationId,
        year: currentYear,
        status: "COMPLETED",
      },
    },
    include: {
      survey: {
        include: {
          client: { select: { id: true, name: true, code: true } },
        },
      },
    },
  });

  const promoters = responses.filter((r) => r.category === "PROMOTER").length;
  const passives = responses.filter((r) => r.category === "PASSIVE").length;
  const detractors = responses.filter((r) => r.category === "DETRACTOR").length;
  const total = responses.length;

  const npsScore = total > 0
    ? Math.round(((promoters - detractors) / total) * 100)
    : 0;

  const avgScore = total > 0
    ? responses.reduce((sum, r) => sum + r.score, 0) / total
    : 0;

  // Group by quarter
  const byQuarter = [1, 2, 3, 4].map((q) => {
    const quarterResponses = responses.filter((r) => r.survey.quarter === q);
    const qPromoters = quarterResponses.filter((r) => r.category === "PROMOTER").length;
    const qDetractors = quarterResponses.filter((r) => r.category === "DETRACTOR").length;
    const qTotal = quarterResponses.length;

    return {
      quarter: q,
      responses: qTotal,
      npsScore: qTotal > 0 ? Math.round(((qPromoters - qDetractors) / qTotal) * 100) : null,
    };
  });

  // Group by client
  const clientMap = new Map<string, { client: { id: string; name: string; code: string }; responses: typeof responses }>();

  for (const r of responses) {
    const clientId = r.survey.clientId;
    if (!clientMap.has(clientId)) {
      clientMap.set(clientId, {
        client: r.survey.client,
        responses: [],
      });
    }
    clientMap.get(clientId)!.responses.push(r);
  }

  const byClient = Array.from(clientMap.values()).map(({ client, responses: clientResponses }) => {
    const cPromoters = clientResponses.filter((r) => r.category === "PROMOTER").length;
    const cDetractors = clientResponses.filter((r) => r.category === "DETRACTOR").length;
    const cTotal = clientResponses.length;

    return {
      client,
      responses: cTotal,
      npsScore: cTotal > 0 ? Math.round(((cPromoters - cDetractors) / cTotal) * 100) : 0,
      avgScore: cTotal > 0
        ? clientResponses.reduce((sum, r) => sum + r.score, 0) / cTotal
        : 0,
    };
  });

  return {
    total,
    promoters,
    passives,
    detractors,
    npsScore,
    avgScore,
    byQuarter,
    byClient,
  };
}

// ============================================
// Client Portal Actions
// ============================================

export async function getClientPendingSurveys(clientId: string) {
  return prisma.nPSSurvey.findMany({
    where: {
      clientId,
      status: "SENT",
    },
    orderBy: { sentAt: "desc" },
  });
}

export async function getPortalUserResponses(portalUserId: string) {
  return prisma.nPSResponse.findMany({
    where: {
      portalUserId,
    },
    include: {
      survey: true,
    },
    orderBy: { submittedAt: "desc" },
    take: 10,
  });
}
