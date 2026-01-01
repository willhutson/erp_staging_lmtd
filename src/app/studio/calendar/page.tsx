import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CalendarClient } from "./calendar-client";
import { StudioSetupRequired } from "@/modules/studio/components/StudioSetupRequired";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    // Calculate date range for fetching (3 months window)
    const now = new Date();
    const rangeStart = startOfMonth(subMonths(now, 1));
    const rangeEnd = endOfMonth(addMonths(now, 1));

    // Fetch calendar entries for the organization
    const entries = await db.studioCalendarEntry.findMany({
      where: {
        organizationId: session.user.organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        client: { select: { id: true, name: true } },
        document: { select: { id: true, title: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    // Fetch clients for the create modal
    const clients = await db.client.findMany({
      where: {
        organizationId: session.user.organizationId,
        isActive: true,
      },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    // Fetch brief deadlines for the calendar
    const briefDeadlines = await db.brief.findMany({
      where: {
        organizationId: session.user.organizationId,
        deadline: {
          gte: rangeStart,
          lte: rangeEnd,
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

    // Transform deadlines to match the expected type
    const formattedDeadlines = briefDeadlines.map((brief) => ({
      id: brief.id,
      briefNumber: brief.briefNumber,
      title: brief.title,
      type: brief.type,
      status: brief.status,
      deadline: brief.deadline!,
      client: brief.client,
      assignee: brief.assignee || undefined,
    }));

    return (
      <CalendarClient
        initialEntries={entries}
        clients={clients}
        briefDeadlines={formattedDeadlines}
      />
    );
  } catch (error) {
    console.error("Studio calendar page error:", error);
    return <StudioSetupRequired module="Social Calendar" />;
  }
}
