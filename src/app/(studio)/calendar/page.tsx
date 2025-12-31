import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { CalendarClient } from "./calendar-client";

export default async function CalendarPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

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
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return (
    <CalendarClient
      initialEntries={entries}
      clients={clients}
    />
  );
}
