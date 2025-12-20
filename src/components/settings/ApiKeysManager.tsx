"use client";

import { useState } from "react";
import { Plus, Copy, Trash2, Check, AlertCircle } from "lucide-react";
import { createApiKeyAction, revokeApiKeyAction } from "@/modules/settings/actions/api-key-actions";
import { API_SCOPES } from "@/lib/api/keys";

interface ApiKeyData {
  id: string;
  name: string;
  keyPrefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: string | null;
  usageCount: number;
  expiresAt: string | null;
  createdAt: string;
  createdByName: string;
}

interface ApiKeysManagerProps {
  initialKeys: ApiKeyData[];
  isAdmin: boolean;
}

export function ApiKeysManager({ initialKeys, isAdmin }: ApiKeysManagerProps) {
  const [keys, setKeys] = useState(initialKeys);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCopyKey = async () => {
    if (newKey) {
      await navigator.clipboard.writeText(newKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleRevoke = async (keyId: string) => {
    if (!confirm("Are you sure you want to revoke this API key? This action cannot be undone.")) {
      return;
    }

    const result = await revokeApiKeyAction(keyId);
    if (result.success) {
      setKeys(keys.map(k => k.id === keyId ? { ...k, isActive: false } : k));
    }
  };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <div className="flex justify-end">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#3dd4b0] transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create API Key
          </button>
        </div>
      )}

      {/* New key display */}
      {newKey && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800">API Key Created</p>
              <p className="text-sm text-green-700 mt-1">
                Copy this key now. You won&apos;t be able to see it again.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <code className="flex-1 bg-white px-3 py-2 rounded border border-green-200 text-sm font-mono break-all">
                  {newKey}
                </code>
                <button
                  onClick={handleCopyKey}
                  className="p-2 hover:bg-green-100 rounded transition-colors"
                >
                  {copied ? (
                    <Check className="w-5 h-5 text-green-600" />
                  ) : (
                    <Copy className="w-5 h-5 text-green-600" />
                  )}
                </button>
              </div>
              <button
                onClick={() => setNewKey(null)}
                className="mt-3 text-sm text-green-700 hover:text-green-800"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Keys list */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Key
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Scopes
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Usage
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {keys.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  No API keys yet. Create one to get started.
                </td>
              </tr>
            ) : (
              keys.map((key) => (
                <tr key={key.id} className={!key.isActive ? "opacity-50" : ""}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{key.name}</p>
                      <p className="text-xs text-gray-500">
                        by {key.createdByName} on{" "}
                        {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-sm text-gray-600 font-mono">
                      {key.keyPrefix}...
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {key.scopes.slice(0, 2).map((scope) => (
                        <span
                          key={scope}
                          className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                        >
                          {scope}
                        </span>
                      ))}
                      {key.scopes.length > 2 && (
                        <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                          +{key.scopes.length - 2} more
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm">
                      <p className="text-gray-900">{key.usageCount} requests</p>
                      {key.lastUsedAt && (
                        <p className="text-xs text-gray-500">
                          Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {key.isActive ? (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-500 rounded-full">
                        Revoked
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      {key.isActive && (
                        <button
                          onClick={() => handleRevoke(key.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Revoke key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onCreated={(key, keyData) => {
            setNewKey(key);
            setKeys([keyData, ...keys]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateApiKeyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (key: string, keyData: ApiKeyData) => void;
}) {
  const [name, setName] = useState("");
  const [selectedScopes, setSelectedScopes] = useState<string[]>([]);
  const [expiresInDays, setExpiresInDays] = useState<number | undefined>();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const result = await createApiKeyAction({
        name,
        scopes: selectedScopes,
        expiresInDays,
      });

      if (result.success && result.key) {
        onCreated(result.key, {
          id: crypto.randomUUID(), // Will be replaced on refresh
          name,
          keyPrefix: result.key.substring(0, 16),
          scopes: selectedScopes,
          isActive: true,
          lastUsedAt: null,
          usageCount: 0,
          expiresAt: expiresInDays
            ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
            : null,
          createdAt: new Date().toISOString(),
          createdByName: "You",
        });
      } else {
        setError(result.error || "Failed to create API key");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleScope = (scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope)
        ? prev.filter((s) => s !== scope)
        : [...prev, scope]
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              Create API Key
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Create a new API key for external integrations
            </p>
          </div>

          <div className="p-6 space-y-4">
            {error && (
              <div className="bg-red-50 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Key Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., n8n Production"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Expiration (optional)
              </label>
              <select
                value={expiresInDays || ""}
                onChange={(e) =>
                  setExpiresInDays(e.target.value ? parseInt(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              >
                <option value="">Never expires</option>
                <option value="30">30 days</option>
                <option value="90">90 days</option>
                <option value="180">6 months</option>
                <option value="365">1 year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Scopes
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                {Object.entries(API_SCOPES).map(([scope, description]) => (
                  <label
                    key={scope}
                    className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                  >
                    <input
                      type="checkbox"
                      checked={selectedScopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                      className="w-4 h-4 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{scope}</p>
                      <p className="text-xs text-gray-500">{description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {selectedScopes.length === 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Select at least one scope
                </p>
              )}
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !name || selectedScopes.length === 0}
              className="px-4 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#3dd4b0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating..." : "Create Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
