import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImageIcon, Plus, Search, Filter, Upload, Sparkles } from "lucide-react";

export default async function MoodboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Moodboard Lab</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Visual inspiration that powers AI-grounded creative generation
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white rounded-[var(--ltd-radius-md)] font-medium text-sm hover:opacity-90 transition-opacity">
          <Plus className="w-4 h-4" />
          New Moodboard
        </button>
      </div>

      {/* Feature Highlight */}
      <div className="p-4 rounded-[var(--ltd-radius-lg)] bg-gradient-to-r from-ltd-primary/10 to-[#7B61FF]/10 border border-ltd-primary/20 mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-[var(--ltd-radius-md)] bg-gradient-to-br from-ltd-primary to-[#7B61FF]">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-ltd-text-1 text-sm">AI-Powered Creative Context</h3>
            <p className="text-sm text-ltd-text-2 mt-0.5">
              Upload images, PDFs, videos, and links. Everything gets indexed so AI can generate content grounded in your visual references.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder="Search moodboards..."
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
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ltd-primary/20 to-[#7B61FF]/20 flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-ltd-primary" />
          </div>
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">Create your first moodboard</h3>
          <p className="text-sm text-ltd-text-2 mb-6">
            Build a collection of references and inspiration. AI will index everything to help generate on-brand creative content.
          </p>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white rounded-[var(--ltd-radius-md)] font-medium text-sm hover:opacity-90 transition-opacity">
              <Plus className="w-4 h-4" />
              Create Moodboard
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
              <Upload className="w-4 h-4" />
              Quick Upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
