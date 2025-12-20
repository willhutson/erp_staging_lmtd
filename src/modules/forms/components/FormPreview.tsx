"use client";

import type { FormSection, FormField } from "@/types/forms";

interface FormPreviewProps {
  name: string;
  description: string;
  sections: FormSection[];
}

export function FormPreview({ name, description, sections }: FormPreviewProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-medium text-gray-900">Preview</h3>
        <p className="text-xs text-gray-500 mt-1">How the form will appear to users</p>
      </div>

      <div className="p-6">
        {/* Form Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {name || "Untitled Form"}
          </h2>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>

        {/* Sections */}
        {sections.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <p>No sections added yet</p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <div key={section.id}>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-gray-500 mb-4">{section.description}</p>
                )}

                <div className="space-y-4">
                  {section.fields.map((field) => (
                    <FieldPreview key={field.id} field={field} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button Preview */}
        {sections.length > 0 && (
          <div className="mt-8 pt-6 border-t border-gray-200">
            <button
              disabled
              className="px-6 py-2.5 bg-[#52EDC7] text-gray-900 font-medium rounded-lg opacity-75 cursor-not-allowed"
            >
              Submit Brief
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function FieldPreview({ field }: { field: FormField }) {
  const renderField = () => {
    switch (field.type) {
      case "text":
      case "url":
      case "number":
        return (
          <input
            type={field.type === "url" ? "url" : field.type === "number" ? "number" : "text"}
            disabled
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
          />
        );

      case "textarea":
        return (
          <textarea
            disabled
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400 resize-none"
          />
        );

      case "select":
        return (
          <select
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
          >
            <option>{field.placeholder || "Select an option"}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );

      case "multi-select":
        return (
          <div className="space-y-2 p-3 border border-gray-200 rounded-lg bg-gray-50">
            {field.options?.length ? (
              field.options.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm text-gray-400">
                  <input type="checkbox" disabled className="rounded border-gray-300" />
                  {opt.label}
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-400">No options defined</p>
            )}
          </div>
        );

      case "date":
        return (
          <input
            type="date"
            disabled
            className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
          />
        );

      case "date-range":
        return (
          <div className="flex items-center gap-2">
            <input
              type="date"
              disabled
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
            />
            <span className="text-gray-400">to</span>
            <input
              type="date"
              disabled
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400"
            />
          </div>
        );

      case "user-select":
        return (
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
            {field.placeholder || "Select team member"}
          </div>
        );

      case "client-select":
        return (
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
            {field.placeholder || "Select client"}
          </div>
        );

      case "file-upload":
        return (
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center bg-gray-50">
            <p className="text-sm text-gray-400">
              {field.multiple ? "Drop files here or click to upload" : "Drop file here or click to upload"}
            </p>
            {field.accept && (
              <p className="text-xs text-gray-400 mt-1">
                Accepted: {field.accept.join(", ")}
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-400">
            Unknown field type: {field.type}
          </div>
        );
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {renderField()}
      {field.helpText && (
        <p className="text-xs text-gray-500 mt-1">{field.helpText}</p>
      )}
    </div>
  );
}
