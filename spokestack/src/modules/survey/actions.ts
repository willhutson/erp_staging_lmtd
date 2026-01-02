"use server";

import { prisma } from "@/lib/prisma";
import { getStudioUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type {
  TemplateKind,
  TemplateCategory,
  SurveyChannel,
  SurveyStatus,
} from "@prisma/client";
import type {
  TemplateListItem,
  SurveyListItem,
  SubmissionListItem,
  SurveyQuestion,
  SurveyDesign,
  SurveySettings,
  DEFAULT_SURVEY_SETTINGS,
  DEFAULT_SURVEY_DESIGN,
  CreateTemplateInput,
  CreateSurveyInput,
} from "./types";

// ============================================
// TEMPLATE ACTIONS
// ============================================

export async function getTemplates(filters?: {
  kind?: TemplateKind;
  category?: TemplateCategory;
  isPublished?: boolean;
  search?: string;
}): Promise<TemplateListItem[]> {
  const user = await getStudioUser();

  const templates = await prisma.surveyTemplate.findMany({
    where: {
      organizationId: user.organizationId,
      isArchived: false,
      ...(filters?.kind && { kind: filters.kind }),
      ...(filters?.category && { category: filters.category }),
      ...(filters?.isPublished !== undefined && { isPublished: filters.isPublished }),
      ...(filters?.search && {
        OR: [
          { name: { contains: filters.search, mode: "insensitive" } },
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
      tags: {
        include: {
          tag: {
            select: {
              id: true,
              name: true,
              color: true,
            },
          },
        },
      },
    },
    orderBy: { updatedAt: "desc" },
  });

  return templates.map((t) => ({
    id: t.id,
    name: t.name,
    slug: t.slug,
    description: t.description,
    kind: t.kind,
    category: t.category,
    isPublished: t.isPublished,
    usageCount: t.usageCount,
    lastUsedAt: t.lastUsedAt,
    createdAt: t.createdAt,
    createdBy: t.createdBy,
    tags: t.tags.map((tt) => tt.tag),
  }));
}

export async function getTemplate(id: string) {
  const user = await getStudioUser();

  const template = await prisma.surveyTemplate.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      currentVersion: true,
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  return {
    ...template,
    schema: template.currentVersion?.schema as SurveyQuestion[] | undefined,
    design: template.currentVersion?.design as SurveyDesign | undefined,
    settings: template.settings as SurveySettings,
    tags: template.tags.map((tt) => tt.tag),
  };
}

export async function createTemplate(input: CreateTemplateInput) {
  const user = await getStudioUser();

  // Generate slug from name
  const slug = input.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  // Check for duplicate slug
  const existing = await prisma.surveyTemplate.findFirst({
    where: {
      organizationId: user.organizationId,
      slug,
    },
  });

  const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

  const template = await prisma.surveyTemplate.create({
    data: {
      organizationId: user.organizationId,
      name: input.name,
      slug: finalSlug,
      description: input.description,
      kind: input.kind,
      category: input.category,
      settings: {},
      createdById: user.id,
    },
  });

  // Create initial version
  const version = await prisma.surveyTemplateVersion.create({
    data: {
      templateId: template.id,
      version: 1,
      schema: [],
      design: {},
      settings: {},
      createdById: user.id,
    },
  });

  // Link version to template
  await prisma.surveyTemplate.update({
    where: { id: template.id },
    data: { currentVersionId: version.id },
  });

  revalidatePath("/surveys/templates");

  return template;
}

export async function saveTemplateVersion(
  templateId: string,
  data: {
    schema: SurveyQuestion[];
    design: SurveyDesign;
    settings: SurveySettings;
    changeNote?: string;
  }
) {
  const user = await getStudioUser();

  const template = await prisma.surveyTemplate.findFirst({
    where: {
      id: templateId,
      organizationId: user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  // Create new version
  const version = await prisma.surveyTemplateVersion.create({
    data: {
      templateId,
      version: template.versionCount + 1,
      schema: data.schema as unknown as object,
      design: data.design as unknown as object,
      settings: data.settings as unknown as object,
      changeNote: data.changeNote,
      createdById: user.id,
    },
  });

  // Update template
  await prisma.surveyTemplate.update({
    where: { id: templateId },
    data: {
      currentVersionId: version.id,
      versionCount: { increment: 1 },
      settings: data.settings as unknown as object,
    },
  });

  revalidatePath(`/surveys/templates/${templateId}`);

  return version;
}

export async function publishTemplate(templateId: string) {
  const user = await getStudioUser();

  await prisma.surveyTemplate.update({
    where: {
      id: templateId,
      organizationId: user.organizationId,
    },
    data: {
      isPublished: true,
    },
  });

  revalidatePath("/surveys/templates");
  revalidatePath(`/surveys/templates/${templateId}`);
}

export async function archiveTemplate(templateId: string) {
  const user = await getStudioUser();

  await prisma.surveyTemplate.update({
    where: {
      id: templateId,
      organizationId: user.organizationId,
    },
    data: {
      isArchived: true,
    },
  });

  revalidatePath("/surveys/templates");
}

// ============================================
// SURVEY ACTIONS
// ============================================

export async function getSurveys(filters?: {
  status?: SurveyStatus;
  templateId?: string;
  targetClientId?: string;
  search?: string;
}): Promise<SurveyListItem[]> {
  const user = await getStudioUser();

  const surveys = await prisma.survey.findMany({
    where: {
      organizationId: user.organizationId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.templateId && { templateId: filters.templateId }),
      ...(filters?.targetClientId && { targetClientId: filters.targetClientId }),
      ...(filters?.search && {
        OR: [
          { title: { contains: filters.search, mode: "insensitive" } },
          { description: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      template: {
        select: {
          id: true,
          name: true,
          kind: true,
        },
      },
      createdBy: {
        select: {
          name: true,
          avatarUrl: true,
        },
      },
      targetClient: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return surveys.map((s) => ({
    id: s.id,
    title: s.title,
    slug: s.slug,
    status: s.status,
    responseCount: s.responseCount,
    maxResponses: s.maxResponses,
    startsAt: s.startsAt,
    endsAt: s.endsAt,
    channels: s.channels,
    createdAt: s.createdAt,
    template: s.template,
    createdBy: s.createdBy,
    targetClient: s.targetClient,
  }));
}

export async function getSurvey(id: string) {
  const user = await getStudioUser();

  const survey = await prisma.survey.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
    },
    include: {
      template: {
        include: {
          currentVersion: true,
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      publishedBy: {
        select: {
          id: true,
          name: true,
        },
      },
      targetClient: true,
    },
  });

  if (!survey) {
    throw new Error("Survey not found");
  }

  return {
    ...survey,
    schema: survey.template.currentVersion?.schema as SurveyQuestion[] | undefined,
    design: survey.template.currentVersion?.design as SurveyDesign | undefined,
  };
}

export async function createSurvey(input: CreateSurveyInput) {
  const user = await getStudioUser();

  const template = await prisma.surveyTemplate.findFirst({
    where: {
      id: input.templateId,
      organizationId: user.organizationId,
    },
  });

  if (!template) {
    throw new Error("Template not found");
  }

  // Generate slug
  const baseSlug = input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  const slug = `${baseSlug}-${Date.now().toString(36)}`;

  const survey = await prisma.survey.create({
    data: {
      organizationId: user.organizationId,
      templateId: input.templateId,
      versionId: template.currentVersionId,
      title: input.title,
      slug,
      description: input.description,
      channels: input.channels || ["WEB_LINK"],
      startsAt: input.startsAt,
      endsAt: input.endsAt,
      maxResponses: input.maxResponses,
      targetClientId: input.targetClientId,
      targetUserIds: input.targetUserIds || [],
      accessCode: input.accessCode,
      createdById: user.id,
    },
  });

  // Update template usage count
  await prisma.surveyTemplate.update({
    where: { id: input.templateId },
    data: {
      usageCount: { increment: 1 },
      lastUsedAt: new Date(),
    },
  });

  revalidatePath("/surveys");

  return survey;
}

export async function updateSurveyStatus(surveyId: string, status: SurveyStatus) {
  const user = await getStudioUser();

  const updateData: {
    status: SurveyStatus;
    publishedById?: string;
    publishedAt?: Date;
    closedAt?: Date;
  } = {
    status,
  };

  if (status === "ACTIVE") {
    updateData.publishedById = user.id;
    updateData.publishedAt = new Date();
  } else if (status === "CLOSED") {
    updateData.closedAt = new Date();
  }

  await prisma.survey.update({
    where: {
      id: surveyId,
      organizationId: user.organizationId,
    },
    data: updateData,
  });

  revalidatePath("/surveys");
  revalidatePath(`/surveys/${surveyId}`);
}

// ============================================
// SUBMISSION ACTIONS
// ============================================

export async function getSubmissions(
  surveyId: string,
  filters?: {
    status?: string;
    search?: string;
  }
): Promise<SubmissionListItem[]> {
  const user = await getStudioUser();

  // First verify the survey belongs to the org
  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      organizationId: user.organizationId,
    },
  });

  if (!survey) {
    throw new Error("Survey not found");
  }

  const submissions = await prisma.surveySubmission.findMany({
    where: {
      surveyId,
      ...(filters?.status && { status: filters.status as any }),
      ...(filters?.search && {
        OR: [
          { respondentEmail: { contains: filters.search, mode: "insensitive" } },
          { respondentName: { contains: filters.search, mode: "insensitive" } },
        ],
      }),
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
      contact: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return submissions.map((s) => ({
    id: s.id,
    status: s.status,
    respondentEmail: s.respondentEmail,
    respondentName: s.respondentName,
    score: s.score,
    maxScore: s.maxScore,
    startedAt: s.startedAt,
    submittedAt: s.submittedAt,
    timeSpent: s.timeSpent,
    user: s.user,
    contact: s.contact,
  }));
}

export async function getSubmission(id: string) {
  const user = await getStudioUser();

  const submission = await prisma.surveySubmission.findFirst({
    where: { id },
    include: {
      survey: {
        where: {
          organizationId: user.organizationId,
        },
        include: {
          template: {
            include: {
              currentVersion: true,
            },
          },
        },
      },
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatarUrl: true,
        },
      },
      contact: true,
    },
  });

  if (!submission?.survey) {
    throw new Error("Submission not found");
  }

  return {
    ...submission,
    answers: submission.answers as Record<string, any>,
  };
}

// ============================================
// ANALYTICS ACTIONS
// ============================================

export async function getSurveyAnalytics(surveyId: string) {
  const user = await getStudioUser();

  const survey = await prisma.survey.findFirst({
    where: {
      id: surveyId,
      organizationId: user.organizationId,
    },
  });

  if (!survey) {
    throw new Error("Survey not found");
  }

  const submissions = await prisma.surveySubmission.findMany({
    where: { surveyId },
    select: {
      status: true,
      submittedAt: true,
      timeSpent: true,
      score: true,
      maxScore: true,
    },
  });

  const completed = submissions.filter((s) => s.status === "COMPLETED");
  const abandoned = submissions.filter((s) => s.status === "ABANDONED");

  return {
    surveyId,
    totalSubmissions: submissions.length,
    completedSubmissions: completed.length,
    abandonedSubmissions: abandoned.length,
    completionRate: submissions.length > 0
      ? Math.round((completed.length / submissions.length) * 100)
      : 0,
    avgTimeSpent: completed.length > 0
      ? Math.round(
          completed.reduce((sum, s) => sum + (s.timeSpent || 0), 0) / completed.length
        )
      : 0,
    avgScore: completed.filter((s) => s.score !== null).length > 0
      ? Math.round(
          completed.reduce((sum, s) => sum + (s.score || 0), 0) /
            completed.filter((s) => s.score !== null).length
        )
      : undefined,
  };
}

// ============================================
// TAG ACTIONS
// ============================================

export async function getTags() {
  const user = await getStudioUser();

  return prisma.surveyTag.findMany({
    where: {
      OR: [
        { organizationId: user.organizationId },
        { organizationId: null },  // System tags
      ],
    },
    orderBy: { name: "asc" },
  });
}

export async function createTag(name: string, color?: string) {
  const user = await getStudioUser();

  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return prisma.surveyTag.create({
    data: {
      organizationId: user.organizationId,
      name,
      slug,
      color,
    },
  });
}
