"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Video,
  Film,
  Palette,
  PenTool,
  Languages,
  Target,
  FileText,
  Loader2,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { submitBriefRequest } from "./actions";

const briefTypes = [
  { value: "VIDEO_SHOOT", label: "Video Shoot", icon: Video },
  { value: "VIDEO_EDIT", label: "Video Edit", icon: Film },
  { value: "DESIGN", label: "Design", icon: Palette },
  { value: "COPYWRITING_EN", label: "Copywriting (English)", icon: PenTool },
  { value: "COPYWRITING_AR", label: "Copywriting (Arabic)", icon: Languages },
  { value: "PAID_MEDIA", label: "Paid Media", icon: Target },
  { value: "OTHER", label: "Other", icon: FileText },
];

const priorities = [
  { value: "LOW", label: "Low", description: "2+ weeks turnaround" },
  { value: "MEDIUM", label: "Medium", description: "1-2 weeks turnaround" },
  { value: "HIGH", label: "High", description: "3-5 days turnaround" },
  { value: "URGENT", label: "Urgent", description: "24-48 hours" },
];

interface Props {
  clientId: string;
}

export function BriefRequestForm({ clientId }: Props) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    briefType: "",
    priority: "MEDIUM",
    description: "",
    desiredDeadline: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Please enter a title");
      return;
    }

    if (!formData.description.trim()) {
      setError("Please describe what you need");
      return;
    }

    setSubmitting(true);

    const result = await submitBriefRequest({
      clientId,
      title: formData.title,
      briefType: formData.briefType || undefined,
      priority: formData.priority as "LOW" | "MEDIUM" | "HIGH" | "URGENT",
      description: formData.description,
      desiredDeadline: formData.desiredDeadline
        ? new Date(formData.desiredDeadline)
        : undefined,
    });

    if (result.success) {
      router.push("/portal/requests");
    } else {
      setError(result.error || "Failed to submit request");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Title */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          What do you need? *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, title: e.target.value }))
          }
          placeholder="e.g., Social media campaign for new product launch"
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent text-lg"
        />
      </div>

      {/* Brief Type */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Type of work (optional)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {briefTypes.map((type) => {
            const Icon = type.icon;
            const isSelected = formData.briefType === type.value;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    briefType: isSelected ? "" : type.value,
                  }))
                }
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                  isSelected
                    ? "border-[#52EDC7] bg-[#52EDC7]/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isSelected ? "text-[#1BA098]" : "text-gray-400"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    isSelected ? "text-gray-900" : "text-gray-600"
                  }`}
                >
                  {type.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe what you need *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Please provide as much detail as possible including goals, target audience, key messages, reference materials, etc."
          rows={6}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-2">
          The more detail you provide, the faster we can get started
        </p>
      </div>

      {/* Priority & Deadline */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Priority Level
            </label>
            <div className="space-y-2">
              {priorities.map((priority) => {
                const isSelected = formData.priority === priority.value;
                return (
                  <button
                    key={priority.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({
                        ...prev,
                        priority: priority.value,
                      }))
                    }
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? "border-[#52EDC7] bg-[#52EDC7]/5"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span
                      className={`font-medium ${
                        isSelected ? "text-gray-900" : "text-gray-600"
                      }`}
                    >
                      {priority.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {priority.description}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Desired Deadline (optional)
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={formData.desiredDeadline}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    desiredDeadline: e.target.value,
                  }))
                }
                min={new Date().toISOString().split("T")[0]}
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              We&apos;ll do our best to meet your timeline
            </p>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-gray-200 text-gray-600 font-medium rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="px-8 py-3 bg-[#52EDC7] text-gray-900 font-semibold rounded-lg hover:bg-[#3dd4b0] transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
          Submit Request
        </button>
      </div>
    </form>
  );
}
