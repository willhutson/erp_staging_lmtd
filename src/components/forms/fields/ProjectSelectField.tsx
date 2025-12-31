"use client";

import type { FormField } from "@/types/forms";
import { cn } from "@/lib/utils";
import { ChevronDown, FolderKanban } from "lucide-react";

interface Project {
  id: string;
  name: string;
  code: string | null;
  clientId: string;
}

interface ProjectSelectFieldProps {
  field: FormField;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  projects: Project[];
  selectedClientId?: string;
}

export function ProjectSelectField({
  field,
  value,
  onChange,
  error,
  projects,
  selectedClientId,
}: ProjectSelectFieldProps) {
  // Filter projects by selected client
  const filteredProjects = selectedClientId
    ? projects.filter((p) => p.clientId === selectedClientId)
    : [];

  const isDisabled = !selectedClientId;

  return (
    <div className="space-y-1">
      <label
        htmlFor={field.id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span className="flex items-center gap-1.5">
          <FolderKanban className="w-4 h-4 text-gray-400" />
          {field.label}
        </span>
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative">
        <select
          id={field.id}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          disabled={isDisabled}
          className={cn(
            "w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent appearance-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white",
            error ? "border-red-500" : "border-gray-300 dark:border-gray-600",
            isDisabled && "bg-gray-100 dark:bg-gray-800 cursor-not-allowed text-gray-500"
          )}
        >
          {isDisabled ? (
            <option value="">Select a client first</option>
          ) : (
            <>
              <option value="">No project (standalone brief)</option>
              {filteredProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                  {project.code && ` (${project.code})`}
                </option>
              ))}
            </>
          )}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
      </div>
      {field.helpText && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{field.helpText}</p>
      )}
      {!isDisabled && filteredProjects.length === 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          No projects found for this client. Brief will be standalone.
        </p>
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
