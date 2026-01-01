import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { VideoClient } from "./video-client";

export default async function VideoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch video projects for the organization
  const projects = await db.videoProject.findMany({
    where: {
      organizationId: session.user.organizationId,
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
      organizationId: session.user.organizationId,
      isActive: true,
    },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  // Fetch potential directors (users in video department or with video skills)
  const directors = await db.user.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      OR: [
        { department: { not: null } },
        { permissionLevel: { in: ["ADMIN", "LEADERSHIP", "TEAM_LEAD"] } },
      ],
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
}
