import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getMoodboard } from "@/modules/studio/actions/moodboard-actions";
import { MoodboardEditorClient } from "./moodboard-editor-client";
import { StudioSetupRequired } from "@/modules/studio/components/StudioSetupRequired";

interface MoodboardEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function MoodboardEditorPage({ params }: MoodboardEditorPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  try {
    const { id } = await params;
    const moodboard = await getMoodboard(id);

    if (!moodboard) {
      notFound();
    }

    return <MoodboardEditorClient moodboard={moodboard} />;
  } catch (error) {
    console.error("Moodboard editor page error:", error);
    return <StudioSetupRequired module="Moodboard Lab" />;
  }
}
