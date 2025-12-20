"use client";

import { useState } from "react";
import {
  GripVertical,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
} from "lucide-react";
import type { FormSection, FormField } from "@/types/forms";
import { FieldEditor } from "./FieldEditor";
import { FIELD_TYPES } from "../types";

interface SectionEditorProps {
  section: FormSection;
  index: number;
  totalSections: number;
  onUpdate: (section: FormSection) => void;
  onRemove: () => void;
  onMove: (direction: "up" | "down") => void;
}

export function SectionEditor({
  section,
  index,
  totalSections,
  onUpdate,
  onRemove,
  onMove,
}: SectionEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddField, setShowAddField] = useState(false);

  const updateTitle = (title: string) => {
    onUpdate({ ...section, title });
  };

  const updateDescription = (description: string) => {
    onUpdate({ ...section, description });
  };

  const addField = (type: string) => {
    const fieldType = FIELD_TYPES.find((ft) => ft.value === type);
    const newField: FormField = {
      id: `field_${Date.now()}`,
      label: fieldType?.label || "New Field",
      type: type as FormField["type"],
      required: false,
    };
    onUpdate({ ...section, fields: [...section.fields, newField] });
    setShowAddField(false);
  };

  const updateField = (fieldIndex: number, field: FormField) => {
    const fields = [...section.fields];
    fields[fieldIndex] = field;
    onUpdate({ ...section, fields });
  };

  const removeField = (fieldIndex: number) => {
    const fields = section.fields.filter((_, i) => i !== fieldIndex);
    onUpdate({ ...section, fields });
  };

  const moveField = (fieldIndex: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? fieldIndex - 1 : fieldIndex + 1;
    if (newIndex < 0 || newIndex >= section.fields.length) return;

    const fields = [...section.fields];
    [fields[fieldIndex], fields[newIndex]] = [fields[newIndex], fields[fieldIndex]];
    onUpdate({ ...section, fields });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Section Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 border-b border-gray-200">
        <button
          className="cursor-grab text-gray-400 hover:text-gray-600"
          title="Drag to reorder"
        >
          <GripVertical className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={section.title}
          onChange={(e) => updateTitle(e.target.value)}
          className="flex-1 bg-transparent font-medium text-gray-900 focus:outline-none"
          placeholder="Section Title"
        />

        <div className="flex items-center gap-1">
          <button
            onClick={() => onMove("up")}
            disabled={index === 0}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move up"
          >
            <ChevronUp className="w-4 h-4" />
          </button>
          <button
            onClick={() => onMove("down")}
            disabled={index === totalSections - 1}
            className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30"
            title="Move down"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-gray-400 hover:text-gray-600"
            title={isExpanded ? "Collapse" : "Expand"}
          >
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={onRemove}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete section"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Section Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Description */}
          <div>
            <input
              type="text"
              value={section.description || ""}
              onChange={(e) => updateDescription(e.target.value)}
              className="w-full text-sm text-gray-500 bg-transparent focus:outline-none"
              placeholder="Section description (optional)"
            />
          </div>

          {/* Fields */}
          <div className="space-y-3">
            {section.fields.map((field, fieldIndex) => (
              <FieldEditor
                key={field.id}
                field={field}
                index={fieldIndex}
                totalFields={section.fields.length}
                onUpdate={(updated) => updateField(fieldIndex, updated)}
                onRemove={() => removeField(fieldIndex)}
                onMove={(direction) => moveField(fieldIndex, direction)}
              />
            ))}

            {section.fields.length === 0 && (
              <div className="text-sm text-gray-400 text-center py-4 border-2 border-dashed border-gray-200 rounded-lg">
                No fields in this section
              </div>
            )}
          </div>

          {/* Add Field */}
          {showAddField ? (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Select field type:</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {FIELD_TYPES.map((fieldType) => (
                  <button
                    key={fieldType.value}
                    onClick={() => addField(fieldType.value)}
                    className="text-left p-3 bg-white rounded-lg border border-gray-200 hover:border-[#52EDC7] hover:bg-[#52EDC7]/5 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900">{fieldType.label}</p>
                    <p className="text-xs text-gray-500">{fieldType.description}</p>
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowAddField(false)}
                className="mt-3 text-sm text-gray-500 hover:text-gray-700"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddField(true)}
              className="flex items-center gap-1 text-sm text-[#52EDC7] hover:text-[#1BA098]"
            >
              <Plus className="w-4 h-4" />
              Add Field
            </button>
          )}
        </div>
      )}
    </div>
  );
}
