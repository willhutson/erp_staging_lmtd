import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoogleIntegrationCard } from "@/modules/integrations/google/components/GoogleIntegrationCard";
import { SlackIntegrationCard } from "@/modules/integrations/slack/components/SlackIntegrationCard";
import { getSlackChannels } from "@/modules/integrations/slack/actions";
import { FileSpreadsheet, BarChart3, Receipt } from "lucide-react";

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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
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
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Monday.com Import</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Import existing briefs and projects from Monday.com
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Meta Business - Coming Soon */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Meta Business Suite</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Pull campaign analytics and performance data
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>

        {/* Xero - Coming Soon */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 opacity-60">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                <Receipt className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Xero</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Sync invoices, expenses, and financial data
                </p>
              </div>
            </div>
            <span className="px-3 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
