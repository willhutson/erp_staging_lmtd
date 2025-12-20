"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Building2 } from "lucide-react";
import Link from "next/link";
import { createClient, getAccountManagers } from "@/modules/crm/actions/client-actions";
import { useEffect } from "react";

const companySizes = [
  { value: "STARTUP", label: "Startup (1-10)" },
  { value: "SMALL", label: "Small (11-50)" },
  { value: "MEDIUM", label: "Medium (51-200)" },
  { value: "LARGE", label: "Large (201-1000)" },
  { value: "ENTERPRISE", label: "Enterprise (1000+)" },
];

const leadSources = [
  { value: "REFERRAL", label: "Referral" },
  { value: "WEBSITE", label: "Website" },
  { value: "SOCIAL_MEDIA", label: "Social Media" },
  { value: "EVENT", label: "Event" },
  { value: "COLD_OUTREACH", label: "Cold Outreach" },
  { value: "RFP_PORTAL", label: "RFP Portal" },
  { value: "PARTNERSHIP", label: "Partnership" },
  { value: "OTHER", label: "Other" },
];

const relationshipStatuses = [
  { value: "LEAD", label: "Lead" },
  { value: "PROSPECT", label: "Prospect" },
  { value: "ACTIVE", label: "Active" },
];

export default function NewClientPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [accountManagers, setAccountManagers] = useState<{ id: string; name: string; role: string }[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    industry: "",
    isRetainer: false,
    retainerHours: "",
    contactName: "",
    contactEmail: "",
    companySize: "",
    website: "",
    linkedIn: "",
    accountManagerId: "",
    relationshipStatus: "ACTIVE",
    leadSource: "",
    notes: "",
  });

  useEffect(() => {
    getAccountManagers().then(setAccountManagers);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      await createClient({
        name: formData.name,
        code: formData.code,
        industry: formData.industry || undefined,
        isRetainer: formData.isRetainer,
        retainerHours: formData.retainerHours ? parseInt(formData.retainerHours) : undefined,
        contactName: formData.contactName || undefined,
        contactEmail: formData.contactEmail || undefined,
        companySize: formData.companySize as any || undefined,
        website: formData.website || undefined,
        linkedIn: formData.linkedIn || undefined,
        accountManagerId: formData.accountManagerId || undefined,
        relationshipStatus: formData.relationshipStatus as any,
        leadSource: formData.leadSource as any || undefined,
        notes: formData.notes || undefined,
      });
      router.push("/clients");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create client");
      setIsSubmitting(false);
    }
  };

  // Auto-generate code from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData(prev => ({
      ...prev,
      name,
      code: prev.code || name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 4),
    }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/clients"
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Client</h1>
          <p className="text-gray-500 mt-1">Create a new client account</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
            {error}
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Basic Information
          </h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleNameChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                placeholder="e.g., Creative City Abu Dhabi"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Client Code *
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                required
                maxLength={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] uppercase"
                placeholder="e.g., CCAD"
              />
              <p className="text-xs text-gray-500 mt-1">Short code for briefs and reports</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <input
                type="text"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                placeholder="e.g., Government, Technology"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Company Size
              </label>
              <select
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              >
                <option value="">Select size...</option>
                {companySizes.map(size => (
                  <option key={size.value} value={size.value}>{size.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn
              </label>
              <input
                type="url"
                name="linkedIn"
                value={formData.linkedIn}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                placeholder="https://linkedin.com/company/..."
              />
            </div>
          </div>
        </div>

        {/* Relationship */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-900">Relationship</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                name="relationshipStatus"
                value={formData.relationshipStatus}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              >
                {relationshipStatuses.map(status => (
                  <option key={status.value} value={status.value}>{status.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lead Source
              </label>
              <select
                name="leadSource"
                value={formData.leadSource}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              >
                <option value="">Select source...</option>
                {leadSources.map(source => (
                  <option key={source.value} value={source.value}>{source.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Account Manager
            </label>
            <select
              name="accountManagerId"
              value={formData.accountManagerId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            >
              <option value="">Select account manager...</option>
              {accountManagers.map(am => (
                <option key={am.id} value={am.id}>{am.name} - {am.role}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isRetainer"
              name="isRetainer"
              checked={formData.isRetainer}
              onChange={handleChange}
              className="w-4 h-4 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
            />
            <label htmlFor="isRetainer" className="text-sm font-medium text-gray-700">
              Retainer Client
            </label>
          </div>

          {formData.isRetainer && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Retainer Hours
              </label>
              <input
                type="number"
                name="retainerHours"
                value={formData.retainerHours}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                placeholder="e.g., 160"
              />
            </div>
          )}
        </div>

        {/* Primary Contact */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-900">Primary Contact</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Name
              </label>
              <input
                type="text"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                placeholder="email@company.com"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-4 pt-4 border-t">
          <h2 className="text-lg font-semibold text-gray-900">Notes</h2>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
            placeholder="Additional notes about this client..."
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Link
            href="/clients"
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Client"}
          </button>
        </div>
      </form>
    </div>
  );
}
