import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { FilesClient } from "./FilesClient";

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function FilesPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  // Get files with uploader info
  const files = await db.file.findMany({
    where: {
      organizationId: session.user.organizationId,
      isArchived: false,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      uploadedBy: { select: { id: true, name: true, avatarUrl: true } },
      folder: { select: { id: true, name: true, path: true } },
    },
  });

  // Get folders at root level
  const folders = await db.folder.findMany({
    where: {
      organizationId: session.user.organizationId,
      parentId: null,
    },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { files: true, children: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Files</h1>
          <p className="text-gray-500 mt-1">
            Manage your organization&apos;s files and assets
          </p>
        </div>
      </div>

      <FilesClient initialFiles={files} initialFolders={folders} />
    </div>
  );
}
