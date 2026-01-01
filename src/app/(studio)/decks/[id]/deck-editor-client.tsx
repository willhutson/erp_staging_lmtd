"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Play,
  MoreHorizontal,
  Trash2,
  Copy,
  MoveUp,
  MoveDown,
  Sparkles,
  Download,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { DeckWithRelations, DeckSlide, SlideLayoutType } from "@/modules/studio/types";
import {
  addSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
} from "@/modules/studio/actions/deck-actions";

interface DeckEditorClientProps {
  deck: DeckWithRelations;
}

const layoutOptions: { value: SlideLayoutType; label: string; description: string }[] = [
  { value: "TITLE", label: "Title", description: "Main title slide" },
  { value: "CONTENT", label: "Content", description: "Standard content slide" },
  { value: "SECTION", label: "Section", description: "Section divider" },
  { value: "TWO_COLUMN", label: "Two Columns", description: "Side by side content" },
  { value: "IMAGE_LEFT", label: "Image Left", description: "Image with text" },
  { value: "IMAGE_RIGHT", label: "Image Right", description: "Text with image" },
  { value: "IMAGE_FULL", label: "Full Image", description: "Full bleed image" },
  { value: "STATS", label: "Stats", description: "Key metrics display" },
  { value: "QUOTE", label: "Quote", description: "Featured quote" },
  { value: "TEAM", label: "Team", description: "Team members" },
  { value: "TIMELINE", label: "Timeline", description: "Process steps" },
  { value: "COMPARISON", label: "Comparison", description: "Before/after" },
  { value: "PRICING", label: "Pricing", description: "Pricing table" },
  { value: "CTA", label: "Call to Action", description: "Action prompt" },
  { value: "THANK_YOU", label: "Thank You", description: "Closing slide" },
];

const statusConfig: Record<string, { label: string; color: string }> = {
  DRAFT: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  IN_REVIEW: { label: "In Review", color: "bg-yellow-100 text-yellow-700" },
  APPROVED: { label: "Approved", color: "bg-green-100 text-green-700" },
  PRESENTED: { label: "Presented", color: "bg-purple-100 text-purple-700" },
  WON: { label: "Won", color: "bg-emerald-100 text-emerald-700" },
  LOST: { label: "Lost", color: "bg-red-100 text-red-700" },
  ARCHIVED: { label: "Archived", color: "bg-slate-100 text-slate-700" },
};

