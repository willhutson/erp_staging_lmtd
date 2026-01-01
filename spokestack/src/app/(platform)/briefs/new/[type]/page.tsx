import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { can } from "@/lib/permissions";
import { getFormConfig } from "@/../config/forms";
import type { BriefType } from "@/types/forms";
import { BriefFormClient } from "./BriefFormClient";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

// Map URL slugs to BriefType enum
const slugToType: Record<string, BriefType> = {
  "video-shoot": "VIDEO_SHOOT",
  "video-edit": "VIDEO_EDIT",
  "design": "DESIGN",
  "copywriting-en": "COPYWRITING_EN",
  "copywriting-ar": "COPYWRITING_AR",
  "paid-media": "PAID_MEDIA",
  "report": "REPORT",
};

interface PageProps {
  params: Promise<{ type: string }>;
}

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function NewBriefTypePage({ params }: PageProps) {
  const { type: typeSlug } = await params;

  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  const supabaseUser = await getUser();
  if (!supabaseUser) {
    redirect("/login");
  }

  // Find user in database
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { supabaseId: supabaseUser.id },
        { email: supabaseUser.email }
      ]
    }
  });

  if (!user) {
    redirect("/hub?error=user_not_found");
  }

  if (!can(user as Parameters<typeof can>[0], "brief:create")) {
    redirect("/briefs");
  }

  const briefType = slugToType[typeSlug];
  if (!briefType) {
    notFound();
  }

  const formConfig = getFormConfig(briefType);

  // Fetch users, clients, and projects for the form
  const [users, clients, projects] = await Promise.all([
    prisma.user.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      select: { id: true, name: true, role: true, department: true },
      orderBy: { name: "asc" },
    }),
    prisma.client.findMany({
      where: { organizationId: user.organizationId, isActive: true },
      select: { id: true, name: true, code: true },
      orderBy: { name: "asc" },
    }),
    prisma.project.findMany({
      where: { organizationId: user.organizationId, status: "ACTIVE" },
      select: { id: true, name: true, code: true, clientId: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/briefs/new"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{formConfig.name}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Format: <span className="italic">{formConfig.namingConvention}</span>
          </p>
        </div>
      </div>

      <BriefFormClient
        config={formConfig}
        users={users}
        clients={clients}
        projects={projects}
        briefType={briefType}
      />
    </div>
  );
}
