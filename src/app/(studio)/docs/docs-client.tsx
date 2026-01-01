"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Plus, Search, Filter, ExternalLink, X } from "lucide-react";
import { DocumentList } from "@/modules/studio/components/DocumentList";
import {
  createStudioDocument,
  syncToGoogle,
  deleteStudioDocument,
} from "@/modules/studio/actions/docs-actions";
import type { DocumentWithRelations, StudioDocType } from "@/modules/studio/types";
import { cn } from "@/lib/utils";

interface DocsClientProps {
  initialDocuments: DocumentWithRelations[];
  clients: { id: string; name: string }[];
}

const documentTypes: { value: StudioDocType; label: string }[] = [
  { value: "DOCUMENT", label: "Document" },
  { value: "SCRIPT", label: "Script" },
  { value: "SOCIAL_COPY", label: "Social Copy" },
  { value: "AD_COPY", label: "Ad Copy" },
  { value: "BLOG_POST", label: "Blog Post" },
  { value: "EMAIL", label: "Email" },
  { value: "PROPOSAL", label: "Proposal" },
  { value: "SOW", label: "Scope of Work" },
];

export function DocsClient({ initialDocuments, clients }: DocsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [documents, setDocuments] = useState(initialDocuments);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create modal state
  const [newDocTitle, setNewDocTitle] = useState("");
  const [newDocType, setNewDocType] = useState<StudioDocType>("DOCUMENT");
  const [newDocClientId, setNewDocClientId] = useState("");
  const [syncToGoogleOnCreate, setSyncToGoogleOnCreate] = useState(false);

  // Filter documents by search
  const filteredDocuments = documents.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateDocument = async () => {
    if (!newDocTitle.trim()) return;

    setIsCreating(true);
    try {
      const newDoc = await createStudioDocument({
        title: newDocTitle,
        type: newDocType,
        clientId: newDocClientId || undefined,
      });

      setDocuments((prev) => [newDoc, ...prev]);
      setIsCreateModalOpen(false);
      resetCreateForm();

      if (syncToGoogleOnCreate) {
        await syncToGoogle(newDoc.id);
      }

      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create document:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleSyncClick = async (doc: DocumentWithRelations) => {
    try {
      await syncToGoogle(doc.id);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to sync:", error);
    }
  };

  const handleDeleteClick = async (doc: DocumentWithRelations) => {
    if (!confirm(`Delete "${doc.title}"? This cannot be undone.`)) return;

    try {
      await deleteStudioDocument(doc.id);
      setDocuments((prev) => prev.filter((d) => d.id !== doc.id));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const handleDocumentClick = (doc: DocumentWithRelations) => {
    router.push(`/studio/docs/${doc.id}`);
  };

  const resetCreateForm = () => {
    setNewDocTitle("");
    setNewDocType("COPY");
    setNewDocClientId("");
    setSyncToGoogleOnCreate(false);
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Documents</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Create and sync documents with Google Docs
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Document
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          />
        </div>
      </div>

      {/* Document List or Empty State */}
      {filteredDocuments.length > 0 ? (
        <DocumentList
          documents={filteredDocuments}
          onDocumentClick={handleDocumentClick}
          onSyncClick={handleSyncClick}
          onDeleteClick={handleDeleteClick}
        />
      ) : (
        <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-ltd-surface-3 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-ltd-text-3" />
            </div>
            <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">
              {searchQuery ? "No documents found" : "No documents yet"}
            </h3>
            <p className="text-sm text-ltd-text-2 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Create documents that sync with Google Docs for seamless collaboration with your team and clients."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Document
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Document Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1">
            <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
              <h2 className="text-lg font-semibold text-ltd-text-1">
                New Document
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
                handleCreateDocument();
              }}
              className="p-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Title *
                </label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g., Campaign Brief - January"
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {documentTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewDocType(type.value)}
                      className={cn(
                        "px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] border transition-colors",
                        newDocType === type.value
                          ? "border-ltd-primary bg-ltd-primary/10 text-ltd-primary"
                          : "border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
                      )}
                    >
                      {type.label}
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
                    value={newDocClientId}
                    onChange={(e) => setNewDocClientId(e.target.value)}
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

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="syncToGoogle"
                  checked={syncToGoogleOnCreate}
                  onChange={(e) => setSyncToGoogleOnCreate(e.target.checked)}
                  className="w-4 h-4 rounded border-ltd-border-1"
                />
                <label htmlFor="syncToGoogle" className="text-sm text-ltd-text-1">
                  Sync to Google Docs immediately
                </label>
              </div>

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
                  disabled={isCreating || !newDocTitle.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-ltd-primary text-ltd-primary-text hover:bg-ltd-primary-dark transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
