"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

// ============================================
// TYPES
// ============================================

export type RetainerPeriodStatus = "PLANNED" | "ACTIVE" | "COMPLETED" | "RECONCILED";

export interface CreateRetainerPeriodInput {
  clientId: string;
  year: number;
  month: number;
  plannedDeliverables?: number;
  deliverableBreakdown?: Record<string, number>; // e.g., { VIDEO: 5, DESIGN: 10 }
  budgetHours?: number;
  budgetValue?: number;
  contractValue?: number;
  notes?: string;
}

export interface UpdateRetainerPeriodInput {
  plannedDeliverables?: number;
  deliverableBreakdown?: Record<string, number>;
  budgetHours?: number;
  budgetValue?: number;
  contractValue?: number;
  actualDeliverables?: number;
  actualHours?: number;
  actualCost?: number;
  burnRate?: number;
  marginPercent?: number;
  status?: RetainerPeriodStatus;
  notes?: string;
  rolloverDeliverables?: number;
  rolloverHours?: number;
}

// Inferred types
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RetainerPeriodRecord = Awaited<ReturnType<typeof db.retainerPeriod.findMany>>[number];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RetainerWithClient = Awaited<ReturnType<typeof db.retainerPeriod.findFirst<{
  include: { client: true }
}>>>;

// ============================================
// CRUD OPERATIONS
// ============================================

/**
 * Get all retainer periods for the organization
 */
