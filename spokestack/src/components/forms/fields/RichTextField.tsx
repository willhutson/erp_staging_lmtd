"use client";

/**
 * Rich Text Field Component (Simplified)
 *
 * Uses a textarea for rich text input until full editor is available.
 *
 * @module components/forms/fields/RichTextField
 */

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";

export type RichTextVariant = "standard" | "mentions" | "minimal";

export interface MentionUser {
  id: string;
  name: string;
  avatarUrl?: string;
}

interface RichTextFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  users?: MentionUser[];
  variant?: RichTextVariant;
  enableAI?: boolean;
}

export function RichTextField({
  field,
  value,
  onChange,
  error,
}: RichTextFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {field.description && (
        <p className="text-sm text-gray-500 dark:text-gray-400">{field.description}</p>
      )}

      <Textarea
        id={field.id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        rows={6}
        maxLength={field.validation?.maxLength}
        className={cn(
          "min-h-[150px]",
          error && "border-red-500"
        )}
      />

      {field.validation?.maxLength && (
        <p className="text-xs text-gray-400 text-right">
          {value?.length || 0} / {field.validation.maxLength}
        </p>
      )}

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {field.helpText && !error && (
        <p className="text-sm text-gray-400">{field.helpText}</p>
      )}
    </div>
  );
}
