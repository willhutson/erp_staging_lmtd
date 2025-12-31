"use client";

import { useState, useTransition } from "react";
import { Plus, Filter } from "lucide-react";
import {
  StudioCalendar,
  CreateCalendarEntryModal,
  type CreateEntryFormData,
} from "@/modules/studio/components";
import type { CalendarEntryWithRelations } from "@/modules/studio/types";
import {
  createCalendarEntry,
  rescheduleEntry,
} from "@/modules/studio/actions/calendar-actions";
import { useRouter } from "next/navigation";

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
    // TODO: Open entry detail panel/modal
    console.log("Entry clicked:", entry);
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
          <button className="inline-flex items-center gap-2 px-3 py-2 border border-ltd-border-1 rounded-[var(--ltd-radius-md)] text-sm text-ltd-text-2 hover:bg-ltd-surface-3 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
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

      {/* Calendar */}
      <div className="flex-1 rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 bg-ltd-surface-2 overflow-hidden">
        <StudioCalendar
          entries={entries}
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
    </div>
  );
}
