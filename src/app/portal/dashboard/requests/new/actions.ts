"use server";

import { db } from "@/lib/db";
import { getPortalUser } from "@/lib/portal/auth";
import { revalidatePath } from "next/cache";

export async function submitBriefRequest(data: {
  clientId: string;
  title: string;
  description: string;
  briefType?: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  desiredDeadline?: Date;
}) {
  const user = await getPortalUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // Verify the client matches
  if (user.clientId !== data.clientId) {
    return { success: false, error: "Invalid client" };
  }

  try {
    const request = await db.clientBriefRequest.create({
      data: {
        organizationId: user.organizationId,
        clientId: data.clientId,
        title: data.title,
        description: data.description,
        briefType: data.briefType,
        priority: data.priority,
        desiredDeadline: data.desiredDeadline,
        submittedById: user.id,
        status: "SUBMITTED",
      },
    });

    revalidatePath("/portal/requests");
    revalidatePath("/portal");

    return { success: true, request };
  } catch (error) {
    console.error("Brief request error:", error);
    return { success: false, error: "Failed to submit request" };
  }
}
