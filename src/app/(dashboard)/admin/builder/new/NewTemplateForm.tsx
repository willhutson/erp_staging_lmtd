"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { BuilderTemplateType } from "@prisma/client";
import { ArrowLeft, FileText, Workflow, LayoutDashboard, BarChart, Brain, ClipboardList, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { createTemplate } from "../actions";

const templateTypes: { type: BuilderTemplateType; label: string; description: string; icon: typeof FileText }[] = [
  {
    type: "BRIEF_TEMPLATE",
    label: "Brief Template",
    description: "Define form fields and stages for a brief type",
    icon: FileText,
  },
  {
    type: "WORKFLOW",
    label: "Workflow",
    description: "Automated task generation and routing",
    icon: Workflow,
  },
  {
    type: "DASHBOARD_WIDGET",
    label: "Dashboard Widget",
    description: "Custom widget for the Hub dashboard",
    icon: LayoutDashboard,
  },
  {
    type: "REPORT_TEMPLATE",
    label: "Report Template",
    description: "Configurable report with data sources",
    icon: BarChart,
  },
  {
    type: "AI_SKILL_CONFIG",
    label: "AI Skill",
    description: "Configure an AI skill with prompts and triggers",
    icon: Brain,
  },
  {
    type: "FORM_TEMPLATE",
    label: "Form Template",
    description: "Reusable form for data collection",
    icon: ClipboardList,
  },
  {
    type: "NOTIFICATION_TEMPLATE",
    label: "Notification Template",
    description: "Email, Slack, or in-app notification templates",
    icon: Bell,
  },
];

const modules = [
  { value: "agency", label: "Agency" },
  { value: "crm", label: "CRM" },
  { value: "content", label: "Content Engine" },
  { value: "team", label: "Team" },
  { value: "messaging", label: "Messaging" },
  { value: "insights", label: "Insights" },
];

export function NewTemplateForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedType, setSelectedType] = useState<BuilderTemplateType | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [module, setModule] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedType || !name || !module) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const template = await createTemplate({
        templateType: selectedType,
        name,
        description: description || undefined,
        module,
      });

      router.push(`/admin/builder/${template.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create template");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Step 1: Select Type */}
      {step === 1 && (
        <div className="p-6">
          <h2 className="font-medium text-gray-900 mb-4">Select Template Type</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {templateTypes.map((type) => {
              const Icon = type.icon;
              const isSelected = selectedType === type.type;

              return (
                <button
                  key={type.type}
                  onClick={() => setSelectedType(type.type)}
                  className={cn(
                    "p-4 rounded-lg border text-left transition-all",
                    isSelected
                      ? "border-[#52EDC7] bg-[#52EDC7]/5 ring-2 ring-[#52EDC7]"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{type.label}</p>
                      <p className="text-sm text-gray-500 mt-0.5">{type.description}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
            <Link
              href="/admin/builder"
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Link>
            <button
              onClick={() => setStep(2)}
              disabled={!selectedType}
              className="px-6 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Template Details */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h2 className="font-medium text-gray-900 mb-4">Template Details</h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g., Video Shoot Brief"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="What does this template do?"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Module <span className="text-red-500">*</span>
            </label>
            <select
              value={module}
              onChange={(e) => setModule(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent bg-white"
            >
              <option value="">Select module...</option>
              {modules.map((mod) => (
                <option key={mod.value} value={mod.value}>
                  {mod.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Which part of the platform will this template be used in?
            </p>
          </div>

          <div className="flex justify-between pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name || !module}
              className="px-6 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Creating..." : "Create Template"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
