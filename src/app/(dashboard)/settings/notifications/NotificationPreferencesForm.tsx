"use client";

import { useState } from "react";
import { Mail, MessageSquare, Bell, Moon } from "lucide-react";
import { updatePreferences } from "@/modules/notifications/actions/notification-actions";

interface Props {
  initialPreferences: {
    emailEnabled: boolean;
    slackEnabled: boolean;
    inAppEnabled: boolean;
    emailDigest: string;
    digestTime: string | null;
    quietHoursEnabled: boolean;
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
    timezone: string;
  } | null;
}

const defaultPreferences = {
  emailEnabled: true,
  slackEnabled: true,
  inAppEnabled: true,
  emailDigest: "instant",
  digestTime: "09:00",
  quietHoursEnabled: false,
  quietHoursStart: "22:00",
  quietHoursEnd: "08:00",
  timezone: "Asia/Dubai",
};

export function NotificationPreferencesForm({ initialPreferences }: Props) {
  const [preferences, setPreferences] = useState(
    initialPreferences || defaultPreferences
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Convert null values to undefined for the action
    const result = await updatePreferences({
      ...preferences,
      digestTime: preferences.digestTime ?? undefined,
      quietHoursStart: preferences.quietHoursStart ?? undefined,
      quietHoursEnd: preferences.quietHoursEnd ?? undefined,
    });
    setSaving(false);

    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  const updatePref = <K extends keyof typeof preferences>(
    key: K,
    value: (typeof preferences)[K]
  ) => {
    setPreferences((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Channel Preferences */}
      <div>
        <h3 className="text-sm font-medium text-gray-900 mb-4">
          Notification Channels
        </h3>
        <div className="space-y-4">
          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">In-App Notifications</p>
                <p className="text-sm text-gray-500">
                  Show notifications in the app header
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.inAppEnabled}
              onChange={(e) => updatePref("inAppEnabled", e.target.checked)}
              className="w-5 h-5 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Mail className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Email Notifications</p>
                <p className="text-sm text-gray-500">
                  Receive important updates via email
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.emailEnabled}
              onChange={(e) => updatePref("emailEnabled", e.target.checked)}
              className="w-5 h-5 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
            />
          </label>

          <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer opacity-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  Slack Notifications
                  <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded">
                    Coming Soon
                  </span>
                </p>
                <p className="text-sm text-gray-500">
                  Get notified directly in Slack
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={preferences.slackEnabled}
              disabled
              className="w-5 h-5 text-gray-300 border-gray-300 rounded"
            />
          </label>
        </div>
      </div>

      {/* Email Digest */}
      {preferences.emailEnabled && (
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-4">
            Email Digest Settings
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Delivery Frequency
              </label>
              <select
                value={preferences.emailDigest}
                onChange={(e) => updatePref("emailDigest", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              >
                <option value="instant">Instant (as they happen)</option>
                <option value="daily">Daily digest</option>
                <option value="weekly">Weekly digest</option>
                <option value="none">None (disable email)</option>
              </select>
            </div>

            {(preferences.emailDigest === "daily" ||
              preferences.emailDigest === "weekly") && (
              <div>
                <label className="block text-sm text-gray-600 mb-2">
                  Digest Time
                </label>
                <input
                  type="time"
                  value={preferences.digestTime || "09:00"}
                  onChange={(e) => updatePref("digestTime", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quiet Hours */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <Moon className="w-5 h-5 text-gray-500" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">Quiet Hours</h3>
            <p className="text-xs text-gray-500">
              Pause non-urgent notifications during these hours
            </p>
          </div>
          <label className="ml-auto flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.quietHoursEnabled}
              onChange={(e) => updatePref("quietHoursEnabled", e.target.checked)}
              className="w-5 h-5 text-[#52EDC7] border-gray-300 rounded focus:ring-[#52EDC7]"
            />
          </label>
        </div>

        {preferences.quietHoursEnabled && (
          <div className="grid grid-cols-3 gap-4 pl-8">
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={preferences.quietHoursStart || "22:00"}
                onChange={(e) => updatePref("quietHoursStart", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={preferences.quietHoursEnd || "08:00"}
                onChange={(e) => updatePref("quietHoursEnd", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-2">
                Timezone
              </label>
              <select
                value={preferences.timezone}
                onChange={(e) => updatePref("timezone", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7] focus:border-transparent"
              >
                <option value="Asia/Dubai">Dubai (GST)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="America/New_York">New York (EST/EDT)</option>
                <option value="Asia/Kolkata">India (IST)</option>
                <option value="Asia/Manila">Manila (PHT)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-[#52EDC7] text-gray-900 rounded-lg font-medium hover:bg-[#3dd4b0] transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved!" : "Save Preferences"}
        </button>
      </div>
    </div>
  );
}
