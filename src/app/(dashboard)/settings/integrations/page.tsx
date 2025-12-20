import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { SettingsNav } from "@/components/settings/SettingsNav";
import { GoogleIntegrationCard } from "@/modules/integrations/google/components/GoogleIntegrationCard";
import { SlackIntegrationCard } from "@/modules/integrations/slack/components/SlackIntegrationCard";
import { getSlackChannels } from "@/modules/integrations/slack/actions";
import { FileSpreadsheet, BarChart3 } from "lucide-react";

export default async function IntegrationsSettingsPage() {
  const session = await auth();

  // Get Google integration status
  const googleIntegration = await db.integration.findUnique({
    where: {
      organizationId_provider: {
        organizationId: session!.user.organizationId,
        provider: "google",
      },
    },
  });

  const isGoogleConnected = googleIntegration?.isEnabled ?? false;

  // Get Slack workspace status
  const slackWorkspace = await db.slackWorkspace.findUnique({
    where: { organizationId: session!.user.organizationId },
  });

  const isSlackConnected = slackWorkspace?.isActive ?? false;

  // Get Slack channels if connected
  const slackChannels = isSlackConnected ? await getSlackChannels() : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <SettingsNav />

        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Connected Services
            </h2>

            <div className="space-y-4">
              <GoogleIntegrationCard isConnected={isGoogleConnected} />

              <SlackIntegrationCard
                isConnected={isSlackConnected}
                workspace={slackWorkspace}
                channels={slackChannels}
              />

              {/* Monday.com - Coming Soon */}
              <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Monday.com Import</p>
                      <p className="text-sm text-gray-500">
                        Import existing briefs and projects from Monday.com
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>

              {/* Meta Business - Coming Soon */}
              <div className="border border-gray-200 rounded-lg p-4 opacity-60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Meta Business Suite</p>
                      <p className="text-sm text-gray-500">
                        Pull campaign analytics and performance data
                      </p>
                    </div>
                  </div>
                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                    Coming Soon
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
