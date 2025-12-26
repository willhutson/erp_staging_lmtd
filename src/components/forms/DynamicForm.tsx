"use client";

import { useState } from "react";
import type { FormConfig, FormField as FormFieldType } from "@/types/forms";
import {
  TextField,
  TextareaField,
  RichTextField,
  SelectField,
  MultiSelectField,
  DateField,
  DateRangeField,
  UserSelectField,
  ClientSelectField,
  FileUploadField,
} from "./fields";

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

interface DynamicFormProps {
  config: FormConfig;
  users: User[];
  clients: Client[];
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
  initialData?: Record<string, unknown>;
  isSubmitting?: boolean;
}

export function DynamicForm({
  config,
  users,
  clients,
  onSubmit,
  initialData = {},
  isSubmitting = false,
}: DynamicFormProps) {
  const [formData, setFormData] = useState<Record<string, unknown>>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when field is updated
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    config.sections.forEach((section) => {
      section.fields.forEach((field) => {
        const value = formData[field.id];

        if (field.required) {
          if (value === undefined || value === null || value === "") {
            newErrors[field.id] = `${field.label} is required`;
          } else if (Array.isArray(value) && value.length === 0) {
            newErrors[field.id] = `${field.label} is required`;
          } else if (
            field.type === "date-range" &&
            typeof value === "object" &&
            value !== null &&
            (!("start" in value) || !("end" in value) || !(value as { start: string }).start || !(value as { end: string }).end)
          ) {
            newErrors[field.id] = `${field.label} is required`;
          }
        }

        // Validation rules
        if (field.validation?.pattern && typeof value === "string" && value) {
          const regex = new RegExp(field.validation.pattern);
          if (!regex.test(value)) {
            newErrors[field.id] = field.validation.message || "Invalid format";
          }
        }
      });
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  const renderField = (field: FormFieldType) => {
    const value = formData[field.id];
    const error = errors[field.id];

    switch (field.type) {
      case "text":
      case "url":
      case "number":
        return (
          <TextField
            key={field.id}
            field={field}
            value={value as string}
            onChange={(v) => updateField(field.id, v)}
            error={error}
          />
        );

      case "textarea":
        return (
          <TextareaField
            key={field.id}
            field={field}
            value={value as string}
            onChange={(v) => updateField(field.id, v)}
            error={error}
          />
        );

      case "richtext":
        return (
          <RichTextField
            key={field.id}
            field={field}
            value={value as string}
            onChange={(v) => updateField(field.id, v)}
            error={error}
            users={users.map((u) => ({ id: u.id, name: u.name }))}
            variant={field.config?.mentions ? "mentions" : "standard"}
            enableAI={field.config?.enableAI}
          />
        );

      case "select":
        return (
          <SelectField
            key={field.id}
            field={field}
            value={value as string}
            onChange={(v) => updateField(field.id, v)}
            error={error}
          />
        );

      case "multi-select":
        return (
          <MultiSelectField
            key={field.id}
            field={field}
            value={(value as string[]) || []}
            onChange={(v) => updateField(field.id, v)}
            error={error}
          />
        );

      case "date":
        return (
          <DateField
            key={field.id}
            field={field}
            value={value as string}
            onChange={(v) => updateField(field.id, v)}
            error={error}
          />
        );

      case "date-range":
        return (
          <DateRangeField
            key={field.id}
            field={field}
            value={(value as { start: string; end: string }) || { start: "", end: "" }}
            onChange={(v) => updateField(field.id, v)}
            error={error}
          />
        );

      case "user-select":
        return (
          <UserSelectField
            key={field.id}
            field={field}
            value={value as string}
            onChange={(v) => updateField(field.id, v)}
            error={error}
            users={users}
          />
        );

      case "client-select":
        return (
          <ClientSelectField
            key={field.id}
            field={field}
            value={value as string}
            onChange={(v) => updateField(field.id, v)}
            error={error}
            clients={clients}
          />
        );

      case "file-upload":
        return (
          <FileUploadField
            key={field.id}
            field={field}
            value={(value as File[]) || []}
            onChange={(v) => updateField(field.id, v)}
            error={error}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {config.sections.map((section) => (
        <div key={section.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
            {section.title}
          </h2>
          {section.description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{section.description}</p>
          )}
          <div className="space-y-4">
            {section.fields.map(renderField)}
          </div>
        </div>
      ))}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Brief"}
        </button>
      </div>
    </form>
  );
}
