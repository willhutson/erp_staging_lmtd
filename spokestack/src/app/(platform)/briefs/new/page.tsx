import Link from "next/link";
import { getSession, getUser } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { can } from "@/lib/permissions";
import { getAllFormConfigs, briefTypeIcons } from "@/../config/forms";
import {
  Video,
  Film,
  Palette,
  FileText,
  Languages,
  Target,
  BarChart3,
  ArrowLeft,
} from "lucide-react";

const iconMap: Record<string, React.ReactNode> = {
  Video: <Video className="w-8 h-8" />,
  Film: <Film className="w-8 h-8" />,
  Palette: <Palette className="w-8 h-8" />,
  FileText: <FileText className="w-8 h-8" />,
  Languages: <Languages className="w-8 h-8" />,
  Target: <Target className="w-8 h-8" />,
  BarChart3: <BarChart3 className="w-8 h-8" />,
};

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default async function NewBriefPage() {
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

  // Check permission
  if (!can(user as Parameters<typeof can>[0], "brief:create")) {
    redirect("/briefs");
  }

  const formConfigs = getAllFormConfigs();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/briefs"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Brief</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Select the type of brief you want to create</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {formConfigs.map((config) => {
          const iconKey = briefTypeIcons[config.id];
          const icon = iconMap[iconKey] || <FileText className="w-8 h-8" />;

          return (
            <Link
              key={config.id}
              href={`/briefs/new/${config.id.toLowerCase().replace(/_/g, "-")}`}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:border-[#52EDC7] dark:hover:border-[#52EDC7] hover:shadow-md transition-all group"
            >
              <div className="text-gray-400 dark:text-gray-500 group-hover:text-[#52EDC7] transition-colors mb-4">
                {icon}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{config.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{config.description}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Example: <span className="italic">{config.example}</span>
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
