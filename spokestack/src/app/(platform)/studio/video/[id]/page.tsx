import { notFound } from "next/navigation";
import { getVideoProject } from "@/modules/studio/actions/video-actions";
import { VideoEditorClient } from "./video-editor-client";
import { AlertTriangle } from "lucide-react";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

interface VideoEditorPageProps {
  params: Promise<{ id: string }>;
}

function VideoEditorError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Video Project Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load video project. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function VideoEditorPage({ params }: VideoEditorPageProps) {
  try {
    const { id } = await params;
    const project = await getVideoProject(id);

    if (!project) {
      notFound();
    }

    return <VideoEditorClient project={project} />;
  } catch (error) {
    console.error("Video editor page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <VideoEditorError message={message} />;
  }
}
