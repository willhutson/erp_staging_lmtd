"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import type { FormConfig, BriefType } from "@/types/forms";
import { createBrief } from "@/modules/briefs/actions/create-brief";

interface User {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface Client {
  id: string;
  name: string;
  code: string;
}

interface BriefFormClientProps {
  config: FormConfig;
  users: User[];
  clients: Client[];
  briefType: BriefType;
}

export function BriefFormClient({ config, users, clients, briefType }: BriefFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const brief = await createBrief({
        type: briefType,
        clientId: formData.clientId as string,
        topic: formData.topic as string,
        assigneeId: formData.assigneeId as string | undefined,
        formData,
      });

      router.push(`/briefs/${brief.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create brief");
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      <DynamicForm
        config={config}
        users={users}
        clients={clients}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
