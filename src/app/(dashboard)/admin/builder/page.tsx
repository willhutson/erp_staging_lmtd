import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { BuilderDashboard } from "./BuilderDashboard";

export default async function BuilderPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only ADMIN can access the Builder
  if (session.user.permissionLevel !== "ADMIN") {
    redirect("/hub");
  }

  // Get all templates
  const templates = await db.builderTemplate.findMany({
    where: {
      organizationId: session.user.organizationId,
      isLatest: true,
    },
    orderBy: [
      { templateType: "asc" },
      { updatedAt: "desc" },
    ],
  });

  // Get template counts by type
  const templateCounts = await db.builderTemplate.groupBy({
    by: ["templateType"],
    where: {
      organizationId: session.user.organizationId,
      isLatest: true,
    },
    _count: { id: true },
  });

  // Get pending approval count
  const pendingCount = await db.builderTemplate.count({
    where: {
      organizationId: session.user.organizationId,
      status: "PENDING_APPROVAL",
    },
  });

  return (
    <BuilderDashboard
      templates={templates}
      templateCounts={templateCounts}
      pendingCount={pendingCount}
    />
  );
}
