"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export type ContactType = "PROSPECT" | "LEAD" | "CUSTOMER" | "PARTNER" | "VENDOR" | "INFLUENCER" | "PRESS" | "INVESTOR" | "OTHER";
export type ContactStatus = "ACTIVE" | "INACTIVE" | "UNSUBSCRIBED" | "BOUNCED" | "DO_NOT_CONTACT" | "ARCHIVED";
export type DealContactRole = "DECISION_MAKER" | "INFLUENCER" | "CHAMPION" | "BLOCKER" | "END_USER" | "PROCUREMENT" | "FINANCE" | "LEGAL" | "TECHNICAL";
export type CRMTaskType = "TODO" | "CALL" | "EMAIL" | "MEETING" | "FOLLOW_UP" | "DEMO" | "PROPOSAL" | "CONTRACT" | "OTHER";
export type CRMTaskStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "DEFERRED";

export interface CreateContactInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  mobile?: string;
  jobTitle?: string;
  department?: string;
  companyName?: string;
  companyId?: string;
  linkedIn?: string;
  contactType?: ContactType;
  tags?: string[];
}

export interface CreateDealInput {
  pipelineId: string;
  name: string;
  description?: string;
  stageId: string;
  amount?: number;
  currency?: string;
  expectedCloseDate?: Date;
  clientId?: string;
  primaryContactId?: string;
  source?: string;
}

// ============================================
// CONTACT OPERATIONS
// ============================================

export async function getContacts(options?: {
  companyId?: string;
  status?: ContactStatus;
  contactType?: ContactType;
  search?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.companyId) where.companyId = options.companyId;
  if (options?.status) where.status = options.status;
  if (options?.contactType) where.contactType = options.contactType;
  if (options?.search) {
    where.OR = [
      { firstName: { contains: options.search, mode: "insensitive" } },
      { lastName: { contains: options.search, mode: "insensitive" } },
      { email: { contains: options.search, mode: "insensitive" } },
      { companyName: { contains: options.search, mode: "insensitive" } },
    ];
  }

  return db.contact.findMany({
    where,
    include: {
      company: { select: { id: true, name: true, code: true } },
      owner: { select: { id: true, name: true } },
      _count: { select: { deals: true, activities: true } },
    },
    orderBy: { createdAt: "desc" },
    take: options?.limit ?? 50,
  });
}

export async function getContact(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.contact.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      company: true,
      owner: { select: { id: true, name: true, email: true } },
      activities: {
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      deals: {
        include: {
          deal: {
            include: {
              pipeline: { select: { id: true, name: true } },
            },
          },
        },
      },
      notes: {
        include: {
          createdBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
      tasks: {
        where: { status: { not: "COMPLETED" } },
        orderBy: { dueDate: "asc" },
        take: 5,
      },
    },
  });
}

export async function createContact(input: CreateContactInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const contact = await db.contact.create({
    data: {
      organizationId: session.user.organizationId,
      firstName: input.firstName,
      lastName: input.lastName,
      email: input.email,
      phone: input.phone,
      mobile: input.mobile,
      jobTitle: input.jobTitle,
      department: input.department,
      companyName: input.companyName,
      companyId: input.companyId,
      linkedIn: input.linkedIn,
      contactType: input.contactType || "PROSPECT",
      tags: input.tags || [],
      ownerId: session.user.id,
    },
  });

  revalidatePath("/crm/contacts");
  return contact;
}

export async function updateContact(id: string, input: Partial<CreateContactInput> & { status?: ContactStatus }) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const contact = await db.contact.update({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    data: {
      ...input,
    },
  });

  revalidatePath("/crm/contacts");
  revalidatePath(`/crm/contacts/${id}`);
  return contact;
}

export async function deleteContact(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  await db.contact.delete({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  revalidatePath("/crm/contacts");
}

// ============================================
// PIPELINE OPERATIONS
// ============================================

export async function getSalesPipelines() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.salesPipeline.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
    },
    include: {
      _count: { select: { deals: true } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getSalesPipeline(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.salesPipeline.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      deals: {
        include: {
          client: { select: { id: true, name: true, code: true } },
          owner: { select: { id: true, name: true } },
          contacts: {
            include: {
              contact: { select: { id: true, firstName: true, lastName: true, email: true } },
            },
            where: { isPrimary: true },
            take: 1,
          },
        },
        orderBy: { updatedAt: "desc" },
      },
    },
  });
}