export function DeckEditorClient({ deck: initialDeck }: DeckEditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deck, setDeck] = useState(initialDeck);
  const [selectedSlideIndex, setSelectedSlideIndex] = useState(0);
  const [isAddingSlide, setIsAddingSlide] = useState(false);
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [slideMenuOpen, setSlideMenuOpen] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const slides = deck.slides || [];
  const selectedSlide = slides[selectedSlideIndex];
  const status = statusConfig[deck.status] || statusConfig.DRAFT;

  const handleAddSlide = async (layoutType: SlideLayoutType) => {
    setIsAddingSlide(true);
    try {
      await addSlide(deck.id, {
        layoutType,
        afterIndex: selectedSlideIndex,
      });
      setShowLayoutPicker(false);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to add slide:", error);
    } finally {
      setIsAddingSlide(false);
    }
  };

  const handleDeleteSlide = async (slideId: string) => {
    if (!confirm("Delete this slide?")) return;

    try {
      await deleteSlide(slideId);
      if (selectedSlideIndex >= slides.length - 1) {
        setSelectedSlideIndex(Math.max(0, selectedSlideIndex - 1));
      }
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to delete slide:", error);
    }
    setSlideMenuOpen(null);
  };

  const handleMoveSlide = async (slideId: string, direction: "up" | "down") => {
    const currentIndex = slides.findIndex((s) => s.id === slideId);
    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (newIndex < 0 || newIndex >= slides.length) return;

    // Create new order
    const newOrder = [...slides.map((s) => s.id)];
    [newOrder[currentIndex], newOrder[newIndex]] = [newOrder[newIndex], newOrder[currentIndex]];

    try {
      await reorderSlides(deck.id, newOrder);
      setSelectedSlideIndex(newIndex);
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to reorder slides:", error);
    }
    setSlideMenuOpen(null);
  };

  const handleUpdateSlide = async (
    slideId: string,
    updates: { title?: string; subtitle?: string; content?: unknown; speakerNotes?: string }
  ) => {
    setIsSaving(true);
    try {
      await updateSlide(slideId, updates);
      // Optimistic update
      setDeck((prev) => ({
        ...prev,
        slides: prev.slides?.map((s) =>
          s.id === slideId ? { ...s, ...updates } : s
        ),
      }));
    } catch (error) {
      console.error("Failed to update slide:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePresent = () => {
    router.push(`/studio/decks/${deck.id}/present`);
  };

  return (
    <div className="h-screen flex flex-col bg-ltd-surface-1">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ltd-border-1 bg-ltd-surface-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/decks")}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-ltd-text-1" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-ltd-text-1">{deck.title}</h1>
            <div className="flex items-center gap-2 text-xs text-ltd-text-2">
              {deck.client && <span>{deck.client.name}</span>}
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
          {deck.googleSlidesUrl && (
            <a
              href={deck.googleSlidesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Google Slides
            </a>
          )}
          <button
            onClick={handlePresent}
            className="inline-flex items-center gap-2 px-4 py-1.5 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors"
          >
            <Play className="w-4 h-4" />
            Present
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Sidebar */}
        <div className="w-64 border-r border-ltd-border-1 bg-ltd-surface-2 flex flex-col">
          <div className="p-2 border-b border-ltd-border-1">
            <button
              onClick={() => setShowLayoutPicker(true)}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm border border-dashed border-ltd-border-2 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:border-ltd-primary hover:text-ltd-primary transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Slide
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                className={cn(
                  "relative group rounded-[var(--ltd-radius-md)] border transition-colors cursor-pointer",
                  selectedSlideIndex === index
                    ? "border-ltd-primary ring-2 ring-ltd-primary/20"
                    : "border-ltd-border-1 hover:border-ltd-border-2"
                )}
                onClick={() => setSelectedSlideIndex(index)}
              >
                {/* Slide Thumbnail */}
                <div className="aspect-video bg-white rounded-t-[var(--ltd-radius-md)] p-2 relative">
                  <div className="absolute top-1 left-1 text-[10px] text-ltd-text-3 font-medium">
                    {index + 1}
                  </div>
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-medium text-ltd-text-1 truncate px-1">
                      {slide.title || slide.layoutType.toLowerCase().replace("_", " ")}
                    </span>
                  </div>
                </div>

                {/* Menu Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSlideMenuOpen(slideMenuOpen === slide.id ? null : slide.id);
                  }}
                  className="absolute top-1 right-1 p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-white/80 transition-opacity"
                >
                  <MoreHorizontal className="w-3 h-3 text-ltd-text-2" />
                </button>

                {/* Dropdown Menu */}
                {slideMenuOpen === slide.id && (
                  <div className="absolute right-0 top-6 z-10 w-40 bg-ltd-surface-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] shadow-lg">
                    <button
                      onClick={() => handleMoveSlide(slide.id, "up")}
                      disabled={index === 0}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ltd-text-1 hover:bg-ltd-surface-3 disabled:opacity-50"
                    >
                      <MoveUp className="w-3 h-3" />
                      Move Up
                    </button>
                    <button
                      onClick={() => handleMoveSlide(slide.id, "down")}
                      disabled={index === slides.length - 1}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-ltd-text-1 hover:bg-ltd-surface-3 disabled:opacity-50"
                    >
                      <MoveDown className="w-3 h-3" />
                      Move Down
                    </button>
                    <button
                      onClick={() => handleDeleteSlide(slide.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-4xl mx-auto">
              {selectedSlide ? (
                <SlideCanvas
                  slide={selectedSlide}
                  onUpdate={(updates) => handleUpdateSlide(selectedSlide.id, updates)}
                />
              ) : (
                <div className="aspect-video bg-white rounded-lg shadow-lg flex items-center justify-center text-ltd-text-3">
                  No slides yet
                </div>
              )}
            </div>
          </div>

          {/* Speaker Notes */}
          {selectedSlide && (
            <div className="border-t border-ltd-border-1 bg-ltd-surface-2 p-4">
              <div className="max-w-4xl mx-auto">
                <label className="block text-xs font-medium text-ltd-text-2 mb-1">
                  Speaker Notes
                </label>
                <textarea
                  value={selectedSlide.speakerNotes || ""}
                  onChange={(e) =>
                    handleUpdateSlide(selectedSlide.id, { speakerNotes: e.target.value })
                  }
                  placeholder="Add speaker notes..."
                  className="w-full px-3 py-2 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                  rows={2}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Layout Picker Modal */}
      {showLayoutPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setShowLayoutPicker(false)}
          />
          <div className="relative w-full max-w-2xl bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1 max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
              <h2 className="text-lg font-semibold text-ltd-text-1">Add Slide</h2>
              <button
                onClick={() => setShowLayoutPicker(false)}
                className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
              >
                ×
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-3 gap-3">
                {layoutOptions.map((layout) => (
                  <button
                    key={layout.value}
                    onClick={() => handleAddSlide(layout.value)}
                    disabled={isAddingSlide}
                    className="p-4 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] hover:border-ltd-primary hover:bg-ltd-primary/5 transition-colors text-left disabled:opacity-50"
                  >
                    <div className="aspect-video bg-ltd-surface-3 rounded mb-2 flex items-center justify-center">
                      <LayoutPreview layout={layout.value} />
                    </div>
                    <div className="text-sm font-medium text-ltd-text-1">
                      {layout.label}
                    </div>
                    <div className="text-xs text-ltd-text-2">{layout.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Slide Canvas Component
function SlideCanvas({
  slide,
  onUpdate,
}: {
  slide: DeckSlide;
  onUpdate: (updates: { title?: string; subtitle?: string; content?: unknown }) => void;
}) {
  const content = (slide.content || {}) as Record<string, unknown>;

  return (
    <div
      className="aspect-video bg-white rounded-lg shadow-lg overflow-hidden relative"
      style={{
        backgroundColor: slide.backgroundColor || undefined,
        backgroundImage: slide.backgroundUrl ? `url(${slide.backgroundUrl})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 p-8 flex flex-col">
        {/* Title Slide Layout */}
        {slide.layoutType === "TITLE" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <input
              type="text"
              value={slide.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Click to add title"
              className="w-full text-4xl font-bold text-center bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-1"
            />
            <input
              type="text"
              value={slide.subtitle || ""}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Click to add subtitle"
              className="w-full text-xl text-center bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-2 mt-4"
            />
          </div>
        )}

        {/* Title + Content Layout */}
        {slide.layoutType === "TITLE_CONTENT" && (
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={slide.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Click to add title"
              className="text-3xl font-bold bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-1 mb-6"
            />
            <textarea
              value={(content.body as string) || ""}
              onChange={(e) => onUpdate({ content: { ...content, body: e.target.value } })}
              placeholder="Click to add content..."
              className="flex-1 text-lg bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-2 resize-none"
            />
          </div>
        )}

        {/* Two Column Layout */}
        {slide.layoutType === "TWO_COLUMN" && (
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={slide.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Click to add title"
              className="text-3xl font-bold bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-1 mb-6"
            />
            <div className="flex-1 grid grid-cols-2 gap-6">
              <textarea
                value={(content.left as string) || ""}
                onChange={(e) => onUpdate({ content: { ...content, left: e.target.value } })}
                placeholder="Left column..."
                className="text-base bg-ltd-surface-2 rounded-lg p-4 border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-2 resize-none"
              />
              <textarea
                value={(content.right as string) || ""}
                onChange={(e) => onUpdate({ content: { ...content, right: e.target.value } })}
                placeholder="Right column..."
                className="text-base bg-ltd-surface-2 rounded-lg p-4 border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-2 resize-none"
              />
            </div>
          </div>
        )}

        {/* Quote Layout */}
        {slide.layoutType === "QUOTE" && (
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <span className="text-6xl text-ltd-primary/50 mb-4">"</span>
            <textarea
              value={slide.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Enter quote..."
              className="w-full text-2xl italic text-center bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-1 resize-none"
              rows={3}
            />
            <input
              type="text"
              value={slide.subtitle || ""}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="— Attribution"
              className="text-base text-center bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-2 mt-4"
            />
          </div>
        )}

        {/* Stats Layout */}
        {slide.layoutType === "STATS" && (
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={slide.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Click to add title"
              className="text-3xl font-bold bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-1 mb-8"
            />
            <div className="flex-1 grid grid-cols-3 gap-6">
              {[0, 1, 2].map((i) => {
                const stats = (content.stats as { value: string; label: string }[]) || [];
                const stat = stats[i] || { value: "", label: "" };
                return (
                  <div key={i} className="text-center">
                    <input
                      type="text"
                      value={stat.value}
                      onChange={(e) => {
                        const newStats = [...stats];
                        newStats[i] = { ...stat, value: e.target.value };
                        onUpdate({ content: { ...content, stats: newStats } });
                      }}
                      placeholder="0"
                      className="w-full text-5xl font-bold text-center bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-primary"
                    />
                    <input
                      type="text"
                      value={stat.label}
                      onChange={(e) => {
                        const newStats = [...stats];
                        newStats[i] = { ...stat, label: e.target.value };
                        onUpdate({ content: { ...content, stats: newStats } });
                      }}
                      placeholder="Label"
                      className="w-full text-sm text-center bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-2 mt-2"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Default/Blank Layout */}
        {!["TITLE", "TITLE_CONTENT", "TWO_COLUMN", "QUOTE", "STATS"].includes(slide.layoutType) && (
          <div className="flex-1 flex flex-col">
            <input
              type="text"
              value={slide.title || ""}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Click to add title"
              className="text-3xl font-bold bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-1 mb-4"
            />
            <input
              type="text"
              value={slide.subtitle || ""}
              onChange={(e) => onUpdate({ subtitle: e.target.value })}
              placeholder="Click to add subtitle"
              className="text-lg bg-transparent border-none outline-none placeholder:text-ltd-text-3 text-ltd-text-2"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Layout Preview Icons
function LayoutPreview({ layout }: { layout: SlideLayoutType }) {
  const baseClass = "w-full h-full p-1";

  switch (layout) {
    case "TITLE":
      return (
        <div className={cn(baseClass, "flex flex-col items-center justify-center gap-1")}>
          <div className="w-2/3 h-2 bg-ltd-text-3 rounded" />
          <div className="w-1/3 h-1 bg-ltd-text-3/50 rounded" />
        </div>
      );
    case "TITLE_CONTENT":
      return (
        <div className={cn(baseClass, "flex flex-col gap-1")}>
          <div className="w-1/2 h-1.5 bg-ltd-text-3 rounded" />
          <div className="flex-1 w-full bg-ltd-text-3/30 rounded" />
        </div>
      );
    case "TWO_COLUMN":
      return (
        <div className={cn(baseClass, "flex flex-col gap-1")}>
          <div className="w-1/2 h-1 bg-ltd-text-3 rounded" />
          <div className="flex-1 flex gap-1">
            <div className="flex-1 bg-ltd-text-3/30 rounded" />
            <div className="flex-1 bg-ltd-text-3/30 rounded" />
          </div>
        </div>
      );
    case "IMAGE_LEFT":
    case "IMAGE_RIGHT":
      return (
        <div className={cn(baseClass, "flex gap-1", layout === "IMAGE_RIGHT" && "flex-row-reverse")}>
          <div className="flex-1 bg-ltd-primary/30 rounded" />
          <div className="flex-1 flex flex-col gap-0.5 justify-center">
            <div className="w-2/3 h-1 bg-ltd-text-3 rounded" />
            <div className="w-full h-0.5 bg-ltd-text-3/50 rounded" />
            <div className="w-3/4 h-0.5 bg-ltd-text-3/50 rounded" />
          </div>
        </div>
      );
    case "IMAGE_FULL":
      return (
        <div className={cn(baseClass)}>
          <div className="w-full h-full bg-ltd-primary/30 rounded" />
        </div>
      );
    case "QUOTE":
      return (
        <div className={cn(baseClass, "flex flex-col items-center justify-center gap-0.5")}>
          <div className="text-[8px] text-ltd-primary">"</div>
          <div className="w-3/4 h-0.5 bg-ltd-text-3/50 rounded" />
          <div className="w-1/2 h-0.5 bg-ltd-text-3/50 rounded" />
        </div>
      );
    case "STATS":
      return (
        <div className={cn(baseClass, "flex flex-col gap-1")}>
          <div className="w-1/3 h-1 bg-ltd-text-3 rounded" />
          <div className="flex-1 flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                <div className="w-3 h-3 rounded-full bg-ltd-primary/50" />
                <div className="w-2/3 h-0.5 bg-ltd-text-3/30 rounded" />
              </div>
            ))}
          </div>
        </div>
      );
    default:
      return (
        <div className={cn(baseClass, "flex items-center justify-center")}>
          <div className="w-8 h-8 border-2 border-dashed border-ltd-text-3/50 rounded" />
        </div>
      );
  }
}
