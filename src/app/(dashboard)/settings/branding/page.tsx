import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { Upload, Palette } from "lucide-react";

export default async function BrandingSettingsPage() {
  const session = await auth();

  const organization = await db.organization.findFirst({
    where: { id: session!.user.organizationId },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNav />

        <div className="lg:col-span-3 space-y-6">
          {/* Logo */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Logo</h2>

            <div className="flex items-start gap-6">
              <div className="w-24 h-24 rounded-xl bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                {organization?.logo ? (
                  <img
                    src={organization.logo}
                    alt="Logo"
                    className="w-full h-full object-contain rounded-xl"
                  />
                ) : (
                  <Upload className="w-8 h-8 text-gray-400" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-600 mb-3">
                  Upload your organization logo. Recommended size: 200x200px.
                  Supported formats: PNG, JPG, SVG.
                </p>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                  Upload Logo
                </button>
              </div>
            </div>
          </div>

          {/* Brand Colors */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Brand Colors
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue="#52EDC7"
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue="#52EDC7"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] uppercase"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used for buttons, links, and accents
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Dark
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    defaultValue="#1BA098"
                    className="w-12 h-12 rounded-lg border border-gray-200 cursor-pointer"
                  />
                  <input
                    type="text"
                    defaultValue="#1BA098"
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] uppercase"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Used for hover states and emphasis
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg">
                  Primary Button
                </button>
                <button className="px-4 py-2 bg-[#1BA098] text-white font-medium rounded-lg">
                  Dark Button
                </button>
                <span className="text-[#52EDC7] font-medium">Link Text</span>
              </div>
            </div>
          </div>

          {/* Email Templates */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Email Branding
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email From Name
                </label>
                <input
                  type="text"
                  defaultValue={organization?.name || ""}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                  placeholder="e.g., TeamLMTD"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Footer Text
                </label>
                <textarea
                  rows={2}
                  defaultValue="© TeamLMTD. All rights reserved."
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button className="px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
