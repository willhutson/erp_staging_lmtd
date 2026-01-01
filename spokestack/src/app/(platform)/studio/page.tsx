import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  FileText,
  Presentation,
  Video,
  ImageIcon,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  Plus,
} from "lucide-react";

const studioModules = [
  {
    title: "Documents",
    description: "Create and sync documents with Google Docs. Collaborate in real-time with version history.",
    href: "/studio/docs",
    icon: FileText,
    color: "from-blue-500 to-blue-600",
    status: "active" as const,
  },
  {
    title: "Pitch Decks",
    description: "Build beautiful presentations with AI-powered content generation and Google Slides export.",
    href: "/studio/decks",
    icon: Presentation,
    color: "from-orange-500 to-red-500",
    status: "active" as const,
  },
  {
    title: "Video Studio",
    description: "Script writing, storyboarding, and shot list management for video productions.",
    href: "/studio/video",
    icon: Video,
    color: "from-purple-500 to-pink-500",
    status: "active" as const,
  },
  {
    title: "Moodboard Lab",
    description: "Upload references, images, and links. AI indexes everything for grounded creative generation.",
    href: "/studio/moodboard",
    icon: ImageIcon,
    color: "from-ltd-primary to-[#7B61FF]",
    status: "active" as const,
    featured: true,
  },
  {
    title: "Social Calendar",
    description: "Plan and schedule social content across platforms with drag-and-drop scheduling.",
    href: "/studio/calendar",
    icon: Calendar,
    color: "from-green-500 to-emerald-600",
    status: "active" as const,
  },
  {
    title: "AI Skills",
    description: "Configure and customize AI assistants for your creative workflows.",
    href: "/studio/skills",
    icon: Sparkles,
    color: "from-yellow-500 to-orange-500",
    status: "active" as const,
  },
];

export default async function StudioDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-ltd-text-1 mb-2">
          Welcome to SpokeStudio
        </h1>
        <p className="text-ltd-text-2">
          Your AI-powered creative workspace. Create content, build presentations, and manage creative assets.
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider mb-4">
          Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
            <Plus className="w-4 h-4" />
            New Document
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-surface-3 text-ltd-text-1 rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-surface-4 transition-colors">
            <Plus className="w-4 h-4" />
            New Moodboard
          </button>
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-surface-3 text-ltd-text-1 rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-surface-4 transition-colors">
            <Plus className="w-4 h-4" />
            New Video Project
          </button>
        </div>
      </div>

      {/* Module Grid */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider mb-4">
          Studio Modules
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studioModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link
                key={module.href}
                href={module.href}
                className={`group relative p-5 rounded-[var(--ltd-radius-lg)] border transition-all hover:shadow-lg ${
                  module.featured
                    ? "border-ltd-primary/30 bg-gradient-to-br from-ltd-primary/5 to-[#7B61FF]/5"
                    : "border-ltd-border-1 bg-ltd-surface-2 hover:border-ltd-primary/50"
                }`}
              >
                {module.featured && (
                  <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white text-[10px] font-bold uppercase tracking-wider rounded-full">
                    Featured
                  </div>
                )}

                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-[var(--ltd-radius-md)] bg-gradient-to-br ${module.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-ltd-text-1 group-hover:text-ltd-primary transition-colors">
                        {module.title}
                      </h3>
                    </div>
                    <p className="text-sm text-ltd-text-2 line-clamp-2">
                      {module.description}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center text-sm text-ltd-text-3 group-hover:text-ltd-primary transition-colors">
                  <span>Open module</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div>
        <h2 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider mb-4">
          Recent Activity
        </h2>
        <div className="p-8 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2">
          <div className="flex flex-col items-center justify-center text-center">
            <Clock className="w-10 h-10 text-ltd-text-3 mb-3" />
            <h3 className="font-medium text-ltd-text-1 mb-1">No recent activity</h3>
            <p className="text-sm text-ltd-text-2 max-w-md">
              Your recent documents, moodboards, and projects will appear here once you start creating.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
