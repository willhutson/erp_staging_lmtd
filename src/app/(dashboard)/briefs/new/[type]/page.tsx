import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
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

export default async function NewBriefTypePage({ params }: PageProps) {
  const { type: typeSlug } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (!can(session.user as Parameters<typeof can>[0], "brief:create")) {
    redirect("/briefs");
  }

  const briefType = slugToType[typeSlug];
  if (!briefType) {
    notFound();
  }

  const formConfig = getFormConfig(briefType);

  // Fetch users and clients for the form
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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/briefs/new"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{formConfig.name}</h1>
          <p className="text-gray-500 mt-1">
            Format: <span className="italic">{formConfig.namingConvention}</span>
          </p>
        </div>
      </div>

      <BriefFormClient
        config={formConfig}
        users={users}
        clients={clients}
        briefType={briefType}
      />
    </div>
  );
}
