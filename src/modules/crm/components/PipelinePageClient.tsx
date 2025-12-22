"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Deal, Client, User } from "@prisma/client";
import { DealPipeline } from "./DealPipeline";
import { DealForm } from "./DealForm";

type DealWithRelations = Deal & {
  client: Client | null;
  owner: User;
};

interface PipelinePageClientProps {
  deals: DealWithRelations[];
  clients: Client[];
}

export function PipelinePageClient({ deals, clients }: PipelinePageClientProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ltd-text-1">Deal Pipeline</h1>
          <p className="text-ltd-text-2 mt-1">Track leads and opportunities</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-ltd-primary text-ltd-primary-text font-medium rounded-[var(--ltd-radius-md)] hover:bg-ltd-primary-hover transition-colors"
        >
          <Plus className="w-5 h-5" />
          New Deal
        </button>
      </div>

      <DealPipeline deals={deals} />

      {showForm && (
        <DealForm clients={clients} onClose={() => setShowForm(false)} />
      )}
    </>
  );
}
