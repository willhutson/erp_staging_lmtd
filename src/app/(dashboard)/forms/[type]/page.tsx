import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DynamicFormClient } from "./DynamicFormClient";
import type { FormTemplateConfig } from "@/modules/forms/types";

interface PageProps {
  params: Promise<{ type: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function DynamicFormPage({ params }: PageProps) {
  const { type } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Find the form template by type
  const template = await db.formTemplate.findFirst({
    where: {
      type: type.toUpperCase().replace(/-/g, "_"),
      organizationId: session.user.organizationId,
      isActive: true,
    },
  });

  if (!template) {
    notFound();
  }

  // Check permissions if template has required permissions
  if (template.requiredPermissions.length > 0) {
    if (!template.requiredPermissions.includes(session.user.permissionLevel)) {
      redirect("/dashboard");
    }
  }

  const config = template.config as unknown as FormTemplateConfig;

  // Fetch users and clients for the form fields
  const [users, clients] = await Promise.all([
    db.user.findMany({
      where: { organizationId: session.user.organizationId, isActive: true },
      select: { id: true, name: true, role: true, department: true },
      orderBy: { name: "asc" },
    }),
    db.client.findMany({
      where: { organizationId: session.user.organizationId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
  ]);

  // Determine back link based on submission model
  const backLink = template.submissionModel === "brief" ? "/briefs/new" : "/dashboard";

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href={backLink}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{template.name}</h1>
          {template.description && (
            <p className="text-gray-500 mt-1">{template.description}</p>
          )}
          {template.namingConvention && (
            <p className="text-sm text-gray-400 mt-1">
              Format: <span className="italic">{template.namingConvention}</span>
            </p>
          )}
        </div>
      </div>

      <DynamicFormClient
        templateId={template.id}
        templateType={template.type}
        config={config}
        users={users}
        clients={clients}
        submissionModel={template.submissionModel}
      />
    </div>
  );
}
