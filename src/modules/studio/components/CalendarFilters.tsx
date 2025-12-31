"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SocialContentType, CalendarEntryStatus } from "../types";

interface CalendarFiltersProps {
  clients: { id: string; name: string }[];
  selectedClientId?: string;
  selectedPlatforms: string[];
  selectedContentType?: SocialContentType;
  selectedStatus?: CalendarEntryStatus;
  onClientChange: (clientId: string | undefined) => void;
  onPlatformToggle: (platform: string) => void;
  onContentTypeChange: (type: SocialContentType | undefined) => void;
  onStatusChange: (status: CalendarEntryStatus | undefined) => void;
  onClearAll: () => void;
  className?: string;
}

const platforms = [
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "twitter", label: "X" },
  { id: "tiktok", label: "TikTok" },
  { id: "youtube", label: "YouTube" },
];

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

const statuses: { value: CalendarEntryStatus; label: string }[] = [
  { value: "IDEA", label: "Idea" },
  { value: "PLANNED", label: "Planned" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "READY", label: "Ready" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function CalendarFilters({
  clients,
  selectedClientId,
  selectedPlatforms,
  selectedContentType,
  selectedStatus,
  onClientChange,
  onPlatformToggle,
  onContentTypeChange,
  onStatusChange,
  onClearAll,
  className,
}: CalendarFiltersProps) {
  const hasActiveFilters =
    selectedClientId ||
    selectedPlatforms.length > 0 ||
    selectedContentType ||
    selectedStatus;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-ltd-text-3">Active filters:</span>

          {selectedClientId && (
            <FilterChip
              label={clients.find((c) => c.id === selectedClientId)?.name || "Client"}
              onRemove={() => onClientChange(undefined)}
            />
          )}

          {selectedPlatforms.map((platform) => (
            <FilterChip
              key={platform}
              label={platforms.find((p) => p.id === platform)?.label || platform}
              onRemove={() => onPlatformToggle(platform)}
            />
          ))}

          {selectedContentType && (
            <FilterChip
              label={contentTypes.find((t) => t.value === selectedContentType)?.label || selectedContentType}
              onRemove={() => onContentTypeChange(undefined)}
            />
          )}

          {selectedStatus && (
            <FilterChip
              label={statuses.find((s) => s.value === selectedStatus)?.label || selectedStatus}
              onRemove={() => onStatusChange(undefined)}
            />
          )}

          <button
            onClick={onClearAll}
            className="text-xs text-ltd-primary hover:underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-3">
        {/* Client Filter */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-ltd-text-3 mb-1">
            Client
          </label>
          <select
            value={selectedClientId || ""}
            onChange={(e) => onClientChange(e.target.value || undefined)}
            className="w-full px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          >
            <option value="">All Clients</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        {/* Platform Filter */}
        <div className="min-w-[150px]">
          <label className="block text-xs font-medium text-ltd-text-3 mb-1">
            Platform
          </label>
          <div className="flex flex-wrap gap-1">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => onPlatformToggle(platform.id)}
                className={cn(
                  "px-2 py-1 text-xs rounded-[var(--ltd-radius-sm)] border transition-colors",
                  selectedPlatforms.includes(platform.id)
                    ? "border-ltd-primary bg-ltd-primary/10 text-ltd-primary"
                    : "border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
                )}
              >
                {platform.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Type Filter */}
        <div className="min-w-[120px]">
          <label className="block text-xs font-medium text-ltd-text-3 mb-1">
            Format
          </label>
          <select
            value={selectedContentType || ""}
            onChange={(e) => onContentTypeChange((e.target.value as SocialContentType) || undefined)}
            className="w-full px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          >
            <option value="">All Formats</option>
            {contentTypes.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[120px]">
          <label className="block text-xs font-medium text-ltd-text-3 mb-1">
            Status
          </label>
          <select
            value={selectedStatus || ""}
            onChange={(e) => onStatusChange((e.target.value as CalendarEntryStatus) || undefined)}
            className="w-full px-3 py-1.5 text-sm border border-ltd-border-1 rounded-[var(--ltd-radius-md)] bg-ltd-surface-1 text-ltd-text-1 focus:outline-none focus:ring-2 focus:ring-ltd-primary/50"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-ltd-primary/10 text-ltd-primary text-xs rounded-full">
      {label}
      <button onClick={onRemove} className="hover:bg-ltd-primary/20 rounded-full">
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}
