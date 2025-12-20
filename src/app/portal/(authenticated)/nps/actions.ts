"use server";

import { db } from "@/lib/db";
import { getPortalUser } from "@/lib/portal/auth";
import { revalidatePath } from "next/cache";
import type { NPSCategory } from "@prisma/client";

function calculateNPSCategory(score: number): NPSCategory {
  if (score >= 9) return "PROMOTER";
  if (score >= 7) return "PASSIVE";
  return "DETRACTOR";
}

export async function submitNPSResponse(data: {
  surveyId: string;
  userId: string;
  score: number;
  whatWeDoWell?: string;
  whatToImprove?: string;
  additionalNotes?: string;
}) {
  const user = await getPortalUser();

  if (!user || user.id !== data.userId) {
    return { success: false, error: "Unauthorized" };
  }

  // Validate score
  if (data.score < 0 || data.score > 10) {
    return { success: false, error: "Invalid score" };
  }

  try {
    // Check if survey exists and belongs to client
    const survey = await db.nPSSurvey.findFirst({
      where: {
        id: data.surveyId,
        clientId: user.clientId,
        status: "SENT",
      },
    });

    if (!survey) {
      return { success: false, error: "Survey not found" };
    }

    // Check if user already responded
    const existingResponse = await db.nPSResponse.findFirst({
      where: {
        surveyId: data.surveyId,
        portalUserId: user.id,
      },
    });

    if (existingResponse) {
      return { success: false, error: "You have already responded to this survey" };
    }

    // Create response
    const response = await db.nPSResponse.create({
      data: {
        surveyId: data.surveyId,
        portalUserId: user.id,
        contactId: user.contactId, // Link to contact if available
        score: data.score,
        category: calculateNPSCategory(data.score),
        whatWeDoWell: data.whatWeDoWell,
        whatToImprove: data.whatToImprove,
        additionalNotes: data.additionalNotes,
      },
    });

    // Check if all expected responses are in - if so, mark survey complete
    // For now, mark as complete after first response (can be enhanced later)
    await db.nPSSurvey.update({
      where: { id: data.surveyId },
      data: { status: "COMPLETED" },
    });

    revalidatePath("/portal/nps");

    return { success: true, response };
  } catch (error) {
    console.error("NPS submission error:", error);
    return { success: false, error: "Failed to submit feedback" };
  }
}
