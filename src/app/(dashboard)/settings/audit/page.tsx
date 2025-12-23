import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Shield, Filter } from "lucide-react";

// Inferred types for Prisma records
type AuditLogRecord = Awaited<ReturnType<typeof db.auditLog.findMany>>[number];
type UserSelect = { id: string; name: string | null };

const actionColors: Record<string, { bg: string; text: string }> = {
  created: { bg: "bg-green-100", text: "text-green-700" },
  updated: { bg: "bg-blue-100", text: "text-blue-700" },
  deleted: { bg: "bg-red-100", text: "text-red-700" },
  default: { bg: "bg-gray-100", text: "text-gray-700" },
};

export default async function AuditSettingsPage() {
  const session = await auth();

  // Only ADMIN can view audit logs
  if (session!.user.permissionLevel !== "ADMIN") {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
        <Shield className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">Admin access required to view audit logs.</p>
      </div>
    );
  }

  const auditLogs = await db.auditLog.findMany({
    where: { organizationId: session!.user.organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Get user names for the logs
  const userIds = Array.from(new Set(auditLogs.filter((l: AuditLogRecord) => l.userId).map((l: AuditLogRecord) => l.userId!)));
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, name: true },
  });
  const userMap = new Map(users.map((u: UserSelect) => [u.id, u.name]));

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionType = (action: string): string => {
    if (action.includes("created") || action.includes("create")) return "created";
    if (action.includes("updated") || action.includes("update")) return "updated";
    if (action.includes("deleted") || action.includes("delete")) return "deleted";
    return "default";
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 mb-6">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Audit Log</h2>
          </div>
          <button className="flex items-center gap-2 px-3 py-1.5 text-gray-600 dark:text-gray-300 text-sm border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {auditLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400">
            No audit logs recorded yet. Actions will appear here as users interact with the platform.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {auditLogs.map((log: AuditLogRecord) => {
              const actionType = getActionType(log.action);
              const colors = actionColors[actionType] || actionColors.default;
              const userName = log.userId ? userMap.get(log.userId) || "Unknown" : "System";

              return (
                <div key={log.id} className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-0.5 text-xs font-medium rounded ${colors.bg} ${colors.text}`}
                        >
                          {log.action}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {log.entityType}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        <span className="font-medium">{userName}</span>
                        {" "}performed action on{" "}
                        <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">
                          {log.entityId.slice(0, 8)}...
                        </code>
                      </p>
                      {log.changes && (
                        <details className="mt-2">
                          <summary className="text-xs text-gray-400 dark:text-gray-500 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300">
                            View changes
                          </summary>
                          <pre className="mt-2 p-2 bg-gray-50 dark:bg-gray-900 rounded text-xs overflow-x-auto text-gray-800 dark:text-gray-200">
                            {JSON.stringify(log.changes, null, 2)}
                          </pre>
                        </details>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {auditLogs.length === 100 && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
            <button className="text-sm text-[#52EDC7] hover:underline">
              Load more
            </button>
          </div>
        )}
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <strong>Note:</strong> Audit logs are retained for 90 days. For compliance purposes,
          consider exporting logs regularly.
        </p>
      </div>
    </>
  );
}
