"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Filter, ChevronDown, ChevronUp, Sparkles, ArrowLeft } from "lucide-react";
import {
  StudioCalendar,
  CreateCalendarEntryModal,
  CalendarEntryPanel,
  CalendarFilters,
  AICalendarGeneratorModal,
  type CreateEntryFormData,
} from "@/modules/studio/components";
import type { CalendarEntryWithRelations, SocialContentType, CalendarEntryStatus } from "@/modules/studio/types";
import type { BriefDeadlineMarker } from "@/modules/studio/actions/brief-deadline-actions";
import {
  createCalendarEntry,
  rescheduleEntry,
} from "@/modules/studio/actions/calendar-actions";
import { cn } from "@/lib/utils";

interface ClientCalendarClientProps {
  client: { id: string; name: string; code: string | null };
  initialEntries: CalendarEntryWithRelations[];
  clients: { id: string; name: string; code?: string | null }[];
  briefDeadlines?: BriefDeadlineMarker[];
}

export function ClientCalendarClient({
  client,
  initialEntries,
  clients,
  briefDeadlines = [],
}: ClientCalendarClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState(initialEntries);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAIGeneratorOpen, setIsAIGeneratorOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<SocialContentType | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<CalendarEntryStatus | undefined>();

  // Entry detail panel state
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntryWithRelations | null>(null);

  // Filter entries based on selected filters
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Platform filter (entry must have at least one of the selected platforms)
      if (selectedPlatforms.length > 0) {
        const entryPlatforms = entry.platforms || [];
        const hasMatchingPlatform = selectedPlatforms.some((p) => entryPlatforms.includes(p));
        if (!hasMatchingPlatform) return false;
      }

      // Content type filter
      if (selectedContentType && entry.contentType !== selectedContentType) {
        return false;
      }

      // Status filter
      if (selectedStatus && entry.status !== selectedStatus) {
        return false;
      }

      return true;
    });
  }, [entries, selectedPlatforms, selectedContentType, selectedStatus]);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedPlatforms([]);
    setSelectedContentType(undefined);
    setSelectedStatus(undefined);
  };

  const hasActiveFilters = selectedPlatforms.length > 0 || selectedContentType || selectedStatus;

  const handleCreateClick = (date: Date) => {
    setSelectedDate(date);
    setIsCreateModalOpen(true);
  };

  const handleCreateEntry = async (data: CreateEntryFormData) => {
    setIsCreating(true);
    try {
      const newEntry = await createCalendarEntry({
        title: data.title,
        description: data.description,
        contentType: data.contentType,
        scheduledDate: new Date(data.scheduledDate),
        scheduledTime: data.scheduledTime || undefined,
        platforms: data.platforms,
        clientId: client.id, // Always use current client
        color: data.color || undefined,
      });

      // Add to local state
      setEntries((prev) => [...prev, newEntry]);
      setIsCreateModalOpen(false);

      // Refresh to get full data
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to create entry:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleEntryDrop = async (entryId: string, newDate: Date) => {
    // Optimistic update
    setEntries((prev) =>
      prev.map((entry) =>
        entry.id === entryId
          ? { ...entry, scheduledDate: newDate }
          : entry
      )
    );

    try {
      await rescheduleEntry(entryId, newDate);
      startTransition(() => {
        router.refresh();
      });
    } catch (error) {
      console.error("Failed to reschedule:", error);
      // Revert on error
      startTransition(() => {
        router.refresh();
      });
    }
  };

  const handleEntryClick = (entry: CalendarEntryWithRelations) => {
    setSelectedEntry(entry);
  };

  const handleEditEntry = (entry: CalendarEntryWithRelations) => {
    console.log("Edit entry:", entry);
  };

  const handleDeleteEntry = async (entryId: string) => {
    console.log("Delete entry:", entryId);
  };

  const handleDeadlineClick = (deadline: BriefDeadlineMarker) => {
    window.location.href = `/briefs/${deadline.id}`;
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Link
            href="/studio/calendar"
            className="inline-flex items-center gap-1 text-sm text-ltd-text-3 hover:text-ltd-primary mb-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All Calendars
          </Link>
          <h1 className="text-2xl font-bold text-ltd-text-1">
            {client.name}
            {client.code && (
              <span className="ml-2 text-lg font-normal text-ltd-text-3">
                ({client.code})
              </span>
            )}
          </h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            {entries.length} scheduled posts
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-2 border rounded-[var(--ltd-radius-md)] text-sm transition-colors",
              hasActiveFilters
                ? "border-ltd-primary bg-ltd-primary/10 text-ltd-primary"
                : "border-ltd-border-1 text-ltd-text-2 hover:bg-ltd-surface-3"
            )}
          >
            <Filter className="w-4 h-4" />
            Filter
            {hasActiveFilters && (
              <span className="w-5 h-5 bg-ltd-primary text-ltd-primary-text rounded-full text-xs flex items-center justify-center">
                {selectedPlatforms.length + (selectedContentType ? 1 : 0) + (selectedStatus ? 1 : 0)}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsAIGeneratorOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-ltd-primary text-ltd-primary rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary/10 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            AI Generate
          </button>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setIsCreateModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text rounded-[var(--ltd-radius-md)] font-medium text-sm hover:bg-ltd-primary-dark transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Entry
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="mb-4 p-4 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2">
          <CalendarFilters
            clients={[]}
            selectedClientId={undefined}
            selectedPlatforms={selectedPlatforms}
            selectedContentType={selectedContentType}
            selectedStatus={selectedStatus}
            onClientChange={() => {}}
            onPlatformToggle={handlePlatformToggle}
            onContentTypeChange={setSelectedContentType}
            onStatusChange={setSelectedStatus}
            onClearAll={handleClearAllFilters}
            hideClientFilter
          />
          {hasActiveFilters && (
            <div className="mt-3 pt-3 border-t border-ltd-border-1 text-sm text-ltd-text-2">
              Showing {filteredEntries.length} of {entries.length} entries
            </div>
          )}
        </div>
      )}

      {/* Calendar */}
      <div className="flex-1 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 overflow-hidden">
        <StudioCalendar
          entries={filteredEntries}
          briefDeadlines={briefDeadlines}
          onCreateClick={handleCreateClick}
          onEntryClick={handleEntryClick}
          onEntryDrop={handleEntryDrop}
          onDeadlineClick={handleDeadlineClick}
        />
      </div>

      {/* Create Modal */}
      <CreateCalendarEntryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateEntry}
        initialDate={selectedDate || undefined}
        clients={clients}
        isLoading={isCreating}
        defaultClientId={client.id}
      />

      {/* Entry Detail Panel */}
      {selectedEntry && (
        <CalendarEntryPanel
          entry={selectedEntry}
          onClose={() => setSelectedEntry(null)}
          onEdit={handleEditEntry}
          onDelete={handleDeleteEntry}
        />
      )}

      {/* AI Calendar Generator Modal */}
      <AICalendarGeneratorModal
        isOpen={isAIGeneratorOpen}
        onClose={() => setIsAIGeneratorOpen(false)}
        onComplete={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
        clients={clients.map(c => ({ id: c.id, name: c.name, code: c.code || undefined }))}
        defaultClientId={client.id}
      />
    </div>
  );
}
