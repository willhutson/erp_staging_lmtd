"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export type ComplaintSource = "EMAIL" | "WHATSAPP" | "PHONE_CALL" | "NPS_SURVEY" | "MEETING" | "PORTAL" | "OTHER";
export type ComplaintCategory = "QUALITY" | "TIMELINE" | "COMMUNICATION" | "SCOPE" | "BILLING" | "PERSONNEL" | "OTHER";
export type ComplaintSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type ComplaintStatus = "NEW" | "ACKNOWLEDGED" | "IN_PROGRESS" | "PENDING_CLIENT" | "RESOLVED" | "CLOSED";

export interface CreateComplaintInput {
  clientId: string;
  source: ComplaintSource;
  sourceId?: string;
  sourceUrl?: string;
  contactId?: string;
  title: string;
  description: string;
  category?: ComplaintCategory;
  briefId?: string;
  npsResponseId?: string;
  severity?: ComplaintSeverity;
  assignedToId?: string;
  keywords?: string[];
}

export interface UpdateComplaintInput {
  title?: string;
  description?: string;
  category?: ComplaintCategory;
  severity?: ComplaintSeverity;
  status?: ComplaintStatus;
  priority?: number;
  assignedToId?: string | null;
  resolution?: string;
  followUpDate?: Date | null;
  followUpNotes?: string;
  keywords?: string[];
}

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all complaints for the organization
 */
export async function getComplaints(options?: {
  clientId?: string;
  status?: ComplaintStatus;
  severity?: ComplaintSeverity;
  assignedToId?: string;
  source?: ComplaintSource;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.clientId) where.clientId = options.clientId;
  if (options?.status) where.status = options.status;
  if (options?.severity) where.severity = options.severity;
  if (options?.assignedToId) where.assignedToId = options.assignedToId;
  if (options?.source) where.source = options.source;

  return db.clientComplaint.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, code: true } },
      contact: { select: { id: true, name: true, email: true } },
      assignedTo: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true, briefNumber: true } },
      npsResponse: {
        select: {
          id: true,
          score: true,
          category: true,
          whatToImprove: true,
        },
      },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
    take: options?.limit ?? 50,
  });
}

/**
 * Get a single complaint
 */
export async function getComplaint(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const complaint = await db.clientComplaint.findUnique({
    where: { id },
    include: {
      client: { select: { id: true, name: true, code: true } },
      contact: { select: { id: true, name: true, email: true, phone: true } },
      assignedTo: { select: { id: true, name: true } },
      brief: {
        select: {
          id: true,
          title: true,
          briefNumber: true,
          status: true,
          assignee: { select: { id: true, name: true } },
        },
      },
      npsResponse: {
        select: {
          id: true,
          score: true,
          category: true,
          whatWeDoWell: true,
          whatToImprove: true,
          additionalNotes: true,
          survey: {
            select: { quarter: true, year: true },
          },
        },
      },
    },
  });

  if (!complaint || complaint.organizationId !== session.user.organizationId) {
    return null;
  }

  return complaint;
}

/**
 * Create a new complaint
 */
export async function createComplaint(input: CreateComplaintInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify client exists
  const client = await db.client.findUnique({
    where: { id: input.clientId },
    select: { organizationId: true },
  });

  if (!client || client.organizationId !== session.user.organizationId) {
    throw new Error("Client not found");
  }

  // Calculate priority based on severity
  const priorityMap: Record<ComplaintSeverity, number> = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
    CRITICAL: 4,
  };

  const complaint = await db.clientComplaint.create({
    data: {
      organizationId: session.user.organizationId,
      clientId: input.clientId,
      source: input.source,
      sourceId: input.sourceId,
      sourceUrl: input.sourceUrl,
      contactId: input.contactId,
      title: input.title,
      description: input.description,
      category: input.category,
      briefId: input.briefId,
      npsResponseId: input.npsResponseId,
      severity: input.severity ?? "MEDIUM",
      priority: priorityMap[input.severity ?? "MEDIUM"],
      assignedToId: input.assignedToId,
      keywords: input.keywords ?? [],
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
  });

  revalidatePath("/complaints");
  revalidatePath(`/clients/${input.clientId}`);

  return complaint;
}

