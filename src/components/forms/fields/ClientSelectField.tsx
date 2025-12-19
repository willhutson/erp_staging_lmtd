"use client";

import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface Client {
  id: string;
  name: string;
  code: string;
}

interface ClientSelectFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  clients: Client[];
}

export function ClientSelectField({ field, value, onChange, error, clients }: ClientSelectFieldProps) {
  return (
    <div className="space-y-1">
      <label htmlFor={field.id} className="block text-sm font-medium text-gray-700">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={field.id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          className={cn(
            "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent appearance-none bg-white",
            error ? "border-red-500" : "border-gray-300"
          )}
        >
          <option value="">Select a client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.name} ({client.code})
            </option>
          ))}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500">{field.helpText}</p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
