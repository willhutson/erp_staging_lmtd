"use client";

import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MultiSelectFieldProps {
  field: FormField;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
}

export function MultiSelectField({ field, value = [], onChange, error }: MultiSelectFieldProps) {
  const toggleOption = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className={cn(
        "border rounded-lg p-2 space-y-1",
        error ? "border-red-500" : "border-gray-300"
      )}>
        {field.options?.map((option) => {
          const isSelected = value.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggleOption(option.value)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm text-left transition-colors",
                isSelected
                  ? "bg-[#52EDC7]/20 text-gray-900"
                  : "hover:bg-gray-50 text-gray-700"
              )}
            >
              <div
                className={cn(
                  "w-4 h-4 border rounded flex items-center justify-center",
                  isSelected ? "bg-[#52EDC7] border-[#52EDC7]" : "border-gray-300"
                )}
              >
                {isSelected && <Check className="w-3 h-3 text-white" />}
              </div>
              {option.label}
            </button>
          );
        })}
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
