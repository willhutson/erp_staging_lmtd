"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { NPSCategory } from "@prisma/client";

function calculateNPSCategory(score: number): NPSCategory {
  if (score >= 9) return "PROMOTER";
  if (score >= 7) return "PASSIVE";
  return "DETRACTOR";
}

export async function createNPSSurvey(data: {
  clientId: string;
  quarter: number;
  year: number;
  sentToId?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    throw new Error("Only admins can create NPS surveys");
  }

  const survey = await db.nPSSurvey.create({
    data: {
      organizationId: session.user.organizationId,
      clientId: data.clientId,
      quarter: data.quarter,
      year: data.year,
      sentToId: data.sentToId,
      createdById: session.user.id,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
      sentTo: { select: { id: true, name: true, email: true } },
    },
  });

  revalidatePath("/nps");
  return survey;
}

export async function sendNPSSurvey(surveyId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const survey = await db.nPSSurvey.update({
    where: { id: surveyId },
    data: {
      status: "SENT",
      sentAt: new Date(),
    },
  });

  // In a real implementation, this would send an email
  // For now, we just update the status

  revalidatePath("/nps");
  return survey;
}

export async function submitNPSResponse(data: {
  surveyId: string;
  score: number;
  whatWeDoWell?: string;
  whatToImprove?: string;
  additionalNotes?: string;
  contactId?: string;
}) {
  // This is a public endpoint - no auth required (accessed via unique link)
  const survey = await db.nPSSurvey.findUnique({
    where: { id: data.surveyId },
  });

  if (!survey) throw new Error("Survey not found");
  if (survey.status === "COMPLETED") throw new Error("Survey already completed");
  if (survey.status === "EXPIRED") throw new Error("Survey has expired");

  const response = await db.nPSResponse.create({
    data: {
      surveyId: data.surveyId,
      contactId: data.contactId,
      score: data.score,
      category: calculateNPSCategory(data.score),
      whatWeDoWell: data.whatWeDoWell,
      whatToImprove: data.whatToImprove,
      additionalNotes: data.additionalNotes,
    },
  });

  // Update survey status to completed
  await db.nPSSurvey.update({
    where: { id: data.surveyId },
    data: { status: "COMPLETED" },
  });

  return response;
}

export async function getNPSStats(organizationId: string, year?: number) {
  const currentYear = year ?? new Date().getFullYear();

  const responses = await db.nPSResponse.findMany({
    where: {
      survey: {
        organizationId,
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
  const byClient = Object.values(
    responses.reduce(
      (acc, r) => {
        const clientId = r.survey.clientId;
        if (!acc[clientId]) {
          acc[clientId] = {
            client: r.survey.client,
            responses: [],
          };
        }
        acc[clientId].responses.push(r);
        return acc;
      },
      {} as Record<string, { client: { id: string; name: string; code: string }; responses: typeof responses }>
    )
  ).map(({ client, responses: clientResponses }) => {
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

export async function getSurveys(filters?: {
  status?: "DRAFT" | "SENT" | "COMPLETED" | "EXPIRED";
  year?: number;
  clientId?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.nPSSurvey.findMany({
    where: {
      organizationId: session.user.organizationId,
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
}
