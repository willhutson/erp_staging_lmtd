"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  FileText,
  Layers,
  List,
  Plus,
  Trash2,
  Sparkles,
  Save,
  Clock,
  Type,
  Camera,
  Move,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { VideoProjectWithRelations, VideoScript, StoryboardFrame, ShotListItem } from "@/modules/studio/types";
import {
  saveVideoScript,
  addStoryboardFrame,
  addShotListItem,
} from "@/modules/studio/actions/video-actions";

interface VideoEditorClientProps {
  project: VideoProjectWithRelations;
}

type TabType = "script" | "storyboard" | "shotlist";

const statusConfig = {
  PLANNING: { label: "Planning", color: "bg-gray-100 text-gray-700" },
  SCRIPTING: { label: "Scripting", color: "bg-blue-100 text-blue-700" },
  PRE_PRODUCTION: { label: "Pre-Production", color: "bg-yellow-100 text-yellow-700" },
  SHOOTING: { label: "Shooting", color: "bg-orange-100 text-orange-700" },
  POST_PRODUCTION: { label: "Post-Production", color: "bg-purple-100 text-purple-700" },
  REVIEW: { label: "Review", color: "bg-pink-100 text-pink-700" },
  COMPLETE: { label: "Complete", color: "bg-green-100 text-green-700" },
};

const shotTypes = [
  "Wide Shot",
  "Medium Shot",
  "Close Up",
  "Extreme Close Up",
  "Over the Shoulder",
  "POV",
  "Aerial",
  "Tracking",
  "Static",
];

const cameraMovements = [
  "Static",
  "Pan",
  "Tilt",
  "Dolly",
  "Zoom",
  "Handheld",
  "Steadicam",
  "Crane",
  "Drone",
];

