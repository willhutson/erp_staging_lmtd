"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createRFP } from "../actions/rfp-actions";

interface RFPFormProps {
  onClose?: () => void;
}

export function RFPForm({ onClose }: RFPFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [clientName, setClientName] = useState("");
  const [portal, setPortal] = useState("");
  const [deadline, setDeadline] = useState("");
  const [estimatedValue, setEstimatedValue] = useState("");
  const [scopeOfWork, setScopeOfWork] = useState("");
  const [requirements, setRequirements] = useState("");
  const [bidBondRequired, setBidBondRequired] = useState(false);
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    startTransition(async () => {
      try {
        await createRFP({
          name: `RFP – ${clientName}`,
          clientName,
          portal: portal || undefined,
          deadline: new Date(deadline),
          estimatedValue: estimatedValue ? parseFloat(estimatedValue) : undefined,
          scopeOfWork: scopeOfWork || undefined,
          requirements: requirements || undefined,
          bidBondRequired,
          notes: notes || undefined,
        });
        router.push("/rfp");
        router.refresh();
      } catch (error) {
        console.error("Failed to create RFP:", error);
      }
    });
  };

  return (
    <div className="bg-ltd-surface-overlay rounded-xl border border-ltd-border-1">
      <div className="flex items-center justify-between p-4 border-b border-ltd-border-1">
        <h2 className="text-lg font-semibold text-ltd-text-1">New RFP</h2>
        {onClose && (
          <button onClick={onClose} className="p-1 hover:bg-ltd-surface-3 rounded">
            <X className="w-5 h-5 text-ltd-text-2" />
          </button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Client / Entity Name *
            </label>
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              placeholder="e.g., Dubai South"
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Portal / Source
            </label>
            <input
              type="text"
              value={portal}
              onChange={(e) => setPortal(e.target.value)}
              placeholder="Where did you receive this RFP?"
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Deadline *
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ltd-text-2 mb-1">
              Estimated Value (AED)
            </label>
            <input
              type="number"
              value={estimatedValue}
              onChange={(e) => setEstimatedValue(e.target.value)}
              placeholder="e.g., 500000"
              className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-ltd-text-2 mb-1">
            Scope of Work
          </label>
          <textarea
            value={scopeOfWork}
            onChange={(e) => setScopeOfWork(e.target.value)}
            rows={4}
            placeholder="Describe the scope of work required..."
            className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ltd-text-2 mb-1">
            Requirements
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            rows={3}
            placeholder="Key requirements or criteria..."
            className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary resize-none"
          />
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="bidBond"
            checked={bidBondRequired}
            onChange={(e) => setBidBondRequired(e.target.checked)}
            className="w-4 h-4 rounded border-ltd-border-1 text-ltd-primary focus:ring-ltd-primary"
          />
          <label htmlFor="bidBond" className="text-sm text-ltd-text-2">
            Bid bond required
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-ltd-text-2 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="Any additional notes..."
            className="w-full px-3 py-2 border border-ltd-border-1 bg-ltd-surface-overlay text-ltd-text-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ltd-primary resize-none"
          />
        </div>

        <div className="flex gap-3 pt-4 border-t border-ltd-border-1">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-ltd-border-1 text-ltd-text-2 rounded-lg hover:bg-ltd-surface-3"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !clientName || !deadline}
            className="flex-1 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-lg hover:bg-ltd-primary-hover transition-colors disabled:opacity-50"
          >
            {isPending ? "Creating..." : "Create RFP"}
          </button>
        </div>
      </form>
    </div>
  );
}
