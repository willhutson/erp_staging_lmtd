import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Presentation, Plus, Search, Filter, Layout } from "lucide-react";

export default async function DecksPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Pitch Decks</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Build presentations with AI-powered content generation
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
          <Plus className="w-4 h-4" />
          New Deck
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder="Search decks..."
            className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          />
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
          <Filter className="w-4 h-4" />
          Filter
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
          <Layout className="w-4 h-4" />
          Templates
        </button>
      </div>

      {/* Empty State */}
      <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2">
        <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
            <Presentation className="w-8 h-8 text-orange-500" />
          </div>
          <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">No pitch decks yet</h3>
          <p className="text-sm text-ltd-text-2 mb-6">
            Create stunning presentations with AI assistance. Export to Google Slides or present directly.
          </p>
          <div className="flex gap-3">
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
              <Plus className="w-4 h-4" />
              Create Deck
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
              <Layout className="w-4 h-4" />
              Browse Templates
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
