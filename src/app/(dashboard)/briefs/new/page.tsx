import Link from "next/link";
import { auth } from "@/lib/auth";
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

export default async function NewBriefPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Check permission
  if (!can(session.user as Parameters<typeof can>[0], "brief:create")) {
    redirect("/briefs");
  }

  const formConfigs = getAllFormConfigs();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/briefs"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-500" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">New Brief</h1>
          <p className="text-gray-500 mt-1">Select the type of brief you want to create</p>
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
              className="bg-white rounded-xl border border-gray-200 p-6 hover:border-[#52EDC7] hover:shadow-md transition-all group"
            >
              <div className="text-gray-400 group-hover:text-[#52EDC7] transition-colors mb-4">
                {icon}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{config.name}</h3>
              <p className="text-sm text-gray-500 mb-3">{config.description}</p>
              <p className="text-xs text-gray-400">
                Example: <span className="italic">{config.example}</span>
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
