"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Image as ImageIcon,
  Plus,
  Search,
  Filter,
  X,
  Sparkles,
  Upload,
} from "lucide-react";
import { MoodboardList } from "@/modules/studio/components/MoodboardList";
import { createMoodboard } from "@/modules/studio/actions/moodboard-actions";
import type { MoodboardWithRelations, MoodboardType } from "@/modules/studio/types";
import { cn } from "@/lib/utils";

interface MoodboardClientProps {
  initialMoodboards: MoodboardWithRelations[];
  clients: { id: string; name: string }[];
}

const moodboardTypes: { value: MoodboardType; label: string; description: string }[] = [
  { value: "CAMPAIGN", label: "Campaign", description: "For a specific campaign" },
  { value: "BRAND", label: "Brand", description: "Brand identity references" },
  { value: "PRODUCT", label: "Product", description: "Product photography" },
  { value: "EVENT", label: "Event", description: "Event visuals" },
  { value: "CONTENT", label: "Content", description: "Content inspiration" },
  { value: "GENERAL", label: "General", description: "Mixed references" },
];

export function MoodboardClient({ initialMoodboards, clients }: MoodboardClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [moodboards, setMoodboards] = useState(initialMoodboards);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create modal state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<MoodboardType>("CAMPAIGN");
  const [newClientId, setNewClientId] = useState("");

  // Filter moodboards by search
  const filteredMoodboards = moodboards.filter((moodboard) =>
    moodboard.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateMoodboard = async () => {
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const newMoodboard = await createMoodboard({
        title: newTitle,
        description: newDescription || undefined,
        type: newType,
        clientId: newClientId || undefined,
      });

      setMoodboards((prev) => [newMoodboard, ...prev]);
      setIsCreateModalOpen(false);
      resetCreateForm();

      // Navigate to moodboard editor
      router.push(`/moodboard/${newMoodboard.id}`);
    } catch (error) {
      console.error("Failed to create moodboard:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleMoodboardClick = (moodboard: MoodboardWithRelations) => {
    router.push(`/moodboard/${moodboard.id}`);
  };

  const handleDeleteClick = async (moodboard: MoodboardWithRelations) => {
    if (!confirm(`Delete "${moodboard.title}"? This cannot be undone.`)) return;

    try {
      // TODO: Implement delete action
      setMoodboards((prev) => prev.filter((m) => m.id !== moodboard.id));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleShareClick = async (moodboard: MoodboardWithRelations) => {
    // TODO: Open share modal
    console.log("Share moodboard:", moodboard.id);
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewType("CAMPAIGN");
    setNewClientId("");
  };

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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white rounded-[var(--ltd-radius-md)] font-medium text-sm hover:opacity-90 transition-opacity"
        >
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

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder="Search moodboards..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          />
        </div>
      </div>

      {/* Moodboard List or Empty State */}
      {filteredMoodboards.length > 0 ? (
        <MoodboardList
          moodboards={filteredMoodboards}
          onMoodboardClick={handleMoodboardClick}
          onDeleteClick={handleDeleteClick}
          onShareClick={handleShareClick}
        />
      ) : (
        <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ltd-primary/20 to-[#7B61FF]/20 flex items-center justify-center mb-4">
              <ImageIcon className="w-8 h-8 text-ltd-primary" />
            </div>
            <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">
              {searchQuery ? "No moodboards found" : "Create your first moodboard"}
            </h3>
            <p className="text-sm text-ltd-text-2 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Build a collection of references and inspiration. AI will index everything to help generate on-brand creative content."}
            </p>
            {!searchQuery && (
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white rounded-[var(--ltd-radius-md)] font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Create Moodboard
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
                  <Upload className="w-4 h-4" />
                  Quick Upload
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create Moodboard Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1">
            <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
              <h2 className="text-lg font-semibold text-ltd-text-1">
                New Moodboard
              </h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
              >
                <X className="w-4 h-4 text-ltd-text-2" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleCreateMoodboard();
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g., Q1 Campaign Visual References"
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Brief description of the moodboard purpose..."
                  rows={2}
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {moodboardTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewType(type.value)}
                      className={cn(
                        "p-3 text-left rounded-[var(--ltd-radius-md)] border transition-colors",
                        newType === type.value
                          ? "border-ltd-primary bg-gradient-to-r from-ltd-primary/10 to-[#7B61FF]/10"
                          : "border-ltd-border-1 hover:bg-ltd-surface-3"
                      )}
                    >
                      <div className="text-sm font-medium text-ltd-text-1">
                        {type.label}
                      </div>
                      <div className="text-xs text-ltd-text-2">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {clients.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    Client
                  </label>
                  <select
                    value={newClientId}
                    onChange={(e) => setNewClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  >
                    <option value="">No client (internal)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-ltd-border-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    resetCreateForm();
                  }}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Moodboard"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
