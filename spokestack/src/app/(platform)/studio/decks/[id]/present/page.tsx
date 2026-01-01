import { notFound } from "next/navigation";
import { getPitchDeck } from "@/modules/studio/actions/deck-actions";
import { PresentationClient } from "./presentation-client";
import { AlertTriangle } from "lucide-react";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

interface PresentPageProps {
  params: Promise<{ id: string }>;
}

function PresentationError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Presentation Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load presentation. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function PresentPage({ params }: PresentPageProps) {
  try {
    const { id } = await params;
    const deck = await getPitchDeck(id);

    if (!deck) {
      notFound();
    }

    return <PresentationClient deck={deck} />;
  } catch (error) {
    console.error("Presentation page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <PresentationError message={message} />;
  }
}
