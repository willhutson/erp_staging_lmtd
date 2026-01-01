import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DecksClient } from "./decks-client";
import { AlertTriangle } from "lucide-react";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

function DecksError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Decks Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load decks. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function DecksPage() {
  try {
    const user = await getStudioUser();

    // Fetch pitch decks for the organization
    const decks = await db.pitchDeck.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        client: { select: { id: true, name: true } },
        template: true,
        slides: { orderBy: { orderIndex: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Fetch clients for the create modal
    const clients = await db.client.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    // Fetch deck templates
    const templates = await db.deckTemplate.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return (
      <DecksClient
        initialDecks={decks}
        clients={clients}
        templates={templates}
      />
    );
  } catch (error) {
    console.error("Decks page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <DecksError message={message} />;
  }
}
