import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DecksClient } from "./decks-client";
import { StudioSetupRequired } from "@/modules/studio/components/StudioSetupRequired";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function DecksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    // Fetch pitch decks for the organization
    const decks = await db.pitchDeck.findMany({
      where: {
        organizationId: session.user.organizationId,
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
        organizationId: session.user.organizationId,
        isActive: true,
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    // Fetch deck templates
    const templates = await db.deckTemplate.findMany({
      where: {
        organizationId: session.user.organizationId,
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
    console.error("Studio decks page error:", error);
    return <StudioSetupRequired module="Pitch Decks" />;
  }
}
