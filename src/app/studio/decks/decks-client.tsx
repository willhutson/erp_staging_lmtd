"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Presentation, Plus, Search, Filter, Layout, X, Calendar } from "lucide-react";
import { DeckList } from "@/modules/studio/components/DeckList";
import { createPitchDeck } from "@/modules/studio/actions/deck-actions";
import type { DeckWithRelations, DeckType } from "@/modules/studio/types";
import { cn } from "@/lib/utils";

interface DecksClientProps {
  initialDecks: DeckWithRelations[];
  clients: { id: string; name: string }[];
  templates: { id: string; name: string }[];
}

const deckTypes: { value: DeckType; label: string }[] = [
  { value: "PITCH", label: "Pitch" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "CASE_STUDY", label: "Case Study" },
  { value: "CREDENTIALS", label: "Credentials" },
  { value: "INTERNAL", label: "Internal" },
];

export function DecksClient({ initialDecks, clients, templates }: DecksClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [decks, setDecks] = useState(initialDecks);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create modal state
  const [newDeckTitle, setNewDeckTitle] = useState("");
  const [newDeckDescription, setNewDeckDescription] = useState("");
  const [newDeckType, setNewDeckType] = useState<DeckType>("PITCH");
  const [newDeckClientId, setNewDeckClientId] = useState("");
  const [newDeckTemplateId, setNewDeckTemplateId] = useState("");
  const [newDeckPresentationDate, setNewDeckPresentationDate] = useState("");

  // Filter decks by search
  const filteredDecks = decks.filter((deck) =>
    deck.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDeck = async () => {
    if (!newDeckTitle.trim()) return;

    setIsCreating(true);
    try {
      const newDeck = await createPitchDeck({
        title: newDeckTitle,
        description: newDeckDescription || undefined,
        type: newDeckType,
        clientId: newDeckClientId || undefined,
        templateId: newDeckTemplateId || undefined,
        presentationDate: newDeckPresentationDate ? new Date(newDeckPresentationDate) : undefined,
      });

      setDecks((prev) => [newDeck, ...prev]);
      setIsCreateModalOpen(false);
      resetCreateForm();

      // Navigate to deck editor
      router.push(`/studio/decks/${newDeck.id}`);
    } catch (error) {
      console.error("Failed to create deck:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeckClick = (deck: DeckWithRelations) => {
    router.push(`/studio/decks/${deck.id}`);
  };

  const handleDeleteClick = async (deck: DeckWithRelations) => {
    if (!confirm(`Delete "${deck.title}"? This cannot be undone.`)) return;

    try {
      // TODO: Implement delete action
      setDecks((prev) => prev.filter((d) => d.id !== deck.id));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handlePresentClick = (deck: DeckWithRelations) => {
    router.push(`/studio/decks/${deck.id}/present`);
  };

  const resetCreateForm = () => {
    setNewDeckTitle("");
    setNewDeckDescription("");
    setNewDeckType("PITCH");
    setNewDeckClientId("");
    setNewDeckTemplateId("");
    setNewDeckPresentationDate("");
  };

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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Deck
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder="Search decks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          />
        </div>
        {templates.length > 0 && (
          <button className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
            <Layout className="w-4 h-4" />
            Templates
          </button>
        )}
      </div>

      {/* Deck List or Empty State */}
      {filteredDecks.length > 0 ? (
        <DeckList
          decks={filteredDecks}
          onDeckClick={handleDeckClick}
          onDeleteClick={handleDeleteClick}
          onPresentClick={handlePresentClick}
        />
      ) : (
        <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center mb-4">
              <Presentation className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">
              {searchQuery ? "No decks found" : "No pitch decks yet"}
            </h3>
            <p className="text-sm text-ltd-text-2 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Create stunning presentations with AI assistance. Export to Google Slides or present directly."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Deck
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Deck Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1">
            <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
              <h2 className="text-lg font-semibold text-ltd-text-1">
                New Pitch Deck
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
                handleCreateDeck();
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  placeholder="e.g., Q1 2025 Campaign Proposal"
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Description
                </label>
                <textarea
                  value={newDeckDescription}
                  onChange={(e) => setNewDeckDescription(e.target.value)}
                  placeholder="Brief description..."
                  rows={2}
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {deckTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewDeckType(type.value)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] border transition-colors",
                        newDeckType === type.value
                          ? "border-ltd-primary bg-ltd-primary/10 text-ltd-primary"
                          : "border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
                      )}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {clients.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                      Client
                    </label>
                    <select
                      value={newDeckClientId}
                      onChange={(e) => setNewDeckClientId(e.target.value)}
                      className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                    >
                      <option value="">No client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline-block mr-1" />
                    Presentation Date
                  </label>
                  <input
                    type="date"
                    value={newDeckPresentationDate}
                    onChange={(e) => setNewDeckPresentationDate(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
              </div>

              {templates.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    <Layout className="w-3.5 h-3.5 inline-block mr-1" />
                    Template
                  </label>
                  <select
                    value={newDeckTemplateId}
                    onChange={(e) => setNewDeckTemplateId(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  >
                    <option value="">Blank deck</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
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
                  disabled={isCreating || !newDeckTitle.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-ltd-primary text-ltd-primary-text hover:bg-ltd-primary-dark transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Deck"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
