"use client";

import { format } from "date-fns";
import { X, Calendar, Clock, Users, FileText, ExternalLink, Edit2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { CalendarEntryWithRelations, SocialContentType, CalendarEntryStatus } from "../types";

interface CalendarEntryPanelProps {
  entry: CalendarEntryWithRelations | null;
  onClose: () => void;
  onEdit?: (entry: CalendarEntryWithRelations) => void;
  onDelete?: (entryId: string) => void;
  className?: string;
}

// Platform display config
const platformConfig: Record<string, { label: string; color: string; icon: string }> = {
  instagram: { label: "Instagram", color: "bg-gradient-to-r from-purple-500 to-pink-500", icon: "IG" },
  facebook: { label: "Facebook", color: "bg-blue-600", icon: "FB" },
  linkedin: { label: "LinkedIn", color: "bg-blue-700", icon: "IN" },
  twitter: { label: "X", color: "bg-black", icon: "X" },
  tiktok: { label: "TikTok", color: "bg-black", icon: "TT" },
  youtube: { label: "YouTube", color: "bg-red-600", icon: "YT" },
};

// Content type labels
const contentTypeConfig: Record<SocialContentType, { label: string; description: string }> = {
  POST: { label: "Post", description: "Static image or text post" },
  CAROUSEL: { label: "Carousel", description: "Multi-image swipeable post" },
  REEL: { label: "Reel", description: "Short-form vertical video" },
  STORY: { label: "Story", description: "24-hour ephemeral content" },
  LIVE: { label: "Live", description: "Real-time broadcast" },
  VIDEO: { label: "Video", description: "Standard video content" },
  ARTICLE: { label: "Article", description: "Long-form written content" },
  TWEET: { label: "Tweet", description: "Short text post" },
  THREAD: { label: "Thread", description: "Multi-part text series" },
  AD: { label: "Ad", description: "Paid promotional content" },
  OTHER: { label: "Other", description: "Custom content type" },
};

// Status config
const statusConfig: Record<CalendarEntryStatus, { label: string; color: string; bgColor: string }> = {
  IDEA: { label: "Idea", color: "text-gray-600", bgColor: "bg-gray-100" },
  PLANNED: { label: "Planned", color: "text-yellow-600", bgColor: "bg-yellow-100" },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600", bgColor: "bg-blue-100" },
  READY: { label: "Ready", color: "text-green-600", bgColor: "bg-green-100" },
  DRAFT: { label: "Draft", color: "text-slate-600", bgColor: "bg-slate-100" },
  SCHEDULED: { label: "Scheduled", color: "text-purple-600", bgColor: "bg-purple-100" },
  PUBLISHED: { label: "Published", color: "text-green-700", bgColor: "bg-green-200" },
  CANCELLED: { label: "Cancelled", color: "text-red-600", bgColor: "bg-red-100" },
};

export function CalendarEntryPanel({
  entry,
  onClose,
  onEdit,
  onDelete,
  className,
}: CalendarEntryPanelProps) {
  if (!entry) return null;

  const status = statusConfig[entry.status];
  const contentType = contentTypeConfig[entry.contentType];

  return (
    <div
      className={cn(
        "fixed inset-y-0 right-0 w-full max-w-md bg-ltd-surface-2 border-l border-ltd-border-1 shadow-xl z-50 flex flex-col",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
        <div className="flex items-center gap-2">
          <span className={cn("px-2 py-1 text-xs font-medium rounded", status.bgColor, status.color)}>
            {status.label}
          </span>
          <span className="text-xs text-ltd-text-3">
            {contentType.label}
          </span>
        </div>
        <div className="flex items-center gap-1">
          {onEdit && (
            <button
              onClick={() => onEdit(entry)}
              className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4 text-ltd-text-2" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(entry.id)}
              className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-red-100 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-500" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3 transition-colors"
          >
            <X className="w-4 h-4 text-ltd-text-2" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-6">
        {/* Title & Description */}
        <div>
          <h2 className="text-xl font-semibold text-ltd-text-1 mb-2">
            {entry.title}
          </h2>
          {entry.description && (
            <p className="text-sm text-ltd-text-2 whitespace-pre-wrap">
              {entry.description}
            </p>
          )}
        </div>

        {/* Client Brand */}
        {entry.client && (
          <div className="p-4 rounded-[var(--ltd-radius-lg)] bg-ltd-surface-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-ltd-primary/20 flex items-center justify-center">
                <span className="text-sm font-bold text-ltd-primary">
                  {entry.client.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="text-xs text-ltd-text-3 uppercase tracking-wider">Client</p>
                <p className="font-medium text-ltd-text-1">{entry.client.name}</p>
              </div>
            </div>
          </div>
        )}

        {/* Schedule */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider">
            Schedule
          </h3>
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="w-4 h-4 text-ltd-text-3" />
            <span className="text-ltd-text-1">
              {format(new Date(entry.scheduledDate), "EEEE, MMMM d, yyyy")}
            </span>
          </div>
          {entry.scheduledTime && (
            <div className="flex items-center gap-3 text-sm">
              <Clock className="w-4 h-4 text-ltd-text-3" />
              <span className="text-ltd-text-1">{entry.scheduledTime}</span>
              <span className="text-ltd-text-3">({entry.timezone || "Asia/Dubai"})</span>
            </div>
          )}
        </div>

        {/* Platforms */}
        {entry.platforms && entry.platforms.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider">
              Platforms
            </h3>
            <div className="flex flex-wrap gap-2">
              {entry.platforms.map((platform) => {
                const config = platformConfig[platform];
                return (
                  <div
                    key={platform}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-sm",
                      config?.color || "bg-gray-500"
                    )}
                  >
                    <span className="font-bold text-xs">{config?.icon || platform[0].toUpperCase()}</span>
                    <span>{config?.label || platform}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Content Type Details */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider">
            Format
          </h3>
          <div className="p-3 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-1">
            <p className="font-medium text-ltd-text-1">{contentType.label}</p>
            <p className="text-xs text-ltd-text-2 mt-0.5">{contentType.description}</p>
          </div>
        </div>

        {/* Linked Document */}
        {entry.document && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider">
              Linked Document
            </h3>
            <a
              href={`/studio/docs/${entry.document.id}`}
              className="flex items-center gap-3 p-3 rounded-[var(--ltd-radius-md)] border border-ltd-border-1 bg-ltd-surface-1 hover:border-ltd-primary/50 transition-colors"
            >
              <FileText className="w-5 h-5 text-ltd-primary" />
              <span className="flex-1 text-sm text-ltd-text-1 truncate">
                {entry.document.title}
              </span>
              <ExternalLink className="w-4 h-4 text-ltd-text-3" />
            </a>
          </div>
        )}

        {/* Assignee */}
        {entry.assignee && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider">
              Assigned To
            </h3>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-ltd-surface-4 flex items-center justify-center">
                {entry.assignee.avatarUrl ? (
                  <img
                    src={entry.assignee.avatarUrl}
                    alt={entry.assignee.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-medium text-ltd-text-1">
                    {entry.assignee.name.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-sm text-ltd-text-1">{entry.assignee.name}</span>
            </div>
          </div>
        )}

        {/* Preview Placeholder */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ltd-text-3 uppercase tracking-wider">
            Preview
          </h3>
          <div className="aspect-square max-w-[280px] rounded-[var(--ltd-radius-lg)] border-2 border-dashed border-ltd-border-2 bg-ltd-surface-1 flex items-center justify-center">
            <div className="text-center p-4">
              <div className="w-12 h-12 rounded-full bg-ltd-surface-3 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-ltd-text-3" />
              </div>
              <p className="text-sm text-ltd-text-2">
                No content preview available
              </p>
              <p className="text-xs text-ltd-text-3 mt-1">
                Link a document or upload assets
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-ltd-border-1 space-y-2">
        <button className="w-full px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors">
          Open in Editor
        </button>
        <button className="w-full px-4 py-2 border border-ltd-border-1 text-ltd-text-2 rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-surface-3 transition-colors">
          Send to Marketing
        </button>
      </div>
    </div>
  );
}
