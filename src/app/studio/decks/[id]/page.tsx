import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPitchDeck } from "@/modules/studio/actions/deck-actions";
import { DeckEditorClient } from "./deck-editor-client";
import { StudioSetupRequired } from "@/modules/studio/components/StudioSetupRequired";

interface DeckEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function DeckEditorPage({ params }: DeckEditorPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    const { id } = await params;
    const deck = await getPitchDeck(id);

    if (!deck) {
      notFound();
    }

    return <DeckEditorClient deck={deck} />;
  } catch (error) {
    console.error("Deck editor page error:", error);
    return <StudioSetupRequired module="Pitch Decks" />;
  }
}
