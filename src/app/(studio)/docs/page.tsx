import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { DocsClient } from "./docs-client";

export default async function DocsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Fetch documents for the organization
  const documents = await db.studioDocument.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      createdBy: { select: { id: true, name: true, avatarUrl: true } },
      lastEditedBy: { select: { id: true, name: true, avatarUrl: true } },
      client: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      brief: { select: { id: true, title: true } },
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

  return <DocsClient initialDocuments={documents} clients={clients} />;
}
