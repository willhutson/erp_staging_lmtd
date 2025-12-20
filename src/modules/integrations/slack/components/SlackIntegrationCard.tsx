"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Slack,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Settings,
  Hash,
  Loader2,
} from "lucide-react";
import { disconnectSlack, setDefaultChannel } from "../actions";

interface SlackChannel {
  id: string;
  name: string;
}

interface Props {
  isConnected: boolean;
  workspace?: {
    id: string;
    teamName: string;
    teamDomain?: string | null;
    defaultChannelId?: string | null;
    defaultChannelName?: string | null;
  } | null;
  channels?: SlackChannel[];
}

export function SlackIntegrationCard({
  isConnected,
  workspace,
  channels = [],
}: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [disconnecting, setDisconnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [savingChannel, setSavingChannel] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(
    workspace?.defaultChannelId || ""
  );

  const success = searchParams.get("success");
  const error = searchParams.get("error");

  const handleConnect = () => {
    // Generate state for CSRF protection
    const state = crypto.randomUUID();
    sessionStorage.setItem("slack_oauth_state", state);

    // Redirect to Slack OAuth
    const params = new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || "",
      scope: "chat:write,channels:read,channels:join,users:read,users:read.email",
      redirect_uri: `${window.location.origin}/api/integrations/slack/callback`,
      state,
    });

    window.location.href = `https://slack.com/oauth/v2/authorize?${params.toString()}`;
  };

  const handleDisconnect = async () => {
    if (!confirm("Are you sure you want to disconnect Slack?")) return;

    setDisconnecting(true);
    await disconnectSlack();
    router.refresh();
  };

  const handleSaveChannel = async () => {
    if (!selectedChannel) return;

    setSavingChannel(true);
    const channel = channels.find((c) => c.id === selectedChannel);
    await setDefaultChannel(selectedChannel, channel?.name || "");
    router.refresh();
    setSavingChannel(false);
    setShowSettings(false);
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4">
      {/* Success/Error Messages */}
      {success === "slack_connected" && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
          <Check className="w-4 h-4" />
          <span className="text-sm">Slack connected successfully!</span>
        </div>
      )}

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <X className="w-4 h-4" />
          <span className="text-sm">
            {error === "slack_denied"
              ? "Slack authorization was denied"
              : "Failed to connect Slack. Please try again."}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
            <Slack className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Slack</p>
            <p className="text-sm text-gray-500">
              {isConnected && workspace
                ? `Connected to ${workspace.teamName}`
                : "Send notifications to Slack channels"}
            </p>
          </div>
        </div>

        {isConnected ? (
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-medium bg-green-100 text-green-700 rounded-full">
              <Check className="w-3 h-3" />
              Connected
            </span>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={handleDisconnect}
              disabled={disconnecting}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Disconnect"
            >
              {disconnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </button>
          </div>
        ) : (
          <button
            onClick={handleConnect}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
          >
            Connect
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Settings Panel */}
      {showSettings && isConnected && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Notification Settings
          </h4>

          <div className="space-y-4">
            {/* Default Channel */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">
                Default notification channel
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={selectedChannel}
                    onChange={(e) => setSelectedChannel(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
                  >
                    <option value="">Select a channel...</option>
                    {channels.map((channel) => (
                      <option key={channel.id} value={channel.id}>
                        {channel.name}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  onClick={handleSaveChannel}
                  disabled={!selectedChannel || savingChannel}
                  className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {savingChannel && <Loader2 className="w-4 h-4 animate-spin" />}
                  Save
                </button>
              </div>
              {workspace?.defaultChannelName && (
                <p className="text-xs text-gray-500 mt-1">
                  Currently: #{workspace.defaultChannelName}
                </p>
              )}
            </div>

            {/* Info text */}
            <p className="text-xs text-gray-500">
              Notifications will be sent to this channel by default. You can
              also set up client-specific channels in client settings.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
