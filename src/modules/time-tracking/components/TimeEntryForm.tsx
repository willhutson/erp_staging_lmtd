"use client";

import { useState, useTransition } from "react";
import { X } from "lucide-react";
import { createTimeEntry, updateTimeEntry } from "../actions/timer-actions";
import type { TimeEntry, Brief, Client } from "@prisma/client";

interface TimeEntryFormProps {
  briefs: (Brief & { client: Client })[];
  entry?: TimeEntry;
  onClose: () => void;
  onSuccess?: () => void;
}

export function TimeEntryForm({
  briefs,
  entry,
  onClose,
  onSuccess,
}: TimeEntryFormProps) {
  const [briefId, setBriefId] = useState(entry?.briefId || "");
  const [date, setDate] = useState(
    entry?.date
      ? new Date(entry.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0]
  );
  const [hours, setHours] = useState(entry?.hours?.toString() || "");
  const [description, setDescription] = useState(entry?.description || "");
  const [isBillable, setIsBillable] = useState(entry?.isBillable ?? true);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        if (entry) {
          await updateTimeEntry(entry.id, {
            briefId: briefId || undefined,
            date: new Date(date),
            hours: parseFloat(hours),
            description,
            isBillable,
          });
        } else {
          await createTimeEntry({
            briefId: briefId || undefined,
            date: new Date(date),
            hours: parseFloat(hours),
            description,
            isBillable,
          });
        }
        onSuccess?.();
        onClose();
      } catch (error) {
        console.error("Failed to save time entry:", error);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-ltd-surface-overlay rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 w-full max-w-md mx-4">
        <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
          <h2 className="text-lg font-semibold text-ltd-text-1">
            {entry ? "Edit Time Entry" : "Add Time Entry"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-ltd-surface-3 rounded"
          >
            <X className="w-5 h-5 text-ltd-text-2" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Brief
            </label>
            <select
              value={briefId}
              onChange={(e) => setBriefId(e.target.value)}
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            >
              <option value="">No brief (general time)</option>
              {briefs.map((brief) => (
                <option key={brief.id} value={brief.id}>
                  {brief.client.code} - {brief.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ltd-text-2 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ltd-text-2 mb-1">
                Hours
              </label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="24"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                required
                placeholder="2.5"
                className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What did you work on?"
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary resize-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="billable"
              checked={isBillable}
              onChange={(e) => setIsBillable(e.target.checked)}
              className="w-4 h-4 rounded border-ltd-border-1 text-ltd-primary focus:ring-ltd-primary"
            />
            <label htmlFor="billable" className="text-sm text-ltd-text-2">
              Billable time
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-ltd-border-1 text-ltd-text-2 rounded-[var(--ltd-radius-md)] hover:bg-ltd-surface-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending || !hours}
              className="flex-1 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Saving..." : entry ? "Update" : "Add Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
