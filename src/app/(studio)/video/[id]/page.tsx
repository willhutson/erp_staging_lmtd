import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { getVideoProject } from "@/modules/studio/actions/video-actions";
import { VideoEditorClient } from "./video-editor-client";

interface VideoEditorPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoEditorPage({ params }: VideoEditorPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;
  const project = await getVideoProject(id);

  if (!project) {
    notFound();
  }

  return <VideoEditorClient project={project} />;
}
