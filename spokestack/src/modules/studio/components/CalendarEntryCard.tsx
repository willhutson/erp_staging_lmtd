"use client";

import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { CalendarEntryWithRelations, SocialContentType, CalendarEntryStatus } from "../types";

interface CalendarEntryCardProps {
  entry: CalendarEntryWithRelations;
  compact?: boolean;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onClick?: () => void;
  className?: string;
}

// Platform colors for visual distinction
const platformColors: Record<string, string> = {
  instagram: "bg-gradient-to-r from-purple-500 to-pink-500",
  facebook: "bg-blue-600",
  linkedin: "bg-blue-700",
  twitter: "bg-sky-500",
  tiktok: "bg-black",
  youtube: "bg-red-600",
};

// Content type icons/labels
const contentTypeLabels: Record<SocialContentType, string> = {
  POST: "Post",
  CAROUSEL: "Carousel",
  REEL: "Reel",
  STORY: "Story",
  LIVE: "Live",
  ARTICLE: "Article",
  THREAD: "Thread",
  AD: "Ad",
};

// Status colors
const statusColors: Record<CalendarEntryStatus, string> = {
  IDEA: "border-l-gray-400",
  PLANNED: "border-l-yellow-500",
  IN_PROGRESS: "border-l-blue-500",
  READY: "border-l-green-500",
  SCHEDULED: "border-l-purple-500",
  PUBLISHED: "border-l-green-600",
  CANCELLED: "border-l-red-500",
};

export function CalendarEntryCard({
  entry,
  compact = false,
  draggable = false,
  onDragStart,
  onDragEnd,
  onClick,
  className,
}: CalendarEntryCardProps) {
  const statusColor = statusColors[entry.status] || "border-l-gray-400";
  const entryColor = entry.color || undefined;

  if (compact) {
    // Compact view for calendar grid cells
    return (
      <div
        draggable={draggable}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.();
        }}
        className={cn(
          "px-1.5 py-0.5 rounded text-xs font-medium truncate cursor-pointer transition-all",
          "border-l-2",
          statusColor,
          draggable && "hover:shadow-md active:opacity-70",
          className
        )}
        style={{ backgroundColor: entryColor ? `${entryColor}20` : undefined }}
      >
        <span className="truncate">{entry.title}</span>
      </div>
    );
  }

  // Full view for panels/modals
  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "p-3 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-2",
        "border-l-4",
        statusColor,
        onClick && "cursor-pointer hover:border-ltd-primary/50",
        draggable && "hover:shadow-md active:opacity-70",
        className
      )}
      style={{ borderLeftColor: entryColor || undefined }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="font-medium text-ltd-text-1 text-sm line-clamp-2">
          {entry.title}
        </h4>
        <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium rounded bg-ltd-surface-3 text-ltd-text-2">
          {contentTypeLabels[entry.contentType]}
        </span>
      </div>

      {/* Description */}
      {entry.description && (
        <p className="text-xs text-ltd-text-2 line-clamp-2 mb-2">
          {entry.description}
        </p>
      )}

      {/* Platforms */}
      {entry.platforms && entry.platforms.length > 0 && (
        <div className="flex gap-1 mb-2">
          {entry.platforms.map((platform) => (
            <span
              key={platform}
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center text-white text-[8px] font-bold uppercase",
                platformColors[platform] || "bg-gray-500"
              )}
              title={platform}
            >
              {platform[0]}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-ltd-text-3">
        <span>
          {format(new Date(entry.scheduledDate), "MMM d")}
          {entry.scheduledTime && ` at ${entry.scheduledTime}`}
        </span>
        {entry.client && (
          <span className="truncate max-w-[100px]">{entry.client.name}</span>
        )}
      </div>

      {/* Assignee */}
      {entry.assignee && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-ltd-text-2">
          <div className="w-4 h-4 rounded-full bg-ltd-surface-4 flex items-center justify-center text-[8px] font-medium">
            {entry.assignee.name.charAt(0)}
          </div>
          <span>{entry.assignee.name}</span>
        </div>
      )}
    </div>
  );
}
