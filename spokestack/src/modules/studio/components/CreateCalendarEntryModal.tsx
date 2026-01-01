"use client";

import { useState } from "react";
import { format } from "date-fns";
import { X, Calendar, Clock, Users, FileText, Palette } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialContentType, CalendarEntryStatus } from "../types";

interface CreateCalendarEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateEntryFormData) => void;
  initialDate?: Date;
  clients?: { id: string; name: string }[];
  isLoading?: boolean;
}

export interface CreateEntryFormData {
  title: string;
  description?: string;
  contentType: SocialContentType;
  scheduledDate: string;
  scheduledTime?: string;
  platforms: string[];
  clientId?: string;
  color?: string;
}

const contentTypes: { value: SocialContentType; label: string }[] = [
  { value: "POST", label: "Post" },
  { value: "CAROUSEL", label: "Carousel" },
  { value: "REEL", label: "Reel" },
  { value: "STORY", label: "Story" },
  { value: "LIVE", label: "Live" },
  { value: "ARTICLE", label: "Article" },
  { value: "THREAD", label: "Thread" },
  { value: "AD", label: "Ad" },
];

const platforms = [
  { id: "instagram", label: "Instagram", color: "from-purple-500 to-pink-500" },
  { id: "facebook", label: "Facebook", color: "bg-blue-600" },
  { id: "linkedin", label: "LinkedIn", color: "bg-blue-700" },
  { id: "twitter", label: "X (Twitter)", color: "bg-black" },
  { id: "tiktok", label: "TikTok", color: "bg-black" },
  { id: "youtube", label: "YouTube", color: "bg-red-600" },
];

const colorOptions = [
  "#EF4444", // red
  "#F97316", // orange
  "#EAB308", // yellow
  "#22C55E", // green
  "#14B8A6", // teal
  "#3B82F6", // blue
  "#8B5CF6", // purple
  "#EC4899", // pink
];

export function CreateCalendarEntryModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  clients = [],
  isLoading = false,
}: CreateCalendarEntryModalProps) {
  const [formData, setFormData] = useState<CreateEntryFormData>({
    title: "",
    description: "",
    contentType: "POST",
    scheduledDate: initialDate ? format(initialDate, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"),
    scheduledTime: "",
    platforms: [],
    clientId: "",
    color: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) return;
    onSubmit(formData);
  };

  const togglePlatform = (platformId: string) => {
    setFormData((prev) => ({
      ...prev,
      platforms: prev.platforms.includes(platformId)
        ? prev.platforms.filter((p) => p !== platformId)
        : [...prev.platforms, platformId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] overflow-auto bg-ltd-surface-2 rounded-[var(--ltd-radius-lg)] shadow-xl border border-ltd-border-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
          <h2 className="text-lg font-semibold text-ltd-text-1">
            Schedule Content
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <X className="w-4 h-4 text-ltd-text-2" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Product launch announcement"
              className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the content..."
              rows={2}
              className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 placeholder:text-ltd-text-3 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50 resize-none"
            />
          </div>

          {/* Content Type */}
          <div>
            <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
              Content Type
            </label>
            <div className="flex flex-wrap gap-2">
              {contentTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, contentType: type.value })}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] border transition-colors",
                    formData.contentType === type.value
                      ? "border-ltd-primary bg-ltd-primary/10 text-ltd-primary"
                      : "border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
                  )}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                <Calendar className="w-3.5 h-3.5 inline-block mr-1.5" />
                Date *
              </label>
              <input
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
                className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                <Clock className="w-3.5 h-3.5 inline-block mr-1.5" />
                Time
              </label>
              <input
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                className="w-full px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
              />
            </div>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
              Platforms
            </label>
            <div className="flex flex-wrap gap-2">
              {platforms.map((platform) => (
                <button
                  key={platform.id}
                  type="button"
                  onClick={() => togglePlatform(platform.id)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded-[var(--ltd-radius-md)] border transition-colors",
                    formData.platforms.includes(platform.id)
                      ? "border-ltd-primary bg-ltd-primary/10 text-ltd-primary"
                      : "border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
                  )}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>

          {/* Client */}
          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
                <Users className="w-3.5 h-3.5 inline-block mr-1.5" />
                Client
              </label>
              <select
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
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

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-ltd-text-1 mb-1.5">
              <Palette className="w-3.5 h-3.5 inline-block mr-1.5" />
              Color
            </label>
            <div className="flex gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  className={cn(
                    "w-7 h-7 rounded-full transition-transform",
                    formData.color === color && "ring-2 ring-offset-2 ring-ltd-primary scale-110"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
              {formData.color && (
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, color: "" })}
                  className="px-2 text-xs text-ltd-text-3 hover:text-ltd-text-1"
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-ltd-border-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] border border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !formData.title.trim()}
              className="px-4 py-2 text-sm font-medium rounded-[var(--ltd-radius-md)] bg-ltd-primary text-ltd-primary-text hover:bg-ltd-primary-dark transition-colors disabled:opacity-50"
            >
              {isLoading ? "Creating..." : "Schedule"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
