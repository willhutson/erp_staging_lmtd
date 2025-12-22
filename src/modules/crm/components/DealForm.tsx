"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createDeal } from "../actions/deal-actions";
import type { Client, LeadSource } from "@prisma/client";

interface DealFormProps {
  clients: Client[];
  onClose: () => void;
}

const leadSources: { value: LeadSource; label: string }[] = [
  { value: "REFERRAL", label: "Referral" },
  { value: "WEBSITE", label: "Website" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "EVENT", label: "Event" },
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "RFP_PORTAL", label: "RFP Portal" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "OTHER", label: "Other" },
];

export function DealForm({ clients, onClose }: DealFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [name, setName] = useState("");
  const [clientId, setClientId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [value, setValue] = useState("");
  const [source, setSource] = useState<LeadSource | "">("");
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createDeal({
          name,
          clientId: clientId || undefined,
          companyName: companyName || undefined,
          contactName: contactName || undefined,
          contactEmail: contactEmail || undefined,
          value: value ? parseFloat(value) : undefined,
          source: source || undefined,
          expectedCloseDate: expectedCloseDate
            ? new Date(expectedCloseDate)
            : undefined,
          notes: notes || undefined,
        });
        router.refresh();
        onClose();
      } catch (error) {
        console.error("Failed to create deal:", error);
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-ltd-surface-overlay rounded-[var(--ltd-radius-lg)] border border-ltd-border-1 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-ltd-border-1 sticky top-0 bg-ltd-surface-overlay">
          <h2 className="text-lg font-semibold text-ltd-text-1">New Deal</h2>
          <button onClick={onClose} className="p-1 hover:bg-ltd-surface-3 rounded">
            <X className="w-5 h-5 text-ltd-text-2" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Deal Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Social Media Retainer 2025"
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Existing Client
            </label>
            <select
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            >
              <option value="">-- New prospect (not a client yet) --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {!clientId && (
            <>
              <div>
                <label className="block text-sm font-medium text-ltd-text-2 mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g., Dubai South"
                  className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-ltd-text-2 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ltd-text-2 mb-1">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="john@company.com"
                    className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
                  />
                </div>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ltd-text-2 mb-1">
                Deal Value (AED)
              </label>
              <input
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="500000"
                className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ltd-text-2 mb-1">
                Expected Close
              </label>
              <input
                type="date"
                value={expectedCloseDate}
                onChange={(e) => setExpectedCloseDate(e.target.value)}
                className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Lead Source
            </label>
            <select
              value={source}
              onChange={(e) => setSource(e.target.value as LeadSource)}
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            >
              <option value="">Select source...</option>
              {leadSources.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Any additional context..."
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-[var(--ltd-radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary resize-none"
            />
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
              disabled={isPending || !name}
              className="flex-1 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors disabled:opacity-50"
            >
              {isPending ? "Creating..." : "Create Deal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
