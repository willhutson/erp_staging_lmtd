import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { MoodboardClient } from "./moodboard-client";

export default async function MoodboardPage() {
  const user = await getStudioUser();

  // Fetch moodboards for the organization
  const moodboards = await db.moodboard.findMany({
    where: {
      organizationId: user.organizationId,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      items: { take: 4, orderBy: { createdAt: "desc" } },
      _count: {
        select: {
          items: true,
          conversations: true,
          outputs: true,
        },
      },
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

  return <MoodboardClient initialMoodboards={moodboards} clients={clients} />;
}
