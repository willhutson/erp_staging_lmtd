import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { VideoClient } from "./video-client";

export default async function VideoPage() {
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
}
