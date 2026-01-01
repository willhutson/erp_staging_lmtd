import { notFound } from "next/navigation";
import { getMoodboard } from "@/modules/studio/actions/moodboard-actions";
import { MoodboardEditorClient } from "./moodboard-editor-client";
import { AlertTriangle } from "lucide-react";

interface MoodboardEditorPageProps {
  params: Promise<{ id: string }>;
}

function MoodboardEditorError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Moodboard Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load moodboard. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function MoodboardEditorPage({ params }: MoodboardEditorPageProps) {
  try {
    const { id } = await params;
    const moodboard = await getMoodboard(id);

    if (!moodboard) {
      notFound();
    }

    return <MoodboardEditorClient moodboard={moodboard} />;
  } catch (error) {
    console.error("Moodboard editor page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <MoodboardEditorError message={message} />;
  }
}