/**
 * Update a complaint
 */
export async function updateComplaint(id: string, input: UpdateComplaintInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.clientComplaint.findUnique({
    where: { id },
  });

  if (!existing || existing.organizationId !== session.user.organizationId) {
    throw new Error("Complaint not found");
  }

  // Update priority if severity changes
  let priority = input.priority;
  if (input.severity && !priority) {
    const priorityMap: Record<ComplaintSeverity, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4,
    };
    priority = priorityMap[input.severity];
  }

  // Set resolved timestamp if status is RESOLVED or CLOSED
  let resolvedAt = undefined;
  let resolvedById = undefined;
  if (
    (input.status === "RESOLVED" || input.status === "CLOSED") &&
    existing.status !== "RESOLVED" &&
    existing.status !== "CLOSED"
  ) {
    resolvedAt = new Date();
    resolvedById = session.user.id;
  }

  const complaint = await db.clientComplaint.update({
    where: { id },
    data: {
      title: input.title,
      description: input.description,
      category: input.category,
      severity: input.severity,
      status: input.status,
      priority,
      assignedToId: input.assignedToId,
      resolution: input.resolution,
      resolvedAt,
      resolvedById,
      followUpDate: input.followUpDate,
      followUpNotes: input.followUpNotes,
      keywords: input.keywords,
    },
  });

  revalidatePath("/complaints");
  revalidatePath(`/complaints/${id}`);
  revalidatePath(`/clients/${existing.clientId}`);

  return complaint;
}

/**
 * Delete a complaint
 */
export async function deleteComplaint(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.clientComplaint.findUnique({
    where: { id },
  });

  if (!existing || existing.organizationId !== session.user.organizationId) {
    throw new Error("Complaint not found");
  }

  await db.clientComplaint.delete({ where: { id } });

  revalidatePath("/complaints");
  revalidatePath(`/clients/${existing.clientId}`);
}

// ============================================
// NPS INTEGRATION
// ============================================

/**
 * Create complaints from NPS detractor responses
 */
export async function createComplaintsFromNPS(options?: {
  minScore?: number;
  maxScore?: number;
  quarter?: number;
  year?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Find detractor responses without complaints
  const responses = await db.nPSResponse.findMany({
    where: {
      survey: {
        organizationId: session.user.organizationId,
        status: "COMPLETED",
        ...(options?.quarter && { quarter: options.quarter }),
        ...(options?.year && { year: options.year }),
      },
      category: "DETRACTOR",
      score: {
        gte: options?.minScore ?? 0,
        lte: options?.maxScore ?? 6,
      },
      complaints: { none: {} },
    },
    include: {
      survey: {
        include: {
          client: { select: { id: true, name: true } },
        },
      },
      contact: { select: { id: true, name: true } },
    },
  });

  const created: string[] = [];

  for (const response of responses) {
    // Only create complaint if there's improvement feedback
    if (!response.whatToImprove) continue;

    const complaint = await db.clientComplaint.create({
      data: {
        organizationId: session.user.organizationId,
        clientId: response.survey.clientId,
        source: "NPS_SURVEY",
        sourceId: response.id,
        contactId: response.contactId,
        title: `NPS Detractor Feedback - Q${response.survey.quarter} ${response.survey.year}`,
        description: response.whatToImprove,
        category: "OTHER",
        npsResponseId: response.id,
        severity: response.score <= 3 ? "HIGH" : "MEDIUM",
        priority: response.score <= 3 ? 3 : 2,
        sentimentScore: (response.score - 5) / 5, // Map 0-6 to -1.0 to 0.2
      },
    });

    created.push(complaint.id);
  }

  revalidatePath("/complaints");
  revalidatePath("/nps");

  return { created: created.length, complaintIds: created };
}

// ============================================
// ANALYTICS
// ============================================

/**
 * Get complaint statistics
 */
export async function getComplaintStats(clientId?: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };
  if (clientId) where.clientId = clientId;

  const [
    total,
    byStatus,
    bySeverity,
    bySource,
    byCategory,
    avgResolutionTime,
  ] = await Promise.all([
    db.clientComplaint.count({ where }),

    db.clientComplaint.groupBy({
      by: ["status"],
      where,
      _count: true,
    }),

    db.clientComplaint.groupBy({
      by: ["severity"],
      where,
      _count: true,
    }),

    db.clientComplaint.groupBy({
      by: ["source"],
      where,
      _count: true,
    }),

    db.clientComplaint.groupBy({
      by: ["category"],
      where,
      _count: true,
    }),

    // Average resolution time for resolved complaints
    db.$queryRaw<[{ avgDays: number }]>`
      SELECT AVG(EXTRACT(EPOCH FROM ("resolvedAt" - "createdAt")) / 86400) as "avgDays"
      FROM client_complaints
      WHERE "organizationId" = ${session.user.organizationId}
      ${clientId ? db.$queryRaw`AND "clientId" = ${clientId}` : db.$queryRaw``}
      AND "resolvedAt" IS NOT NULL
    `,
  ]);

  // Open vs closed
  const openStatuses: ComplaintStatus[] = ["NEW", "ACKNOWLEDGED", "IN_PROGRESS", "PENDING_CLIENT"];
  const openCount = byStatus
    .filter((s: { status: string }) => openStatuses.includes(s.status as ComplaintStatus))
    .reduce((sum: number, s: { _count: number }) => sum + s._count, 0);

  return {
    total,
    open: openCount,
    closed: total - openCount,
    byStatus: Object.fromEntries(byStatus.map((s: { status: string; _count: number }) => [s.status, s._count])),
    bySeverity: Object.fromEntries(bySeverity.map((s: { severity: string; _count: number }) => [s.severity, s._count])),
    bySource: Object.fromEntries(bySource.map((s: { source: string; _count: number }) => [s.source, s._count])),
    byCategory: Object.fromEntries(
      byCategory
        .filter((c) => c.category !== null)
        .map((c) => [c.category!, c._count])
    ),
    avgResolutionDays: avgResolutionTime[0]?.avgDays ?? null,
  };
}

