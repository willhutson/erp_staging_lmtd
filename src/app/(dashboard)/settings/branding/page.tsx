import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { BrandingForm } from "@/components/settings/BrandingForm";
import { ThemeSettings } from "@/lib/theme";
import { Shield } from "lucide-react";

export default async function BrandingSettingsPage() {
  const session = await auth();

  // Only ADMIN can edit branding
  if (session!.user.permissionLevel !== "ADMIN") {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Admin access required to edit branding settings.</p>
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
    <BrandingForm
      initialTheme={organization?.themeSettings as Partial<ThemeSettings> | null}
      organizationName={organization?.name || ""}
      logo={organization?.logo || null}
    />
  );
}
