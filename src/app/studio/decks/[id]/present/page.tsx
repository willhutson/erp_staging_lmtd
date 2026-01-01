import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getPitchDeck } from "@/modules/studio/actions/deck-actions";
import { PresentationClient } from "./presentation-client";
import { StudioSetupRequired } from "@/modules/studio/components/StudioSetupRequired";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

interface PresentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PresentPage({ params }: PresentPageProps) {
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

    return <PresentationClient deck={deck} />;
  } catch (error) {
    console.error("Presentation page error:", error);
    return <StudioSetupRequired module="Pitch Decks" />;
  }
}