/**
 * Get clients with most complaints
 */
export async function getClientComplaintRanking(limit: number = 10) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const rankings = await db.clientComplaint.groupBy({
    by: ["clientId"],
    where: {
      organizationId: session.user.organizationId,
    },
    _count: true,
    orderBy: { _count: { clientId: "desc" } },
    take: limit,
  });

  // Get client details
  const clientIds = rankings.map((r: { clientId: string }) => r.clientId);
  const clients = await db.client.findMany({
    where: { id: { in: clientIds } },
    select: { id: true, name: true, code: true },
  });

  const clientMap = Object.fromEntries(clients.map((c) => [c.id, c]));

  return rankings.map((r: { clientId: string; _count: number }) => ({
    client: clientMap[r.clientId],
    complaintCount: r._count,
  }));
}

/**
 * Get complaint trends over time
 */
export async function getComplaintTrends(months: number = 6) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);

  const complaints = await db.clientComplaint.findMany({
    where: {
      organizationId: session.user.organizationId,
      createdAt: { gte: startDate },
    },
    select: {
      createdAt: true,
      severity: true,
      source: true,
      status: true,
      resolvedAt: true,
    },
  });

  // Group by month
  const byMonth: Record<string, {
    total: number;
    resolved: number;
    bySeverity: Record<string, number>;
    bySource: Record<string, number>;
  }> = {};

  for (const complaint of complaints) {
    const monthKey = `${complaint.createdAt.getFullYear()}-${String(complaint.createdAt.getMonth() + 1).padStart(2, "0")}`;

    if (!byMonth[monthKey]) {
      byMonth[monthKey] = { total: 0, resolved: 0, bySeverity: {}, bySource: {} };
    }

    byMonth[monthKey].total++;
    if (complaint.resolvedAt) byMonth[monthKey].resolved++;

    byMonth[monthKey].bySeverity[complaint.severity] =
      (byMonth[monthKey].bySeverity[complaint.severity] ?? 0) + 1;
    byMonth[monthKey].bySource[complaint.source] =
      (byMonth[monthKey].bySource[complaint.source] ?? 0) + 1;
  }

  return Object.entries(byMonth)
    .map(([month, data]) => ({ month, ...data }))
    .sort((a, b) => a.month.localeCompare(b.month));
}
