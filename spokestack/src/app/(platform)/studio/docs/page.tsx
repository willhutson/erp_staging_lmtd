import { getStudioUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { DocsClient } from "./docs-client";
import { AlertTriangle } from "lucide-react";

function DocsError({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-8">
      <div className="flex flex-col items-center text-center max-w-md">
        <div className="p-4 rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold mb-2">Documents Unavailable</h2>
        <p className="text-muted-foreground mb-4">
          {message || "Unable to load documents. Please try again later."}
        </p>
      </div>
    </div>
  );
}

export default async function DocsPage() {
  try {
    const user = await getStudioUser();

    // Fetch documents for the organization
    const documents = await db.studioDocument.findMany({
      where: {
        organizationId: user.organizationId,
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
        organizationId: user.organizationId,
        isActive: true,
      },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });

    return <DocsClient initialDocuments={documents} clients={clients} />;
  } catch (error) {
    console.error("Docs page error:", error);
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return <DocsError message={message} />;
  }
}
