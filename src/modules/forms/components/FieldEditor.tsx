"use client";

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Settings,
  Plus,
  X,
} from "lucide-react";
import type { FormField, SelectOption } from "@/types/forms";
import { FIELD_TYPES } from "../types";

interface FieldEditorProps {
  field: FormField;
  index: number;
  totalFields: number;
  onUpdate: (field: FormField) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}

export function FieldEditor({
  field,
  index,
  totalFields,
  onUpdate,
  onRemove,
  onMove,
}: FieldEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const fieldTypeInfo = FIELD_TYPES.find((ft) => ft.value === field.type);

  const updateField = (updates: Partial<FormField>) => {
    onUpdate({ ...field, ...updates });
  };

  const hasOptions = field.type === "select" || field.type === "multi-select";

  const addOption = () => {
    const options = field.options || [];
    const newOption: SelectOption = {
      value: `option_${options.length + 1}`,
      label: `Option ${options.length + 1}`,
    };
    updateField({ options: [...options, newOption] });
  };

  const updateOption = (optionIndex: number, updates: Partial<SelectOption>) => {
    const options = [...(field.options || [])];
    options[optionIndex] = { ...options[optionIndex], ...updates };
    updateField({ options });
  };

  const removeOption = (optionIndex: number) => {
    const options = (field.options || []).filter((_, i) => i !== optionIndex);
    updateField({ options });
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      {/* Field Header */}
      <div className="flex items-center gap-2 px-3 py-2 bg-white hover:bg-gray-50">
        <button
          className="cursor-grab text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={field.label}
              onChange={(e) => updateField({ label: e.target.value })}
              className="flex-1 text-sm font-medium text-gray-900 bg-transparent focus:outline-none"
              placeholder="Field Label"
            />
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
              {fieldTypeInfo?.label || field.type}
            </span>
            {field.required && (
              <span className="text-xs text-red-500">*</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={index === totalFields - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title="Settings"
          >
            <Settings className="w-3 h-3" />
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete field"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Field Settings */}
      {isExpanded && (
        <div className="border-t border-gray-200 p-3 bg-gray-50 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Field ID
              </label>
              <input
                type="text"
                value={field.id}
                onChange={(e) => updateField({ id: e.target.value.replace(/\s+/g, "_") })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
                placeholder="field_id"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Type
              </label>
              <select
                value={field.type}
                onChange={(e) => updateField({ type: e.target.value as FormField["type"] })}
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
              >
                {FIELD_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {ft.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Placeholder
            </label>
            <input
              type="text"
              value={field.placeholder || ""}
              onChange={(e) => updateField({ placeholder: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
              placeholder="Enter placeholder text"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">
              Help Text
            </label>
            <input
              type="text"
              value={field.helpText || ""}
              onChange={(e) => updateField({ helpText: e.target.value })}
              className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
              placeholder="Additional help text for users"
            />
          </div>

          {(field.type === "text" || field.type === "textarea") && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Max Length
              </label>
              <input
                type="number"
                value={field.maxLength || ""}
                onChange={(e) =>
                  updateField({ maxLength: e.target.value ? parseInt(e.target.value) : undefined })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
                placeholder="No limit"
              />
            </div>
          )}

          {/* Options for select/multi-select */}
          {hasOptions && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Options
              </label>
              <div className="space-y-2">
                {(field.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => updateOption(optionIndex, { value: e.target.value })}
                      className="w-1/3 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
                      placeholder="value"
                    />
                    <input
                      type="text"
                      value={option.label}
                      onChange={(e) => updateOption(optionIndex, { label: e.target.value })}
                      className="flex-1 px-2 py-1 text-xs border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
                      placeholder="Label"
                    />
                    <button
                      onClick={() => removeOption(optionIndex)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addOption}
                  className="flex items-center gap-1 text-xs text-[#52EDC7] hover:text-[#1BA098]"
                >
                  <Plus className="w-3 h-3" />
                  Add Option
                </button>
              </div>
            </div>
          )}

          {/* User select filter */}
          {field.type === "user-select" && (
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Filter by Departments (comma-separated)
              </label>
              <input
                type="text"
                value={field.filter?.departments?.join(", ") || ""}
                onChange={(e) =>
                  updateField({
                    filter: {
                      ...field.filter,
                      departments: e.target.value
                        .split(",")
                        .map((d) => d.trim())
                        .filter(Boolean),
                    },
                  })
                }
                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
                placeholder="e.g., Video Production, Creative & Design"
              />
            </div>
          )}

          {/* File upload settings */}
          {field.type === "file-upload" && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`multiple_${field.id}`}
                  checked={field.multiple || false}
                  onChange={(e) => updateField({ multiple: e.target.checked })}
                  className="w-4 h-4 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
                />
                <label htmlFor={`multiple_${field.id}`} className="text-xs text-gray-600">
                  Allow multiple files
                </label>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Accepted File Types (comma-separated)
                </label>
                <input
                  type="text"
                  value={field.accept?.join(", ") || ""}
                  onChange={(e) =>
                    updateField({
                      accept: e.target.value
                        .split(",")
                        .map((a) => a.trim())
                        .filter(Boolean),
                    })
                  }
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-[#52EDC7]"
                  placeholder="e.g., image/*, .pdf, .doc"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`required_${field.id}`}
              checked={field.required}
              onChange={(e) => updateField({ required: e.target.checked })}
              className="w-4 h-4 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
            />
            <label htmlFor={`required_${field.id}`} className="text-xs text-gray-600">
              Required field
            </label>
          </div>
        </div>
      )}
    </div>
  );
}
