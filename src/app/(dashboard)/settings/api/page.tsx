import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ApiKeysManager } from "@/components/settings/ApiKeysManager";
import { db } from "@/lib/db";

// Inferred type for API keys with creator
type ApiKeyWithCreator = Awaited<
  ReturnType<
    typeof db.apiKey.findMany<{
      include: { createdBy: { select: { name: true } } };
    }>
  >
>[number];

export default async function ApiSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // Only admins and leadership can access API settings
  if (!["ADMIN", "LEADERSHIP"].includes(session.user.permissionLevel)) {
    redirect("/settings");
  }

  // Get existing API keys
  const apiKeys = await db.apiKey.findMany({
    where: { organizationId: session.user.organizationId },
    orderBy: { createdAt: "desc" },
    include: {
      createdBy: { select: { name: true } },
    },
  });

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">API Keys</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Manage API keys for external integrations like n8n, Zapier, or
              custom applications
            </p>
          </div>
        </div>

        <ApiKeysManager
          initialKeys={apiKeys.map((key: ApiKeyWithCreator) => ({
            id: key.id,
            name: key.name,
            keyPrefix: key.keyPrefix,
            scopes: key.scopes,
            isActive: key.isActive,
            lastUsedAt: key.lastUsedAt?.toISOString() || null,
            usageCount: key.usageCount,
            expiresAt: key.expiresAt?.toISOString() || null,
            createdAt: key.createdAt.toISOString(),
            createdByName: key.createdBy.name,
          }))}
          isAdmin={session.user.permissionLevel === "ADMIN"}
        />
      </div>

      {/* API Documentation */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          API Documentation
        </h2>

        <div className="space-y-4">
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Base URL</h3>
            <code className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded">
              {process.env.NEXT_PUBLIC_APP_URL || "https://app.spokestack.io"}
              /api/v1
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">Authentication</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              Include your API key in the Authorization header:
            </p>
            <code className="text-sm bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-2 py-1 rounded block">
              Authorization: Bearer sk_live_xxxxx
            </code>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 dark:text-white mb-2">
              Available Endpoints
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-mono text-xs">
                  GET
                </span>
                <code className="text-gray-600 dark:text-gray-300">/api/v1/briefs</code>
                <span className="text-gray-400">- List briefs</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded font-mono text-xs">
                  POST
                </span>
                <code className="text-gray-600 dark:text-gray-300">/api/v1/briefs</code>
                <span className="text-gray-400">- Create brief</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded font-mono text-xs">
                  GET
                </span>
                <code className="text-gray-600 dark:text-gray-300">/api/v1/briefs/:id</code>
                <span className="text-gray-400">- Get brief</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded font-mono text-xs">
                  PATCH
                </span>
                <code className="text-gray-600 dark:text-gray-300">/api/v1/briefs/:id</code>
                <span className="text-gray-400">- Update brief</span>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded font-mono text-xs">
                  DELETE
                </span>
                <code className="text-gray-600 dark:text-gray-300">/api/v1/briefs/:id</code>
                <span className="text-gray-400">- Delete brief</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
