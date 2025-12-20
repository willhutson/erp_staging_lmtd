"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import type { FormSubmissionStatus, BriefType, Prisma } from "@prisma/client";

// ============================================
// CREATE SUBMISSION
// ============================================

export async function createFormSubmission(data: {
  templateId: string;
  formData: Record<string, unknown>;
  title?: string;
  isDraft?: boolean;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Get the template to validate it exists and belongs to org
  const template = await db.formTemplate.findFirst({
    where: {
      id: data.templateId,
      organizationId: session.user.organizationId,
      isActive: true,
    },
  });

  if (!template) {
    throw new Error("Form template not found");
  }

  // Generate title if not provided
  const title = data.title || generateSubmissionTitle(template.name, data.formData);

  const submission = await db.formSubmission.create({
    data: {
      organizationId: session.user.organizationId,
      templateId: data.templateId,
      submittedById: session.user.id,
      data: data.formData as Prisma.InputJsonValue,
      title,
      status: data.isDraft ? "DRAFT" : "SUBMITTED",
    },
    include: {
      template: true,
      submittedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  revalidatePath("/submissions");
  revalidatePath(`/forms/${template.type}`);

  return submission;
}

// ============================================
// UPDATE SUBMISSION
// ============================================

export async function updateFormSubmission(
  id: string,
  data: {
    formData?: Record<string, unknown>;
    title?: string;
    assigneeId?: string | null;
  }
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const submission = await db.formSubmission.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  // Only allow updates if in DRAFT or SUBMITTED status
  if (!["DRAFT", "SUBMITTED"].includes(submission.status)) {
    throw new Error("Cannot update submission in current status");
  }

  const updated = await db.formSubmission.update({
    where: { id },
    data: {
      ...(data.formData && { data: data.formData as Prisma.InputJsonValue }),
      ...(data.title && { title: data.title }),
      ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
    },
    include: {
      template: true,
      submittedBy: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);

  return updated;
}

// ============================================
// SUBMIT FOR REVIEW
// ============================================

export async function submitForReview(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const submission = await db.formSubmission.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      submittedById: session.user.id,
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (submission.status !== "DRAFT") {
    throw new Error("Only draft submissions can be submitted for review");
  }

  const updated = await db.formSubmission.update({
    where: { id },
    data: {
      status: "SUBMITTED",
    },
  });

  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);

  return updated;
}

// ============================================
// APPROVE SUBMISSION
// ============================================

export async function approveSubmission(
  id: string,
  notes?: string
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins and team leads can approve
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    throw new Error("You don't have permission to approve submissions");
  }

  const submission = await db.formSubmission.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      template: true,
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (!["SUBMITTED", "IN_REVIEW"].includes(submission.status)) {
    throw new Error("Submission cannot be approved in current status");
  }

  // Update submission status
  const updated = await db.formSubmission.update({
    where: { id },
    data: {
      status: "APPROVED",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      reviewNotes: notes,
    },
    include: {
      template: true,
    },
  });

  // If template creates briefs, create one now
  let brief = null;
  if (submission.template.submissionModel === "brief") {
    brief = await createBriefFromSubmission(updated);
  }

  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);
  if (brief) {
    revalidatePath("/briefs");
  }

  return { submission: updated, brief };
}

// ============================================
// REJECT SUBMISSION
// ============================================

export async function rejectSubmission(
  id: string,
  reason: string
) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  // Only admins and team leads can reject
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    throw new Error("You don't have permission to reject submissions");
  }

  if (!reason.trim()) {
    throw new Error("Rejection reason is required");
  }

  const submission = await db.formSubmission.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (!["SUBMITTED", "IN_REVIEW"].includes(submission.status)) {
    throw new Error("Submission cannot be rejected in current status");
  }

  const updated = await db.formSubmission.update({
    where: { id },
    data: {
      status: "REJECTED",
      reviewedById: session.user.id,
      reviewedAt: new Date(),
      rejectionReason: reason,
    },
  });

  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);

  return updated;
}

// ============================================
// CANCEL SUBMISSION
// ============================================

export async function cancelSubmission(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const submission = await db.formSubmission.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
      submittedById: session.user.id,
    },
  });

  if (!submission) {
    throw new Error("Submission not found");
  }

  if (["COMPLETED", "CANCELLED"].includes(submission.status)) {
    throw new Error("Submission cannot be cancelled");
  }

  const updated = await db.formSubmission.update({
    where: { id },
    data: {
      status: "CANCELLED",
    },
  });

  revalidatePath("/submissions");
  revalidatePath(`/submissions/${id}`);

  return updated;
}

