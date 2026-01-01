import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DecksClient } from "./decks-client";

export default async function DecksPage() {
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
}
