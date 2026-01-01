"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Folder, Loader2 } from "lucide-react";
import { createAssetLibrary } from "@/modules/dam/actions/asset-actions";
import type { LibraryType, LibraryVisibility } from "@/modules/dam/actions/asset-actions";

const libraryTypes: { value: LibraryType; label: string; description: string }[] = [
  { value: "GENERAL", label: "General", description: "General purpose asset storage" },
  { value: "BRAND", label: "Brand", description: "Brand guidelines, logos, and identity assets" },
  { value: "STOCK", label: "Stock", description: "Stock photos, videos, and media" },
  { value: "CLIENT", label: "Client", description: "Client-specific assets and deliverables" },
  { value: "PROJECT", label: "Project", description: "Project-based asset organization" },
  { value: "ARCHIVE", label: "Archive", description: "Archived assets for reference" },
];

const visibilityOptions: { value: LibraryVisibility; label: string; description: string }[] = [
  { value: "INTERNAL", label: "Internal Only", description: "Only team members can access" },
  { value: "CLIENT", label: "Client Access", description: "Clients can view approved assets" },
  { value: "PUBLIC", label: "Public", description: "Anyone with the link can access" },
];

// Force dynamic rendering - uses cookies for auth
export const dynamic = "force-dynamic";

export default function NewLibraryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    libraryType: "GENERAL" as LibraryType,
    visibility: "INTERNAL" as LibraryVisibility,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const library = await createAssetLibrary(formData);
      router.push(`/assets/${library.id}`);
    } catch (error) {
      console.error("Failed to create library:", error);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/assets"
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Asset Library</h1>
          <p className="text-gray-500 mt-0.5">Organize your digital assets</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-6">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Library Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g., Brand Assets, Client Media, Stock Photos"
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="What types of assets will this library contain?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent resize-none"
          />
        </div>

        {/* Library Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Library Type
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {libraryTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData({ ...formData, libraryType: type.value })}
                className={`p-3 rounded-lg border text-left transition-colors ${
                  formData.libraryType === type.value
                    ? "border-[#52EDC7] bg-[#52EDC7]/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <p className="font-medium text-gray-900 text-sm">{type.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{type.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Visibility
          </label>
          <div className="space-y-2">
            {visibilityOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                  formData.visibility === option.value
                    ? "border-[#52EDC7] bg-[#52EDC7]/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="visibility"
                  value={option.value}
                  checked={formData.visibility === option.value}
                  onChange={(e) => setFormData({ ...formData, visibility: e.target.value as LibraryVisibility })}
                  className="mt-0.5 accent-[#52EDC7]"
                />
                <div>
                  <p className="font-medium text-gray-900 text-sm">{option.label}</p>
                  <p className="text-xs text-gray-500">{option.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t">
          <Link
            href="/assets"
            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#3dd4b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Create Library
          </button>
        </div>
      </form>
    </div>
  );
}