export async function getRetainerPeriods(options?: {
  clientId?: string;
  year?: number;
  month?: number;
  status?: RetainerPeriodStatus;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const where: Record<string, unknown> = {
    organizationId: session.user.organizationId,
  };

  if (options?.clientId) where.clientId = options.clientId;
  if (options?.year) where.year = options.year;
  if (options?.month) where.month = options.month;
  if (options?.status) where.status = options.status;

  return db.retainerPeriod.findMany({
    where,
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: options?.limit ?? 50,
  });
}

/**
 * Get a single retainer period by ID
 */
export async function getRetainerPeriod(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const period = await db.retainerPeriod.findUnique({
    where: { id },
    include: {
      client: true,
    },
  });

  if (!period || period.organizationId !== session.user.organizationId) {
    return null;
  }

  return period;
}

/**
 * Get retainer period for a specific client and month
 */
export async function getRetainerPeriodByMonth(clientId: string, year: number, month: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.retainerPeriod.findUnique({
    where: {
      clientId_year_month: { clientId, year, month },
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
  });
}

/**
 * Get all retainer periods for a specific client
 */
export async function getRetainerPeriodsForClient(clientId: string, options?: {
  year?: number;
  limit?: number;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify client exists and belongs to org
  const client = await db.client.findUnique({
    where: { id: clientId },
    select: { organizationId: true },
  });

  if (!client || client.organizationId !== session.user.organizationId) {
    throw new Error("Client not found");
  }

  const where: Record<string, unknown> = { clientId };
  if (options?.year) where.year = options.year;

  return db.retainerPeriod.findMany({
    where,
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: options?.limit ?? 24, // Default to 2 years of data
  });
}

/**
 * Create a new retainer period
 */
export async function createRetainerPeriod(input: CreateRetainerPeriodInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  // Verify client exists and belongs to org
  const client = await db.client.findUnique({
    where: { id: input.clientId },
    select: { organizationId: true },
  });

  if (!client || client.organizationId !== session.user.organizationId) {
    throw new Error("Client not found");
  }

  // Check for existing period
  const existing = await db.retainerPeriod.findUnique({
    where: {
      clientId_year_month: {
        clientId: input.clientId,
        year: input.year,
        month: input.month,
      },
    },
  });

  if (existing) {
    throw new Error(`Retainer period for ${input.month}/${input.year} already exists`);
  }

  const period = await db.retainerPeriod.create({
    data: {
      organizationId: session.user.organizationId,
      clientId: input.clientId,
      year: input.year,
      month: input.month,
      plannedDeliverables: input.plannedDeliverables,
      deliverableBreakdown: input.deliverableBreakdown ?? {},
      budgetHours: input.budgetHours,
      budgetValue: input.budgetValue,
      contractValue: input.contractValue,
      notes: input.notes,
      status: "PLANNED",
    },
  });

  revalidatePath(`/clients/${input.clientId}`);
  revalidatePath("/retainer");

  return period;
}

/**
 * Update a retainer period
 */
export async function updateRetainerPeriod(id: string, input: UpdateRetainerPeriodInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.retainerPeriod.findUnique({
    where: { id },
  });

  if (!existing || existing.organizationId !== session.user.organizationId) {
    throw new Error("Retainer period not found");
  }

  // Calculate burn rate if actuals are provided
  let burnRate = input.burnRate;
  if (input.actualDeliverables !== undefined && existing.plannedDeliverables) {
    burnRate = (input.actualDeliverables / existing.plannedDeliverables) * 100;
  }

  // Calculate margin if actuals and contract value available
  let marginPercent = input.marginPercent;
  if (input.actualCost !== undefined && existing.contractValue) {
    const contractVal = Number(existing.contractValue);
    const costVal = input.actualCost;
    if (contractVal > 0) {
      marginPercent = ((contractVal - costVal) / contractVal) * 100;
    }
  }

  const period = await db.retainerPeriod.update({
    where: { id },
    data: {
      plannedDeliverables: input.plannedDeliverables,
      deliverableBreakdown: input.deliverableBreakdown,
      budgetHours: input.budgetHours,
      budgetValue: input.budgetValue,
      contractValue: input.contractValue,
      actualDeliverables: input.actualDeliverables,
      actualHours: input.actualHours,
      actualCost: input.actualCost,
      burnRate,
      marginPercent,
      status: input.status,
      notes: input.notes,
      rolloverDeliverables: input.rolloverDeliverables,
      rolloverHours: input.rolloverHours,
    },
  });

  revalidatePath(`/clients/${existing.clientId}`);
  revalidatePath("/retainer");

  return period;
}

/**
 * Delete a retainer period
 */
export async function deleteRetainerPeriod(id: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const existing = await db.retainerPeriod.findUnique({
    where: { id },
  });

  if (!existing || existing.organizationId !== session.user.organizationId) {
    throw new Error("Retainer period not found");
  }

  await db.retainerPeriod.delete({ where: { id } });

  revalidatePath(`/clients/${existing.clientId}`);
  revalidatePath("/retainer");
}

// ============================================
// ANALYTICS & CALCULATIONS
// ============================================

/**
 * Calculate actuals from deliverables for a period
 */
export async function recalculateRetainerActuals(clientId: string, year: number, month: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  // Count delivered deliverables for this client in this period
  const deliverables = await db.deliverable.findMany({
    where: {
      brief: {
        clientId,
        organizationId: session.user.organizationId,
      },
      status: { in: ["APPROVED", "DELIVERED"] },
      approvedAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      brief: { select: { type: true } },
    },
  });

  // Sum up time entries for this client in this period
  const timeEntries = await db.timeEntry.aggregate({
    where: {
      brief: {
        clientId,
        organizationId: session.user.organizationId,
      },
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    _sum: {
      hours: true,
    },
  });

  // Group deliverables by type
  const byType: Record<string, number> = {};
  for (const d of deliverables) {
    byType[d.brief.type] = (byType[d.brief.type] || 0) + 1;
  }

  return {
    actualDeliverables: deliverables.length,
    actualHours: Number(timeEntries._sum.hours ?? 0),
    deliverablesByType: byType,
  };
}

/**
 * Get retainer dashboard data for all clients
 */
export async function getRetainerDashboard(year?: number, month?: number) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const now = new Date();
  const targetYear = year ?? now.getFullYear();
  const targetMonth = month ?? now.getMonth() + 1;

  // Get all retainer periods for current month
  const periods = await db.retainerPeriod.findMany({
    where: {
      organizationId: session.user.organizationId,
      year: targetYear,
      month: targetMonth,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
  });

  // Get clients with retainers but no period for this month
  const clientsWithPeriods = new Set(periods.map((p: { clientId: string }) => p.clientId));

  const allClients = await db.client.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
    },
    select: { id: true, name: true, code: true },
  });

  // Summary calculations
  const summary = {
    totalPlannedDeliverables: 0,
    totalActualDeliverables: 0,
    totalPlannedHours: 0,
    totalActualHours: 0,
    totalContractValue: 0,
    totalActualCost: 0,
    averageBurnRate: 0,
    averageMargin: 0,
    clientsOnTrack: 0,
    clientsOverBurn: 0,
    clientsUnderBurn: 0,
  };

  for (const period of periods) {
    summary.totalPlannedDeliverables += period.plannedDeliverables ?? 0;
    summary.totalActualDeliverables += period.actualDeliverables;
    summary.totalPlannedHours += Number(period.budgetHours ?? 0);
    summary.totalActualHours += Number(period.actualHours);
    summary.totalContractValue += Number(period.contractValue ?? 0);
    summary.totalActualCost += Number(period.actualCost);

    const burnRate = Number(period.burnRate ?? 0);
    if (burnRate >= 90 && burnRate <= 110) {
      summary.clientsOnTrack++;
    } else if (burnRate > 110) {
      summary.clientsOverBurn++;
    } else if (burnRate > 0) {
      summary.clientsUnderBurn++;
    }
  }

  if (periods.length > 0) {
    const totalBurnRate = periods.reduce((sum, p) => sum + Number(p.burnRate ?? 0), 0);
    const totalMargin = periods.reduce((sum, p) => sum + Number(p.marginPercent ?? 0), 0);
    summary.averageBurnRate = totalBurnRate / periods.length;
    summary.averageMargin = totalMargin / periods.length;
  }

  return {
    year: targetYear,
    month: targetMonth,
    periods,
    clientsWithoutPeriod: allClients.filter((c: { id: string }) => !clientsWithPeriods.has(c.id)),
    summary,
  };
}

/**
 * Get year-to-date summary for a client
 */
export async function getClientYTDSummary(clientId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const now = new Date();
  const year = now.getFullYear();

  const periods = await db.retainerPeriod.findMany({
    where: {
      organizationId: session.user.organizationId,
      clientId,
      year,
    },
    orderBy: { month: "asc" },
  });

  const ytd = {
    totalPlannedDeliverables: 0,
    totalActualDeliverables: 0,
    totalPlannedHours: 0,
    totalActualHours: 0,
    totalContractValue: 0,
    totalActualCost: 0,
    averageMonthlyBurn: 0,
    averageMargin: 0,
    monthlyTrend: [] as Array<{
      month: number;
      planned: number;
      actual: number;
      burnRate: number;
    }>,
  };

  for (const period of periods) {
    ytd.totalPlannedDeliverables += period.plannedDeliverables ?? 0;
    ytd.totalActualDeliverables += period.actualDeliverables;
    ytd.totalPlannedHours += Number(period.budgetHours ?? 0);
    ytd.totalActualHours += Number(period.actualHours);
    ytd.totalContractValue += Number(period.contractValue ?? 0);
    ytd.totalActualCost += Number(period.actualCost);

    ytd.monthlyTrend.push({
      month: period.month,
      planned: period.plannedDeliverables ?? 0,
      actual: period.actualDeliverables,
      burnRate: Number(period.burnRate ?? 0),
    });
  }

  if (periods.length > 0) {
    const totalBurnRate = periods.reduce((sum, p) => sum + Number(p.burnRate ?? 0), 0);
    const totalMargin = periods.reduce((sum, p) => sum + Number(p.marginPercent ?? 0), 0);
    ytd.averageMonthlyBurn = totalBurnRate / periods.length;
    ytd.averageMargin = totalMargin / periods.length;
  }

  return ytd;
}

/**
 * Get monthly trend across all clients
 */
export async function getRetainerTrends(months: number = 6) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  const periods = await db.retainerPeriod.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      client: { select: { id: true, name: true, code: true } },
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
    take: months * 10, // Approximate max clients
  });

  // Group by month
  const byMonth: Record<string, {
    year: number;
    month: number;
    totalPlanned: number;
    totalActual: number;
    totalRevenue: number;
    totalCost: number;
    avgBurnRate: number;
    avgMargin: number;
    clientCount: number;
  }> = {};

  for (const period of periods) {
    const key = `${period.year}-${String(period.month).padStart(2, "0")}`;

    if (!byMonth[key]) {
      byMonth[key] = {
        year: period.year,
        month: period.month,
        totalPlanned: 0,
        totalActual: 0,
        totalRevenue: 0,
        totalCost: 0,
        avgBurnRate: 0,
        avgMargin: 0,
        clientCount: 0,
      };
    }

    byMonth[key].totalPlanned += period.plannedDeliverables ?? 0;
    byMonth[key].totalActual += period.actualDeliverables;
    byMonth[key].totalRevenue += Number(period.contractValue ?? 0);
    byMonth[key].totalCost += Number(period.actualCost);
    byMonth[key].avgBurnRate += Number(period.burnRate ?? 0);
    byMonth[key].avgMargin += Number(period.marginPercent ?? 0);
    byMonth[key].clientCount++;
  }

  // Calculate averages
  for (const key in byMonth) {
    const data = byMonth[key];
    if (data.clientCount > 0) {
      data.avgBurnRate = data.avgBurnRate / data.clientCount;
      data.avgMargin = data.avgMargin / data.clientCount;
    }
  }

  return Object.values(byMonth).sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  }).slice(0, months);
}