export async function createSalesPipeline(input: {
  name: string;
  description?: string;
  stages: Array<{ id: string; name: string; order: number; probability: number; color: string; isClosed?: boolean; isWon?: boolean }>;
  defaultCurrency?: string;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const pipeline = await db.salesPipeline.create({
    data: {
      organizationId: session.user.organizationId,
      name: input.name,
      description: input.description,
      stages: input.stages,
      defaultCurrency: input.defaultCurrency || "USD",
    },
  });

  revalidatePath("/crm/deals");
  return pipeline;
}

// ============================================
// DEAL OPERATIONS
// ============================================

export async function getDeals(options?: {
  pipelineId?: string;
  stageId?: string;
  ownerId?: string;
  clientId?: string;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.pipelineId) where.pipelineId = options.pipelineId;
  if (options?.stageId) where.stageId = options.stageId;
  if (options?.ownerId) where.ownerId = options.ownerId;
  if (options?.clientId) where.clientId = options.clientId;

  return db.cRMDeal.findMany({
    where,
    include: {
      pipeline: { select: { id: true, name: true, stages: true } },
      client: { select: { id: true, name: true, code: true } },
      owner: { select: { id: true, name: true } },
      contacts: {
        include: {
          contact: { select: { id: true, firstName: true, lastName: true, email: true } },
        },
        where: { isPrimary: true },
        take: 1,
      },
    },
    orderBy: { updatedAt: "desc" },
    take: options?.limit ?? 100,
  });
}

export async function getDeal(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.cRMDeal.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
    include: {
      pipeline: true,
      client: true,
      owner: { select: { id: true, name: true, email: true } },
      contacts: {
        include: {
          contact: true,
        },
      },
      activities: {
        include: {
          performedBy: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      products: {
        include: {
          product: true,
        },
        orderBy: { sortOrder: "asc" },
      },
      history: {
        include: {
          changedBy: { select: { id: true, name: true } },
        },
        orderBy: { changedAt: "desc" },
        take: 10,
      },
      tasks: {
        include: {
          assignedTo: { select: { id: true, name: true } },
        },
        where: { status: { not: "COMPLETED" } },
        orderBy: { dueDate: "asc" },
        take: 5,
      },
    },
  });
}

export async function createDeal(input: CreateDealInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify pipeline exists
  const pipeline = await db.salesPipeline.findFirst({
    where: {
      id: input.pipelineId,
      organizationId: session.user.organizationId,
    },
  });

  if (!pipeline) throw new Error("Pipeline not found");

  const deal = await db.cRMDeal.create({
    data: {
      organizationId: session.user.organizationId,
      pipelineId: input.pipelineId,
      name: input.name,
      description: input.description,
      stageId: input.stageId,
      amount: input.amount,
      currency: input.currency || "USD",
      expectedCloseDate: input.expectedCloseDate,
      clientId: input.clientId,
      primaryContactId: input.primaryContactId,
      ownerId: session.user.id,
    },
  });

  // Create initial activity
  await db.dealActivity.create({
    data: {
      dealId: deal.id,
      activityType: "CREATED",
      subject: "Deal created",
      performedById: session.user.id,
    },
  });

  // Create initial stage history
  await db.dealStageHistory.create({
    data: {
      dealId: deal.id,
      toStageId: input.stageId,
      changedById: session.user.id,
    },
  });

  revalidatePath("/crm/deals");
  return deal;
}

export async function updateDealStage(id: string, newStageId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const deal = await db.cRMDeal.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!deal) throw new Error("Deal not found");

  const oldStageId = deal.stageId;

  // Update deal
  const updatedDeal = await db.cRMDeal.update({
    where: { id },
    data: {
      stageId: newStageId,
      lastActivityAt: new Date(),
    },
  });

  // Create activity
  await db.dealActivity.create({
    data: {
      dealId: id,
      activityType: "STAGE_CHANGED",
      subject: "Stage changed",
      oldValue: oldStageId,
      newValue: newStageId,
      performedById: session.user.id,
    },
  });

  // Create stage history
  await db.dealStageHistory.create({
    data: {
      dealId: id,
      fromStageId: oldStageId,
      toStageId: newStageId,
      changedById: session.user.id,
    },
  });

  revalidatePath("/crm/deals");
  return updatedDeal;
}

// ============================================
// CRM STATS
// ============================================

export async function getCRMStats() {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const [contacts, activeDeals, totalValue, tasks] = await Promise.all([
    db.contact.count({ where: { organizationId: session.user.organizationId } }),
    db.cRMDeal.count({
      where: {
        organizationId: session.user.organizationId,
        actualCloseDate: null,
      },
    }),
    db.cRMDeal.aggregate({
      where: {
        organizationId: session.user.organizationId,
        actualCloseDate: null,
      },
      _sum: { amount: true },
    }),
    db.cRMTask.count({
      where: {
        organizationId: session.user.organizationId,
        status: "PENDING",
        dueDate: { lte: new Date() },
      },
    }),
  ]);

  return {
    contacts,
    activeDeals,
    pipelineValue: totalValue._sum.amount || 0,
    overdueTasks: tasks,
  };
}
