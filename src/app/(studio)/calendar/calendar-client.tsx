"use client";

import { useState, useTransition, useMemo } from "react";
import { Plus, Filter, ChevronDown, ChevronUp } from "lucide-react";
import {
  StudioCalendar,
  CreateCalendarEntryModal,
  CalendarEntryPanel,
  CalendarFilters,
  type CreateEntryFormData,
} from "@/modules/studio/components";
import type { CalendarEntryWithRelations, SocialContentType, CalendarEntryStatus } from "@/modules/studio/types";
import {
  createCalendarEntry,
  rescheduleEntry,
} from "@/modules/studio/actions/calendar-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface CalendarClientProps {
  initialEntries: CalendarEntryWithRelations[];
  clients: { id: string; name: string }[];
}

export function CalendarClient({ initialEntries, clients }: CalendarClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [entries, setEntries] = useState(initialEntries);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>();
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [selectedContentType, setSelectedContentType] = useState<SocialContentType | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<CalendarEntryStatus | undefined>();

  // Entry detail panel state
  const [selectedEntry, setSelectedEntry] = useState<CalendarEntryWithRelations | null>(null);

  // Filter entries based on selected filters
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Client filter
      if (selectedClientId && entry.clientId !== selectedClientId) {
        return false;
      }

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
  }, [entries, selectedClientId, selectedPlatforms, selectedContentType, selectedStatus]);

  const handlePlatformToggle = (platform: string) => {
    setSelectedPlatforms((prev) =>
      prev.includes(platform)
        ? prev.filter((p) => p !== platform)
        : [...prev, platform]
    );
  };

  const handleClearAllFilters = () => {
    setSelectedClientId(undefined);
    setSelectedPlatforms([]);
    setSelectedContentType(undefined);
    setSelectedStatus(undefined);
  };

  const hasActiveFilters = selectedClientId || selectedPlatforms.length > 0 || selectedContentType || selectedStatus;

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
        clientId: data.clientId || undefined,
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
    // TODO: Open edit modal
    console.log("Edit entry:", entry);
  };

  const handleDeleteEntry = async (entryId: string) => {
    // TODO: Implement delete with confirmation
    console.log("Delete entry:", entryId);
  };

  return (
    <div className="p-6 lg:p-8 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Social Calendar</h1>
          <p className="text-sm text-ltd-text-2 mt-1">
            Plan and schedule content across platforms
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
                {(selectedClientId ? 1 : 0) + selectedPlatforms.length + (selectedContentType ? 1 : 0) + (selectedStatus ? 1 : 0)}
              </span>
            )}
            {showFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
            clients={clients}
            selectedClientId={selectedClientId}
            selectedPlatforms={selectedPlatforms}
            selectedContentType={selectedContentType}
            selectedStatus={selectedStatus}
            onClientChange={setSelectedClientId}
            onPlatformToggle={handlePlatformToggle}
            onContentTypeChange={setSelectedContentType}
            onStatusChange={setSelectedStatus}
            onClearAll={handleClearAllFilters}
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
          onCreateClick={handleCreateClick}
          onEntryClick={handleEntryClick}
          onEntryDrop={handleEntryDrop}
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
    </div>
  );
}
