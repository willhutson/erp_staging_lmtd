"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { DynamicForm } from "@/components/forms/DynamicForm";
import type { FormTemplateConfig } from "@/modules/forms/types";
import { createFormSubmission } from "@/modules/forms/actions/form-submission-actions";

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

interface DynamicFormClientProps {
  templateId: string;
  templateType: string;
  config: FormTemplateConfig;
  users: User[];
  clients: Client[];
  submissionModel: string;
}

export function DynamicFormClient({
  templateId,
  templateType,
  config,
  users,
  clients,
  submissionModel,
}: DynamicFormClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Record<string, unknown>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const submission = await createFormSubmission({
        templateId,
        formData,
      });

      // If it creates a brief and was approved immediately, go to the brief
      if (submissionModel === "brief" && submission.briefId) {
        router.push(`/briefs/${submission.briefId}`);
      } else {
        // Otherwise go to submissions list or show success
        router.push("/submissions?success=true");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit form");
      setIsSubmitting(false);
    }
  };

  // Convert FormTemplateConfig to FormConfig format expected by DynamicForm
  const formConfig = {
    id: templateType as import("@prisma/client").BriefType,
    name: templateType,
    description: "",
    namingConvention: "",
    namingPrefix: "",
    example: "",
    sections: config.sections,
    qualityRules: config.qualityRules || [],
  };

  return (
    <div>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}
      <DynamicForm
        config={formConfig}
        users={users}
        clients={clients}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
