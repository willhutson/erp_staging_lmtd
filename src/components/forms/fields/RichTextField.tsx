"use client";

/**
 * Rich Text Field Component
 *
 * Form field that uses RichTextEditor for rich text input.
 * Supports @mentions and optional AI features.
 *
 * @module components/forms/fields/RichTextField
 */

import { useRef } from "react";
import { Label } from "@/components/ui/label";
import { RichTextEditor, type RichTextVariant, type RichTextEditorRef, type MentionUser } from "@/components/editor";
import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";

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
  users = [],
  variant = "standard",
  enableAI = false,
}: RichTextFieldProps) {
  const editorRef = useRef<RichTextEditorRef>(null);

  // Determine variant based on field config
  const editorVariant: RichTextVariant =
    field.config?.variant as RichTextVariant ||
    (field.config?.mentions ? "mentions" : variant);

  return (
    <div className="space-y-2">
      <Label htmlFor={field.id}>
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </Label>

      {field.description && (
        <p className="text-sm text-gray-500">{field.description}</p>
      )}

      <RichTextEditor
        ref={editorRef}
        variant={editorVariant}
        defaultValue={value}
        onChange={(html) => onChange(html)}
        placeholder={field.placeholder}
        users={users}
        enableAI={enableAI}
        maxLength={field.validation?.maxLength}
        showCharCount={!!field.validation?.maxLength}
        className={cn(
          error && "border-red-500",
          field.config?.minHeight && `min-h-[${field.config.minHeight}]`
        )}
      />

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {field.helpText && !error && (
        <p className="text-sm text-gray-400">{field.helpText}</p>
      )}
    </div>
  );
}
