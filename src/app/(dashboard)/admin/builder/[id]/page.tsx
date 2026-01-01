import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { db } from "@/lib/db";
import { TemplateEditor } from "./TemplateEditor";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function TemplateDetailPage({ params }: PageProps) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.permissionLevel !== "ADMIN") {
    redirect("/hub");
  }

  const template = await db.builderTemplate.findFirst({
    where: {
      id,
      organizationId: session.user.organizationId,
    },
  });

  if (!template) {
    notFound();
  }

  // Get audit history
  const auditLogs = await db.builderAuditLog.findMany({
    where: {
      templateId: id,
      organizationId: session.user.organizationId,
    },
    orderBy: { performedAt: "desc" },
    take: 10,
  });

  // Get user names for audit logs
  const userIds = [...new Set(auditLogs.map((log) => log.performedById))];
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });

  const userMap = Object.fromEntries(users.map((u) => [u.id, u.name]));

  const logsWithUsers = auditLogs.map((log) => ({
    ...log,
    performedByName: userMap[log.performedById] || "Unknown",
  }));

  return (
    <TemplateEditor
      template={template}
      auditLogs={logsWithUsers}
    />
  );
}
