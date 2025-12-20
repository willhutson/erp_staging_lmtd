"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Loader2,
  Eye,
  Settings,
} from "lucide-react";
import { createFormTemplate, updateFormTemplate } from "../actions/form-template-actions";
import { FORM_ICONS, type FormTemplateConfig } from "../types";
import type { FormSection } from "@/types/forms";
import { SectionEditor } from "./SectionEditor";
import { FormPreview } from "./FormPreview";

interface FormEditorProps {
  initialData?: {
    id: string;
    type: string;
    name: string;
    description: string;
    namingConvention: string;
    namingPrefix: string;
    icon: string;
    isActive: boolean;
    isSystem: boolean;
    config: FormTemplateConfig;
  };
}

const DEFAULT_CONFIG: FormTemplateConfig = {
  sections: [
    {
      id: "basic",
      title: "Basic Information",
      fields: [
        {
          id: "topic",
          label: "Topic / Title",
          type: "text",
          required: true,
          placeholder: "Enter the topic or title",
        },
        {
          id: "clientId",
          label: "Client",
          type: "client-select",
          required: true,
        },
        {
          id: "assigneeId",
          label: "Assign To",
          type: "user-select",
          required: false,
          placeholder: "Select team member",
        },
      ],
    },
  ],
  qualityRules: [],
};

export function FormEditor({ initialData }: FormEditorProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showPreview, setShowPreview] = useState(false);

  const [formData, setFormData] = useState({
    type: initialData?.type || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    namingConvention: initialData?.namingConvention || "",
    namingPrefix: initialData?.namingPrefix || "",
    icon: initialData?.icon || "FileText",
    isActive: initialData?.isActive ?? true,
  });

  const [config, setConfig] = useState<FormTemplateConfig>(
    initialData?.config || DEFAULT_CONFIG
  );

  const isEditing = !!initialData?.id;

  const handleSave = () => {
    if (!formData.type || !formData.name) {
      alert("Please fill in the type and name fields");
      return;
    }

    startTransition(async () => {
      try {
        if (isEditing) {
          await updateFormTemplate(initialData.id, {
            name: formData.name,
            description: formData.description || undefined,
            namingConvention: formData.namingConvention || undefined,
            namingPrefix: formData.namingPrefix || undefined,
            icon: formData.icon || undefined,
            isActive: formData.isActive,
            config,
          });
        } else {
          await createFormTemplate({
            type: formData.type.toUpperCase().replace(/\s+/g, "_"),
            name: formData.name,
            description: formData.description || undefined,
            namingConvention: formData.namingConvention || undefined,
            namingPrefix: formData.namingPrefix || undefined,
            icon: formData.icon || undefined,
            config,
          });
        }
        router.push("/settings/forms");
      } catch (error) {
        console.error("Failed to save template:", error);
        alert(error instanceof Error ? error.message : "Failed to save template");
      }
    });
  };

  const addSection = () => {
    const newSection: FormSection = {
      id: `section_${Date.now()}`,
      title: "New Section",
      fields: [],
    };
    setConfig((prev) => ({
      ...prev,
      sections: [...prev.sections, newSection],
    }));
  };

  const updateSection = (index: number, section: FormSection) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.map((s, i) => (i === index ? section : s)),
    }));
  };

  const removeSection = (index: number) => {
    setConfig((prev) => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index),
    }));
  };

  const moveSection = (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= config.sections.length) return;

    setConfig((prev) => {
      const sections = [...prev.sections];
      [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
      return { ...prev, sections };
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/forms"
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {isEditing ? "Edit Form Template" : "Create Form Template"}
            </h2>
            <p className="text-sm text-gray-500">
              {isEditing
                ? "Modify the form structure and settings"
                : "Design a new brief form template"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Eye className="w-4 h-4" />
            {showPreview ? "Hide Preview" : "Preview"}
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Save Template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Column */}
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Template Settings
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.type}
                  onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                  disabled={isEditing}
                  placeholder="e.g., VIDEO_SHOOT"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] disabled:bg-gray-50"
                />
                <p className="text-xs text-gray-400 mt-1">Unique identifier (uppercase)</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Video Shoot Request"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Brief description of this form type"
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Naming Prefix
                </label>
                <input
                  type="text"
                  value={formData.namingPrefix}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, namingPrefix: e.target.value }))
                  }
                  placeholder="e.g., Shoot"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Icon
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                >
                  {FORM_ICONS.map((icon) => (
                    <option key={icon} value={icon}>
                      {icon}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Naming Convention
              </label>
              <input
                type="text"
                value={formData.namingConvention}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, namingConvention: e.target.value }))
                }
                placeholder="e.g., Shoot: [Client] – [Topic]"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, isActive: e.target.checked }))
                }
                className="w-4 h-4 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
              />
              <label htmlFor="isActive" className="text-sm text-gray-700">
                Active (available for new briefs)
              </label>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-gray-900">Form Sections</h3>
              <button
                onClick={addSection}
                className="flex items-center gap-1 text-sm text-[#52EDC7] hover:text-[#1BA098]"
              >
                <Plus className="w-4 h-4" />
                Add Section
              </button>
            </div>

            {config.sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                index={index}
                totalSections={config.sections.length}
                onUpdate={(updated) => updateSection(index, updated)}
                onRemove={() => removeSection(index)}
                onMove={(direction) => moveSection(index, direction)}
              />
            ))}

            {config.sections.length === 0 && (
              <div className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-8 text-center">
                <p className="text-sm text-gray-500">No sections yet. Add a section to get started.</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Column */}
        {showPreview && (
          <div className="lg:sticky lg:top-6 lg:self-start">
            <FormPreview
              name={formData.name}
              description={formData.description}
              sections={config.sections}
            />
          </div>
        )}
      </div>
    </div>
  );
}
