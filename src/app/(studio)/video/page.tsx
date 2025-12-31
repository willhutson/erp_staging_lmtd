import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Video, Plus, Search, Filter, FileText, Layers } from "lucide-react";

export default async function VideoPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Video Studio</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Scripts, storyboards, and shot lists for video production
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder="Search video projects..."
            className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
      </div>

      {/* Empty State */}
      <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-purple-500" />
          </div>
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">No video projects yet</h3>
          <p className="text-sm text-ltd-text-2 mb-6">
            Plan your video productions with scripts, storyboards, and shot lists. AI helps you write and visualize.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
              <Plus className="w-4 h-4" />
              New Project
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
              <FileText className="w-4 h-4" />
              Script Library
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
              <Layers className="w-4 h-4" />
              Storyboards
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
