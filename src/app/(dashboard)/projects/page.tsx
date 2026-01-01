import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { ProjectsView } from "./ProjectsView";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const projects = await db.project.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      client: {
        select: { id: true, name: true, code: true },
      },
      _count: {
        select: { briefs: true },
      },
    },
    orderBy: [
      { status: "asc" },
      { updatedAt: "desc" },
    ],
  });

  const clients = await db.client.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });

  return (
    <ProjectsView
      projects={projects}
      clients={clients}
      permissionLevel={session.user.permissionLevel}
    />
  );
}
