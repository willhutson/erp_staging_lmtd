import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { VideoClient } from "./video-client";
import { AlertTriangle } from "lucide-react";

function VideoError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Video Projects Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load video projects. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function VideoPage() {
  try {
    const user = await getStudioUser();

    // Fetch video projects for the organization
    const projects = await db.videoProject.findMany({
      where: {
        organizationId: user.organizationId,
      },
      include: {
        createdBy: { select: { id: true, name: true, avatarUrl: true } },
        director: { select: { id: true, name: true, avatarUrl: true } },
        client: { select: { id: true, name: true } },
        script: true,
        storyboard: { include: { frames: true } },
        shotList: true,
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

    // Fetch potential directors (active users with leadership roles)
    const directors = await db.user.findMany({
      where: {
        organizationId: user.organizationId,
        isActive: true,
        permissionLevel: { in: ["ADMIN", "LEADERSHIP", "TEAM_LEAD", "STAFF"] },
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return (
      <VideoClient
        initialProjects={projects}
        clients={clients}
        directors={directors}
      />
    );
  } catch (error) {
    console.error("Video page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <VideoError message={message} />;
  }
}
