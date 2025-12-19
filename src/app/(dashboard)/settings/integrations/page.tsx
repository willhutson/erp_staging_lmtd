import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { GoogleIntegrationCard } from "@/modules/integrations/google/components/GoogleIntegrationCard";

export default async function IntegrationsSettingsPage() {
  const session = await auth();

  if (!session?.user?.organizationId) {
    redirect("/login");
  }

  // Check if user has admin permission
  if (session.user.permissionLevel !== "ADMIN") {
    redirect("/");
  }

  // Get Google integration status
  const googleIntegration = await db.integration.findUnique({
    where: {
      organizationId_provider: {
        organizationId: session.user.organizationId,
        provider: "google",
      },
    },
  });

  const isGoogleConnected = googleIntegration?.isEnabled ?? false;

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-gray-500 mt-1">
          Connect third-party services to enhance your workflow
        </p>
      </div>

      <div className="space-y-4">
        <GoogleIntegrationCard isConnected={isGoogleConnected} />
      </div>
    </div>
  );
}
