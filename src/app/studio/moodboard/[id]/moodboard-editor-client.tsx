"use client";

import { useState, useRef, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Plus,
  Image as ImageIcon,
  Type,
  Link as LinkIcon,
  Palette,
  Trash2,
  Share2,
  Sparkles,
  MessageSquare,
  Upload,
  X,
  Move,
  ZoomIn,
  ZoomOut,
  Grid,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MoodboardWithRelations, MoodboardItem, MoodboardItemType } from "@/modules/studio/types";
import {
  addMoodboardItem,
  updateItemPosition,
  deleteMoodboardItem,
  toggleMoodboardSharing,
} from "@/modules/studio/actions/moodboard-actions";

interface MoodboardEditorClientProps {
  moodboard: MoodboardWithRelations;
}

type ToolType = "select" | "image" | "text" | "color" | "link";

export function MoodboardEditorClient({ moodboard: initialMoodboard }: MoodboardEditorClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [moodboard, setMoodboard] = useState(initialMoodboard);
  const [activeTool, setActiveTool] = useState<ToolType>("select");
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);

  // Drag state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLDivElement>(null);

  // Add item form state
  const [newItemType, setNewItemType] = useState<MoodboardItemType>("IMAGE");
  const [newItemUrl, setNewItemUrl] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [newItemColor, setNewItemColor] = useState("#52EDC7");
  const [newItemTitle, setNewItemTitle] = useState("");

  const items = moodboard.items || [];

  const handleAddItem = async () => {
    setIsAddingItem(true);
    try {
      const position = {
        positionX: Math.random() * 400 + 100,
        positionY: Math.random() * 300 + 100,
        width: newItemType === "COLOR" ? 100 : 200,
        height: newItemType === "COLOR" ? 100 : 150,
      };

      await addMoodboardItem({
        moodboardId: moodboard.id,
        type: newItemType,
        fileUrl: newItemType === "IMAGE" ? newItemUrl : undefined,
        sourceUrl: newItemType === "LINK" ? newItemUrl : undefined,
        text: newItemType === "TEXT" ? newItemText : undefined,
        color: newItemType === "COLOR" ? newItemColor : undefined,
        title: newItemTitle || undefined,
        ...position,
      });

      setShowAddModal(false);
      resetAddForm();
      startTransition(() => router.refresh());
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsAddingItem(false);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      await deleteMoodboardItem(itemId);
      setMoodboard((prev) => ({
        ...prev,
        items: prev.items?.filter((i) => i.id !== itemId),
      }));
      setSelectedItemId(null);
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const handleDragStart = (e: React.MouseEvent, item: MoodboardItem) => {
    if (activeTool !== "select") return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    setSelectedItemId(item.id);
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - (item.positionX || 0) * zoom,
      y: e.clientY - (item.positionY || 0) * zoom,
    });
  };

  const handleDragMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging || !selectedItemId) return;

      const newX = (e.clientX - dragOffset.x) / zoom;
      const newY = (e.clientY - dragOffset.y) / zoom;

      setMoodboard((prev) => ({
        ...prev,
        items: prev.items?.map((item) =>
          item.id === selectedItemId
            ? { ...item, positionX: newX, positionY: newY }
            : item
        ),
      }));
    },
    [isDragging, selectedItemId, dragOffset, zoom]
  );

  const handleDragEnd = async () => {
    if (!isDragging || !selectedItemId) return;

    setIsDragging(false);

    const item = items.find((i) => i.id === selectedItemId);
    if (item) {
      try {
        await updateItemPosition(selectedItemId, {
          positionX: item.positionX || 0,
          positionY: item.positionY || 0,
        });
      } catch (error) {
        console.error("Failed to update position:", error);
      }
    }
  };

  const handleToggleShare = async () => {
    try {
      const result = await toggleMoodboardSharing(moodboard.id, !moodboard.isPublic);
      setMoodboard((prev) => ({
        ...prev,
        isPublic: !prev.isPublic,
      }));
      if (result.shareUrl) {
        navigator.clipboard.writeText(window.location.origin + result.shareUrl);
        alert("Share link copied to clipboard!");
      }
    } catch (error) {
      console.error("Failed to toggle sharing:", error);
    }
  };

  const resetAddForm = () => {
    setNewItemType("IMAGE");
    setNewItemUrl("");
    setNewItemText("");
    setNewItemColor("#52EDC7");
    setNewItemTitle("");
  };

  return (
    <div className="h-screen flex flex-col bg-ltd-surface-1">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-ltd-border-1 bg-ltd-surface-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/moodboard")}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-ltd-text-1" />
          </button>
          <div>
            <h1 className="text-lg font-semibold text-ltd-text-1">{moodboard.title}</h1>
            <div className="flex items-center gap-2 text-xs text-ltd-text-2">
              {moodboard.client && <span>{moodboard.client.name}</span>}
              <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700">
                {moodboard.type}
              </span>
              {moodboard.isPublic && (
                <span className="flex items-center gap-1 text-green-600">
                  <Share2 className="w-3 h-3" />
                  Shared
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] font-medium transition-colors",
              showAIPanel
                ? "bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white"
                : "border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
          <button
            onClick={handleToggleShare}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            {moodboard.isPublic ? "Unshare" : "Share"}
          </button>
        </div>
      </div>

      {/* Tool Palette */}
      <div className="flex items-center gap-1 px-4 py-2 border-b border-ltd-border-1 bg-ltd-surface-2">
        <div className="flex items-center gap-1 border-r border-ltd-border-1 pr-4 mr-4">
          <ToolButton
            active={activeTool === "select"}
            onClick={() => setActiveTool("select")}
            icon={<Move className="w-4 h-4" />}
            title="Select & Move"
          />
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium hover:bg-ltd-primary-dark transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Item
        </button>

        <div className="flex-1" />

        {/* Zoom Controls */}
        <div className="flex items-center gap-1 border-l border-ltd-border-1 pl-4">
          <button
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <ZoomOut className="w-4 h-4 text-ltd-text-2" />
          </button>
          <span className="text-sm text-ltd-text-2 w-16 text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <ZoomIn className="w-4 h-4 text-ltd-text-2" />
          </button>
        </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Canvas */}
        <div
          ref={canvasRef}
          className="flex-1 overflow-auto bg-[#1a1a2e] relative"
          onMouseMove={handleDragMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
          onClick={() => setSelectedItemId(null)}
        >
          {/* Grid Background */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(to right, #fff 1px, transparent 1px),
                linear-gradient(to bottom, #fff 1px, transparent 1px)
              `,
              backgroundSize: `${20 * zoom}px ${20 * zoom}px`,
            }}
          />

          {/* Items */}
          <div
            className="relative"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              minWidth: "2000px",
              minHeight: "1500px",
            }}
          >
            {items.map((item) => (
              <MoodboardItemCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                onMouseDown={(e) => handleDragStart(e, item)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItemId(item.id);
                }}
                onDelete={() => handleDeleteItem(item.id)}
              />
            ))}
          </div>

          {/* Empty State */}
          {items.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8 bg-white/5 rounded-[var(--ltd-radius-lg)] border border-white/10">
                <Upload className="w-12 h-12 text-white/30 mx-auto mb-4" />
                <h3 className="text-white/70 font-medium mb-2">
                  Start building your moodboard
                </h3>
                <p className="text-white/50 text-sm mb-4">
                  Add images, colors, text, and links to create visual inspiration
                </p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white rounded-[var(--ltd-radius-md)] font-medium text-sm hover:opacity-90 transition-opacity"
                >
                  <Plus className="w-4 h-4" />
                  Add First Item
                </button>
              </div>
            </div>
          )}
        </div>

        {/* AI Panel */}
        {showAIPanel && (
          <div className="w-80 border-l border-ltd-border-1 bg-ltd-surface-2 flex flex-col">
            <div className="p-4 border-b border-ltd-border-1">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-ltd-text-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ltd-primary" />
                  AI Generation
                </h2>
                <button
                  onClick={() => setShowAIPanel(false)}
                  className="p-1 rounded hover:bg-ltd-surface-3"
                >
                  <X className="w-4 h-4 text-ltd-text-2" />
                </button>
              </div>
              <p className="text-xs text-ltd-text-2 mt-1">
                Generate content grounded in your moodboard
              </p>
            </div>

            <div className="flex-1 p-4 space-y-4">
              <div className="p-4 bg-gradient-to-r from-ltd-primary/10 to-[#7B61FF]/10 rounded-[var(--ltd-radius-md)] border border-ltd-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-ltd-primary" />
                  <span className="text-sm font-medium text-ltd-text-1">Ask AI</span>
                </div>
                <p className="text-xs text-ltd-text-2 mb-3">
                  Ask questions or generate content based on your visual references
                </p>
                <textarea
                  placeholder="e.g., Write captions for social posts that match this visual style..."
                  className="w-full px-3 py-2 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                  rows={3}
                />
                <button className="w-full mt-3 px-4 py-2 bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white rounded-[var(--ltd-radius-md)] font-medium text-sm hover:opacity-90 transition-opacity">
                  Generate
                </button>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-ltd-text-1">Quick Actions</h3>
                <button className="w-full text-left px-3 py-2 text-sm rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors text-ltd-text-2">
                  📝 Generate social captions
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors text-ltd-text-2">
                  🎨 Extract color palette
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors text-ltd-text-2">
                  📊 Create pitch deck outline
                </button>
                <button className="w-full text-left px-3 py-2 text-sm rounded-[var(--ltd-radius-md)] border border-ltd-border-1 hover:bg-ltd-surface-3 transition-colors text-ltd-text-2">
                  🎬 Write video script
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative w-full max-w-md bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1">
            <div className="p-4 border-b border-ltd-border-1">
              <h2 className="text-lg font-semibold text-ltd-text-1">Add to Moodboard</h2>
            </div>

            <div className="p-4 space-y-4">
              {/* Type Selection */}
              <div className="grid grid-cols-4 gap-2">
                <ItemTypeButton
                  type="IMAGE"
                  icon={<ImageIcon className="w-5 h-5" />}
                  label="Image"
                  selected={newItemType === "IMAGE"}
                  onClick={() => setNewItemType("IMAGE")}
                />
                <ItemTypeButton
                  type="COLOR"
                  icon={<Palette className="w-5 h-5" />}
                  label="Color"
                  selected={newItemType === "COLOR"}
                  onClick={() => setNewItemType("COLOR")}
                />
                <ItemTypeButton
                  type="TEXT"
                  icon={<Type className="w-5 h-5" />}
                  label="Text"
                  selected={newItemType === "TEXT"}
                  onClick={() => setNewItemType("TEXT")}
                />
                <ItemTypeButton
                  type="LINK"
                  icon={<LinkIcon className="w-5 h-5" />}
                  label="Link"
                  selected={newItemType === "LINK"}
                  onClick={() => setNewItemType("LINK")}
                />
              </div>

              {/* Dynamic Fields */}
              {(newItemType === "IMAGE" || newItemType === "LINK") && (
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    URL *
                  </label>
                  <input
                    type="url"
                    value={newItemUrl}
                    onChange={(e) => setNewItemUrl(e.target.value)}
                    placeholder={newItemType === "IMAGE" ? "https://example.com/image.jpg" : "https://example.com"}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                  />
                </div>
              )}

              {newItemType === "TEXT" && (
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    Text *
                  </label>
                  <textarea
                    value={newItemText}
                    onChange={(e) => setNewItemText(e.target.value)}
                    placeholder="Enter text note..."
                    rows={3}
                    className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
                  />
                </div>
              )}

              {newItemType === "COLOR" && (
                <div>
                  <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                    Color
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={newItemColor}
                      onChange={(e) => setNewItemColor(e.target.value)}
                      className="w-12 h-12 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={newItemColor}
                      onChange={(e) => setNewItemColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                  Label (optional)
                </label>
                <input
                  type="text"
                  value={newItemTitle}
                  onChange={(e) => setNewItemTitle(e.target.value)}
                  placeholder="Add a label..."
                  className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 p-4 border-t border-ltd-border-1">
              <button
                onClick={() => { setShowAddModal(false); resetAddForm(); }}
                className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={isAddingItem || (
                  (newItemType === "IMAGE" || newItemType === "LINK") && !newItemUrl.trim()
                ) || (newItemType === "TEXT" && !newItemText.trim())}
                className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-gradient-to-r from-ltd-primary to-[#7B61FF] text-white hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isAddingItem ? "Adding..." : "Add Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tool Button Component
function ToolButton({
  active,
  onClick,
  icon,
  title,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={cn(
        "p-2 rounded-[var(--ltd-radius-md)] transition-colors",
        active
          ? "bg-ltd-primary/10 text-ltd-primary"
          : "text-ltd-text-2 hover:bg-ltd-surface-3"
      )}
    >
      {icon}
    </button>
  );
}

// Item Type Button
function ItemTypeButton({
  type,
  icon,
  label,
  selected,
  onClick,
}: {
  type: string;
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 p-3 rounded-[var(--ltd-radius-md)] border transition-colors",
        selected
          ? "border-ltd-primary bg-ltd-primary/10"
          : "border-ltd-border-1 hover:bg-ltd-surface-3"
      )}
    >
      <div className={cn(selected ? "text-ltd-primary" : "text-ltd-text-2")}>
        {icon}
      </div>
      <span className={cn("text-xs font-medium", selected ? "text-ltd-primary" : "text-ltd-text-2")}>
        {label}
      </span>
    </button>
  );
}

// Moodboard Item Card
function MoodboardItemCard({
  item,
  isSelected,
  onMouseDown,
  onClick,
  onDelete,
}: {
  item: MoodboardItem;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={cn(
        "absolute rounded-lg overflow-hidden shadow-lg transition-shadow cursor-move",
        isSelected && "ring-2 ring-ltd-primary shadow-xl"
      )}
      style={{
        left: item.positionX || 0,
        top: item.positionY || 0,
        width: item.width || 200,
        height: item.height || 150,
        transform: `rotate(${item.rotation || 0}deg)`,
        zIndex: item.zIndex || 0,
      }}
      onMouseDown={onMouseDown}
      onClick={onClick}
    >
      {/* Content */}
      {item.type === "IMAGE" && item.fileUrl && (
        <img
          src={item.fileUrl}
          alt={item.title || ""}
          className="w-full h-full object-cover"
          draggable={false}
        />
      )}

      {item.type === "COLOR" && (
        <div
          className="w-full h-full flex items-center justify-center"
          style={{ backgroundColor: item.color || "#ccc" }}
        >
          <span className="text-xs font-mono text-white drop-shadow">
            {item.color}
          </span>
        </div>
      )}

      {item.type === "TEXT" && (
        <div className="w-full h-full bg-white p-3 flex items-center">
          <p className="text-sm text-gray-800 line-clamp-6">{item.text}</p>
        </div>
      )}

      {item.type === "LINK" && (
        <div className="w-full h-full bg-white p-3 flex flex-col">
          <div className="flex items-center gap-1 text-blue-600 mb-2">
            <LinkIcon className="w-3 h-3" />
            <span className="text-xs truncate">{item.sourceUrl}</span>
          </div>
          <p className="text-xs text-gray-600 line-clamp-4">{item.title || item.sourceUrl}</p>
        </div>
      )}

      {/* Label */}
      {item.title && item.type !== "TEXT" && (
        <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/50 text-white text-xs truncate">
          {item.title}
        </div>
      )}

      {/* Delete Button */}
      {isSelected && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