// ============================================
// GET SUBMISSIONS
// ============================================

export async function getFormSubmissions(filters?: {
  templateId?: string;
  status?: FormSubmissionStatus[];
  submittedById?: string;
  assigneeId?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const submissions = await db.formSubmission.findMany({
    where: {
      organizationId: session.user.organizationId,
      ...(filters?.templateId && { templateId: filters.templateId }),
      ...(filters?.status && { status: { in: filters.status } }),
      ...(filters?.submittedById && { submittedById: filters.submittedById }),
      ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
    },
    include: {
      template: {
        select: { id: true, type: true, name: true, icon: true },
      },
      submittedBy: {
        select: { id: true, name: true, email: true },
      },
      assignee: {
        select: { id: true, name: true },
      },
      brief: {
        select: { id: true, briefNumber: true, status: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return submissions;
}

// ============================================
// GET SINGLE SUBMISSION
// ============================================

export async function getFormSubmission(id: string) {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const submission = await db.formSubmission.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      template: true,
      submittedBy: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      assignee: {
        select: { id: true, name: true, email: true },
      },
      reviewedBy: {
        select: { id: true, name: true },
      },
      brief: {
        select: { id: true, briefNumber: true, title: true, status: true },
      },
    },
  });

  return submission;
}

// ============================================
// GET PENDING REVIEW COUNT
// ============================================

export async function getPendingReviewCount() {
  const session = await auth();
  if (!session?.user) {
    return 0;
  }

  // Only show count to users who can review
  if (!["ADMIN", "LEADERSHIP", "TEAM_LEAD"].includes(session.user.permissionLevel)) {
    return 0;
  }

  const count = await db.formSubmission.count({
    where: {
      organizationId: session.user.organizationId,
      status: { in: ["SUBMITTED", "IN_REVIEW"] },
    },
  });

  return count;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function generateSubmissionTitle(
  templateName: string,
  formData: Record<string, unknown>
): string {
  // Try to use topic, title, or name from form data
  const possibleTitleFields = ["title", "topic", "name", "projectTitle"];
  for (const field of possibleTitleFields) {
    if (formData[field] && typeof formData[field] === "string") {
      return formData[field] as string;
    }
  }

  // Fallback to template name with date
  const date = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  return `${templateName} - ${date}`;
}

async function createBriefFromSubmission(
  submission: {
    id: string;
    organizationId: string;
    submittedById: string;
    title: string | null;
    data: unknown;
    template: {
      type: string;
      namingConvention: string | null;
    };
  }
) {
  const formData = submission.data as Record<string, unknown>;

  // Extract key fields from form data
  const clientId = formData.clientId as string;
  const assigneeId = formData.assigneeId as string | undefined;
  const topic = formData.topic as string | undefined;

  if (!clientId) {
    throw new Error("Client is required to create a brief");
  }

  // Generate brief number
  const year = new Date().getFullYear();
  const lastBrief = await db.brief.findFirst({
    where: {
      organizationId: submission.organizationId,
      briefNumber: { startsWith: `LMTD-${year}-` },
    },
    orderBy: { briefNumber: "desc" },
  });

  let nextNumber = 1;
  if (lastBrief) {
    const match = lastBrief.briefNumber.match(/LMTD-\d{4}-(\d+)/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  const briefNumber = `LMTD-${year}-${nextNumber.toString().padStart(3, "0")}`;

  // Get client for title generation
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { name: true, code: true },
  });

  // Generate title based on naming convention
  let title = submission.title || "Untitled Brief";
  if (submission.template.namingConvention && client) {
    // Replace placeholders
    title = submission.template.namingConvention
      .replace("[Client]", client.code || client.name)
      .replace("[Topic]", topic || "Untitled")
      .replace("[Campaign or Topic]", topic || "Untitled");
  }

  // Create the brief
  const brief = await db.brief.create({
    data: {
      organizationId: submission.organizationId,
      briefNumber,
      type: submission.template.type as BriefType,
      title,
      clientId,
      assigneeId,
      createdById: submission.submittedById,
      status: "SUBMITTED",
      formData: formData as Prisma.InputJsonValue,
    },
  });

  // Link submission to brief
  await db.formSubmission.update({
    where: { id: submission.id },
    data: {
      briefId: brief.id,
      status: "COMPLETED",
      completedAt: new Date(),
    },
  });

  return brief;
}
