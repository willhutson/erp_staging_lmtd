import { notFound } from "next/navigation";
import { getMoodboard } from "@/modules/studio/actions/moodboard-actions";
import { MoodboardEditorClient } from "./moodboard-editor-client";

interface MoodboardEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function MoodboardEditorPage({ params }: MoodboardEditorPageProps) {
  const { id } = await params;
  const moodboard = await getMoodboard(id);

  if (!moodboard) {
    notFound();
  }

  return <MoodboardEditorClient moodboard={moodboard} />;
}