export function VideoEditorClient({ project: initialProject }: VideoEditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [project, setProject] = useState(initialProject);
  const [activeTab, setActiveTab] = useState<TabType>("script");
  const [isSaving, setIsSaving] = useState(false);

  // Script state
  const [scriptContent, setScriptContent] = useState(
    project.script?.contentText || ""
  );

  // New frame form
  const [showNewFrame, setShowNewFrame] = useState(false);
  const [newFrameDescription, setNewFrameDescription] = useState("");
  const [newFrameDialogue, setNewFrameDialogue] = useState("");
  const [newFrameAction, setNewFrameAction] = useState("");
  const [newFrameShotType, setNewFrameShotType] = useState("");
  const [newFrameCameraMovement, setNewFrameCameraMovement] = useState("");
  const [newFrameDuration, setNewFrameDuration] = useState("");

  // New shot form
  const [showNewShot, setShowNewShot] = useState(false);
  const [newShotNumber, setNewShotNumber] = useState("");
  const [newShotDescription, setNewShotDescription] = useState("");
  const [newShotType, setNewShotType] = useState("");
  const [newShotLocation, setNewShotLocation] = useState("");
  const [newShotTalent, setNewShotTalent] = useState("");
  const [newShotEquipment, setNewShotEquipment] = useState("");

  const status = statusConfig[project.status] || statusConfig.PLANNING;
  const frames = project.storyboard?.frames || [];
  const shots = project.shotList || [];

  const handleSaveScript = async () => {
    setIsSaving(true);
    try {
      await saveVideoScript(project.id, { text: scriptContent }, scriptContent);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to save script:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddFrame = async () => {
    if (!newFrameDescription.trim()) return;

    try {
      await addStoryboardFrame(project.id, {
        description: newFrameDescription,
        dialogue: newFrameDialogue || undefined,
        action: newFrameAction || undefined,
        shotType: newFrameShotType || undefined,
        cameraMovement: newFrameCameraMovement || undefined,
        duration: newFrameDuration ? parseInt(newFrameDuration) : undefined,
      });

      setShowNewFrame(false);
      resetFrameForm();
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to add frame:", error);
    }
  };

  const handleAddShot = async () => {
    if (!newShotNumber.trim() || !newShotDescription.trim()) return;

    try {
      await addShotListItem(project.id, {
        shotNumber: newShotNumber,
        description: newShotDescription,
        shotType: newShotType || undefined,
        location: newShotLocation || undefined,
        talent: newShotTalent || undefined,
        equipment: newShotEquipment || undefined,
      });

      setShowNewShot(false);
      resetShotForm();
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to add shot:", error);
    }
  };

  const resetFrameForm = () => {
    setNewFrameDescription("");
    setNewFrameDialogue("");
    setNewFrameAction("");
    setNewFrameShotType("");
    setNewFrameCameraMovement("");
    setNewFrameDuration("");
  };

  const resetShotForm = () => {
    setNewShotNumber("");
    setNewShotDescription("");
    setNewShotType("");
    setNewShotLocation("");
    setNewShotTalent("");
    setNewShotEquipment("");
  };

  // Calculate word count and estimated duration
  const wordCount = scriptContent.split(/\s+/).filter(Boolean).length;
  const estimatedDuration = Math.ceil((wordCount / 150) * 60);

  return (
    <div className="h-screen flex flex-col bg-ltd-surface-1">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ltd-border-1 bg-ltd-surface-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/video")}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-ltd-text-1" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-ltd-text-1">{project.title}</h1>
            <div className="flex items-center gap-2 text-xs text-ltd-text-2">
              {project.client && <span>{project.client.name}</span>}
              <span className={cn("px-1.5 py-0.5 rounded", status.color)}>
                {status.label}
              </span>
              {isSaving && <span className="text-ltd-primary">Saving...</span>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Assist
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-ltd-border-1 bg-ltd-surface-2">
        <button
          onClick={() => setActiveTab("script")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] transition-colors",
            activeTab === "script"
              ? "bg-ltd-primary/10 text-ltd-primary"
              : "text-ltd-text-2 hover:bg-ltd-surface-3"
          )}
        >
          <FileText className="w-4 h-4" />
          Script
        </button>
        <button
          onClick={() => setActiveTab("storyboard")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] transition-colors",
            activeTab === "storyboard"
              ? "bg-ltd-primary/10 text-ltd-primary"
              : "text-ltd-text-2 hover:bg-ltd-surface-3"
          )}
        >
          <Layers className="w-4 h-4" />
          Storyboard
          {frames.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-ltd-surface-3 rounded text-xs">
              {frames.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("shotlist")}
          className={cn(
            "inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] transition-colors",
            activeTab === "shotlist"
              ? "bg-ltd-primary/10 text-ltd-primary"
              : "text-ltd-text-2 hover:bg-ltd-surface-3"
          )}
        >
          <List className="w-4 h-4" />
          Shot List
          {shots.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-ltd-surface-3 rounded text-xs">
              {shots.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {/* Script Tab */}
        {activeTab === "script" && (
          <div className="h-full flex flex-col">
            <div className="flex-1 p-6 overflow-auto">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4 text-sm text-ltd-text-2">
                    <span className="flex items-center gap-1">
                      <Type className="w-4 h-4" />
                      {wordCount} words
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ~{Math.floor(estimatedDuration / 60)}:{String(estimatedDuration % 60).padStart(2, "0")} estimated
                    </span>
                  </div>
                  <button
                    onClick={handleSaveScript}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </div>
                <textarea
                  value={scriptContent}
                  onChange={(e) => setScriptContent(e.target.value)}
                  placeholder="Start writing your script...

Format tips:
- Use [SCENE] for scene headings
- Use (action) for action lines
- Use CHARACTER: for dialogue
- Use V.O. for voiceover

Example:
[SCENE 1 - OFFICE - DAY]

(Wide shot of modern office space. Natural light streams through large windows.)

NARRATOR (V.O.): In a world of endless possibilities...

(Camera slowly pushes in to focus on main character at desk)"
                  className="w-full h-[calc(100vh-300px)] px-4 py-3 border border-ltd-border-1 rounded-[var(--ltd-radius-lg)] bg-ltd-surface-2 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none font-mono text-sm leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* Storyboard Tab */}
        {activeTab === "storyboard" && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-ltd-text-1">Storyboard</h2>
                <button
                  onClick={() => setShowNewFrame(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Frame
                </button>
              </div>

              {frames.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {frames.map((frame, index) => (
                    <div
                      key={frame.id}
                      className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 overflow-hidden"
                    >
                      {/* Frame Preview */}
                      <div className="aspect-video bg-ltd-surface-3 flex items-center justify-center relative">
                        {frame.imageUrl ? (
                          <img
                            src={frame.imageUrl}
                            alt={`Frame ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Layers className="w-8 h-8 text-ltd-text-3" />
                        )}
                        <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs">
                          Frame {index + 1}
                        </div>
                        {frame.duration && (
                          <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {frame.duration}s
                          </div>
                        )}
                      </div>

                      {/* Frame Details */}
                      <div className="p-3 space-y-2">
                        <p className="text-sm text-ltd-text-1">{frame.description}</p>
                        {frame.dialogue && (
                          <p className="text-xs text-ltd-text-2 flex items-start gap-1">
                            <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {frame.dialogue}
                          </p>
                        )}
                        {frame.action && (
                          <p className="text-xs text-ltd-text-2 flex items-start gap-1">
                            <Move className="w-3 h-3 mt-0.5 flex-shrink-0" />
                            {frame.action}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-ltd-text-3">
                          {frame.shotType && (
                            <span className="flex items-center gap-1">
                              <Camera className="w-3 h-3" />
                              {frame.shotType}
                            </span>
                          )}
                          {frame.cameraMovement && (
                            <span>{frame.cameraMovement}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2 text-center">
                  <Layers className="w-12 h-12 text-ltd-text-3 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">
                    No storyboard frames yet
                  </h3>
                  <p className="text-sm text-ltd-text-2 mb-4">
                    Visualize your scenes with storyboard frames
                  </p>
                  <button
                    onClick={() => setShowNewFrame(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Frame
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Shot List Tab */}
        {activeTab === "shotlist" && (
          <div className="h-full overflow-auto p-6">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-ltd-text-1">Shot List</h2>
                <button
                  onClick={() => setShowNewShot(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Shot
                </button>
              </div>

              {shots.length > 0 ? (
                <div className="rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-ltd-surface-3">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ltd-text-2 uppercase tracking-wider">
                          Shot
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ltd-text-2 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ltd-text-2 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ltd-text-2 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-ltd-text-2 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-ltd-surface-2 divide-y divide-ltd-border-1">
                      {shots.map((shot) => (
                        <tr key={shot.id} className="hover:bg-ltd-surface-3 transition-colors">
                          <td className="px-4 py-3 text-sm font-medium text-ltd-text-1">
                            {shot.shotNumber}
                          </td>
                          <td className="px-4 py-3 text-sm text-ltd-text-2">
                            {shot.description}
                          </td>
                          <td className="px-4 py-3 text-sm text-ltd-text-2">
                            {shot.shotType || "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-ltd-text-2">
                            {shot.location || "—"}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              "px-2 py-0.5 text-xs font-medium rounded",
                              shot.status === "SHOT" ? "bg-green-100 text-green-700" :
                              shot.status === "SETUP" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            )}>
                              {shot.status || "PENDING"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 rounded-[var(--ltd-radius-lg)] border border-dashed border-ltd-border-2 bg-ltd-surface-2 text-center">
                  <List className="w-12 h-12 text-ltd-text-3 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-ltd-text-1 mb-2">
                    No shot list yet
                  </h3>
                  <p className="text-sm text-ltd-text-2 mb-4">
                    Plan your production with a detailed shot list
                  </p>
                  <button
                    onClick={() => setShowNewShot(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Shot
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Frame Modal */}
      {showNewFrame && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewFrame(false)} />
          <div className="relative w-full max-w-lg bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1">
            <div className="p-4 border-b border-ltd-border-1">
              <h2 className="text-lg font-semibold text-ltd-text-1">Add Storyboard Frame</h2>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Description *</label>
                <textarea
                  value={newFrameDescription}
                  onChange={(e) => setNewFrameDescription(e.target.value)}
                  placeholder="Describe what happens in this frame..."
                  rows={2}
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Shot Type</label>
                  <select
                    value={newFrameShotType}
                    onChange={(e) => setNewFrameShotType(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  >
                    <option value="">Select...</option>
                    {shotTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Camera Movement</label>
                  <select
                    value={newFrameCameraMovement}
                    onChange={(e) => setNewFrameCameraMovement(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  >
                    <option value="">Select...</option>
                    {cameraMovements.map((movement) => (
                      <option key={movement} value={movement}>{movement}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Dialogue</label>
                <input
                  type="text"
                  value={newFrameDialogue}
                  onChange={(e) => setNewFrameDialogue(e.target.value)}
                  placeholder="Any dialogue or VO in this frame..."
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Action</label>
                  <input
                    type="text"
                    value={newFrameAction}
                    onChange={(e) => setNewFrameAction(e.target.value)}
                    placeholder="Action description..."
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Duration (seconds)</label>
                  <input
                    type="number"
                    value={newFrameDuration}
                    onChange={(e) => setNewFrameDuration(e.target.value)}
                    placeholder="5"
                    min="1"
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-ltd-border-1">
              <button
                onClick={() => { setShowNewFrame(false); resetFrameForm(); }}
                className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddFrame}
                disabled={!newFrameDescription.trim()}
                className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-ltd-primary text-ltd-primary-text hover:bg-ltd-primary-dark transition-colors disabled:opacity-50"
              >
                Add Frame
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Shot Modal */}
      {showNewShot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowNewShot(false)} />
          <div className="relative w-full max-w-lg bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1">
            <div className="p-4 border-b border-ltd-border-1">
              <h2 className="text-lg font-semibold text-ltd-text-1">Add Shot</h2>
            </div>
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Shot # *</label>
                  <input
                    type="text"
                    value={newShotNumber}
                    onChange={(e) => setNewShotNumber(e.target.value)}
                    placeholder="1A"
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Shot Type</label>
                  <select
                    value={newShotType}
                    onChange={(e) => setNewShotType(e.target.value)}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  >
                    <option value="">Select...</option>
                    {shotTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Description *</label>
                <textarea
                  value={newShotDescription}
                  onChange={(e) => setNewShotDescription(e.target.value)}
                  placeholder="Describe the shot..."
                  rows={2}
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Location</label>
                  <input
                    type="text"
                    value={newShotLocation}
                    onChange={(e) => setNewShotLocation(e.target.value)}
                    placeholder="e.g., Office lobby"
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Talent</label>
                  <input
                    type="text"
                    value={newShotTalent}
                    onChange={(e) => setNewShotTalent(e.target.value)}
                    placeholder="e.g., Main actor"
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">Equipment</label>
                <input
                  type="text"
                  value={newShotEquipment}
                  onChange={(e) => setNewShotEquipment(e.target.value)}
                  placeholder="e.g., Gimbal, 35mm lens"
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 p-4 border-t border-ltd-border-1">
              <button
                onClick={() => { setShowNewShot(false); resetShotForm(); }}
                className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddShot}
                disabled={!newShotNumber.trim() || !newShotDescription.trim()}
                className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-ltd-primary text-ltd-primary-text hover:bg-ltd-primary-dark transition-colors disabled:opacity-50"
              >
                Add Shot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
