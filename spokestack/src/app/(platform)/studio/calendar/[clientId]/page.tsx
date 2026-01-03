import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ClientCalendarClient } from "./client-calendar-client";
import { startOfMonth, endOfMonth, subMonths, addMonths } from "date-fns";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ clientId: string }>;
}

function CalendarError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Calendar Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load calendar. Please try again later."}
        </p>
        <Link
          href="/studio/calendar"
          className="inline-flex items-center gap-2 text-ltd-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Calendars
        </Link>
      </div>
    </div>
  );
}

export default async function ClientCalendarPage({ params }: PageProps) {
  try {
    const { clientId } = await params;
    const user = await getStudioUser();

    // Fetch the client
    const client = await db.client.findFirst({
      where: {
        id: clientId,
        organizationId: user.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    });

    if (!client) {
      notFound();
    }

    // Calculate date range for fetching (3 months window)
    const now = new Date();
    const rangeStart = startOfMonth(subMonths(now, 1));
    const rangeEnd = endOfMonth(addMonths(now, 2));

    // Fetch calendar entries for this client
    const entries = await db.studioCalendarEntry.findMany({
      where: {
        organizationId: user.organizationId,
        clientId: clientId,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        client: { select: { id: true, name: true } },
        document: { select: { id: true, title: true } },
      },
      orderBy: { scheduledDate: "asc" },
    });

    // Fetch all clients for the create modal (in case they want to switch)
    const allClients = await db.client.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    });

    // Fetch brief deadlines for this client
    const briefDeadlines = await db.brief.findMany({
      where: {
        organizationId: user.organizationId,
        clientId: clientId,
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
    type BriefDeadline = (typeof briefDeadlines)[number];
    const formattedDeadlines = briefDeadlines.map((brief: BriefDeadline) => ({
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
      <ClientCalendarClient
        client={client}
        initialEntries={entries}
        clients={allClients}
        briefDeadlines={formattedDeadlines}
      />
    );
  } catch (error) {
    console.error("Client calendar page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <CalendarError message={message} />;
  }
}
