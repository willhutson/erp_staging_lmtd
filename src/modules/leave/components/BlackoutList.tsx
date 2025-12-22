"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Calendar, Building2, Repeat, Trash2, Plus } from "lucide-react";
import type { BlackoutPeriod } from "@prisma/client";
import { createBlackoutPeriod, deleteBlackoutPeriod } from "../actions/blackout-actions";

type BlackoutWithClient = BlackoutPeriod & {
  client: { id: string; name: string; code: string } | null;
};

interface BlackoutListProps {
  blackouts: BlackoutWithClient[];
  clients: { id: string; name: string; code: string }[];
  canManage?: boolean;
}

export function BlackoutList({ blackouts, clients, canManage = false }: BlackoutListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [clientId, setClientId] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      await createBlackoutPeriod({
        name,
        reason: reason || undefined,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        clientId: clientId || undefined,
        isRecurring,
      });
      setName("");
      setReason("");
      setStartDate("");
      setEndDate("");
      setClientId("");
      setIsRecurring(false);
      setShowForm(false);
      router.refresh();
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this blackout period?")) return;

    startTransition(async () => {
      await deleteBlackoutPeriod(id);
      router.refresh();
    });
  };

  return (
    <div className="bg-ltd-surface-overlay rounded-[var(--ltd-radius-lg)] border border-ltd-border-1">
      <div className="p-4 border-b border-ltd-border-1 flex items-center justify-between">
        <h2 className="font-semibold text-ltd-text-1">Blackout Periods</h2>
        {canManage && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 text-sm text-ltd-primary hover:underline"
          >
            <Plus className="w-4 h-4" />
            Add Blackout
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="p-4 border-b border-ltd-border-1 bg-ltd-surface-2 space-y-3">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Blackout name (e.g., Ramadan Coverage)"
            required
            className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
              className="px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate}
              required
              className="px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
          </div>
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
          >
            <option value="">All clients (company-wide)</option>
            {clients.map((client) => (
              <option key={client.id} value={client.id}>
                {client.name} ({client.code})
              </option>
            ))}
          </select>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            rows={2}
            className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary resize-none"
          />
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="w-4 h-4 rounded border-ltd-border-1 text-ltd-primary focus:ring-ltd-primary"
            />
            <span className="text-sm text-ltd-text-2">Repeats annually</span>
          </label>
          <div className="flex gap-2 justify-end">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1.5 text-sm text-ltd-text-2 hover:text-ltd-text-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-1.5 text-sm bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Adding..." : "Add Blackout"}
            </button>
          </div>
        </form>
      )}

      {blackouts.length === 0 ? (
        <div className="p-8 text-center text-ltd-text-2 text-sm">
          No blackout periods defined
        </div>
      ) : (
        <div className="divide-y divide-ltd-border-1">
          {blackouts.map((blackout) => (
            <div key={blackout.id} className="p-4 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-ltd-text-1">{blackout.name}</span>
                  {blackout.isRecurring && (
                    <span title="Repeats annually">
                      <Repeat className="w-4 h-4 text-ltd-text-3" />
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-ltd-text-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {formatDate(blackout.startDate)} – {formatDate(blackout.endDate)}
                  </span>
                  {blackout.client && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {blackout.client.code}
                    </span>
                  )}
                </div>
                {blackout.reason && (
                  <p className="text-sm text-ltd-text-3 mt-1">{blackout.reason}</p>
                )}
              </div>
              {canManage && (
                <button
                  onClick={() => handleDelete(blackout.id)}
                  disabled={isPending}
                  className="p-1.5 text-ltd-text-3 hover:text-ltd-error transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
