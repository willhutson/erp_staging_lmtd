"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export interface BriefDeadlineMarker {
  id: string;
  briefNumber: string;
  title: string;
  type: string;
  status: string;
  deadline: Date;
  client: {
    id: string;
    name: string;
    code: string;
  };
  assignee?: {
    id: string;
    name: string;
  };
}

/**
 * Get brief deadlines for the calendar view
 * Returns briefs with deadlines within the specified date range
 */
export async function getBriefDeadlinesForCalendar(
  startDate: Date,
  endDate: Date
): Promise<BriefDeadlineMarker[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const briefs = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
      deadline: {
        gte: startDate,
        lte: endDate,
      },
      status: {
        notIn: ["COMPLETED", "CANCELLED"],
      },
    },
    select: {
      id: true,
      briefNumber: true,
      title: true,
      type: true,
      status: true,
      deadline: true,
      client: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { deadline: "asc" },
  });

  return briefs.map((brief) => ({
    id: brief.id,
    briefNumber: brief.briefNumber,
    title: brief.title,
    type: brief.type,
    status: brief.status,
    deadline: brief.deadline!,
    client: brief.client,
    assignee: brief.assignee || undefined,
  }));
}

/**
 * Get upcoming brief deadlines (next 7 days)
 */
export async function getUpcomingBriefDeadlines(): Promise<BriefDeadlineMarker[]> {
  const now = new Date();
  const nextWeek = new Date(now);
  nextWeek.setDate(nextWeek.getDate() + 7);

  return getBriefDeadlinesForCalendar(now, nextWeek);
}

/**
 * Get overdue brief deadlines
 */
export async function getOverdueBriefDeadlines(): Promise<BriefDeadlineMarker[]> {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Unauthorized");
  }

  const now = new Date();

  const briefs = await db.brief.findMany({
    where: {
      organizationId: session.user.organizationId,
      deadline: {
        lt: now,
      },
      status: {
        notIn: ["COMPLETED", "CANCELLED"],
      },
    },
    select: {
      id: true,
      briefNumber: true,
      title: true,
      type: true,
      status: true,
      deadline: true,
      client: {
        select: {
          id: true,
          name: true,
          code: true,
        },
      },
      assignee: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: { deadline: "asc" },
  });

  return briefs.map((brief) => ({
    id: brief.id,
    briefNumber: brief.briefNumber,
    title: brief.title,
    type: brief.type,
    status: brief.status,
    deadline: brief.deadline!,
    client: brief.client,
    assignee: brief.assignee || undefined,
  }));
}
