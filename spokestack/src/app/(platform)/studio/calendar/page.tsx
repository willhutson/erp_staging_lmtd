import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CalendarGalleryClient } from "./gallery-client";
import { AlertTriangle } from "lucide-react";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

function CalendarError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Calendar Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load calendar data. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function CalendarGalleryPage() {
  try {
    const user = await getStudioUser();

    // Fetch clients with their calendar entry counts
    const clients = await db.client.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        code: true,
        _count: {
          select: {
            studioCalendarEntries: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    // Get recent calendar entries per client for preview
    const clientsWithPreview = await Promise.all(
      clients.map(async (client) => {
        const recentEntries = await db.studioCalendarEntry.findMany({
          where: {
            clientId: client.id,
            organizationId: user.organizationId,
          },
          select: {
            id: true,
            title: true,
            contentType: true,
            scheduledDate: true,
            platforms: true,
            color: true,
          },
          orderBy: { scheduledDate: "desc" },
          take: 5,
        });

        return {
          id: client.id,
          name: client.name,
          code: client.code,
          entryCount: client._count.studioCalendarEntries,
          recentEntries,
        };
      })
    );

    return <CalendarGalleryClient clients={clientsWithPreview} />;
  } catch (error) {
    console.error("Calendar gallery error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <CalendarError message={message} />;
  }
}
