"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Client, ClientContact } from "@prisma/client";
import { createNPSSurvey } from "../actions/nps-actions";

type ClientWithContacts = Client & {
  contacts: ClientContact[];
};

interface CreateSurveyFormProps {
  clients: ClientWithContacts[];
  onSuccess?: () => void;
}

export function CreateSurveyForm({ clients, onSuccess }: CreateSurveyFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [clientId, setClientId] = useState("");
  const [contactId, setContactId] = useState("");
  const [quarter, setQuarter] = useState(Math.ceil((new Date().getMonth() + 1) / 3));
  const [year, setYear] = useState(new Date().getFullYear());

  const selectedClient = clients.find((c) => c.id === clientId);
  const decisionMakers = selectedClient?.contacts.filter(
    (c) => c.isDecisionMaker && c.isActive && c.email
  ) ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!clientId) {
      setError("Please select a client");
      return;
    }

    startTransition(async () => {
      try {
        await createNPSSurvey({
          clientId,
          quarter,
          year,
          sentToId: contactId || undefined,
        });
        router.refresh();
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create survey");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Client */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Client
        </label>
        <select
          value={clientId}
          onChange={(e) => {
            setClientId(e.target.value);
            setContactId("");
          }}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          required
        >
          <option value="">Select a client...</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.code})
            </option>
          ))}
        </select>
      </div>

      {/* Contact (Decision Maker) */}
      {selectedClient && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Send to (CEO/CFO)
          </label>
          <select
            value={contactId}
            onChange={(e) => setContactId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          >
            <option value="">Select a contact...</option>
            {decisionMakers.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.name} - {contact.jobTitle} ({contact.email})
              </option>
            ))}
          </select>
          {decisionMakers.length === 0 && (
            <p className="text-xs text-orange-600 mt-1">
              No decision makers found. Add a contact marked as decision maker.
            </p>
          )}
        </div>
      )}

      {/* Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quarter
          </label>
          <select
            value={quarter}
            onChange={(e) => setQuarter(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          >
            <option value={1}>Q1 (Jan-Mar)</option>
            <option value={2}>Q2 (Apr-Jun)</option>
            <option value={3}>Q3 (Jul-Sep)</option>
            <option value={4}>Q4 (Oct-Dec)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Year
          </label>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
          >
            <option value={2024}>2024</option>
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={isPending || !clientId}
        className="w-full py-2.5 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
      >
        {isPending ? "Creating..." : "Create Survey"}
      </button>
    </form>
  );
}
