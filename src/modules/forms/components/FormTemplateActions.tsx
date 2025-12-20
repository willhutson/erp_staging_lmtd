"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import Link from "next/link";
import { Pencil, Copy, Trash2, Loader2 } from "lucide-react";
import { duplicateFormTemplate, deleteFormTemplate } from "../actions/form-template-actions";

interface FormTemplateActionsProps {
  templateId: string;
  isSystem: boolean;
}

export function FormTemplateActions({ templateId, isSystem }: FormTemplateActionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDuplicate = () => {
    startTransition(async () => {
      try {
        const duplicate = await duplicateFormTemplate(templateId);
        router.push(`/settings/forms/${duplicate.id}`);
      } catch (error) {
        console.error("Failed to duplicate template:", error);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm("Are you sure you want to delete this template? This action cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      try {
        await deleteFormTemplate(templateId);
        router.refresh();
      } catch (error) {
        console.error("Failed to delete template:", error);
      }
    });
  };

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/settings/forms/${templateId}`}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
        title="Edit"
      >
        <Pencil className="w-4 h-4" />
      </Link>
      <button
        onClick={handleDuplicate}
        disabled={isPending}
        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
        title="Duplicate"
      >
        {isPending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
      </button>
      {!isSystem && (
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
          title="Delete"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
