"use client";

import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";

interface TextareaFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function TextareaField({ field, value, onChange, error }: TextareaFieldProps) {
  const charCount = value?.length || 0;
  const showCount = field.maxLength && charCount > field.maxLength * 0.8;

  return (
    <div className="space-y-1">
      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <textarea
        id={field.id}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        maxLength={field.maxLength}
        rows={4}
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent resize-y",
          error ? "border-red-500" : "border-gray-300"
        )}
      />
      <div className="flex justify-between">
        {field.helpText && (
          <p className="text-xs text-gray-500">{field.helpText}</p>
        )}
        {showCount && field.maxLength && (
          <p className={cn("text-xs", charCount > field.maxLength ? "text-red-500" : "text-gray-400")}>
            {charCount}/{field.maxLength}
          </p>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
