"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Video, Plus, Search, Filter, X, Calendar, Clock, User } from "lucide-react";
import { VideoProjectList } from "@/modules/studio/components/VideoProjectList";
import { createVideoProject } from "@/modules/studio/actions/video-actions";
import type { VideoProjectWithRelations, VideoProjectType } from "@/modules/studio/types";
import { cn } from "@/lib/utils";

interface VideoClientProps {
  initialProjects: VideoProjectWithRelations[];
  clients: { id: string; name: string }[];
  directors: { id: string; name: string }[];
}

const projectTypes: { value: VideoProjectType; label: string; description: string }[] = [
  { value: "SOCIAL_CONTENT", label: "Social Content", description: "Short-form social" },
  { value: "BRAND_VIDEO", label: "Brand Video", description: "Corporate/brand video" },
  { value: "COMMERCIAL", label: "Commercial", description: "Brand advertisement" },
  { value: "DOCUMENTARY", label: "Documentary", description: "Long-form story" },
  { value: "TESTIMONIAL", label: "Testimonial", description: "Customer story" },
  { value: "EVENT", label: "Event", description: "Coverage video" },
  { value: "EXPLAINER", label: "Explainer", description: "How-to content" },
  { value: "ANIMATION", label: "Animation", description: "Motion graphics" },
];

const aspectRatios = [
  { value: "16:9", label: "16:9 (Landscape)" },
  { value: "9:16", label: "9:16 (Portrait)" },
  { value: "1:1", label: "1:1 (Square)" },
  { value: "4:5", label: "4:5 (Instagram)" },
];

export function VideoClient({ initialProjects, clients, directors }: VideoClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] = useState(initialProjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Create modal state
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<VideoProjectType>("SOCIAL_CONTENT");
  const [newClientId, setNewClientId] = useState("");
  const [newDirectorId, setNewDirectorId] = useState("");
  const [newAspectRatio, setNewAspectRatio] = useState("16:9");
  const [newDuration, setNewDuration] = useState("");
  const [newShootDate, setNewShootDate] = useState("");
  const [newDueDate, setNewDueDate] = useState("");

  // Filter projects by search
  const filteredProjects = projects.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = async () => {
    if (!newTitle.trim()) return;

    setIsCreating(true);
    try {
      const newProject = await createVideoProject({
        title: newTitle,
        description: newDescription || undefined,
        type: newType,
        clientId: newClientId || undefined,
        directorId: newDirectorId || undefined,
        aspectRatio: newAspectRatio,
        duration: newDuration ? parseInt(newDuration) : undefined,
        shootDate: newShootDate ? new Date(newShootDate) : undefined,
        dueDate: newDueDate ? new Date(newDueDate) : undefined,
      });

      setProjects((prev) => [newProject, ...prev]);
      setIsCreateModalOpen(false);
      resetCreateForm();

      // Navigate to project editor
      router.push(`/studio/video/${newProject.id}`);
    } catch (error) {
      console.error("Failed to create project:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleProjectClick = (project: VideoProjectWithRelations) => {
    router.push(`/studio/video/${project.id}`);
  };

  const handleDeleteClick = async (project: VideoProjectWithRelations) => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;

    try {
      // TODO: Implement delete action
      setProjects((prev) => prev.filter((p) => p.id !== project.id));
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to delete:", error);
    }
  };

  const resetCreateForm = () => {
    setNewTitle("");
    setNewDescription("");
    setNewType("SOCIAL_CONTENT");
    setNewClientId("");
    setNewDirectorId("");
    setNewAspectRatio("16:9");
    setNewDuration("");
    setNewShootDate("");
    setNewDueDate("");
  };

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
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ltd-text-3" />
          <input
            type="text"
            placeholder="Search video projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          />
        </div>
      </div>

      {/* Project List or Empty State */}
      {filteredProjects.length > 0 ? (
        <VideoProjectList
          projects={filteredProjects}
          onProjectClick={handleProjectClick}
          onDeleteClick={handleDeleteClick}
        />
      ) : (
        <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2">
          <div className="flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-4">
              <Video className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">
              {searchQuery ? "No projects found" : "No video projects yet"}
            </h3>
            <p className="text-sm text-ltd-text-2 mb-6">
              {searchQuery
                ? "Try a different search term"
                : "Plan your video productions with scripts, storyboards, and shot lists. AI helps you write and visualize."}
            </p>
            {!searchQuery && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Project
              </button>
            )}
          </div>
        </div>
      )}

      {/* Create Project Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-lg bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-ltd-border-1 sticky top-0 bg-ltd-surface-2 z-10">
              <h2 className="text-lg font-semibold text-ltd-text-1">
                New Video Project
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
                handleCreateProject();
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
                  placeholder="e.g., Product Launch Video"
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
                  placeholder="Brief description of the video..."
                  rows={2}
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {projectTypes.map((type) => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setNewType(type.value)}
                      className={cn(
                        "p-3 text-left rounded-[var(--ltd-radius-md)] border transition-colors",
                        newType === type.value
                          ? "border-ltd-primary bg-ltd-primary/10"
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

              <div className="grid grid-cols-2 gap-4">
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
                      <option value="">No client</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {directors.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                      <User className="w-3.5 h-3.5 inline-block mr-1" />
                      Director
                    </label>
                    <select
                      value={newDirectorId}
                      onChange={(e) => setNewDirectorId(e.target.value)}
                      className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                    >
                      <option value="">Unassigned</option>
                      {directors.map((director) => (
                        <option key={director.id} value={director.id}>
                          {director.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    Aspect Ratio
                  </label>
                  <select
                    value={newAspectRatio}
                    onChange={(e) => setNewAspectRatio(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  >
                    {aspectRatios.map((ratio) => (
                      <option key={ratio.value} value={ratio.value}>
                        {ratio.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    <Clock className="w-3.5 h-3.5 inline-block mr-1" />
                    Duration (seconds)
                  </label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="60"
                    min="1"
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline-block mr-1" />
                    Shoot Date
                  </label>
                  <input
                    type="date"
                    value={newShootDate}
                    onChange={(e) => setNewShootDate(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    <Calendar className="w-3.5 h-3.5 inline-block mr-1" />
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
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
                  disabled={isCreating || !newTitle.trim()}
                  className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-ltd-primary text-ltd-primary-text hover:bg-ltd-primary-dark transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
