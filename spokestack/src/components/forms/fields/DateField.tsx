"use client";

import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";

interface DateFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export function DateField({ field, value, onChange, error }: DateFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        id={field.id}
        type="date"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "w-full px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent",
          error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
        )}
      />
      {field.helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

interface DateRangeFieldProps {
  field: FormField;
  value: { start: string; end: string };
  onChange: (value: { start: string; end: string }) => void;
  error?: string;
}

export function DateRangeField({ field, value = { start: "", end: "" }, onChange, error }: DateRangeFieldProps) {
  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={value.start || ""}
          onChange={(e) => onChange({ ...value, start: e.target.value })}
          className={cn(
            "flex-1 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent",
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          )}
        />
        <span className="text-gray-400 dark:text-gray-500">to</span>
        <input
          type="date"
          value={value.end || ""}
          onChange={(e) => onChange({ ...value, end: e.target.value })}
          min={value.start}
          className={cn(
            "flex-1 px-3 py-2 border rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent",
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600"
          )}
        />
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
