import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { BrandingForm } from "@/components/settings/BrandingForm";
import { ThemeSettings } from "@/lib/theme";
import { Shield } from "lucide-react";

export default async function BrandingSettingsPage() {
  const session = await auth();

  // Only ADMIN can edit branding
  if (session!.user.permissionLevel !== "ADMIN") {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage platform settings</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <SettingsNav />
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-12 text-center">
            <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Admin access required to edit branding settings.</p>
          </div>
        </div>
      </div>
    );
  }

  const organization = await db.organization.findFirst({
    where: { id: session!.user.organizationId },
    select: {
      name: true,
      logo: true,
      themeSettings: true,
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNav />

        <div className="lg:col-span-3">
          <BrandingForm
            initialTheme={organization?.themeSettings as Partial<ThemeSettings> | null}
            organizationName={organization?.name || ""}
            logo={organization?.logo || null}
          />
        </div>
      </div>
    </div>
  );
}
